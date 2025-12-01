# Terraform configuration for GCP Bioinformatics Pipeline
# This file provisions GCS bucket, BigQuery dataset/table, and Cloud Function

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "cloudfunctions.googleapis.com",
    "storage.googleapis.com",
    "bigquery.googleapis.com",
    "cloudbuild.googleapis.com",
    "run.googleapis.com"
  ])
  
  service = each.value
  project = var.project_id
  
  disable_on_destroy = false
}

# Google Cloud Storage bucket for FASTQ file uploads
resource "google_storage_bucket" "fastq_bucket" {
  name          = var.bucket_name
  location      = var.region
  force_destroy = var.force_destroy_bucket
  
  # Lifecycle rules to manage storage costs
  lifecycle_rule {
    condition {
      age = var.lifecycle_age_days
    }
    action {
      type = "Delete"
    }
  }
  
  # Versioning disabled by default (can be enabled if needed)
  versioning {
    enabled = false
  }
  
  # Uniform bucket-level access
  uniform_bucket_level_access = true
}

# BigQuery dataset for QC results
resource "google_bigquery_dataset" "qc_dataset" {
  dataset_id  = var.dataset_name
  description = "Dataset for storing FASTQ quality control metrics"
  location    = var.region
  
  # Dataset access controls (optional - adjust as needed)
  access {
    role   = "OWNER"
    special_group = "projectOwners"
  }
  
  access {
    role   = "READER"
    special_group = "projectReaders"
  }
}

# BigQuery table for FASTQ metrics
resource "google_bigquery_table" "fastq_metrics" {
  dataset_id = google_bigquery_dataset.qc_dataset.dataset_id
  table_id   = var.table_name
  
  description = "Table storing quality control metrics for processed FASTQ files"
  
  # Schema definition
  schema = jsonencode([
    {
      name = "filename"
      type = "STRING"
      mode = "REQUIRED"
      description = "Name of the FASTQ file"
    },
    {
      name = "timestamp"
      type = "TIMESTAMP"
      mode = "REQUIRED"
      description = "Timestamp when the file was processed"
    },
    {
      name = "total_reads"
      type = "INTEGER"
      mode = "NULLABLE"
      description = "Total number of reads in the file"
    },
    {
      name = "avg_length"
      type = "FLOAT"
      mode = "NULLABLE"
      description = "Average read length"
    },
    {
      name = "gc_content"
      type = "FLOAT"
      mode = "NULLABLE"
      description = "GC content percentage"
    },
    {
      name = "avg_quality"
      type = "FLOAT"
      mode = "NULLABLE"
      description = "Average Phred quality score"
    }
  ])
  
  # Partitioning by timestamp (optional, for better query performance)
  time_partitioning {
    type  = "DAY"
    field = "timestamp"
  }
}

# Service account for Cloud Function
resource "google_service_account" "function_sa" {
  account_id   = "fastq-qc-function"
  display_name = "Service Account for FASTQ QC Cloud Function"
  description  = "Service account with permissions to read GCS and write to BigQuery"
}

# IAM role binding for GCS read access
resource "google_storage_bucket_iam_member" "function_gcs_reader" {
  bucket = google_storage_bucket.fastq_bucket.name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:${google_service_account.function_sa.email}"
}

# IAM role binding for BigQuery write access
resource "google_project_iam_member" "function_bq_writer" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.function_sa.email}"
}

# IAM role binding for BigQuery job user (needed for insert operations)
resource "google_project_iam_member" "function_bq_jobuser" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${google_service_account.function_sa.email}"
}

# Cloud Storage bucket for Cloud Function source code
resource "google_storage_bucket" "function_source" {
  name          = "${var.project_id}-function-source"
  location      = var.region
  force_destroy = true
}

# Archive Cloud Function source code
data "archive_file" "function_source" {
  type        = "zip"
  source_dir  = "../cloud_function"
  output_path = "/tmp/function-source.zip"
  excludes    = ["__pycache__", "*.pyc", ".git"]
}

# Upload source code to GCS
resource "google_storage_bucket_object" "function_source" {
  name   = "function-source-${data.archive_file.function_source.output_md5}.zip"
  bucket = google_storage_bucket.function_source.name
  source = data.archive_file.function_source.output_path
}

# Cloud Function
resource "google_cloudfunctions2_function" "fastq_qc_function" {
  name        = "fastq-qc-processor"
  location    = var.region
  description = "Processes FASTQ files and calculates QC metrics"
  
  build_config {
    runtime     = "python311"
    entry_point = "process_fastq"
    source {
      storage_source {
        bucket = google_storage_bucket.function_source.name
        object = google_storage_bucket_object.function_source.name
      }
    }
  }
  
  service_config {
    max_instance_count    = 10
    min_instance_count    = 0
    available_memory      = "512Mi"
    timeout_seconds       = 540
    service_account_email = google_service_account.function_sa.email
    
    environment_variables = {
      BUCKET_NAME  = google_storage_bucket.fastq_bucket.name
      DATASET_NAME = google_bigquery_dataset.qc_dataset.dataset_id
      TABLE_NAME   = google_bigquery_table.fastq_metrics.table_id
    }
  }
  
  event_trigger {
    trigger_region = var.region
    event_type     = "google.cloud.storage.object.v1.finalized"
    event_filters {
      attribute = "bucket"
      value     = google_storage_bucket.fastq_bucket.name
    }
  }
  
  depends_on = [
    google_project_service.required_apis,
    google_storage_bucket_object.function_source
  ]
}

# Service account for Cloud Run services
resource "google_service_account" "cloud_run_sa" {
  account_id   = "fastq-qc-cloud-run"
  display_name = "Service Account for Cloud Run services"
  description  = "Service account with permissions to read BigQuery and GCS"
}

# IAM role binding for BigQuery read access
resource "google_project_iam_member" "cloud_run_bq_reader" {
  project = var.project_id
  role    = "roles/bigquery.dataViewer"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# IAM role binding for BigQuery job user
resource "google_project_iam_member" "cloud_run_bq_jobuser" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# IAM role binding for GCS signed URL generation
resource "google_storage_bucket_iam_member" "cloud_run_gcs_admin" {
  bucket = google_storage_bucket.fastq_bucket.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Cloud Run service for FastAPI backend
resource "google_cloud_run_service" "api" {
  name     = "fastq-qc-api"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/fastq-qc-api:latest"
        
        ports {
          container_port = 8000
        }

        env {
          name  = "GCP_PROJECT_ID"
          value = var.project_id
        }
        
        env {
          name  = "BIGQUERY_DATASET"
          value = google_bigquery_dataset.qc_dataset.dataset_id
        }
        
        env {
          name  = "BIGQUERY_TABLE"
          value = google_bigquery_table.fastq_metrics.table_id
        }
        
        env {
          name  = "GCS_BUCKET"
          value = google_storage_bucket.fastq_bucket.name
        }

        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }
      }

      service_account_name = google_service_account.cloud_run_sa.email
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [
    google_project_service.required_apis
  ]
}

# Cloud Run IAM binding for API (public access)
resource "google_cloud_run_service_iam_member" "api_public" {
  service  = google_cloud_run_service.api.name
  location = google_cloud_run_service.api.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Cloud Run service for React dashboard
resource "google_cloud_run_service" "dashboard" {
  name     = "fastq-qc-dashboard"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/fastq-qc-dashboard:latest"
        
        ports {
          container_port = 80
        }

        env {
          name  = "VITE_API_URL"
          value = google_cloud_run_service.api.status[0].url
        }

        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [
    google_project_service.required_apis,
    google_cloud_run_service.api
  ]
}

# Cloud Run IAM binding for dashboard (public access)
resource "google_cloud_run_service_iam_member" "dashboard_public" {
  service  = google_cloud_run_service.dashboard.name
  location = google_cloud_run_service.dashboard.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}


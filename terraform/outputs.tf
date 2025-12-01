# Terraform outputs for GCP Bioinformatics Pipeline

output "bucket_name" {
  description = "Name of the GCS bucket for FASTQ uploads"
  value       = google_storage_bucket.fastq_bucket.name
}

output "bucket_url" {
  description = "URL of the GCS bucket"
  value       = google_storage_bucket.fastq_bucket.url
}

output "bigquery_dataset_id" {
  description = "BigQuery dataset ID"
  value       = google_bigquery_dataset.qc_dataset.dataset_id
}

output "bigquery_table_id" {
  description = "BigQuery table ID"
  value       = google_bigquery_table.fastq_metrics.table_id
}

output "cloud_function_name" {
  description = "Name of the Cloud Function"
  value       = google_cloudfunctions2_function.fastq_qc_function.name
}

output "cloud_function_url" {
  description = "URL of the Cloud Function"
  value       = google_cloudfunctions2_function.fastq_qc_function.url
}

output "service_account_email" {
  description = "Email of the service account used by Cloud Function"
  value       = google_service_account.function_sa.email
}

output "api_url" {
  description = "URL of the Cloud Run API service"
  value       = google_cloud_run_service.api.status[0].url
}

output "dashboard_url" {
  description = "URL of the Cloud Run dashboard service"
  value       = google_cloud_run_service.dashboard.status[0].url
}

output "cloud_run_service_account_email" {
  description = "Email of the service account used by Cloud Run services"
  value       = google_service_account.cloud_run_sa.email
}


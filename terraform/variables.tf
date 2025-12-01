# Terraform variables for GCP Bioinformatics Pipeline

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region for resources"
  type        = string
  default     = "us-central1"
}

variable "bucket_name" {
  description = "Name of the GCS bucket for FASTQ uploads"
  type        = string
  default     = "fastq-uploads"
}

variable "dataset_name" {
  description = "BigQuery dataset name for QC results"
  type        = string
  default     = "bioinformatics_qc"
}

variable "table_name" {
  description = "BigQuery table name for FASTQ metrics"
  type        = string
  default     = "fastq_metrics"
}

variable "force_destroy_bucket" {
  description = "Force destroy bucket even if it contains objects (for cleanup)"
  type        = bool
  default     = false
}

variable "lifecycle_age_days" {
  description = "Number of days after which objects in bucket are deleted"
  type        = number
  default     = 90
}


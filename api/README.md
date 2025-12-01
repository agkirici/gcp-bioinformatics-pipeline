# FASTQ QC API

FastAPI backend for the FASTQ QC Dashboard.

## Features

- REST API endpoints for BigQuery metrics
- Signed URL generation for GCS uploads
- CORS support for frontend integration
- Pydantic models for request/response validation
- Error handling and logging

## Endpoints

### GET `/`
Health check endpoint.

### GET `/api/metrics`
Fetch all QC metrics from BigQuery.

Query parameters:
- `start_date` (optional): ISO format date string
- `end_date` (optional): ISO format date string

### GET `/api/metrics/{filename}`
Fetch metrics for a specific file.

### GET `/api/summary`
Get aggregated statistics.

### POST `/api/upload`
Generate signed URL for file upload.

Request body:
```json
{
  "filename": "example.fastq"
}
```

## Environment Variables

- `GCP_PROJECT_ID`: GCP project ID
- `BIGQUERY_DATASET`: BigQuery dataset name (default: bioinformatics_qc)
- `BIGQUERY_TABLE`: BigQuery table name (default: fastq_metrics)
- `GCS_BUCKET`: GCS bucket name (default: fastq-uploads)

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GCP_PROJECT_ID=your-project-id
export BIGQUERY_DATASET=bioinformatics_qc
export BIGQUERY_TABLE=fastq_metrics
export GCS_BUCKET=fastq-uploads

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Docker

```bash
# Build image
docker build -t fastq-qc-api .

# Run container
docker run -p 8000:8000 \
  -e GCP_PROJECT_ID=your-project-id \
  -e BIGQUERY_DATASET=bioinformatics_qc \
  -e BIGQUERY_TABLE=fastq_metrics \
  -e GCS_BUCKET=fastq-uploads \
  fastq-qc-api
```

## Deployment

See deployment scripts in the main project directory.


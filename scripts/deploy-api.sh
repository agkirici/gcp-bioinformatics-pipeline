#!/bin/bash

# Deployment script for FastAPI backend to Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
API_DIR="$PROJECT_ROOT/api"

echo -e "${GREEN}=== Deploying FASTQ QC API ===${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}ERROR: gcloud CLI is not installed${NC}"
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not installed${NC}"
    exit 1
fi

# Read project ID from terraform.tfvars
TERRAFORM_DIR="$PROJECT_ROOT/terraform"
if [ ! -f "$TERRAFORM_DIR/terraform.tfvars" ]; then
    echo -e "${RED}ERROR: terraform.tfvars not found${NC}"
    exit 1
fi

PROJECT_ID=$(grep 'project_id' "$TERRAFORM_DIR/terraform.tfvars" | cut -d'"' -f2 | cut -d"'" -f2)
BUCKET_NAME=$(grep 'bucket_name' "$TERRAFORM_DIR/terraform.tfvars" | cut -d'"' -f2 | cut -d"'" -f2 || echo "fastq-uploads")
DATASET_NAME=$(grep 'dataset_name' "$TERRAFORM_DIR/terraform.tfvars" | cut -d'"' -f2 | cut -d"'" -f2 || echo "bioinformatics_qc")
TABLE_NAME=$(grep 'table_name' "$TERRAFORM_DIR/terraform.tfvars" | cut -d'"' -f2 | cut -d"'" -f2 || echo "fastq_metrics")

echo -e "${GREEN}Using GCP Project: ${PROJECT_ID}${NC}"

# Set project
gcloud config set project "$PROJECT_ID"

# Step 1: Build Docker image
echo -e "${YELLOW}Step 1: Building Docker image...${NC}"
cd "$API_DIR"
docker build -t gcr.io/$PROJECT_ID/fastq-qc-api:latest .

# Step 2: Push to Container Registry
echo -e "\n${YELLOW}Step 2: Pushing to Container Registry...${NC}"
docker push gcr.io/$PROJECT_ID/fastq-qc-api:latest

# Step 3: Deploy to Cloud Run
echo -e "\n${YELLOW}Step 3: Deploying to Cloud Run...${NC}"
gcloud run deploy fastq-qc-api \
    --image gcr.io/$PROJECT_ID/fastq-qc-api:latest \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --port 8000 \
    --memory 512Mi \
    --cpu 1 \
    --set-env-vars "GCP_PROJECT_ID=$PROJECT_ID,BIGQUERY_DATASET=$DATASET_NAME,BIGQUERY_TABLE=$TABLE_NAME,GCS_BUCKET=$BUCKET_NAME"

# Get service URL
SERVICE_URL=$(gcloud run services describe fastq-qc-api --region=us-central1 --format='value(status.url)')

echo -e "\n${GREEN}=== Deployment Complete! ===${NC}"
echo -e "API URL: ${SERVICE_URL}"
echo -e "\nAPI Documentation: ${SERVICE_URL}/docs"


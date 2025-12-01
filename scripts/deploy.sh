#!/bin/bash

# Deployment script for GCP Bioinformatics Pipeline
# This script authenticates, sets up infrastructure, and deploys the Cloud Function

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TERRAFORM_DIR="$PROJECT_ROOT/terraform"
CLOUD_FUNCTION_DIR="$PROJECT_ROOT/cloud_function"

echo -e "${GREEN}=== GCP Bioinformatics Pipeline Deployment ===${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}ERROR: gcloud CLI is not installed${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}ERROR: Terraform is not installed${NC}"
    echo "Please install it from: https://www.terraform.io/downloads"
    exit 1
fi

# Check if terraform.tfvars exists
if [ ! -f "$TERRAFORM_DIR/terraform.tfvars" ]; then
    echo -e "${YELLOW}WARNING: terraform.tfvars not found${NC}"
    echo "Creating from example file..."
    if [ -f "$TERRAFORM_DIR/terraform.tfvars.example" ]; then
        cp "$TERRAFORM_DIR/terraform.tfvars.example" "$TERRAFORM_DIR/terraform.tfvars"
        echo -e "${YELLOW}Please edit terraform.tfvars with your GCP project details${NC}"
        exit 1
    else
        echo -e "${RED}ERROR: terraform.tfvars.example not found${NC}"
        exit 1
    fi
fi

# Read project ID from terraform.tfvars
PROJECT_ID=$(grep 'project_id' "$TERRAFORM_DIR/terraform.tfvars" | cut -d'"' -f2 | cut -d"'" -f2)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}ERROR: Could not read project_id from terraform.tfvars${NC}"
    exit 1
fi

echo -e "${GREEN}Using GCP Project: ${PROJECT_ID}${NC}\n"

# Step 1: Authenticate with GCP
echo -e "${YELLOW}Step 1: Authenticating with GCP...${NC}"
gcloud auth login --no-browser
gcloud config set project "$PROJECT_ID"

# Step 2: Enable required APIs
echo -e "\n${YELLOW}Step 2: Enabling required APIs...${NC}"
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable bigquery.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com

# Step 3: Apply Terraform configuration
echo -e "\n${YELLOW}Step 3: Applying Terraform configuration...${NC}"
cd "$TERRAFORM_DIR"
terraform init
terraform plan
echo -e "${YELLOW}Review the plan above. Continue? (y/n)${NC}"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi
terraform apply -auto-approve

# Get outputs from Terraform
BUCKET_NAME=$(terraform output -raw bucket_name)
echo -e "\n${GREEN}Terraform deployment complete!${NC}"
echo -e "Bucket name: ${BUCKET_NAME}"

# Step 4: Create and upload a test FASTQ file
echo -e "\n${YELLOW}Step 4: Creating test FASTQ file...${NC}"
cd "$PROJECT_ROOT"
python3 "$SCRIPT_DIR/test_local.py" --generate --output /tmp/test_sample.fastq --reads 50 --length 75

echo -e "\n${YELLOW}Step 5: Uploading test file to GCS...${NC}"
gsutil cp /tmp/test_sample.fastq "gs://${BUCKET_NAME}/test_sample.fastq"

echo -e "\n${GREEN}=== Deployment Complete! ===${NC}"
echo -e "\nNext steps:"
echo "1. Check Cloud Function logs: gcloud functions logs read fastq-qc-processor --limit 50"
echo "2. Query BigQuery: bq query 'SELECT * FROM \`${PROJECT_ID}.bioinformatics_qc.fastq_metrics\` LIMIT 10'"
echo "3. Upload more FASTQ files to: gs://${BUCKET_NAME}/"
echo -e "\nTo view results in BigQuery Console:"
echo "https://console.cloud.google.com/bigquery?project=${PROJECT_ID}"


#!/bin/bash

# Deployment script for React dashboard to Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DASHBOARD_DIR="$PROJECT_ROOT/dashboard"

echo -e "${GREEN}=== Deploying FASTQ QC Dashboard ===${NC}\n"

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

echo -e "${GREEN}Using GCP Project: ${PROJECT_ID}${NC}\n"

# Set project
gcloud config set project "$PROJECT_ID"

# Get API URL (assume API is deployed)
API_URL=$(gcloud run services describe fastq-qc-api --region=us-central1 --format='value(status.url)' 2>/dev/null || echo "")
if [ -z "$API_URL" ]; then
    echo -e "${YELLOW}WARNING: API service not found. You may need to deploy the API first.${NC}"
    read -p "Enter API URL (or press Enter to skip): " API_URL
fi

# Step 1: Build Docker image
echo -e "${YELLOW}Step 1: Building Docker image...${NC}"
cd "$DASHBOARD_DIR"

# Create .env.production if API URL is provided
if [ -n "$API_URL" ]; then
    echo "VITE_API_URL=$API_URL" > .env.production
fi

docker build -t gcr.io/$PROJECT_ID/fastq-qc-dashboard:latest .

# Step 2: Push to Container Registry
echo -e "\n${YELLOW}Step 2: Pushing to Container Registry...${NC}"
docker push gcr.io/$PROJECT_ID/fastq-qc-dashboard:latest

# Step 3: Deploy to Cloud Run
echo -e "\n${YELLOW}Step 3: Deploying to Cloud Run...${NC}"
gcloud run deploy fastq-qc-dashboard \
    --image gcr.io/$PROJECT_ID/fastq-qc-dashboard:latest \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --port 80 \
    --memory 512Mi \
    --cpu 1

# Get service URL
SERVICE_URL=$(gcloud run services describe fastq-qc-dashboard --region=us-central1 --format='value(status.url)')

echo -e "\n${GREEN}=== Deployment Complete! ===${NC}"
echo -e "Dashboard URL: ${SERVICE_URL}"


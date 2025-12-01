#!/bin/bash

# Cleanup script for GCP Bioinformatics Pipeline
# This script destroys all Terraform resources and cleans up test files

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

echo -e "${YELLOW}=== GCP Bioinformatics Pipeline Cleanup ===${NC}\n"

# Check if terraform.tfvars exists
if [ ! -f "$TERRAFORM_DIR/terraform.tfvars" ]; then
    echo -e "${RED}ERROR: terraform.tfvars not found${NC}"
    exit 1
fi

# Read project ID from terraform.tfvars
PROJECT_ID=$(grep 'project_id' "$TERRAFORM_DIR/terraform.tfvars" | cut -d'"' -f2 | cut -d"'" -f2)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}ERROR: Could not read project_id from terraform.tfvars${NC}"
    exit 1
fi

echo -e "${YELLOW}WARNING: This will destroy all resources in project: ${PROJECT_ID}${NC}"
echo -e "${YELLOW}This includes:${NC}"
echo "  - GCS bucket and all files"
echo "  - BigQuery dataset and table"
echo "  - Cloud Function"
echo "  - Service account"
echo ""
echo -e "${RED}Are you sure you want to continue? (yes/no)${NC}"
read -r response

if [[ ! "$response" == "yes" ]]; then
    echo "Cleanup cancelled."
    exit 0
fi

# Step 1: Destroy Terraform resources
echo -e "\n${YELLOW}Step 1: Destroying Terraform resources...${NC}"
cd "$TERRAFORM_DIR"

if [ -d ".terraform" ]; then
    terraform destroy -auto-approve
    echo -e "${GREEN}Terraform resources destroyed${NC}"
else
    echo -e "${YELLOW}No Terraform state found, skipping...${NC}"
fi

# Step 2: Clean up local test files
echo -e "\n${YELLOW}Step 2: Cleaning up local test files...${NC}"
if [ -f "/tmp/test_sample.fastq" ]; then
    rm -f /tmp/test_sample.fastq
    echo -e "${GREEN}Removed /tmp/test_sample.fastq${NC}"
fi

if [ -f "sample.fastq" ]; then
    rm -f sample.fastq
    echo -e "${GREEN}Removed sample.fastq${NC}"
fi

# Step 3: Clean up Terraform state files (optional)
echo -e "\n${YELLOW}Step 3: Cleaning up Terraform state...${NC}"
read -p "Remove Terraform state files? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf "$TERRAFORM_DIR/.terraform"
    rm -f "$TERRAFORM_DIR/.terraform.lock.hcl"
    rm -f "$TERRAFORM_DIR/terraform.tfstate"
    rm -f "$TERRAFORM_DIR/terraform.tfstate.backup"
    echo -e "${GREEN}Terraform state files removed${NC}"
fi

echo -e "\n${GREEN}=== Cleanup Complete! ===${NC}"
echo -e "All resources have been destroyed and local files cleaned up."


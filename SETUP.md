# 🚀 Quick Setup Guide

This guide helps you get the pipeline running quickly.

## Prerequisites Checklist

- [ ] Google Cloud Platform account with billing enabled
- [ ] Node.js 18+ installed
- [ ] Python 3.11+ installed
- [ ] Google Cloud SDK (gcloud) installed
- [ ] Terraform 1.0+ installed
- [ ] Docker installed (optional, for containerized deployment)

## Quick Start (5 Minutes)

### 1. Clone and Configure

```bash
git clone https://github.com/YOUR_USERNAME/gcp-fastq-pipeline.git
cd gcp-fastq-pipeline
```

### 2. Set Up GCP Project

```bash
# Create or select project
gcloud projects create YOUR_PROJECT_ID
gcloud config set project YOUR_PROJECT_ID

# Enable billing (required)
# Visit: https://console.cloud.google.com/billing
```

### 3. Configure Terraform

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your project_id
```

### 4. Authenticate

```bash
gcloud auth login
gcloud auth application-default login
```

### 5. Deploy Infrastructure

```bash
cd terraform
terraform init
terraform apply
```

### 6. Run Dashboard Locally

```bash
cd dashboard
npm install
npm run dev
```

Visit `http://localhost:3000` to see the dashboard!

## Next Steps

- Upload a test FASTQ file to the GCS bucket
- Watch it process automatically
- View results in the dashboard

See [DEMO.md](./DEMO.md) for detailed workflow examples.

## Troubleshooting

**"Permission denied" errors**: Ensure you have Owner or Editor role on the GCP project

**"API not enabled"**: Run `terraform apply` - it enables required APIs automatically

**Dashboard not loading**: Check that `npm install` completed successfully

For more help, see the main [README.md](./README.md).


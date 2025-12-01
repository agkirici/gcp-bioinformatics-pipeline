# Project Structure

```
gcp-fastq-pipeline/
│
├── cloud_function/          # Cloud Function source code
│   ├── main.py              # Main Cloud Function code
│   └── requirements.txt     # Python dependencies for Cloud Function
│
├── terraform/               # Infrastructure as Code
│   ├── main.tf              # Main Terraform configuration
│   ├── variables.tf         # Variable definitions
│   ├── outputs.tf           # Output values
│   └── terraform.tfvars.example  # Example variables file
│
├── api/                     # FastAPI Backend
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Container image
│   └── README.md            # API documentation
│
├── dashboard/               # React Dashboard
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript types
│   ├── Dockerfile           # Container image
│   ├── nginx.conf           # Nginx configuration
│   └── package.json         # Node.js dependencies
│
├── dashboard-simple/        # Simple HTML Dashboard (Alternative)
│   ├── dashboard.html       # Single-file dashboard
│   └── README.md           # Setup instructions
│
├── scripts/                 # Utility scripts
│   ├── deploy.sh            # Main deployment script
│   ├── deploy-api.sh        # API deployment script
│   ├── deploy-frontend.sh   # Dashboard deployment script
│   ├── cleanup.sh           # Cleanup script
│   ├── test_local.py        # Local testing script
│   ├── create_dashboard.py  # Dashboard generation script
│   └── requirements_dashboard.txt  # Dashboard dependencies
│
├── README.md                # Main documentation
├── PROJECT_STRUCTURE.md     # This file
├── .gitignore              # Git ignore rules
└── .terraformignore        # Terraform ignore rules
```

## File Descriptions

### Cloud Function (`cloud_function/`)

- **main.py**: Contains the Cloud Function code that:
  - Triggers on GCS file uploads
  - Parses FASTQ files
  - Calculates QC metrics
  - Stores results in BigQuery

- **requirements.txt**: Python dependencies including:
  - Google Cloud libraries
  - Bioinformatics libraries (Biopython, pysam)

### Terraform (`terraform/`)

- **main.tf**: Defines all GCP resources:
  - GCS bucket
  - BigQuery dataset and table
  - Cloud Function
  - Cloud Run services (API and Dashboard)
  - Service accounts and IAM roles

- **variables.tf**: Input variables for customization

- **outputs.tf**: Output values after deployment

- **terraform.tfvars.example**: Example configuration file

### API (`api/`)

- **main.py**: FastAPI application with REST endpoints
- **requirements.txt**: Python dependencies
- **Dockerfile**: Container image for Cloud Run

### Dashboard (`dashboard/`)

- **src/**: React TypeScript source code
- **Dockerfile**: Multi-stage build with nginx
- **package.json**: Node.js dependencies

### Scripts (`scripts/`)

- **deploy.sh**: Automated deployment script
- **deploy-api.sh**: API deployment script
- **deploy-frontend.sh**: Dashboard deployment script
- **cleanup.sh**: Resource cleanup script
- **test_local.py**: Local testing without GCP
- **create_dashboard.py**: Generate HTML dashboard from BigQuery data

## Quick Start

1. Copy `terraform/terraform.tfvars.example` to `terraform/terraform.tfvars`
2. Edit `terraform.tfvars` with your GCP project details
3. Run `scripts/deploy.sh` to deploy everything
4. Upload a FASTQ file to the GCS bucket
5. View results in BigQuery or generate dashboard

## Next Steps

See `README.md` for detailed instructions.


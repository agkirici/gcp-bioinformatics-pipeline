# 🧬 GCP Serverless Bioinformatics Pipeline

[![React](https://img.shields.io/badge/React-18.2-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://www.python.org/)
[![Terraform](https://img.shields.io/badge/Terraform-1.0+-623CE4?logo=terraform)](https://www.terraform.io/)
[![GCP](https://img.shields.io/badge/Google_Cloud-4285F4?logo=googlecloud)](https://cloud.google.com/)

> **A production-ready, serverless bioinformatics pipeline on Google Cloud Platform that automates FASTQ quality control analysis with real-time visualization and scalable infrastructure.**

## 📖 Overview

This project demonstrates a complete **serverless bioinformatics pipeline** that automatically processes sequencing data (FASTQ files), performs quality control analysis, and provides interactive visualizations. Built with modern cloud-native technologies, it showcases expertise in **cloud architecture**, **bioinformatics**, **full-stack development**, and **Infrastructure as Code**.

### 🎯 Key Features

- ⚡ **Serverless Architecture** - Fully automated processing with Cloud Functions
- 📊 **Real-time Dashboard** - Interactive React dashboard with live metrics visualization
- 🔄 **Event-Driven Processing** - Automatic QC analysis triggered on file upload
- 📈 **Scalable Infrastructure** - Handles large datasets with BigQuery and Cloud Storage
- 🛠️ **Infrastructure as Code** - Complete Terraform configuration for reproducible deployments
- 🧪 **Local Testing** - Test QC logic locally before deploying
- 📱 **Responsive Design** - Modern UI that works on all devices
- 🔐 **Production-Ready** - Error handling, logging, and security best practices

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │  React Dashboard │  ←────→ │  FastAPI Backend │             │
│  │  (Cloud Run)     │         │  (Cloud Run)     │             │
│  └──────────────────┘         └────────┬─────────┘             │
└──────────────────────────────────────────┼──────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Google Cloud Platform                        │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │  Cloud       │───▶│  Cloud       │───▶│  BigQuery    │     │
│  │  Storage     │    │  Functions   │    │  (Analytics) │     │
│  │  (FASTQ)     │    │  (QC Engine) │    │              │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│         ▲                   │                    │              │
│         │                   │                    │              │
│         └───────────────────┴────────────────────┘              │
│                      Event-Driven Flow                           │
└─────────────────────────────────────────────────────────────────┘
```

### Flow Description

1. **Upload**: User uploads FASTQ file to Google Cloud Storage bucket
2. **Trigger**: Cloud Function automatically triggers on file upload event
3. **Process**: Function parses FASTQ, calculates QC metrics (reads, quality, GC content)
4. **Store**: Results stored in BigQuery for analytics
5. **Visualize**: React dashboard queries BigQuery via FastAPI to display metrics
6. **Monitor**: Real-time updates show new files as they're processed

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Recharts** - Beautiful, responsive charts
- **React Query** - Powerful data synchronization

### Backend
- **Python 3.11** - Modern Python features
- **FastAPI** - High-performance API framework
- **Google Cloud Libraries** - BigQuery, Cloud Storage integration

### Cloud Services
- **Cloud Functions** - Serverless compute for QC processing
- **Cloud Storage** - Scalable file storage
- **BigQuery** - Data warehouse for analytics
- **Cloud Run** - Containerized services for API and dashboard
- **IAM** - Secure access control

### Infrastructure
- **Terraform** - Infrastructure as Code
- **Docker** - Containerization
- **Cloud Build** - CI/CD automation

## 📦 Project Structure

```
gcp-fastq-pipeline/
├── cloud_function/          # Cloud Function for QC processing
│   ├── main.py             # QC analysis logic
│   └── requirements.txt    # Python dependencies
│
├── terraform/               # Infrastructure as Code
│   ├── main.tf             # GCP resources definition
│   ├── variables.tf        # Input variables
│   ├── outputs.tf          # Output values
│   └── terraform.tfvars.example  # Configuration template
│
├── api/                     # FastAPI Backend
│   ├── main.py             # REST API endpoints
│   ├── requirements.txt    # Dependencies
│   └── Dockerfile          # Container image
│
├── dashboard/              # React Dashboard
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── data/          # Mock data for development
│   │   └── api/           # API client
│   ├── package.json        # Node dependencies
│   └── Dockerfile          # Production build
│
├── scripts/                # Utility scripts
│   ├── deploy.sh          # Main deployment
│   ├── deploy-api.sh     # API deployment
│   ├── deploy-frontend.sh # Dashboard deployment
│   ├── test_local.py     # Local testing
│   └── create_dashboard.py # Python dashboard generator
│
└── README.md              # This file
```

## 🚀 Local Development Setup

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.11+**
- **Google Cloud SDK** (gcloud CLI)
- **Terraform 1.0+**
- **Docker** (for containerized deployments)

### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/gcp-fastq-pipeline.git
cd gcp-fastq-pipeline
```

### Step 2: Configure GCP Project

1. Create a GCP project (or use existing)
2. Enable billing
3. Copy Terraform variables:
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   ```
4. Edit `terraform.tfvars` with your project details:
   ```hcl
   project_id = "YOUR_PROJECT_ID"
   region     = "us-central1"
   ```

### Step 3: Authenticate

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

### Step 4: Run Dashboard Locally

```bash
cd dashboard
npm install
npm run dev
```

Visit `http://localhost:3000` to see the dashboard with mock data.

### Step 5: Test QC Logic Locally

```bash
cd scripts
python3 test_local.py --generate  # Generate sample FASTQ
python3 test_local.py sample.fastq  # Test analysis
```

### Step 6: Deploy Infrastructure

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

See [DEMO.md](./DEMO.md) for detailed workflow examples.

## 📊 Dashboard Features

The React dashboard provides a comprehensive view of QC metrics:

### Overview Cards
- **Total Files Processed** - Count of analyzed FASTQ files
- **Average Quality Score** - Mean Phred quality across all files
- **Average GC Content** - Mean GC percentage
- **Total Reads** - Aggregate read count

### Interactive Charts
- **Quality Trends** - Line chart showing quality scores over time
- **GC Content Distribution** - Histogram of GC percentages
- **Read Count Trends** - Visualization of sequencing depth

### Data Table
- Sortable columns (filename, timestamp, reads, quality, GC%)
- Search functionality
- Color-coded quality indicators
- Responsive design for mobile devices

### Real-time Updates
- Automatic refresh when new files are processed
- Live status indicators
- Toast notifications for new uploads

## 🔬 Bioinformatics Context

### What is FASTQ?
FASTQ is the standard format for storing sequencing data. Each file contains:
- **Sequences** - DNA/RNA nucleotide sequences
- **Quality Scores** - Per-base confidence metrics (Phred scores)

### QC Metrics Explained

- **Total Reads**: Number of sequencing reads in the file
- **Average Length**: Mean read length in base pairs (bp)
- **GC Content**: Percentage of G and C nucleotides (typically 40-60% for most organisms)
- **Quality Score**: Phred score indicating base call accuracy (higher = better, typically 20-40)

### Why QC Matters
Quality control is essential in genomics to:
- Identify sequencing errors
- Filter low-quality data
- Ensure downstream analysis reliability
- Detect contamination or technical issues

## 🎓 Learning Outcomes

This project demonstrates:

✅ **Cloud Architecture** - Serverless design patterns, event-driven systems  
✅ **Bioinformatics** - Domain knowledge of sequencing data processing  
✅ **Full-Stack Development** - React frontend, Python backend, API design  
✅ **DevOps** - Infrastructure as Code, CI/CD, containerization  
✅ **Data Engineering** - BigQuery analytics, data pipelines  
✅ **Software Engineering** - TypeScript, testing, error handling  

## 🔮 Future Enhancements

- [ ] **Email Notifications** - Alert on quality threshold violations
- [ ] **Data Validation** - Pre-processing validation pipeline
- [ ] **Advanced Metrics** - Per-base quality, adapter detection
- [ ] **Multi-file Processing** - Paired-end read support
- [ ] **ML Integration** - Automated quality assessment
- [ ] **Workflow Orchestration** - Integration with Nextflow/Snakemake
- [ ] **Authentication** - User management and access control
- [ ] **Export Features** - PDF reports, CSV downloads

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- Portfolio: [yourwebsite.com](https://yourwebsite.com)

## 🙏 Acknowledgments

- Google Cloud Platform for excellent serverless services
- The bioinformatics community for open-source tools and standards
- Contributors and testers who helped improve this project

## 📚 Additional Resources

- [FASTQ Format Specification](https://en.wikipedia.org/wiki/FASTQ_format)
- [Google Cloud Functions Documentation](https://cloud.google.com/functions/docs)
- [BigQuery Best Practices](https://cloud.google.com/bigquery/docs/best-practices)
- [Terraform GCP Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)

---

⭐ **Star this repo if you find it useful!** ⭐

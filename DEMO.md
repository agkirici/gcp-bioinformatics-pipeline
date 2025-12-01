# 🎬 Demo Guide: GCP Serverless Bioinformatics Pipeline

This guide walks through the complete workflow of the bioinformatics pipeline, from file upload to visualization.

## 📋 Table of Contents

- [Overview](#overview)
- [Pipeline Workflow](#pipeline-workflow)
- [Step-by-Step Demo](#step-by-step-demo)
- [Understanding the Metrics](#understanding-the-metrics)
- [Sample Scenarios](#sample-scenarios)

## 🎯 Overview

This pipeline automates the quality control (QC) analysis of sequencing data. When a researcher uploads a FASTQ file, the system automatically:

1. Detects the upload
2. Analyzes the file
3. Calculates quality metrics
4. Stores results in a database
5. Updates the dashboard in real-time

**No manual intervention required!**

## 🔄 Pipeline Workflow

```
┌─────────────┐
│  1. Upload  │  Researcher uploads FASTQ file to GCS
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 2. Trigger  │  Cloud Function detects new file
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 3. Process  │  Parse FASTQ, calculate QC metrics
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 4. Store    │  Save metrics to BigQuery
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 5. Visualize│  Dashboard automatically updates
└─────────────┘
```

## 📝 Step-by-Step Demo

### Prerequisites

- GCP project with billing enabled
- Terraform configured
- Infrastructure deployed

### Step 1: Deploy Infrastructure

```bash
cd terraform
terraform init
terraform apply
```

This creates:
- GCS bucket for file uploads
- BigQuery dataset and table
- Cloud Function for processing
- Cloud Run services for API and dashboard

### Step 2: Generate Sample FASTQ File

```bash
cd scripts
python3 test_local.py --generate --output demo_sample.fastq --reads 1000 --length 100
```

This creates a realistic FASTQ file for testing.

### Step 3: Upload to GCS

```bash
# Get bucket name from Terraform output
BUCKET_NAME=$(cd terraform && terraform output -raw bucket_name)

# Upload file
gsutil cp demo_sample.fastq gs://$BUCKET_NAME/
```

### Step 4: Monitor Processing

```bash
# Watch Cloud Function logs
gcloud functions logs read fastq-qc-processor --limit 20 --follow
```

You should see:
```
Processing FASTQ file: demo_sample.fastq
Found 1000 reads
QC Metrics: {'total_reads': 1000, 'avg_length': 100.0, ...}
Successfully processed and stored metrics
```

### Step 5: View Results

**Option A: BigQuery Console**
1. Go to [BigQuery Console](https://console.cloud.google.com/bigquery)
2. Navigate to `bioinformatics_qc.fastq_metrics`
3. Click "Preview" to see results

**Option B: Dashboard**
1. Open the React dashboard
2. See new file appear in the table
3. Metrics update in real-time

**Option C: API**
```bash
curl http://YOUR_API_URL/api/metrics
```

## 🔬 Understanding the Metrics

### For Non-Bioinformaticians

#### Total Reads
**What it is**: Number of DNA/RNA sequences in the file  
**Why it matters**: More reads = more data = better statistical power  
**Good value**: Depends on experiment, typically 1M-10M for RNA-seq

#### Average Length
**What it is**: Mean length of each sequence in base pairs  
**Why it matters**: Longer reads provide more information per sequence  
**Good value**: 75-150 bp for short-read sequencing

#### GC Content
**What it is**: Percentage of G (guanine) and C (cytosine) nucleotides  
**Why it matters**: Most organisms have 40-60% GC. Deviations suggest contamination or bias  
**Good value**: 40-60% for most organisms

#### Quality Score (Phred)
**What it is**: Confidence in each base call, on a logarithmic scale  
**Why it matters**: Higher quality = fewer errors = more reliable results  
**Good value**: 
- ≥30: Excellent
- 20-30: Good
- <20: Poor (may need filtering)

### Quality Assessment

The dashboard color-codes quality scores:
- 🟢 **Green**: Excellent (≥30)
- 🟡 **Yellow**: Good (20-30)
- 🔴 **Red**: Poor (<20)

## 🎭 Sample Scenarios

### Scenario 1: High-Quality Data

**File**: `experiment_control_001.fastq`

**Metrics**:
- Total Reads: 5,234,567
- Avg Length: 125 bp
- GC Content: 48.5%
- Avg Quality: 32.5

**Interpretation**: ✅ Excellent quality data, ready for analysis

### Scenario 2: Low Quality Detected

**File**: `batch_2024_01_15.fastq`

**Metrics**:
- Total Reads: 2,100,000
- Avg Length: 98 bp
- GC Content: 52.3%
- Avg Quality: 18.2

**Interpretation**: ⚠️ Low quality detected. May need:
- Quality filtering
- Investigation of sequencing run
- Re-sequencing if quality is critical

### Scenario 3: Unusual GC Content

**File**: `sample_unknown.fastq`

**Metrics**:
- Total Reads: 3,500,000
- Avg Length: 110 bp
- GC Content: 72.5%
- Avg Quality: 28.5

**Interpretation**: ⚠️ Unusual GC content. Possible:
- Different organism than expected
- Contamination
- Sequencing bias

## 🧪 Local Testing Workflow

### Test QC Logic Without GCP

```bash
# Generate sample data
python3 scripts/test_local.py --generate --output test.fastq

# Analyze locally
python3 scripts/test_local.py test.fastq
```

**Output**:
```
============================================================
Processing FASTQ file: test.fastq
============================================================

Parsing FASTQ file...
Found 100 reads

Calculating QC metrics...

============================================================
QUALITY CONTROL METRICS
============================================================
Filename:        test.fastq
Total Reads:     100
Avg Length:      100.00 bp
GC Content:      48.50%
Avg Quality:     28.30 (Phred)
============================================================

QUALITY ASSESSMENT:
  ✓ Excellent quality (Phred >= 30)
  ✓ GC content in normal range (40-60%)
```

## 📊 Dashboard Demo

### Viewing Mock Data

1. Start dashboard: `npm run dev` in `dashboard/` folder
2. Dashboard loads with 10 sample files
3. Explore:
   - Click chart lines to see tooltips
   - Sort table columns
   - Search for specific files

### Connecting to Real Data

1. Deploy API: `./scripts/deploy-api.sh`
2. Update `.env`: `VITE_API_URL=https://your-api-url.run.app`
3. Restart dashboard
4. See real data from BigQuery

## 🎓 Learning Points

This demo showcases:

1. **Event-Driven Architecture**: Automatic processing on file upload
2. **Serverless Computing**: No servers to manage
3. **Data Pipeline**: From raw data to insights
4. **Real-time Visualization**: Live updates as data arrives
5. **Scalability**: Handles any number of files
6. **Infrastructure as Code**: Reproducible deployments

## 🔍 Troubleshooting Demo

### File Not Processing

**Check**:
- File ends with `.fastq` or `.fastq.gz`
- File is in the correct GCS bucket
- Cloud Function logs for errors

### Dashboard Not Updating

**Check**:
- API is running and accessible
- CORS configured correctly
- Browser console for errors

### Metrics Look Wrong

**Check**:
- FASTQ file format is valid
- File isn't corrupted
- Cloud Function logs for parsing errors

## 📚 Next Steps

After running the demo:

1. **Upload Your Own Data**: Try with real FASTQ files
2. **Customize Metrics**: Add new QC calculations
3. **Extend Dashboard**: Add new visualizations
4. **Integrate Workflows**: Connect to analysis pipelines

## 💡 Tips

- Start with small test files (< 1MB) for faster processing
- Monitor Cloud Function logs during first uploads
- Use BigQuery console to explore raw data
- Check dashboard in different browsers/devices

---

**Ready to process your sequencing data?** Follow the steps above and watch the magic happen! ✨


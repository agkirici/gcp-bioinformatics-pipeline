# Simple HTML Dashboard

A lightweight, single-file HTML dashboard for FASTQ QC metrics that requires no build process.

## Features

- Single HTML file - no build process needed
- Bootstrap for styling
- Chart.js for visualizations
- Google Sign-In for authentication
- Direct BigQuery API integration
- Can be hosted on Cloud Storage as static website

## Setup

1. **Get OAuth Client ID**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services > Credentials
   - Create OAuth 2.0 Client ID (Web application)
   - Add authorized JavaScript origins and redirect URIs

2. **Update Configuration**:
   - Open `dashboard.html`
   - Replace `YOUR_PROJECT_ID` with your GCP project ID
   - Replace `YOUR_CLIENT_ID.apps.googleusercontent.com` with your OAuth client ID

3. **Deploy to Cloud Storage**:
   ```bash
   # Create bucket (if not exists)
   gsutil mb gs://your-dashboard-bucket

   # Upload file
   gsutil cp dashboard.html gs://your-dashboard-bucket/

   # Make bucket publicly readable
   gsutil iam ch allUsers:objectViewer gs://your-dashboard-bucket

   # Enable static website hosting
   gsutil web set -m dashboard.html gs://your-dashboard-bucket
   ```

4. **Access Dashboard**:
   - Visit: `https://storage.googleapis.com/your-dashboard-bucket/dashboard.html`
   - Or set up a custom domain

## Permissions

The user needs BigQuery Data Viewer role:
```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="user:USER_EMAIL" \
  --role="roles/bigquery.dataViewer"
```

## Limitations

- Requires user authentication for each session
- Limited to 100 most recent records (can be increased)
- No file upload functionality
- No real-time updates (polls every 30 seconds)

## Customization

You can customize:
- Chart types and colors
- Number of records displayed
- Refresh interval
- Styling and layout


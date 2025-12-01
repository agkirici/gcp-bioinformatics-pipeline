# 📊 FASTQ QC Dashboard

A modern, interactive React dashboard for visualizing FASTQ quality control metrics from Google Cloud BigQuery.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

## 🎯 Overview

The dashboard provides real-time visualization of sequencing data quality metrics, helping bioinformaticians and researchers quickly assess data quality and identify potential issues.

### What It Displays

- **Summary Statistics**: Overview cards showing aggregate metrics
- **Quality Trends**: Interactive line charts showing metrics over time
- **File Details**: Comprehensive table of all processed FASTQ files
- **Real-time Updates**: Automatic refresh when new data arrives

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- (Optional) Running FastAPI backend for production data

### Installation

```bash
cd dashboard
npm install
```

### Development

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## 📦 Project Structure

```
dashboard/
├── src/
│   ├── components/        # React components
│   │   ├── MetricsCard.tsx    # Individual metric display
│   │   ├── QCChart.tsx        # Line chart visualization
│   │   ├── FileTable.tsx      # Data table
│   │   └── StatsOverview.tsx  # Summary cards
│   ├── data/
│   │   └── sampleData.ts      # Mock data generator
│   ├── api/
│   │   └── client.ts          # API client for BigQuery
│   ├── App.tsx                # Main application
│   └── main.tsx               # Entry point
├── package.json
└── vite.config.ts
```

## 🎨 Features

### Mock Data Mode

The dashboard includes a mock data generator (`src/data/sampleData.ts`) that creates realistic sample data for development and demonstration purposes. This allows you to:

- Develop and test without GCP credentials
- Showcase the dashboard functionality
- Understand the data structure

**Mock Data Includes:**
- 10 sample FASTQ files with realistic names
- Timestamps spread over 30 days
- Realistic QC metrics:
  - Total reads: 1M - 6M per file
  - Average length: 75-125 bp
  - GC content: 40-60%
  - Quality scores: 20-35 Phred

### Production Mode

When connected to the FastAPI backend, the dashboard:

- Fetches real data from BigQuery
- Updates automatically when new files are processed
- Supports date range filtering
- Handles large datasets efficiently

## 🔌 API Integration

### Environment Variables

Create a `.env` file for production:

```env
VITE_API_URL=http://localhost:8000
```

For Cloud Run deployment, set this to your API service URL.

### API Endpoints

The dashboard expects these endpoints from the FastAPI backend:

- `GET /api/metrics` - Fetch all QC metrics
- `GET /api/summary` - Get aggregated statistics
- `GET /api/metrics/{filename}` - Get specific file metrics

See [../api/README.md](../api/README.md) for API documentation.

## 🎨 Styling

The dashboard uses **TailwindCSS** for styling with a scientific theme:

- **Color Scheme**: Blue/purple gradient (scientific aesthetic)
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode Ready**: Components support dark theme
- **Accessibility**: WCAG compliant color contrasts

## 📊 Components

### MetricsCard

Displays individual metrics with icons and optional trend indicators.

**Props:**
- `title`: Metric name
- `value`: Numeric or string value
- `subtitle`: Optional description
- `icon`: React component for icon
- `loading`: Loading state

### QCChart

Interactive line chart using Recharts showing multiple QC metrics over time.

**Features:**
- Dual Y-axis for different metric scales
- Tooltips with detailed information
- Legend for metric identification
- Responsive sizing

### FileTable

Sortable, searchable table displaying all processed files.

**Features:**
- Column sorting (click headers)
- Search by filename
- Color-coded quality badges
- Responsive layout

### StatsOverview

Grid of summary statistic cards.

**Displays:**
- Total Files
- Average Quality
- Average GC Content
- Total Reads

## 🧪 Development

### Adding New Metrics

1. Update `MetricsData` interface in `src/data/sampleData.ts`
2. Add metric to `generateSampleData()` function
3. Update components to display new metric
4. Add to BigQuery schema if using production data

### Customizing Charts

The charts use Recharts. To customize:

1. Modify `QCChart.tsx` component
2. Add/remove `Line` components for different metrics
3. Adjust colors in the component
4. Update axis labels and formatting

## 🚢 Deployment

### Docker

```bash
docker build -t fastq-qc-dashboard .
docker run -p 80:80 fastq-qc-dashboard
```

### Cloud Run

See [../scripts/deploy-frontend.sh](../scripts/deploy-frontend.sh) for automated deployment.

## 📸 Screenshots

### Dashboard Overview
![Overview](https://via.placeholder.com/1200x600?text=Dashboard+Overview)

### Quality Trends Chart
![Charts](https://via.placeholder.com/1200x400?text=Quality+Trends+Chart)

### File Table
![Table](https://via.placeholder.com/1200x500?text=File+Table+View)

## 🐛 Troubleshooting

### Dashboard shows loading forever

- Check that mock data is generating correctly
- Verify React Query is configured properly
- Check browser console for errors

### Charts not rendering

- Ensure Recharts is installed: `npm install recharts`
- Check that data array is not empty
- Verify data format matches `MetricsData` interface

### API connection issues

- Verify `VITE_API_URL` is set correctly
- Check CORS settings on API server
- Ensure API is running and accessible

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Recharts Documentation](https://recharts.org)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)

---

**Note**: Replace placeholder images with actual screenshots before publishing to portfolio.

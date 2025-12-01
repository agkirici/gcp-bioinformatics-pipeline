"""
Dashboard creation script for FASTQ QC results

This script queries BigQuery and creates visualizations using plotly.
Can be run locally or deployed as a Flask app.
"""

import os
import sys
from datetime import datetime, timedelta
from google.cloud import bigquery
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import plotly.offline as pyo

# Configuration
PROJECT_ID = os.environ.get('GCP_PROJECT_ID', '')
DATASET_NAME = os.environ.get('DATASET_NAME', 'bioinformatics_qc')
TABLE_NAME = os.environ.get('TABLE_NAME', 'fastq_metrics')

if not PROJECT_ID:
    print("ERROR: GCP_PROJECT_ID environment variable not set")
    print("Set it with: export GCP_PROJECT_ID=your-project-id")
    sys.exit(1)


def query_bigquery(project_id, dataset_name, table_name, days_back=30):
    """
    Query BigQuery for QC metrics.
    
    Args:
        project_id: GCP project ID
        dataset_name: BigQuery dataset name
        table_name: BigQuery table name
        days_back: Number of days to look back
        
    Returns:
        pandas.DataFrame: Query results
    """
    client = bigquery.Client(project=project_id)
    
    query = f"""
    SELECT 
        filename,
        timestamp,
        total_reads,
        avg_length,
        gc_content,
        avg_quality
    FROM `{project_id}.{dataset_name}.{table_name}`
    WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL {days_back} DAY)
    ORDER BY timestamp DESC
    """
    
    print(f"Querying BigQuery...")
    df = client.query(query).to_dataframe()
    
    if df.empty:
        print("WARNING: No data found in BigQuery table")
        return df
    
    # Convert timestamp to datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    print(f"Retrieved {len(df)} records")
    return df


def create_dashboard(df, output_file='dashboard.html'):
    """
    Create HTML dashboard with visualizations.
    
    Args:
        df: pandas.DataFrame with QC metrics
        output_file: Output HTML file path
    """
    if df.empty:
        print("No data to visualize")
        return
    
    # Create subplots
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=(
            'Total Reads per File',
            'Average Quality Scores Over Time',
            'GC Content Distribution',
            'Average Read Length per File'
        ),
        specs=[[{"type": "bar"}, {"type": "scatter"}],
               [{"type": "histogram"}, {"type": "bar"}]]
    )
    
    # 1. Bar chart of total reads per file
    fig.add_trace(
        go.Bar(
            x=df['filename'],
            y=df['total_reads'],
            name='Total Reads',
            marker_color='lightblue'
        ),
        row=1, col=1
    )
    
    # 2. Line chart of average quality scores over time
    fig.add_trace(
        go.Scatter(
            x=df['timestamp'],
            y=df['avg_quality'],
            mode='lines+markers',
            name='Avg Quality',
            line=dict(color='green', width=2),
            marker=dict(size=8)
        ),
        row=1, col=2
    )
    
    # 3. Histogram of GC content distribution
    fig.add_trace(
        go.Histogram(
            x=df['gc_content'],
            nbinsx=20,
            name='GC Content',
            marker_color='orange'
        ),
        row=2, col=1
    )
    
    # 4. Bar chart of average read length
    fig.add_trace(
        go.Bar(
            x=df['filename'],
            y=df['avg_length'],
            name='Avg Length',
            marker_color='purple'
        ),
        row=2, col=2
    )
    
    # Update axes labels
    fig.update_xaxes(title_text="Filename", row=1, col=1)
    fig.update_yaxes(title_text="Total Reads", row=1, col=1)
    
    fig.update_xaxes(title_text="Timestamp", row=1, col=2)
    fig.update_yaxes(title_text="Avg Quality (Phred)", row=1, col=2)
    
    fig.update_xaxes(title_text="GC Content (%)", row=2, col=1)
    fig.update_yaxes(title_text="Frequency", row=2, col=1)
    
    fig.update_xaxes(title_text="Filename", row=2, col=2)
    fig.update_yaxes(title_text="Avg Length (bp)", row=2, col=2)
    
    # Update layout
    fig.update_layout(
        title_text="FASTQ Quality Control Dashboard",
        height=800,
        showlegend=False
    )
    
    # Generate HTML
    html_content = pyo.plot(fig, output_type='div', include_plotlyjs='cdn')
    
    # Create full HTML page
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>FASTQ QC Dashboard</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 20px;
                background-color: #f5f5f5;
            }}
            .header {{
                background-color: #2c3e50;
                color: white;
                padding: 20px;
                border-radius: 5px;
                margin-bottom: 20px;
            }}
            .stats {{
                display: flex;
                gap: 20px;
                margin-bottom: 20px;
            }}
            .stat-card {{
                background-color: white;
                padding: 15px;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                flex: 1;
            }}
            .stat-value {{
                font-size: 2em;
                font-weight: bold;
                color: #3498db;
            }}
            .stat-label {{
                color: #7f8c8d;
                margin-top: 5px;
            }}
            .table-container {{
                background-color: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-top: 20px;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
            }}
            th, td {{
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }}
            th {{
                background-color: #3498db;
                color: white;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>FASTQ Quality Control Dashboard</h1>
            <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">{len(df)}</div>
                <div class="stat-label">Files Processed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{df['total_reads'].sum():,}</div>
                <div class="stat-label">Total Reads</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{df['avg_quality'].mean():.2f}</div>
                <div class="stat-label">Avg Quality (Phred)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{df['gc_content'].mean():.2f}%</div>
                <div class="stat-label">Avg GC Content</div>
            </div>
        </div>
        
        {html_content}
        
        <div class="table-container">
            <h2>Recent Files</h2>
            {df[['filename', 'timestamp', 'total_reads', 'avg_length', 'gc_content', 'avg_quality']].to_html(index=False, classes='table', table_id='data-table')}
        </div>
    </body>
    </html>
    """
    
    # Write to file
    with open(output_file, 'w') as f:
        f.write(full_html)
    
    print(f"\nDashboard created: {output_file}")
    print(f"Open it in your browser to view the visualizations.")


def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Create dashboard from BigQuery QC results'
    )
    parser.add_argument(
        '--project-id',
        default=PROJECT_ID,
        help='GCP Project ID (default: from GCP_PROJECT_ID env var)'
    )
    parser.add_argument(
        '--dataset',
        default=DATASET_NAME,
        help='BigQuery dataset name'
    )
    parser.add_argument(
        '--table',
        default=TABLE_NAME,
        help='BigQuery table name'
    )
    parser.add_argument(
        '--days',
        type=int,
        default=30,
        help='Number of days to look back (default: 30)'
    )
    parser.add_argument(
        '--output',
        default='dashboard.html',
        help='Output HTML file (default: dashboard.html)'
    )
    
    args = parser.parse_args()
    
    if not args.project_id:
        print("ERROR: Project ID is required")
        parser.print_help()
        sys.exit(1)
    
    # Query BigQuery
    df = query_bigquery(args.project_id, args.dataset, args.table, args.days)
    
    if df.empty:
        print("No data to visualize. Make sure files have been processed.")
        sys.exit(0)
    
    # Create dashboard
    create_dashboard(df, args.output)


if __name__ == '__main__':
    main()


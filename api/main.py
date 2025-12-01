"""
FastAPI backend for FASTQ QC Dashboard

Provides REST endpoints for fetching metrics from BigQuery
and generating signed URLs for file uploads to GCS.
"""

import os
import logging
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.cloud import bigquery
from google.cloud import storage
from google.cloud.exceptions import NotFound

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="FASTQ QC API",
    description="API for FASTQ Quality Control metrics",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get configuration from environment variables
PROJECT_ID = os.environ.get("GCP_PROJECT_ID", "")
DATASET_NAME = os.environ.get("BIGQUERY_DATASET", "bioinformatics_qc")
TABLE_NAME = os.environ.get("BIGQUERY_TABLE", "fastq_metrics")
BUCKET_NAME = os.environ.get("GCS_BUCKET", "fastq-uploads")

# Initialize clients
bq_client = bigquery.Client(project=PROJECT_ID) if PROJECT_ID else None
storage_client = storage.Client(project=PROJECT_ID) if PROJECT_ID else None


# Pydantic models
class MetricsData(BaseModel):
    filename: str
    timestamp: str
    total_reads: int
    avg_length: float
    gc_content: float
    avg_quality: float


class SummaryData(BaseModel):
    total_files: int
    total_reads: int
    avg_quality: float
    avg_gc_content: float
    avg_length: float


class UploadRequest(BaseModel):
    filename: str


class UploadResponse(BaseModel):
    signed_url: str
    filename: str


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "FASTQ QC API",
        "version": "1.0.0"
    }


@app.get("/api/metrics", response_model=List[MetricsData])
async def get_metrics(
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)")
):
    """
    Fetch all QC metrics from BigQuery.
    
    Optional query parameters:
    - start_date: Filter results from this date (ISO format)
    - end_date: Filter results until this date (ISO format)
    """
    if not bq_client:
        raise HTTPException(status_code=500, detail="BigQuery client not initialized")
    
    try:
        # Build query
        query = f"""
        SELECT 
            filename,
            timestamp,
            total_reads,
            avg_length,
            gc_content,
            avg_quality
        FROM `{PROJECT_ID}.{DATASET_NAME}.{TABLE_NAME}`
        WHERE 1=1
        """
        
        if start_date:
            query += f" AND timestamp >= TIMESTAMP('{start_date}')"
        
        if end_date:
            query += f" AND timestamp <= TIMESTAMP('{end_date}')"
        
        query += " ORDER BY timestamp DESC"
        
        logger.info(f"Executing query: {query}")
        
        # Execute query
        query_job = bq_client.query(query)
        results = query_job.result()
        
        # Convert to list of dictionaries
        metrics = []
        for row in results:
            metrics.append({
                "filename": row.filename,
                "timestamp": row.timestamp.isoformat() if hasattr(row.timestamp, 'isoformat') else str(row.timestamp),
                "total_reads": row.total_reads,
                "avg_length": float(row.avg_length),
                "gc_content": float(row.gc_content),
                "avg_quality": float(row.avg_quality)
            })
        
        return metrics
    
    except Exception as e:
        logger.error(f"Error fetching metrics: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching metrics: {str(e)}")


@app.get("/api/metrics/{filename}", response_model=MetricsData)
async def get_metrics_by_filename(filename: str):
    """
    Fetch metrics for a specific file.
    """
    if not bq_client:
        raise HTTPException(status_code=500, detail="BigQuery client not initialized")
    
    try:
        query = f"""
        SELECT 
            filename,
            timestamp,
            total_reads,
            avg_length,
            gc_content,
            avg_quality
        FROM `{PROJECT_ID}.{DATASET_NAME}.{TABLE_NAME}`
        WHERE filename = @filename
        ORDER BY timestamp DESC
        LIMIT 1
        """
        
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("filename", "STRING", filename)
            ]
        )
        
        query_job = bq_client.query(query, job_config=job_config)
        results = list(query_job.result())
        
        if not results:
            raise HTTPException(status_code=404, detail=f"Metrics not found for file: {filename}")
        
        row = results[0]
        return {
            "filename": row.filename,
            "timestamp": row.timestamp.isoformat() if hasattr(row.timestamp, 'isoformat') else str(row.timestamp),
            "total_reads": row.total_reads,
            "avg_length": float(row.avg_length),
            "gc_content": float(row.gc_content),
            "avg_quality": float(row.avg_quality)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching metrics for {filename}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching metrics: {str(e)}")


@app.get("/api/summary", response_model=SummaryData)
async def get_summary():
    """
    Get aggregated statistics from all processed files.
    """
    if not bq_client:
        raise HTTPException(status_code=500, detail="BigQuery client not initialized")
    
    try:
        query = f"""
        SELECT 
            COUNT(*) as total_files,
            SUM(total_reads) as total_reads,
            AVG(avg_quality) as avg_quality,
            AVG(gc_content) as avg_gc_content,
            AVG(avg_length) as avg_length
        FROM `{PROJECT_ID}.{DATASET_NAME}.{TABLE_NAME}`
        """
        
        query_job = bq_client.query(query)
        results = list(query_job.result())
        
        if not results or results[0].total_files == 0:
            return {
                "total_files": 0,
                "total_reads": 0,
                "avg_quality": 0.0,
                "avg_gc_content": 0.0,
                "avg_length": 0.0
            }
        
        row = results[0]
        return {
            "total_files": row.total_files,
            "total_reads": int(row.total_reads) if row.total_reads else 0,
            "avg_quality": float(row.avg_quality) if row.avg_quality else 0.0,
            "avg_gc_content": float(row.avg_gc_content) if row.avg_gc_content else 0.0,
            "avg_length": float(row.avg_length) if row.avg_length else 0.0
        }
    
    except Exception as e:
        logger.error(f"Error fetching summary: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching summary: {str(e)}")


@app.post("/api/upload", response_model=UploadResponse)
async def create_upload_url(request: UploadRequest):
    """
    Generate a signed URL for uploading a file to GCS.
    """
    if not storage_client:
        raise HTTPException(status_code=500, detail="Storage client not initialized")
    
    try:
        # Validate filename
        if not request.filename:
            raise HTTPException(status_code=400, detail="Filename is required")
        
        # Check if file is a FASTQ file
        if not (request.filename.endswith('.fastq') or request.filename.endswith('.fastq.gz')):
            raise HTTPException(
                status_code=400,
                detail="File must be a FASTQ file (.fastq or .fastq.gz)"
            )
        
        # Get bucket
        bucket = storage_client.bucket(BUCKET_NAME)
        
        # Create blob
        blob = bucket.blob(request.filename)
        
        # Generate signed URL (valid for 1 hour)
        signed_url = blob.generate_signed_url(
            version="v4",
            expiration=3600,  # 1 hour
            method="PUT",
            content_type="application/octet-stream"
        )
        
        logger.info(f"Generated signed URL for {request.filename}")
        
        return {
            "signed_url": signed_url,
            "filename": request.filename
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating signed URL: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error generating signed URL: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


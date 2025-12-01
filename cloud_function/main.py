"""
Google Cloud Function for FASTQ Quality Control Analysis

This function triggers when a FASTQ file is uploaded to GCS,
performs QC analysis, and stores results in BigQuery.
"""

import os
import logging
import gzip
from datetime import datetime
from google.cloud import storage
from google.cloud import bigquery
import functions_framework

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get environment variables
BUCKET_NAME = os.environ.get('BUCKET_NAME', 'fastq-uploads')
DATASET_NAME = os.environ.get('DATASET_NAME', 'bioinformatics_qc')
TABLE_NAME = os.environ.get('TABLE_NAME', 'fastq_metrics')

# Initialize clients
storage_client = storage.Client()
bq_client = bigquery.Client()


def parse_fastq(file_content):
    """
    Parse FASTQ file content and extract sequences and quality scores.
    
    Args:
        file_content: Raw bytes content of the FASTQ file
        
    Returns:
        tuple: (sequences, quality_strings) lists
    """
    lines = file_content.decode('utf-8').strip().split('\n')
    sequences = []
    quality_strings = []
    
    i = 0
    while i < len(lines):
        if lines[i].startswith('@'):
            # Sequence identifier line
            if i + 3 < len(lines):
                sequences.append(lines[i + 1])  # Sequence line
                quality_strings.append(lines[i + 3])  # Quality line
            i += 4
        else:
            i += 1
    
    return sequences, quality_strings


def calculate_qc_metrics(sequences, quality_strings):
    """
    Calculate quality control metrics from FASTQ sequences.
    
    Args:
        sequences: List of DNA sequences
        quality_strings: List of quality score strings
        
    Returns:
        dict: QC metrics
    """
    if not sequences:
        return {
            'total_reads': 0,
            'avg_length': 0.0,
            'gc_content': 0.0,
            'avg_quality': 0.0
        }
    
    total_reads = len(sequences)
    
    # Calculate average read length
    total_length = sum(len(seq) for seq in sequences)
    avg_length = total_length / total_reads if total_reads > 0 else 0.0
    
    # Calculate GC content
    total_bases = 0
    gc_bases = 0
    for seq in sequences:
        seq_upper = seq.upper()
        total_bases += len(seq_upper)
        gc_bases += seq_upper.count('G') + seq_upper.count('C')
    
    gc_content = (gc_bases / total_bases * 100) if total_bases > 0 else 0.0
    
    # Calculate average quality score (Phred+33)
    total_quality = 0
    quality_count = 0
    for qual_str in quality_strings:
        for char in qual_str:
            phred_score = ord(char) - 33  # Phred+33 encoding
            total_quality += phred_score
            quality_count += 1
    
    avg_quality = total_quality / quality_count if quality_count > 0 else 0.0
    
    return {
        'total_reads': total_reads,
        'avg_length': round(avg_length, 2),
        'gc_content': round(gc_content, 2),
        'avg_quality': round(avg_quality, 2)
    }


@functions_framework.cloud_event
def process_fastq(cloud_event):
    """
    Cloud Function entry point triggered by GCS object creation.
    
    Args:
        cloud_event: CloudEvent containing GCS object metadata
    """
    try:
        # Extract file information from the event
        # For 2nd gen Cloud Functions, the data is in cloud_event.data
        data = cloud_event.data
        bucket_name = data.get('bucket', BUCKET_NAME)
        file_name = data.get('name', '')
        
        # Check if file is a FASTQ file
        if not (file_name.endswith('.fastq') or file_name.endswith('.fastq.gz')):
            logger.info(f"Skipping non-FASTQ file: {file_name}")
            return
        
        logger.info(f"Processing FASTQ file: {file_name} from bucket: {bucket_name}")
        
        # Download file from GCS
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(file_name)
        
        # Read file content
        if file_name.endswith('.gz'):
            file_content = gzip.decompress(blob.download_as_bytes())
        else:
            file_content = blob.download_as_bytes()
        
        # Parse FASTQ file
        sequences, quality_strings = parse_fastq(file_content)
        
        # Calculate QC metrics
        metrics = calculate_qc_metrics(sequences, quality_strings)
        
        logger.info(f"QC Metrics for {file_name}: {metrics}")
        
        # Prepare data for BigQuery
        dataset_ref = bq_client.dataset(DATASET_NAME)
        table_ref = dataset_ref.table(TABLE_NAME)
        
        row = {
            'filename': file_name,
            'timestamp': datetime.utcnow().isoformat(),
            'total_reads': metrics['total_reads'],
            'avg_length': metrics['avg_length'],
            'gc_content': metrics['gc_content'],
            'avg_quality': metrics['avg_quality']
        }
        
        # Insert row into BigQuery
        errors = bq_client.insert_rows_json(table_ref, [row])
        
        if errors:
            logger.error(f"Error inserting into BigQuery: {errors}")
            raise Exception(f"BigQuery insert failed: {errors}")
        
        logger.info(f"Successfully processed and stored metrics for {file_name}")
        
    except Exception as e:
        logger.error(f"Error processing FASTQ file: {str(e)}", exc_info=True)
        raise


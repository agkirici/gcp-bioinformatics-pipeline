export interface MetricsData {
  filename: string
  timestamp: string
  total_reads: number
  avg_length: number
  gc_content: number
  avg_quality: number
}

export interface SummaryData {
  total_files: number
  total_reads: number
  avg_quality: number
  avg_gc_content: number
  avg_length: number
}

export interface UploadResponse {
  signed_url: string
  filename: string
}


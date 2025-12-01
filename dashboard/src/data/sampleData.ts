/**
 * Sample data for development and testing
 * Simulates BigQuery results for FASTQ QC metrics
 */

export interface MetricsData {
  filename: string;
  timestamp: string;
  total_reads: number;
  avg_length: number;
  gc_content: number;
  avg_quality: number;
}

export interface SummaryStats {
  totalFiles: number;
  avgQuality: number;
  avgGcContent: number;
  totalReads: number;
}

/**
 * Generate sample metrics data
 * Returns an array of mock FASTQ QC metrics
 */
export function generateSampleData(): MetricsData[] {
  const files = [
    'sample_001.fastq',
    'sample_002.fastq',
    'sample_003.fastq.gz',
    'experiment_A_R1.fastq',
    'experiment_A_R2.fastq',
    'control_001.fastq.gz',
    'treatment_001.fastq',
    'batch_2024_01_15.fastq.gz',
    'batch_2024_01_16.fastq.gz',
    'batch_2024_01_17.fastq.gz',
  ];

  const data: MetricsData[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 30); // Start 30 days ago

  files.forEach((filename, index) => {
    const timestamp = new Date(baseDate);
    timestamp.setDate(timestamp.getDate() + index * 3); // Spread over time

    // Generate realistic QC metrics
    const totalReads = Math.floor(Math.random() * 5000000) + 1000000; // 1M to 6M reads
    const avgLength = Math.floor(Math.random() * 50) + 75; // 75-125 bp
    const gcContent = Math.random() * 20 + 40; // 40-60%
    const avgQuality = Math.random() * 15 + 20; // 20-35 Phred score

    data.push({
      filename,
      timestamp: timestamp.toISOString(),
      total_reads: totalReads,
      avg_length: parseFloat(avgLength.toFixed(2)),
      gc_content: parseFloat(gcContent.toFixed(2)),
      avg_quality: parseFloat(avgQuality.toFixed(2)),
    });
  });

  // Sort by timestamp (most recent first)
  return data.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Calculate summary statistics from metrics data
 */
export function calculateSummaryStats(data: MetricsData[]): SummaryStats {
  if (data.length === 0) {
    return {
      totalFiles: 0,
      avgQuality: 0,
      avgGcContent: 0,
      totalReads: 0,
    };
  }

  const totalReads = data.reduce((sum, item) => sum + item.total_reads, 0);
  const avgQuality = 
    data.reduce((sum, item) => sum + item.avg_quality, 0) / data.length;
  const avgGcContent = 
    data.reduce((sum, item) => sum + item.gc_content, 0) / data.length;

  return {
    totalFiles: data.length,
    avgQuality: parseFloat(avgQuality.toFixed(2)),
    avgGcContent: parseFloat(avgGcContent.toFixed(2)),
    totalReads,
  };
}

/**
 * Simulate API delay for development
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


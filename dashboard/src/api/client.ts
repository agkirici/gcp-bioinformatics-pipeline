/**
 * API Client for BigQuery integration
 * 
 * This client will be used to fetch QC metrics from the FastAPI backend
 * For now, it's set up with the structure for future BigQuery integration
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { MetricsData } from '../data/sampleData';

// Base URL for the API (will be configured via environment variables)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

/**
 * Request interceptor for adding auth tokens if needed
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error:', error.request);
    } else {
      // Error setting up request
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * API Service for QC Metrics
 */
export const metricsApi = {
  /**
   * Fetch all QC metrics
   * @param startDate Optional start date filter (ISO string)
   * @param endDate Optional end date filter (ISO string)
   * @returns Promise with array of metrics
   */
  async getMetrics(
    startDate?: string,
    endDate?: string
  ): Promise<MetricsData[]> {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await apiClient.get<MetricsData[]>('/api/metrics', {
      params,
    });
    return response.data;
  },

  /**
   * Fetch metrics for a specific file
   * @param filename Name of the file
   * @returns Promise with metrics data
   */
  async getMetricsByFilename(filename: string): Promise<MetricsData> {
    const response = await apiClient.get<MetricsData>(
      `/api/metrics/${encodeURIComponent(filename)}`
    );
    return response.data;
  },

  /**
   * Fetch summary statistics
   * @returns Promise with summary stats
   */
  async getSummary(): Promise<{
    total_files: number;
    total_reads: number;
    avg_quality: number;
    avg_gc_content: number;
    avg_length: number;
  }> {
    const response = await apiClient.get('/api/summary');
    return response.data;
  },
};

export default apiClient;


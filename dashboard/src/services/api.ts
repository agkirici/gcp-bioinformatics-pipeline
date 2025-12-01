import axios from 'axios'
import { MetricsData, SummaryData, UploadResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for auth if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const fetchMetrics = async (
  startDate: Date | null = null,
  endDate: Date | null = null
): Promise<MetricsData[]> => {
  const params: any = {}
  if (startDate) {
    params.start_date = startDate.toISOString()
  }
  if (endDate) {
    params.end_date = endDate.toISOString()
  }

  const response = await api.get<MetricsData[]>('/api/metrics', { params })
  return response.data
}

export const fetchMetricsByFilename = async (filename: string): Promise<MetricsData> => {
  const response = await api.get<MetricsData>(`/api/metrics/${encodeURIComponent(filename)}`)
  return response.data
}

export const fetchSummary = async (): Promise<SummaryData> => {
  const response = await api.get<SummaryData>('/api/summary')
  return response.data
}

export const getUploadUrl = async (filename: string): Promise<UploadResponse> => {
  const response = await api.post<UploadResponse>('/api/upload', { filename })
  return response.data
}

export default api


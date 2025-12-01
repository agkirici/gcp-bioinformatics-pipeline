/**
 * Main App Component
 * 
 * Dashboard application for FASTQ QC metrics visualization
 * Uses React Query for data fetching and state management
 */

import React from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import StatsOverview from './components/StatsOverview';
import QCChart from './components/QCChart';
import FileTable from './components/FileTable';
import {
  generateSampleData,
  calculateSummaryStats,
  MetricsData,
} from './data/sampleData';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Custom hook to fetch metrics data
 * For now, uses mock data. Will be replaced with API call later
 */
function useMetrics() {
  return useQuery<MetricsData[]>({
    queryKey: ['metrics'],
    queryFn: () => {
      // Return data immediately (synchronous for mock data)
      return Promise.resolve(generateSampleData());
    },
    // Provide initial data to avoid loading state
    initialData: generateSampleData(),
  });
}

/**
 * Dashboard Content Component
 */
function DashboardContent() {
  const { data: metrics = [], isLoading } = useMetrics();

  // Calculate summary stats from metrics
  const summaryStats = calculateSummaryStats(metrics);

  // Only show loading when actually loading
  const loading = isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FASTQ QC Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Quality control metrics for processed sequencing files
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <StatsOverview stats={summaryStats} loading={loading} />

        {/* Charts Section */}
        <div className="mb-8">
          <QCChart data={metrics} loading={loading} />
        </div>

        {/* Files Table */}
        <div>
          <FileTable data={metrics} loading={loading} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Bioinformatics QC Pipeline - Powered by Google Cloud Platform
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Root App Component with Query Provider
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}

export default App;

/**
 * StatsOverview Component
 * 
 * Dashboard overview showing summary statistics in card format
 * Displays: Total Files, Avg Quality, Avg GC Content, Total Reads
 */

import React from 'react';
import MetricsCard from './MetricsCard';
import { SummaryStats } from '../data/sampleData';

interface StatsOverviewProps {
  stats: SummaryStats;
  loading?: boolean;
}

// Simple icon components (using SVG)
const FileIcon = () => (
  <svg
    className="w-6 h-6 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const QualityIcon = () => (
  <svg
    className="w-6 h-6 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const GCIcon = () => (
  <svg
    className="w-6 h-6 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const ReadsIcon = () => (
  <svg
    className="w-6 h-6 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
    />
  </svg>
);

export default function StatsOverview({
  stats,
  loading = false,
}: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricsCard
        title="Total Files"
        value={stats.totalFiles}
        subtitle="FASTQ files processed"
        icon={<FileIcon />}
        loading={loading}
      />
      <MetricsCard
        title="Avg Quality"
        value={stats.avgQuality.toFixed(2)}
        subtitle="Phred score"
        icon={<QualityIcon />}
        loading={loading}
      />
      <MetricsCard
        title="Avg GC Content"
        value={`${stats.avgGcContent.toFixed(2)}%`}
        subtitle="Percentage"
        icon={<GCIcon />}
        loading={loading}
      />
      <MetricsCard
        title="Total Reads"
        value={stats.totalReads.toLocaleString()}
        subtitle="Across all files"
        icon={<ReadsIcon />}
        loading={loading}
      />
    </div>
  );
}

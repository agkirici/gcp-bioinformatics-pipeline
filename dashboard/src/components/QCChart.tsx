/**
 * QCChart Component
 * 
 * Line chart displaying QC metrics over time using Recharts
 * Shows quality trends, GC content, and other metrics
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MetricsData } from '../data/sampleData';

interface QCChartProps {
  data: MetricsData[];
  loading?: boolean;
}

export default function QCChart({ data, loading = false }: QCChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          QC Metrics Over Time
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  // Format data for chart (sort by timestamp, most recent first)
  const chartData = [...data]
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    .map((item) => ({
      ...item,
      date: new Date(item.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        QC Metrics Over Time
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            stroke="#3b82f6"
            tick={{ fill: '#3b82f6', fontSize: 12 }}
            label={{
              value: 'Quality Score / GC %',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#6b7280' },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#10b981"
            tick={{ fill: '#10b981', fontSize: 12 }}
            label={{
              value: 'Reads / Length',
              angle: 90,
              position: 'insideRight',
              style: { textAnchor: 'middle', fill: '#6b7280' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="avg_quality"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Avg Quality (Phred)"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="gc_content"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="GC Content (%)"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="total_reads"
            stroke="#10b981"
            strokeWidth={2}
            name="Total Reads"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avg_length"
            stroke="#f59e0b"
            strokeWidth={2}
            name="Avg Length (bp)"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

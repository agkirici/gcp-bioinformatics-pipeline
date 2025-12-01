/**
 * FileTable Component
 * 
 * Displays a table of all processed FASTQ files with their QC metrics
 * Columns: filename, timestamp, reads, quality, GC%
 */

import React from 'react';
import { MetricsData } from '../data/sampleData';

interface FileTableProps {
  data: MetricsData[];
  loading?: boolean;
}

export default function FileTable({ data, loading = false }: FileTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Processed Files
        </h3>
        <div className="text-center py-12 text-gray-500">
          No files processed yet
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getQualityBadgeColor = (quality: number): string => {
    if (quality >= 30) return 'bg-green-100 text-green-800';
    if (quality >= 20) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Processed Files ({data.length})
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Filename
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Timestamp
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                Total Reads
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                Avg Length
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                GC Content
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                Avg Quality
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                  {item.filename}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {formatDate(item.timestamp)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  {item.total_reads.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  {item.avg_length.toFixed(2)} bp
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  {item.gc_content.toFixed(2)}%
                </td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getQualityBadgeColor(
                      item.avg_quality
                    )}`}
                  >
                    {item.avg_quality.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

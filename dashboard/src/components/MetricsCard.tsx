/**
 * MetricsCard Component
 * 
 * Displays an individual metric with icon and value
 * Used in the dashboard overview to show key statistics
 */

import React from 'react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export default function MetricsCard({
  title,
  value,
  subtitle,
  icon,
  loading = false,
}: MetricsCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

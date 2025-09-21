import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = null,
  fullScreen = false 
}) => {
  // Size variants
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  // Color variants
  const colorClasses = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-600',
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600'
  };

  const spinnerClass = `${sizeClasses[size]} border-4 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`;

  const LoadingContent = () => (
    <motion.div
      className={`flex flex-col items-center justify-center ${
        fullScreen ? 'min-h-screen' : 'py-8'
      }`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={spinnerClass} />
      {text && (
        <motion.p
          className={`mt-4 text-sm ${
            color === 'white' ? 'text-white' : 'text-gray-600'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm">
        <LoadingContent />
      </div>
    );
  }

  return <LoadingContent />;
};

// Skeleton loader for content placeholders
export const SkeletonLoader = ({ 
  lines = 3, 
  height = 'h-4', 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 rounded ${height} ${
            index < lines - 1 ? 'mb-2' : ''
          } ${
            index === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

// Card skeleton loader
export const CardSkeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full mr-4" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  );
};

// Table skeleton loader
export const TableSkeleton = ({ rows = 5, cols = 4, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="overflow-hidden bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: cols }).map((_, index) => (
                <th key={index} className="px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Chart skeleton loader
export const ChartSkeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-6" />
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  );
};

export default LoadingSpinner;
'use client';

import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  description,
  actionLabel,
  actionHref,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-xl font-semibold mt-1 text-gray-900">{value}</p>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="p-2 rounded-full bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
      
      {actionLabel && actionHref && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <a 
            href={actionHref} 
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
          >
            {actionLabel}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
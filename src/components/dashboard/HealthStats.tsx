'use client';

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface HealthStatsProps {
  weightData?: Array<{date: string; value: number}>;
  bloodPressureData?: Array<{date: string; systolic: number; diastolic: number}>;
  className?: string;
}

const HealthStats: React.FC<HealthStatsProps> = ({ 
  weightData = [], 
  bloodPressureData = [],
  className = ''
}) => {
  // Sample data if no data is provided
  const sampleWeightData = weightData.length > 0 ? weightData : [
    { date: 'Jan', value: 70 },
    { date: 'Feb', value: 69 },
    { date: 'Mar', value: 68 },
    { date: 'Apr', value: 67.5 },
    { date: 'May', value: 68 },
    { date: 'Jun', value: 67 },
  ];

  const sampleBloodPressureData = bloodPressureData.length > 0 ? bloodPressureData : [
    { date: 'Jan', systolic: 120, diastolic: 80 },
    { date: 'Feb', systolic: 118, diastolic: 78 },
    { date: 'Mar', systolic: 122, diastolic: 82 },
    { date: 'Apr', systolic: 119, diastolic: 79 },
    { date: 'May', systolic: 121, diastolic: 80 },
    { date: 'Jun', systolic: 118, diastolic: 78 },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-5 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Health Statistics</h2>
      
      <div className="space-y-6">
        {/* Weight Chart */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Weight (kg)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sampleWeightData}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#weightGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Blood Pressure Chart */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Blood Pressure (mmHg)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sampleBloodPressureData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  domain={['dataMin - 10', 'dataMax + 10']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="systolic" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  dot={{ stroke: '#ef4444', strokeWidth: 2, r: 4, fill: '#fff' }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="diastolic" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4, fill: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthStats;
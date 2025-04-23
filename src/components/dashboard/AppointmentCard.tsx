'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

interface AppointmentProps {
  date: string;
  time: string;
  doctorName: string;
  location?: string;
  status?: 'upcoming' | 'completed' | 'cancelled';
}

const AppointmentCard: React.FC<AppointmentProps> = ({
  date,
  time,
  doctorName,
  location,
  status = 'upcoming'
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-50 rounded-full text-blue-600">
          <Calendar size={20} />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">{date}</h3>
              <p className="text-sm text-gray-500">{time}</p>
            </div>
            
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor()}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          
          <div className="mt-2">
            <p className="font-medium text-gray-800">Dr. {doctorName}</p>
            {location && <p className="text-sm text-gray-500">{location}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
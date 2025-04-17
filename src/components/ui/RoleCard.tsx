'use client';

import React from 'react';
import { NavigationLink } from './NavigationLoader';

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

const RoleCard: React.FC<RoleCardProps> = ({ icon, title, description, href }) => {
  return (
    <NavigationLink href={href} className="block">
      <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all p-6 h-full">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 text-blue-600">
            {icon}
          </div>
          <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </NavigationLink>
  );
};

export default RoleCard; 
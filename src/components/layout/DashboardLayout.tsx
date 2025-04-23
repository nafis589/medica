'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  FileText, 
  Calendar, 
  Pill, 
  Droplet, 
  Settings, 
  Menu, 
  X,
  Bell,
  LogOut
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'patient' | 'doctor' | 'admin';
  userName?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  userType,
  userName = 'User'
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    // TODO: Implement logout functionality
    router.push('/login');
  };

  const patientNavItems = [
    { name: 'Dashboard', icon: <Home size={20} />, href: '/dashboard/patient' },
    { name: 'Medical Records', icon: <FileText size={20} />, href: '/dashboard/patient/records' },
    { name: 'Appointments', icon: <Calendar size={20} />, href: '/dashboard/patient/appointments' },
    { name: 'Medications', icon: <Pill size={20} />, href: '/dashboard/patient/medications' },
    { name: 'Blood Donation', icon: <Droplet size={20} />, href: '/dashboard/patient/blood-donation' },
    { name: 'Settings', icon: <Settings size={20} />, href: '/dashboard/patient/settings' },
  ];

  // Use appropriate nav items based on user type
  const navItems = userType === 'patient' ? patientNavItems : [];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <button 
        className="fixed z-50 p-2 bg-blue-600 rounded-full shadow-lg text-white md:hidden left-4 top-4"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 transform bg-white border-r border-gray-200 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-blue-600">Medica</h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center px-4 py-3 text-gray-700 transition-colors rounded-md hover:bg-blue-50 hover:text-blue-600 group"
              >
                <span className="text-gray-500 group-hover:text-blue-600">{item.icon}</span>
                <span className="ml-3">{item.name}</span>
              </a>
            ))}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-700 transition-colors rounded-md hover:bg-red-50 hover:text-red-600 group"
            >
              <LogOut size={20} className="text-gray-500 group-hover:text-red-600" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">Welcome, {userName}</h1>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-1 text-gray-500 transition-colors rounded-full hover:text-blue-600 hover:bg-blue-50">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="w-8 h-8 overflow-hidden bg-gray-200 rounded-full">
              {/* User avatar placeholder */}
              <div className="flex items-center justify-center w-full h-full text-gray-500 bg-blue-100">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
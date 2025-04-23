'use client';

import React from 'react';
import { 
  Calendar, 
  Pill, 
  Clock, 
  Droplet, 
  Activity,
  Bell,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardCard from '@/components/ui/DashboardCard';
import AppointmentCard from '@/components/dashboard/AppointmentCard';
import HealthStats from '@/components/dashboard/HealthStats';

const PatientDashboard = () => {
  // Mock data for the dashboard
  const patientName = "Damien";
  const reminders = [
    { id: 1, medication: "Paracetamol", time: "3:00 PM", taken: false },
    { id: 2, medication: "Vitamin D", time: "9:00 AM", taken: true },
    { id: 3, medication: "Antibiotic", time: "8:00 PM", taken: false },
  ];

  const recentActivities = [
    { id: 1, type: "appointment", description: "Consultation with Dr. Alexander Kalish", date: "May 7, 2023" },
    { id: 2, type: "prescription", description: "New prescription for Amoxicillin", date: "May 5, 2023" },
    { id: 3, type: "test", description: "Blood test results uploaded", date: "May 3, 2023" },
    { id: 4, type: "appointment", description: "Dental checkup with Dr. Sarah Miller", date: "April 28, 2023" },
  ];

  return (
    <DashboardLayout userType="patient" userName={patientName}>
      <div className="space-y-6">
        {/* Summary Cards Section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Next Appointment"
            value="May 7, 2023"
            description="Dr. Alexander Kalish at 10:30 AM"
            icon={<Calendar size={20} />}
            actionLabel="View Details"
            actionHref="/dashboard/patient/appointments"
          />
          <DashboardCard
            title="Ongoing Treatment"
            value="Antibiotics"
            description="3 times daily for 7 days"
            icon={<Pill size={20} />}
            actionLabel="View Medications"
            actionHref="/dashboard/patient/medications"
          />
          <DashboardCard
            title="Last Consultation"
            value="April 28, 2023"
            description="Dr. Sarah Miller - Dental Checkup"
            icon={<Clock size={20} />}
            actionLabel="View Records"
            actionHref="/dashboard/patient/records"
          />
          <DashboardCard
            title="Blood Donation"
            value="Eligible"
            description="Last donation: 3 months ago"
            icon={<Droplet size={20} />}
            actionLabel="Donate Now"
            actionHref="/dashboard/patient/blood-donation"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Reminders */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Today&apos;s Reminders</h2>
                <Bell size={18} className="text-blue-600" />
              </div>
              
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {reminder.taken ? 
                        <CheckCircle2 size={18} className="text-green-500" /> : 
                        <AlertCircle size={18} className="text-amber-500" />
                      }
                      <div>
                        <p className="font-medium text-gray-800">{reminder.medication}</p>
                        <p className="text-sm text-gray-500">{reminder.time}</p>
                      </div>
                    </div>
                    {!reminder.taken && (
                      <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                        Mark as taken
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100">
                <a 
                  href="/dashboard/patient/medications" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                >
                  View all medications
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
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Activities</h2>
                <Activity size={18} className="text-blue-600" />
              </div>
              
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="relative pl-5 pb-5 border-l-2 border-gray-200 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-600"></div>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                    <p className="font-medium text-gray-800 mt-1">{activity.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100">
                <a 
                  href="/dashboard/patient/records" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                >
                  View all activities
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
            </div>
          </div>

          {/* Right Column - Health Stats */}
          <div className="lg:col-span-2">
            <HealthStats className="h-full" />
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h2>
            <a 
              href="/dashboard/patient/appointments" 
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View all
            </a>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AppointmentCard 
              date="May 7, 2023"
              time="10:30 AM"
              doctorName="Alexander Kalish"
              location="123 Healthcare Blvd, Burlington"
              status="upcoming"
            />
            <AppointmentCard 
              date="May 15, 2023"
              time="2:00 PM"
              doctorName="Sarah Miller"
              location="Dental Clinic, 45 Main St"
              status="upcoming"
            />
            <AppointmentCard 
              date="April 28, 2023"
              time="11:15 AM"
              doctorName="Sarah Miller"
              location="Dental Clinic, 45 Main St"
              status="completed"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
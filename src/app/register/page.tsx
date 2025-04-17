'use client';

import React from 'react';
import Header from '../../components/layout/Header';
import RoleCard from '../../components/ui/RoleCard';
import { NavigationLink } from '../../components/ui/NavigationLoader';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-hidden relative">
      {/* Hand-drawn decorative elements */}
      
      {/* Top-right corner illustration */}
      <div className="absolute top-20 right-8 opacity-40 hidden md:block">
        <svg width="240" height="150" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M25,40 C32,28 50,16 60,18 C70,20 68,38 80,42 C92,46 105,30 120,32 C135,34 140,50 160,46 C180,42 184,22 190,30" 
                stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 4" />
          <path d="M30,70 C42,60 60,62 75,75 C90,88 110,82 125,70 C140,58 160,65 175,75" 
                stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 3" />
          <path d="M155,15 C158,10 164,8 168,10 C172,12 174,18 172,22 C170,26 164,28 160,26 C156,24 152,20 155,15" 
                stroke="#3B82F6" strokeWidth="1" strokeLinecap="round" />
          <text x="135" y="18" fontFamily="Arial" fontSize="14" fontWeight="bold" fill="#3B82F6" fontStyle="italic">Care</text>
        </svg>
      </div>

      {/* Bottom-left illustration */}
      <div className="absolute bottom-10 left-12 opacity-40 hidden lg:block">
        <svg width="220" height="180" viewBox="0 0 180 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10,80 C15,65 25,55 40,60 C55,65 60,80 75,85 C90,90 110,75 125,85 C140,95 150,120 170,115" 
                stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20,120 Q40,100 60,110 Q80,120 100,110 Q120,100 140,110 Q160,120 170,100" 
                stroke="#F87171" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" />
          <path d="M25,40 C30,35 40,35 45,40 C50,45 50,55 45,60 C40,65 30,65 25,60 C20,55 20,45 25,40" 
                stroke="#F87171" strokeWidth="1" strokeLinecap="round" />
          <text x="15" y="130" fontFamily="Arial" fontSize="14" fontWeight="bold" fill="#F87171" fontStyle="italic">Wellness</text>
        </svg>
      </div>

      {/* Right-side illustration */}
      <div className="absolute top-1/2 right-10 transform -translate-y-1/2 opacity-40 hidden lg:block">
        <svg width="150" height="360" viewBox="0 0 120 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M40,20 C45,40 55,60 50,80 C45,100 35,120 40,140 C45,160 55,180 50,200 C45,220 35,240 40,260" 
                stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 6" />
          <path d="M80,30 C85,50 75,70 80,90 C85,110 95,130 90,150 C85,170 75,190 80,210 C85,230 95,250 90,270" 
                stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 2" />
          <path d="M60,130 C65,120 75,115 80,120 C85,125 85,135 80,140 C75,145 65,145 60,140 C55,135 55,125 60,120" 
                stroke="#6B7280" strokeWidth="1" strokeLinecap="round" />
          <text x="60" y="180" fontFamily="Arial" fontSize="16" fontWeight="bold" fill="#6B7280" fontStyle="italic" transform="rotate(90, 60, 180)">Health</text>
        </svg>
      </div>

      {/* Reusing the Header without auth buttons */}
      <Header showAuthButtons={false} />

      <main className="flex-grow relative z-10">
        <div className="max-w-4xl mx-auto py-16 px-6">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Create an Account</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Please select your role to continue with registration. Choose the option that best describes how you&apos;ll use Medica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {/* Patient Role */}
            <RoleCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              title="Patient"
              description="Register as a patient to book appointments, access medical records, and consult with healthcare providers."
              href="/register/patient"
            />
            
            {/* Doctor Role */}
            <RoleCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              }
              title="Doctor"
              description="Join as a healthcare provider to manage appointments, update patient records, and provide teleconsultations."
              href="/register/doctor"
            />
            
            {/* Administrator Role */}
            <RoleCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="Administrator"
              description="Manage the platform, users, and system settings. Control access levels and monitor system usage."
              href="/register/admin"
            />
          </div>

          {/* Small centered bottom illustration */}
          <div className="text-center mt-12 relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-6 opacity-40">
              <svg width="120" height="24" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5,10 C15,5 25,15 35,10 C45,5 55,15 65,10 C75,5 85,15 95,10" 
                      stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            
            <p className="text-sm text-gray-500">
              Already have an account? <NavigationLink href="/login" className="text-blue-600 hover:underline">Sign in here</NavigationLink>
            </p>
          </div>
        </div>
      </main>
      
      {/* Add subtle animation with CSS */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        svg {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 
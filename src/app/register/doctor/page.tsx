'use client';

import React from 'react';
import Header from '../../../components/layout/Header';
import DoctorRegistrationForm from '../../../components/registration/DoctorRegistrationForm';

export default function DoctorRegistration() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header showAuthButtons={false} />
      
      <main className="flex-grow flex justify-center relative overflow-hidden">
        {/* Background gradient from top-right - positioned below header */}
        <div className="absolute top-10 right-0 w-2/5 h-2/5 bg-blue-300 opacity-60 rounded-full blur-3xl transform translate-x-1/4"></div>
        
        {/* Background gradient from bottom-left */}
        <div className="absolute bottom-0 left-0 w-2/5 h-2/5 bg-blue-400 opacity-50 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4"></div>
        
        <div className="w-full max-w-2xl py-12 px-4 relative z-10">
          <DoctorRegistrationForm />
        </div>
      </main>
    </div>
  );
} 
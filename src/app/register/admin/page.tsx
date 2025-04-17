'use client';

import React from 'react';
import Header from '../../../components/layout/Header';
import Link from 'next/link';

export default function AdminRegistration() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header showAuthButtons={false} />
      
      <main className="flex-grow">
        <div className="max-w-md mx-auto py-16 px-6">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Administrator Registration</h1>
            <p className="text-gray-600 mb-8">
              This is a placeholder for the administrator registration form.
            </p>
            
            <Link href="/register" className="text-blue-600 hover:underline">
              &larr; Back to role selection
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 
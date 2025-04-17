'use client';

import React from 'react';
import Header from '../components/layout/Header';
import { NavigationLink } from '../components/ui/NavigationLoader';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Use the reusable Header component */}
      <Header />

      {/* Hero Section */}
      <main className="flex-grow bg-white">
        <div className="max-w-7xl mx-auto py-16 px-6 flex items-center">
          <div className="w-1/2 pr-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome to{" "}
              <span className="relative inline-block">
                <span className="relative z-10 px-3 py-1 bg-blue-50 border border-blue-200 rounded-md">
                  Medica
                </span>
                {/* Custom SVG decoration with much longer lines */}
                <svg className="absolute -top-3 -right-6 w-16 h-16 z-0" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12C12 8 25 7 45 8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 24C18 19 32 18 50 20" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M1 36C15 31 30 30 48 32" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">Your trusted partner for quality healthcare services. Access medical advice, book appointments, and manage your health journey all in one place.</p>
            <NavigationLink 
              href="/register" 
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors inline-block"
            >
              Start Free
            </NavigationLink>
          </div>
          <div className="w-1/2 flex flex-col justify-center relative">
            {/* Minimalist Arrow SVG */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12 w-full max-w-[150px] opacity-70">
              <svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                <path 
                  d="M20,10 C60,-10 80,30 50,45 L50,45 L50,55 L60,45 L40,45 L50,55 L50,45" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-blue-500"
                />
              </svg>
            </div>
            <div className="rounded-lg w-full h-96 overflow-hidden shadow-md">
              <img 
                src="/img/medica-img.jpg" 
                alt="Healthcare professionals" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Features Section - Centered with horizontal layout */}
        <div className="bg-blue-50 max-w-6xl mx-auto px-8 py-16">
          <div className="flex flex-wrap">
            {/* Medical Records */}
            <div className="w-full md:w-1/4 flex px-6 py-4 md:border-r border-gray-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Medical Records</h3>
                  <p className="mt-1 text-sm text-gray-900">Access and manage your complete medical history in one secure place.</p>
                </div>
              </div>
            </div>
            
            {/* Appointments */}
            <div className="w-full md:w-1/4 flex px-6 py-4 md:border-r border-gray-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
                  <p className="mt-1 text-sm text-gray-900">Schedule and manage appointments with healthcare providers effortlessly.</p>
                </div>
              </div>
            </div>
            
            {/* Teleconsultations */}
            <div className="w-full md:w-1/4 flex px-6 py-4 md:border-r border-gray-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-600">
                      <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Teleconsultations</h3>
                  <p className="mt-1 text-sm text-gray-900">Consult with medical professionals remotely from the comfort of your home.</p>
                </div>
              </div>
            </div>
            
            {/* Blood Donations */}
            <div className="w-full md:w-1/4 flex px-6 py-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Blood Donations</h3>
                  <p className="mt-1 text-sm text-gray-900">Find donation centers and keep track of your donation history and eligibility.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

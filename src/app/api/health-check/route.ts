import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

export async function GET() {
  try {
    // Get the backend API URL from environment variables
    const apiUrl = process.env.API_URL;
    
    if (!apiUrl) {
      console.error('API_URL environment variable is not set');
      return NextResponse.json({ 
        status: 'DOWN',
        message: 'Backend API URL is not configured'
      }, { status: 500 });
    }
    
    console.log(`Checking backend health at: ${apiUrl}/api/health`);
    
    // Try to reach the backend health endpoint
    const response = await axios.get(`${apiUrl}/api/health`, {
      timeout: 5000, // 5 second timeout to avoid long waits
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // If we get here, the backend is reachable
    console.log('Backend health check successful:', response.data);
    
    return NextResponse.json({ 
      status: 'UP',
      time: new Date().toISOString(),
      backendStatus: response.data
    });
    
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error('Health check failed:', axiosError.message);
    console.error('Error details:', axiosError.code, axiosError.config?.url);
    
    if (axiosError.code === 'ECONNREFUSED') {
      return NextResponse.json({ 
        status: 'DOWN',
        time: new Date().toISOString(),
        message: 'Le serveur backend est injoignable',
        errorCode: 'CONNECTION_REFUSED'
      }, { status: 503 });
    }
    
    // Backend is not reachable
    return NextResponse.json({ 
      status: 'DOWN',
      time: new Date().toISOString(),
      message: 'Cannot connect to backend server',
      errorCode: axiosError.code || 'UNKNOWN_ERROR'
    }, { status: 503 });
  }
} 
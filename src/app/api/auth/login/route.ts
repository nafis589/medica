import { NextResponse } from 'next/server';
import axios from 'axios';
import { AxiosError } from 'axios';

export async function POST(request: Request) {
  try {
    const { identifier, password, rememberMe } = await request.json();

    // Validate input
    if (!identifier || !password) {
      return NextResponse.json(
        { message: 'Identifiants invalides' },
        { status: 400 }
      );
    }

    // Get the API URL from environment variables
    const apiUrl = process.env.API_URL;
    
    if (!apiUrl) {
      console.error('API_URL environment variable is not set');
      return NextResponse.json(
        { message: 'Erreur de configuration du serveur' },
        { status: 500 }
      );
    }

    console.log(`Attempting to connect to backend API at: ${apiUrl}/api/auth/login`);
    console.log('Login request payload:', { identifier, password });

    // Make a request to the backend server for authentication
    try {
      const apiResponse = await axios({
        method: 'post',
        url: `${apiUrl}/api/auth/login`,
        data: {
          identifier,
          password,
        },
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      console.log('Login response from backend:', apiResponse.status);

      const { token, user } = apiResponse.data;

      if (!token || !user) {
        console.error('Invalid response from backend:', apiResponse.data);
        return NextResponse.json(
          { message: 'Réponse invalide du serveur' },
          { status: 500 }
        );
      }

      // Set HTTP-only cookie (more secure than localStorage)
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day in seconds
        path: '/',
      };

      // Create response object with user data
      const response = NextResponse.json({
        success: true,
        token, // Also return token for client-side storage fallback if needed
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
      
      // Set the JWT in an HTTP-only cookie
      response.cookies.set('authToken', token, cookieOptions);
      
      return response;
    } catch (error: unknown) {
      // Handle API error responses
      const axiosError = error as AxiosError;
      
      console.error('Login API error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
        code: axiosError.code,
      });
      
      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const responseData = axiosError.response.data as { message?: string };
        return NextResponse.json(
          { message: responseData.message || 'Identifiants incorrects' },
          { status: axiosError.response.status || 401 }
        );
      } else if (axiosError.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser
        console.error('No response received from server:', axiosError.request);
        return NextResponse.json(
          { message: 'Erreur de connexion au serveur. Veuillez vérifier que le serveur est en marche.' },
          { status: 503 }
        );
      } else if (axiosError.code === 'ECONNABORTED') {
        // Request timed out
        return NextResponse.json(
          { message: 'La connexion au serveur a pris trop de temps. Veuillez réessayer.' },
          { status: 504 }
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        return NextResponse.json(
          { message: 'Erreur de connexion au serveur' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Login route error:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
} 
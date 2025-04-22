'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios, { AxiosError } from 'axios';
import Header from '../../components/layout/Header';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [identifierType, setIdentifierType] = useState<'email' | 'phone' | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [serverStatus, setServerStatus] = useState<'unknown' | 'up' | 'down'>('unknown');
  const maxRetries = 2;

  // Check server health on component mount
  useEffect(() => {
    checkServerHealth();
  }, []);
  
  // Function to check server health
  const checkServerHealth = async () => {
    try {
      setServerStatus('unknown');
      console.log('Checking server health...');
      const response = await axios.get('/api/health-check', {
        timeout: 5000 // 5 second timeout
      });
      console.log('Health check response:', response.data);
      
      if (response.data.status === 'UP') {
        setServerStatus('up');
        setError(''); // Clear any server connection errors
      } else {
        setServerStatus('down');
        setError('Le serveur backend est indisponible. ' + (response.data.message || ''));
      }
    } catch (err) {
      console.error('Server health check failed:', err);
      setServerStatus('down');
      setError('Le serveur semble être indisponible. Veuillez réessayer plus tard.');
    }
  };

  // Detect if input is email or phone number
  const detectIdentifierType = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{8,15}$/;
    
    if (emailRegex.test(value)) {
      setIdentifierType('email');
    } else if (phoneRegex.test(value)) {
      setIdentifierType('phone');
    } else {
      setIdentifierType(null);
    }
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIdentifier(value);
    detectIdentifierType(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!identifier) {
      setError('Champ obligatoire');
      return;
    }
    
    if (!password) {
      setError('Mot de passe obligatoire');
      return;
    }
    
    // Trim whitespace
    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();
    
    // Check server health before attempting login
    if (serverStatus === 'down') {
      await checkServerHealth();
      if (serverStatus === 'down') {
        setError('Le serveur est indisponible. Veuillez réessayer plus tard.');
        return;
      }
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      console.log('Attempting login with:', { identifier: trimmedIdentifier });
      
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        identifier: trimmedIdentifier,
        password: trimmedPassword,
        rememberMe
      }, {
        timeout: 10000 // 10 second timeout
      });
      
      if (response.data.token) {
        // Store JWT according to user preference
        if (rememberMe) {
          // For more persistent storage
          localStorage.setItem('authToken', response.data.token);
        } else {
          // For session-based storage
          sessionStorage.setItem('authToken', response.data.token);
        }
        
        // Redirect based on user role
        if (response.data.user.role === 'Patient') {
          router.push('/dashboard/patient');
        } else if (response.data.user.role === 'doctor') {
          router.push('/dashboard/doctor');
        } else if (response.data.user.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{message?: string}>;
      if (error.response && error.response.data && error.response.data.message) {
        // Handle specific API errors with messages
        setError(error.response.data.message);
      } else if (error.response) {
        // Handle generic API errors (e.g., 401, 403, 500 without specific message)
        setError('Identifiants incorrects ou problème serveur.');
      } else if (error.request) {
        // Update server status
        setServerStatus('down');
        
        // Server connection error - consider retrying
        if (retryCount < maxRetries) {
          console.log(`Connection error, retrying (${retryCount + 1}/${maxRetries})...`);
          setRetryCount(prevCount => prevCount + 1);
          setError('Erreur de connexion au serveur. Nouvelle tentative...');
          
          // Wait a moment before retrying
          setTimeout(() => {
            handleSubmit(e);
          }, 1500);
          return;
        } else {
          // Max retries reached
          setError('Erreur de connexion au serveur. Veuillez vérifier que le serveur est en marche et votre connexion internet.');
          setRetryCount(0); // Reset for next attempt
        }
      } else {
        // Handle other errors (e.g., setup errors before request was sent)
        setError('Une erreur inattendue s\'est produite.');
        console.error('Login Error:', error.message); // Log the actual error for debugging
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle retry button click
  const handleRetryClick = async () => {
    await checkServerHealth();
    setRetryCount(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-white to-blue-50 overflow-hidden relative">
      {/* Single looped arrow pointing to the login form */}
      <div className="absolute inset-0 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 1000 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-15">
          {/* Left side looped arrow */}
          <path d="M200,400 C150,300 180,200 250,150 C320,100 400,120 450,200 C500,280 450,400 350,450 C250,500 200,450 180,400 C160,350 180,300 220,280 C260,260 320,280 350,330" 
                stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10 15" />
          
          {/* Arrow pointing to form */}
          <path d="M350,330 C400,400 450,430 500,400 C550,370 580,300 620,350 C660,400 700,500 800,450" 
                stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10 15" />
          
          {/* Arrow head */}
          <path d="M790,445 L800,450 L790,455" 
                stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Reusing the Header without auth buttons */}
      <Header showAuthButtons={false} />

      <main className="flex-grow flex items-center justify-center relative z-10">
        <div className="max-w-md w-full space-y-8 p-10 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Connexion</h1>
            <p className="mt-2 text-sm text-gray-600">
              Accédez à vos informations médicales en toute sécurité
            </p>
            {serverStatus === 'down' && (
              <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <span className="w-2 h-2 mr-1 rounded-full bg-red-500"></span>
                Serveur indisponible
              </div>
            )}
            {serverStatus === 'up' && (
              <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 mr-1 rounded-full bg-green-500"></span>
                Serveur connecté
              </div>
            )}
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                  Email ou téléphone
                </label>
                <div className="mt-1 relative">
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Entrez votre email ou téléphone"
                    value={identifier}
                    onChange={handleIdentifierChange}
                  />
                  {identifierType && (
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
                      {identifierType === 'email' ? 'Email' : 'Téléphone'}
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-sm bg-red-50 p-3 rounded-md border border-red-100 text-red-600 mt-2">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
                {error.includes('Erreur de connexion au serveur') && (
                  <div className="mt-2 text-xs">
                    <p>Suggestions:</p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Vérifiez que le serveur backend est démarré</li>
                      <li>Vérifiez votre connexion internet</li>
                      <li>Contactez l&apos;administrateur si le problème persiste</li>
                    </ul>
                    <button 
                      type="button"
                      onClick={handleRetryClick}
                      className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Vérifier l&apos;état du serveur
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>
              
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Mot de passe oublié?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || serverStatus === 'down'}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {retryCount > 0 ? `Tentative ${retryCount}/${maxRetries}...` : 'Chargement...'}
                  </>
                ) : "Se connecter"}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Vous n&apos;avez pas de compte?{' '}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Créer un compte
              </Link>
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
          animation: float 15s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 
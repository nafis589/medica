'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import PageLoader from '../ui/PageLoader';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { initRecaptchaVerifier, sendVerificationCode, verifyOtpCode } from '../../lib/firebase';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

// Define types for form data
interface FormData {
  // Step 1: Personal Information
  firstName: string;
  lastName: string;
  specialty: string;
  
  // Step 2: Professional Information
  licenseNumber: string;
  licenseDocument: File | null;
  practiceCity: string;
  
  // Step 3: Contact Information
  email: string;
  phoneNumber: string;
  otpVerified: boolean;
  
  // Step 4: Security
  password: string;
}

// Define validation errors type
interface FormErrors {
  firstName?: string;
  lastName?: string;
  specialty?: string;
  licenseNumber?: string;
  licenseDocument?: string;
  practiceCity?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
}

// Specialty options
const specialties = [
  { value: '', label: 'Sélectionner une spécialité' },
  { value: 'generaliste', label: 'Médecin généraliste' },
  { value: 'cardiologue', label: 'Cardiologue' },
  { value: 'dermatologue', label: 'Dermatologue' },
  { value: 'neurologue', label: 'Neurologue' },
  { value: 'pediatre', label: 'Pédiatre' },
  { value: 'psychiatre', label: 'Psychiatre' },
  { value: 'gynecologue', label: 'Gynécologue' },
  { value: 'ophtalmologue', label: 'Ophtalmologue' },
  { value: 'orthopediste', label: 'Orthopédiste' },
  { value: 'autre', label: 'Autre spécialité' },
];

// Cities
const cities = [
  { value: '', label: 'Sélectionner une ville' },
  { value: 'paris', label: 'Paris' },
  { value: 'lyon', label: 'Lyon' },
  { value: 'marseille', label: 'Marseille' },
  { value: 'bordeaux', label: 'Bordeaux' },
  { value: 'lille', label: 'Lille' },
  { value: 'toulouse', label: 'Toulouse' },
  { value: 'nice', label: 'Nice' },
  { value: 'nantes', label: 'Nantes' },
  { value: 'strasbourg', label: 'Strasbourg' },
  { value: 'autre', label: 'Autre ville' },
];

// Form steps
const steps = [
  'Informations personnelles',
  'Informations professionnelles',
  'Contact',
  'Sécurité'
];

// OTP Input Component
const OtpInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}> = ({ value = '', onChange, disabled = false }) => {
  // Ensure value is always a string
  const safeValue = value || '';
  
  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={6}
      value={safeValue}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="Entrez le code à 6 chiffres"
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-black"
    />
  );
};

const DoctorRegistrationForm: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    specialty: '',
    licenseNumber: '',
    licenseDocument: null,
    practiceCity: '',
    email: '',
    phoneNumber: '',
    otpVerified: false,
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'verified' | 'error'>('idle');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const verifyButtonRef = useRef<HTMLButtonElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize recaptcha on component mount
  useEffect(() => {
    // Cleanup function to reset recaptcha on unmount
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  // Reset recaptcha when component unmounts or when verification status changes
  useEffect(() => {
    if (verificationStatus === 'error' || verificationStatus === 'verified') {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    }
  }, [verificationStatus]);

  // Handle input changes - ensure value is always a string
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ?? '',
    }));
    
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // File dropzone setup
  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFormData({
        ...formData,
        licenseDocument: file,
      });
      
      // Clear error if it exists
      if (errors.licenseDocument) {
        setErrors({
          ...errors,
          licenseDocument: undefined,
        });
      }
    }
  }, [formData, errors]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    maxFiles: 1
  });

  // Validate current step
  const validateStep = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (currentStep === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'Ce champ est requis';
      }
      
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Ce champ est requis';
      }
      
      if (!formData.specialty) {
        newErrors.specialty = 'Ce champ est requis';
      }
    } 
    else if (currentStep === 2) {
      if (!formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'Ce champ est requis';
      }
      
      if (!formData.licenseDocument) {
        newErrors.licenseDocument = 'Document requis';
      }
      
      if (!formData.practiceCity) {
        newErrors.practiceCity = 'Ce champ est requis';
      }
    }
    else if (currentStep === 3) {
      if (!formData.email.trim()) {
        newErrors.email = 'Ce champ est requis';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Format incorrect';
      }
      
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Ce champ est requis';
      } else if (!/^\+?[0-9]{10,15}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Format incorrect';
      } else if (!formData.otpVerified) {
        if (!showOtpInput) {
          setShowOtpInput(true);
          return false;
        } else if (!otpCode || otpCode.length !== 6) {
          newErrors.phoneNumber = 'Code OTP invalide';
          return false;
        }
      }
    }
    else if (currentStep === 4) {
      if (!formData.password) {
        newErrors.password = 'Ce champ est requis';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form data to backend
  const submitForm = async () => {
    try {
      setIsLoading(true);
      setSubmitError(null);
      
      // Create FormData for multipart/form-data to handle file upload
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'licenseDocument' && value instanceof File) {
          formDataToSend.append('licenseDocument', value);
        } else if (typeof value === 'string' || typeof value === 'boolean') {
          formDataToSend.append(key, String(value));
        }
      });
      
      // Log what's being sent (only in development)
      console.log('Sending doctor data to backend');
      
      // Use the correct backend URL
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      
      const response = await axios.post(`${backendUrl}/api/doctors/register`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Response from backend:', response.data);
      
      if (response.status === 201 || response.status === 200) {
        // Registration successful, redirect to home or login page
        router.push('/');
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Error registering doctor:', error);
      // Provide more specific error message if available
      const axiosError = error as AxiosError<{message: string}>;
      const errorMessage = axiosError.response?.data?.message || 
                        'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
      setSubmitError(errorMessage);
      setIsLoading(false);
    }
  };

  // Handle next step button
  const handleNext = () => {
    if (currentStep === 3 && showOtpInput && otpCode.length === 6) {
      // Mock OTP verification
      setFormData({
        ...formData,
        otpVerified: true,
      });
      setShowOtpInput(false);
      // Reset OTP code without causing a controlled/uncontrolled switch
      setOtpCode('');
    }
    
    if (validateStep()) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        // Submit the form and show loading animation
        submitForm();
      }
    }
  };

  // Handle back button
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Send verification code
  const handleSendVerificationCode = async () => {
    if (!formData.phoneNumber) {
      setErrors(prev => ({
        ...prev,
        phoneNumber: 'Ce champ est requis'
      }));
      return;
    }

    try {
      setVerificationStatus('sending');
      setVerificationError(null);
      
      // Clear any existing recaptcha before initializing a new one
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
      
      // Initialize new recaptcha
      await new Promise<void>((resolve) => {
        initRecaptchaVerifier(verifyButtonRef.current as HTMLElement, (verifier) => {
          recaptchaVerifierRef.current = verifier;
          resolve();
        });
      });
      
      // Ensure recaptcha is available before continuing
      if (!recaptchaVerifierRef.current) {
        setVerificationError("Erreur d'initialisation de la vérification");
        setVerificationStatus('error');
        return;
      }
      
      const result = await sendVerificationCode(
        formData.phoneNumber,
        recaptchaVerifierRef.current,
        (confirmationResult) => {
          confirmationResultRef.current = confirmationResult;
        }
      );
      
      if (result.success) {
        setVerificationStatus('sent');
        setShowOtpInput(true);
      } else {
        setVerificationStatus('error');
        setVerificationError(result.errorMessage || "Erreur lors de l'envoi du code");
      }
    } catch (error) {
      if (error instanceof FirebaseError) {
        setVerificationStatus('error');
        // Check for network error specifically
        if (error.code === 'auth/network-request-failed') {
          setVerificationError('Veuillez vérifier votre connexion internet et réessayer.');
        } else {
          setVerificationError('Une erreur est survenue. Veuillez réessayer.');
        }
        console.error('Error sending verification code:', error.code, error.message);
      } else {
        // Handle non-Firebase errors
        setVerificationStatus('error');
        setVerificationError('Une erreur inattendue est survenue.');
        console.error('Non-Firebase error sending verification code:', error);
      }
    }
  };

  // Handle OTP change
  const handleOtpChange = useCallback((value: string) => {
    // Ensure value is a string and only contains numbers
    const inputValue = value || '';
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    
    // Always set to an empty string if no valid value
    setOtpCode(numericValue);
  }, []);

  // Verify OTP code
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setErrors({
        ...errors,
        phoneNumber: 'Code OTP invalide'
      });
      return;
    }

    try {
      setVerificationStatus('verifying');
      setVerificationError(null);
      
      const result = await verifyOtpCode(otpCode);
      
      if (result.success) {
        setVerificationStatus('verified');
        setFormData({
          ...formData,
          otpVerified: true
        });
        setShowOtpInput(false);
        
        // Store the token in localStorage or state for later use
        if (result.idToken) {
          localStorage.setItem('firebaseIdToken', result.idToken);
        }
        
        // Clear any phoneNumber errors
        setErrors({
          ...errors,
          phoneNumber: undefined
        });
      } else {
        setVerificationStatus('error');
        setVerificationError(result.errorMessage || 'Code incorrect');
        setErrors({
          ...errors,
          phoneNumber: 'Code OTP invalide'
        });
      }
    } catch (error) {
      if (error instanceof FirebaseError) {
        setVerificationStatus('error');
        // Check for network error specifically
        if (error.code === 'auth/network-request-failed') {
          setVerificationError('Veuillez vérifier votre connexion internet et réessayer.');
        } else {
          setVerificationError('Une erreur est survenue lors de la vérification');
        }
        console.error('Error verifying OTP:', error.code, error.message);
      } else {
        // Handle non-Firebase errors
        setVerificationStatus('error');
        setVerificationError('Une erreur inattendue est survenue lors de la vérification.');
        console.error('Non-Firebase error verifying OTP:', error);
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-800 mb-1">
                Prénom
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Entrez votre prénom"
                className={`w-full border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-black`}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-800 mb-1">
                Nom
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Entrez votre nom"
                className={`w-full border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-black`}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.lastName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-800 mb-1">
                Spécialité médicale
              </label>
              <select
                id="specialty"
                name="specialty"
                required
                value={formData.specialty}
                onChange={handleChange}
                className={`w-full border ${errors.specialty ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black`}
              >
                {specialties.map((specialty) => (
                  <option key={specialty.value} value={specialty.value}>
                    {specialty.label}
                  </option>
                ))}
              </select>
              {errors.specialty && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.specialty}</p>
              )}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-800 mb-1">
                Numéro de licence médicale
              </label>
              <input
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                required
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="Exemple: LM-123456"
                className={`w-full border ${errors.licenseNumber ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-black`}
              />
              {errors.licenseNumber && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.licenseNumber}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Upload de justificatif
              </label>
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed ${errors.licenseDocument ? 'border-red-400' : isDragActive ? 'border-blue-400' : 'border-gray-300'} 
                  rounded-lg p-6 cursor-pointer transition-colors hover:border-blue-500 flex flex-col items-center justify-center text-center`}
              >
                <input {...getInputProps()} />
                
                {formData.licenseDocument ? (
                  <div className="flex flex-col items-center">
                    <div className="text-blue-600 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                        <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
                        <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formData.licenseDocument.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(formData.licenseDocument.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    
                    <p className="text-sm text-gray-800 font-medium mb-1">
                      {isDragActive ? "Déposez votre fichier ici..." : "Déposez votre fichier ici ou cliquez pour parcourir"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Formats acceptés: PDF, JPG, JPEG
                    </p>
                  </>
                )}
              </div>
              {errors.licenseDocument && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.licenseDocument}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="practiceCity" className="block text-sm font-medium text-gray-800 mb-1">
                Ville d&apos;exercice
              </label>
              <select
                id="practiceCity"
                name="practiceCity"
                required
                value={formData.practiceCity}
                onChange={handleChange}
                className={`w-full border ${errors.practiceCity ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black`}
              >
                {cities.map((city) => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
              {errors.practiceCity && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.practiceCity}</p>
              )}
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="exemple@email.com"
                className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-black`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-800 mb-1">
                Numéro de téléphone
              </label>
              <div className="flex">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+33 6 12 34 56 78"
                  className={`w-full border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-black`}
                  disabled={verificationStatus === 'sent' || verificationStatus === 'verifying' || verificationStatus === 'verified'}
                />
                {!formData.otpVerified && !showOtpInput && formData.phoneNumber && (
                  <button
                    ref={verifyButtonRef}
                    id="verifyPhoneButton"
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={verificationStatus === 'sending' || !formData.phoneNumber || formData.phoneNumber.length < 10}
                    className={`ml-2 px-3 py-2 ${
                      verificationStatus === 'sending' ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white rounded-md text-sm font-medium transition-colors`}
                  >
                    {verificationStatus === 'sending' ? 'Envoi...' : 'Vérifier'}
                  </button>
                )}
                {formData.otpVerified && (
                  <div className="ml-2 px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                    Vérifié
                  </div>
                )}
              </div>
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.phoneNumber}</p>
              )}
              {verificationError && (
                <p className="mt-1 text-sm text-red-600 font-medium">{verificationError}</p>
              )}
            </div>
            
            {showOtpInput && (
              <div className="mt-3">
                <label htmlFor="otpCode" className="block text-sm font-medium text-gray-800 mb-1">
                  Code OTP
                </label>
                <div className="flex">
                  <OtpInput
                    value={otpCode}
                    onChange={handleOtpChange}
                    disabled={verificationStatus === 'verifying'}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={!otpCode || otpCode.length !== 6 || verificationStatus === 'verifying'}
                    className={`ml-2 px-3 py-2 ${
                      verificationStatus === 'verifying' || !otpCode || otpCode.length !== 6 
                        ? 'bg-gray-400' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white rounded-md text-sm font-medium transition-colors`}
                  >
                    {verificationStatus === 'verifying' ? 'Vérification...' : 'Valider'}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-700">
                  Un code de vérification a été envoyé à votre numéro.
                </p>
              </div>
            )}
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-black`}
              />
              {errors.password ? (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.password}</p>
              ) : (
                <p className="mt-1 text-sm text-gray-700">
                  Minimum 8 caractères
                </p>
              )}
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Prochaines étapes après l&apos;inscription</h4>
              <ul className="text-xs text-blue-700 space-y-1 list-disc pl-5">
                <li>Vérification de votre licence médicale (1-2 jours ouvrables)</li>
                <li>Configuration de votre profil et disponibilités</li>
                <li>Intégration à notre plateforme de téléconsultation</li>
              </ul>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <div className="max-w-md mx-auto bg-white rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Inscription Médecin
        </h1>
        
        {/* Stepper */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center"
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index + 1 === currentStep
                      ? 'bg-blue-600 text-white'
                      : index + 1 < currentStep
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {index + 1 < currentStep ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2"></div>
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
            
            <div className="flex justify-between relative z-10">
              {steps.map((_, index) => (
                <div 
                  key={index} 
                  className={`w-4 h-4 rounded-full ${
                    index + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                ></div>
              ))}
            </div>
          </div>
          
          <p className="text-center mt-4 text-lg font-semibold text-gray-800">
            Étape {currentStep} sur {steps.length} – {steps[currentStep - 1]}
          </p>
        </div>
        
        {/* Form Content */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
          noValidate
        >
          {submitError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {submitError}
            </div>
          )}
          
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
              >
                Précédent
              </button>
            ) : (
              <div></div> // Empty div to maintain layout with flex justify-between
            )}
            
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
            >
              {currentStep === steps.length ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default DoctorRegistrationForm; 
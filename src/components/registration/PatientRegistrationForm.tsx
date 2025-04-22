'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import PageLoader from '../ui/PageLoader';
import { initRecaptchaVerifier, sendVerificationCode, verifyOtpCode } from '../../lib/firebase';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';

// Define types for form data
interface FormData {
  // Step 1: Personal Information
  firstName: string;
  lastName: string;
  birthDate: string;
  
  // Step 2: Contact Information
  phoneNumber: string;
  email: string;
  otpVerified: boolean;
  
  // Step 3: Security
  password: string;
  
  // Step 4: Medical Information
  bloodGroup: string;
  address: string;
}

// Define validation errors type
interface FormErrors {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  bloodGroup?: string;
}

const steps = [
  'Informations personnelles',
  'Contact',
  'Sécurité',
  'Informations médicales'
];

const bloodGroups = [
  { value: '', label: 'Sélectionner' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

const PatientRegistrationForm: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    birthDate: '',
    phoneNumber: '',
    email: '',
    otpVerified: false,
    password: '',
    bloodGroup: '',
    address: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpValue, setOtpValue] = useState('');
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
      }
    };
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

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
      
      if (!formData.birthDate) {
        newErrors.birthDate = 'Ce champ est requis';
      }
    } 
    else if (currentStep === 2) {
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Ce champ est requis';
      } else if (!/^\+?[0-9]{10,15}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Format incorrect';
      } else if (!formData.otpVerified) {
        // We would normally verify the OTP here
        // For this example, we'll just require an OTP code to be entered
        if (!showOtpInput) {
          setShowOtpInput(true);
          return false;
        } else if (!otpValue || otpValue.length !== 6) {
          newErrors.phoneNumber = 'Code OTP invalide';
          return false;
        }
      }
      
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Format incorrect';
      }
    } 
    else if (currentStep === 3) {
      if (!formData.password) {
        newErrors.password = 'Ce champ est requis';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Send verification code
  const handleSendVerificationCode = async () => {
    if (!formData.phoneNumber) {
      setErrors({
        ...errors,
        phoneNumber: 'Ce champ est requis'
      });
      return;
    }

    try {
      setVerificationStatus('sending');
      setVerificationError(null);
      
      // Make sure recaptcha is initialized
      if (!recaptchaVerifierRef.current) {
        initRecaptchaVerifier(verifyButtonRef.current as HTMLElement, (verifier) => {
          recaptchaVerifierRef.current = verifier;
        });
      }
      
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
        // Reset recaptcha for retry
        if (recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        }
      }
    } catch (error) {
      setVerificationStatus('error');
      setVerificationError('Une erreur est survenue. Veuillez réessayer.');
      console.error('Error sending verification code:', error);
    }
  };

  // Verify OTP code
  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length !== 6) {
      setErrors({
        ...errors,
        phoneNumber: 'Code OTP invalide'
      });
      return;
    }

    try {
      setVerificationStatus('verifying');
      setVerificationError(null);
      
      const result = await verifyOtpCode(otpValue);
      
      if (result.success) {
        setVerificationStatus('verified');
        setFormData({
          ...formData,
          otpVerified: true
        });
        setShowOtpInput(false);
        
        // Store the token in localStorage or state for later use
        if (result.idToken) {
          // This token can be sent to your backend
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
      setVerificationStatus('error');
      setVerificationError('Une erreur est survenue lors de la vérification');
      console.error('Error verifying OTP:', error);
    }
  };

  // Submit form data to backend
  const submitForm = async () => {
    try {
      setIsLoading(true);
      setSubmitError(null);
      
      // Use the correct backend URL
      const backendUrl = 'http://localhost:5001';
      
      // Log what's being sent (only in development)
      console.log('Sending data to backend:', formData);
      
      // Make sure to set the Content-Type header
      const response = await axios.post(`${backendUrl}/api/patients/register`, formData, {
        headers: {
          'Content-Type': 'application/json'
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
      console.error('Error registering patient:', error);
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
    // Special handling for step 2 (phone verification)
    if (currentStep === 2) {
      if (!formData.otpVerified) {
        setErrors({
          ...errors,
          phoneNumber: 'Veuillez vérifier votre numéro de téléphone'
        });
        return;
      }
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
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-800 mb-1">
                Date de naissance
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                required
                value={formData.birthDate}
                onChange={handleChange}
                className={`w-full border ${errors.birthDate ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black`}
              />
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.birthDate}</p>
              )}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
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
                {!formData.otpVerified && !showOtpInput && (
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
              {verificationError && (
                <p className="mt-1 text-sm text-red-600 font-medium">{verificationError}</p>
              )}
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.phoneNumber}</p>
              )}
            </div>
            
            {showOtpInput && (
              <div className="mt-3">
                <label htmlFor="otpValue" className="block text-sm font-medium text-gray-800 mb-1">
                  Code OTP
                </label>
                <div className="flex">
                  <input
                    id="otpValue"
                    type="text"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    placeholder="Entrez le code à 6 chiffres"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-black"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verificationStatus === 'verifying' || otpValue.length !== 6}
                    className={`ml-2 px-3 py-2 ${
                      verificationStatus === 'verifying' ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white rounded-md text-sm font-medium transition-colors`}
                  >
                    {verificationStatus === 'verifying' ? 'Vérification...' : 'Valider'}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-700">
                  Un code de vérification a été envoyé à votre numéro.
                </p>
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={verificationStatus === 'sending'}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  {verificationStatus === 'sending' ? 'Envoi en cours...' : 'Renvoyer le code'}
                </button>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1">
                Email (optionnel)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="exemple@email.com"
                className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-black`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.email}</p>
              )}
            </div>
          </div>
        );
        
      case 3:
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
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-800 mb-1">
                Groupe sanguin
              </label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                {bloodGroups.map((group) => (
                  <option key={group.value} value={group.value}>
                    {group.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-800 mb-1">
                Adresse / région
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="Votre adresse ou région"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-black"
              />
              <p className="mt-1 text-sm text-gray-700">
                Recommandé mais pas obligatoire
              </p>
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
          Créer un compte
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
        <form>
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
              type="button"
              onClick={handleNext}
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

export default PatientRegistrationForm; 
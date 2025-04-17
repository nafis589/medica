// Firebase configuration
import { initializeApp, FirebaseError } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult
} from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9VEqX_Ezs2b3A6PgCJMCM_BLw5f4PPio",
  authDomain: "otp-verifcation-41dad.firebaseapp.com",
  projectId: "otp-verifcation-41dad",
  storageBucket: "otp-verifcation-41dad.appspot.com",
  messagingSenderId: "551455222981",
  appId: "1:551455222981:web:080123cb372d847dcad4ac",
  measurementId: "G-EF4N4M6XHJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Global variable to store confirmation result
let confirmationResult: ConfirmationResult | null = null;

// Initialize reCAPTCHA verifier
export const initRecaptchaVerifier = (
  buttonElement: HTMLElement, 
  callback?: (verifier: RecaptchaVerifier) => void
) => {
  const recaptchaVerifier = new RecaptchaVerifier(auth, buttonElement, {
    'size': 'invisible',
    'callback': () => {
      // reCAPTCHA solved, allow signInWithPhoneNumber
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      // Response expired. Ask user to solve reCAPTCHA again
      console.log('reCAPTCHA expired');
    }
  });
  
  if (callback) {
    callback(recaptchaVerifier);
  }
  
  return recaptchaVerifier;
};

// Send verification code
export const sendVerificationCode = async (
  phoneNumber: string, 
  recaptchaVerifier: RecaptchaVerifier,
  callback?: (result: ConfirmationResult) => void
) => {
  try {
    // Sign in with phone number
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    
    if (callback && confirmationResult) {
      callback(confirmationResult);
    }
    
    return { success: true };
  } catch (error: unknown) {
    const firebaseError = error as FirebaseError;
    console.error('Error sending verification code:', firebaseError);
    return { 
      success: false, 
      errorCode: firebaseError.code,
      errorMessage: firebaseError.message 
    };
  }
};

// Verify OTP code
export const verifyOtpCode = async (otpCode: string) => {
  if (!confirmationResult) {
    return { 
      success: false, 
      errorMessage: 'No verification was started. Please send the code first.' 
    };
  }

  try {
    // Confirm the verification code
    const userCredential = await confirmationResult.confirm(otpCode);
    
    // Get the user
    const user = userCredential.user;
    
    // Get the ID token
    const idToken = await user.getIdToken();
    
    return { 
      success: true, 
      user, 
      idToken 
    };
  } catch (error: unknown) {
    const firebaseError = error as FirebaseError;
    console.error('Error verifying code:', firebaseError);
    return { 
      success: false, 
      errorCode: firebaseError.code,
      errorMessage: firebaseError.message 
    };
  }
};

export { auth }; 
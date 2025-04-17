import express from 'express';
import { body } from 'express-validator';
import { registerPatient } from '../controllers/patientController.js';

const router = express.Router();

// POST /api/patients - Register new patient
router.post('/',
  [
    // Add validation rules using express-validator
    body('firstName', 'First name is required').not().isEmpty(),
    body('lastName', 'Last name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('dateOfBirth', 'Date of birth is required').not().isEmpty().isISO8601().toDate(), // Validate date format
    body('gender', 'Gender is required').isIn(['Male', 'Female', 'Other']),
    // Add validation for other fields as needed (address, phone, etc.)
    body('phoneNumber').optional().isString(), // Example: optional phone number
    body('address.street').optional().isString(),
    body('address.city').optional().isString(),
    body('address.state').optional().isString(),
    body('address.zipCode').optional().isPostalCode('any'), // Basic zip code validation
    body('address.country').optional().isString(),
    // Add more validation rules based on your requirements
  ],
  registerPatient
);

// @route   POST /api/patients/register
// @desc    Register a new patient
// @access  Public
router.post('/register', registerPatient);

// Add other patient routes here (e.g., GET /:id, PUT /:id)

export default router;

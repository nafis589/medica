import express from 'express';
import { body } from 'express-validator';
import fileUpload from 'express-fileupload';
import { registerDoctor } from '../controllers/doctorController.js';

const router = express.Router();

// File upload middleware
router.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  useTempFiles: true,
  tempFileDir: '/tmp/',
  abortOnLimit: true,
  createParentPath: true,
}));

// POST /api/doctors - Register new doctor
router.post('/',
  [
    // Add validation rules using express-validator
    body('firstName', 'First name is required').not().isEmpty(),
    body('lastName', 'Last name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('specialization', 'Specialization is required').not().isEmpty(),
    body('licenseNumber', 'License number is required').not().isEmpty(),
    body('yearsOfExperience', 'Years of experience must be a non-negative number').isNumeric({ no_symbols: true }).isInt({ min: 0 }),
    body('phoneNumber', 'Phone number is required').not().isEmpty().isString(), // Add more specific phone validation if needed
    // Add validation for clinicAddress and availableHours if necessary
    body('clinicAddress.street').optional().isString(),
    body('clinicAddress.city').optional().isString(),
    body('clinicAddress.state').optional().isString(),
    body('clinicAddress.zipCode').optional().isPostalCode('any'),
    body('clinicAddress.country').optional().isString(),
    body('availableHours').optional(), // Can add custom validation later if needed
    // Add more validation rules based on your requirements
  ],
  registerDoctor
);

// @route   POST /api/doctors/register
// @desc    Register a new doctor
// @access  Public
router.post('/register', registerDoctor);

// Add other doctor routes here (e.g., GET /:id, PUT /:id)

export default router;

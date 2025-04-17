import Patient from '../models/patient.js';

// @desc    Register a new patient
// @route   POST /api/patients/register
// @access  Public
export const registerPatient = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      birthDate, 
      phoneNumber, 
      email, 
      password, 
      bloodGroup, 
      address 
    } = req.body;

    // Check if patient with the same phone number already exists
    const existingPatient = await Patient.findOne({ phoneNumber });
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec ce numéro de téléphone existe déjà'
      });
    }

    // Check if email exists and is unique if provided
    if (email) {
      const emailExists = await Patient.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Un compte avec cet email existe déjà'
        });
      }
    }

    // Create new patient
    const patient = new Patient({
      firstName,
      lastName,
      birthDate,
      phoneNumber,
      email: email || '',
      password,
      bloodGroup: bloodGroup || '',
      address: address || ''
    });

    // Save patient to database
    await patient.save();

    // Return success response (without sensitive data)
    res.status(201).json({
      success: true,
      message: 'Compte patient créé avec succès',
      data: {
        id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName
      }
    });
  } catch (error) {
    console.error('Error registering patient:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte',
      error: error.message
    });
  }
};

// Add other patient-related controller functions here (e.g., getPatientById, updatePatient, etc.) 
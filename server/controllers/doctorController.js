import Doctor from '../models/doctor.js';
import path from 'path';
import fs from 'fs';

// @desc    Register a new doctor
// @route   POST /api/doctors/register
// @access  Public
export const registerDoctor = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      specialty, 
      licenseNumber, 
      practiceCity, 
      email, 
      phoneNumber, 
      password 
    } = req.body;

    // Check if doctor with the same email already exists
    const emailExists = await Doctor.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec cet email existe déjà'
      });
    }

    // Check if phone number already exists
    const phoneExists = await Doctor.findOne({ phoneNumber });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec ce numéro de téléphone existe déjà'
      });
    }

    // Check if license number already exists
    const licenseExists = await Doctor.findOne({ licenseNumber });
    if (licenseExists) {
      return res.status(400).json({
        success: false,
        message: 'Un médecin avec ce numéro de licence existe déjà'
      });
    }

    // Handle license document upload
    let licenseDocumentPath = '';
    if (req.files && req.files.licenseDocument) {
      const licenseDocument = req.files.licenseDocument;
      
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'uploads', 'licenses');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Generate unique filename
      const fileExt = path.extname(licenseDocument.name);
      const fileName = `${licenseNumber}-${Date.now()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      
      // Save file
      await licenseDocument.mv(filePath);
      licenseDocumentPath = `/uploads/licenses/${fileName}`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Document de licence requis'
      });
    }

    // Create new doctor
    const doctor = new Doctor({
      firstName,
      lastName,
      specialty,
      licenseNumber,
      licenseDocumentPath,
      practiceCity,
      email,
      phoneNumber,
      password,
      isVerified: false // Doctors need verification by admin
    });

    // Save doctor to database
    await doctor.save();

    // Return success response (without sensitive data)
    res.status(201).json({
      success: true,
      message: 'Compte médecin créé avec succès, en attente de vérification',
      data: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        isVerified: doctor.isVerified
      }
    });
  } catch (error) {
    console.error('Error registering doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte',
      error: error.message
    });
  }
};

// Add other doctor-related controller functions here 
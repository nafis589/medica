import mongoose from 'mongoose';
import User from './User.js';

const doctorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  specialty: {
    type: String,
    required: [true, 'Specialty is required'],
    trim: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  licenseDocumentPath: {
    type: String,
    required: [true, 'License document is required']
  },
  practiceCity: {
    type: String,
    required: [true, 'Practice city is required'],
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false // Doctors need to be verified by admin
  }
});

const Doctor = User.discriminator('Doctor', doctorSchema);

export default Doctor; 
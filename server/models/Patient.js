import mongoose from 'mongoose';
import User from './User.js'; // Assuming User is the base model

const patientSchema = new mongoose.Schema({
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
  birthDate: {
    type: Date,
    required: [true, 'Birth date is required']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']
  },
  address: {
    type: String,
    trim: true
  }
});

const Patient = User.discriminator('Patient', patientSchema);
export default Patient; 
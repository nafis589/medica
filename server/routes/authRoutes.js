import express from 'express';
import { login, register, getCurrentUser } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route for user login
router.post('/login', login);

// Route for user registration
router.post('/register', register);

// Route to get current user info (requires authentication)
router.get('/me', authenticateToken, getCurrentUser);

export default router; 
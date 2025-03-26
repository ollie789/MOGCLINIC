const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a doctor
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('specialty', 'Specialty is required').not().isEmpty()
  ],
  async (req, res) => {
    console.log('Registration attempt with data:', {
      ...req.body,
      password: '[REDACTED]'
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Invalid registration data',
        errors: errors.array() 
      });
    }

    const { name, email, password, specialty } = req.body;

    try {
      // Check if doctor already exists
      let doctor = await Doctor.findOne({ email });
      if (doctor) {
        console.log('Doctor already exists with email:', email);
        return res.status(400).json({ message: 'Doctor already exists' });
      }

      // Create new doctor
      doctor = new Doctor({
        name,
        email,
        password, // Will be hashed by the pre-save middleware
        specialty
      });

      console.log('Attempting to save new doctor:', {
        name,
        email,
        specialty
      });

      // Save doctor to database
      await doctor.save();
      console.log('Doctor saved successfully with ID:', doctor._id);

      // Create and return JWT
      const payload = {
        doctor: {
          id: doctor.id,
          role: doctor.role
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '24h' },
        (err, token) => {
          if (err) {
            console.error('JWT Sign error:', err);
            return res.status(500).json({ 
              message: 'Error creating authentication token',
              error: err.message
            });
          }
          console.log('Registration successful for:', email);
          res.json({ 
            token,
            doctor: {
              id: doctor.id,
              name: doctor.name,
              email: doctor.email,
              role: doctor.role,
              specialty: doctor.specialty
            }
          });
        }
      );
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle duplicate key error
      if (err.code === 11000) {
        return res.status(400).json({ 
          message: 'Email already exists',
          error: 'This email is already registered'
        });
      }
      
      // Handle validation errors
      if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({ 
          message: 'Validation error',
          errors: validationErrors
        });
      }
      
      // Handle missing JWT_SECRET
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables');
        return res.status(500).json({
          message: 'Server configuration error',
          error: 'Authentication system is not properly configured'
        });
      }
      
      // Handle other errors
      res.status(500).json({ 
        message: 'Server error during registration',
        error: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
      });
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate doctor & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('Login attempt:', { email, password: '[REDACTED]' });

    try {
      // Check if doctor exists
      const doctor = await Doctor.findOne({ email });
      if (!doctor) {
        console.log('Doctor not found with email:', email);
        return res.status(400).json({ message: 'Invalid Credentials' });
      }
      console.log('Doctor found:', { id: doctor._id, email: doctor.email });

      // Check if password matches
      const isMatch = await doctor.comparePassword(password);
      console.log('Password match result:', isMatch);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid Credentials' });
      }

      // Update last login timestamp
      doctor.lastLogin = Date.now();
      await doctor.save();

      // Create and return JWT
      const payload = {
        doctor: {
          id: doctor.id,
          name: doctor.name,
          role: doctor.role
        }
      };

      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables');
        return res.status(500).json({
          message: 'Server configuration error',
          error: 'Authentication system is not properly configured'
        });
      }

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '24h' },
        (err, token) => {
          if (err) {
            console.error('JWT Sign error:', err);
            return res.status(500).json({ 
              message: 'Error creating authentication token',
              error: err.message
            });
          }
          console.log('Login successful for:', email);
          res.json({ 
            token,
            doctor: {
              id: doctor.id,
              name: doctor.name,
              email: doctor.email,
              role: doctor.role,
              specialty: doctor.specialty
            }
          });
        }
      );
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ 
        message: 'Server error during login',
        error: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
      });
    }
  }
);

// @route   GET api/auth/me
// @desc    Get current doctor
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctor.id).select('-password');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/debug-check
// @desc    Debug endpoint to check login system
// @access  Public (for debugging only)
router.get('/debug-check', async (req, res) => {
  try {
    // Get count of doctors in the database
    const count = await Doctor.countDocuments();
    
    // Get a sample doctor (only include non-sensitive fields)
    const sampleDoctor = await Doctor.findOne()
      .select('email name specialty role createdAt lastLogin')
      .lean();
    
    // Check if JWT_SECRET is configured
    const jwtConfigured = !!process.env.JWT_SECRET;
    
    res.json({
      success: true,
      message: "Debug information for authentication system",
      data: {
        doctorCount: count,
        jwtConfigured,
        sampleDoctor: sampleDoctor || "No doctors in database",
        serverTime: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Debug endpoint error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving debug information',
      error: err.message 
    });
  }
});

module.exports = router; 
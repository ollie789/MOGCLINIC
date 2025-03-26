const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Assessment = require('../models/Assessment');
const mongoose = require('mongoose');

// @route   GET api/patients
// @desc    Search patients
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Search for patients by name or email
    const patients = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('-password');
    
    res.json(patients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/patients/:id
// @desc    Get patient by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select('-password');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get patient's assessments
    const assessments = await Assessment.find({
      'userInfo.email': patient.email
    }).sort({ createdAt: -1 });

    res.json({
      patient,
      assessments
    });
  } catch (err) {
    console.error(err.message);
    
    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid patient ID' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   GET api/patients
// @desc    Get all patients (paginated)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const total = await User.countDocuments();
    const patients = await User.find().select('-password').skip(skip).limit(limit).sort({ createdAt: -1 });

    res.json({
      patients,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 
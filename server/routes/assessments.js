const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Assessment = require('../models/Assessment');
const mongoose = require('mongoose');
const { validateAssessment, handleValidation } = require('../middleware/validation');

// @route   GET api/assessments/recent
// @desc    Get recent assessments
// @access  Private
router.get('/recent', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const assessments = await Assessment.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.json(assessments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/assessments/:id
// @desc    Get assessment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    
    res.json(assessment);
  } catch (err) {
    console.error(err.message);
    
    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid assessment ID' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   GET api/assessments/user/:email
// @desc    Get assessments by user email
// @access  Private
router.get('/user/:email', auth, async (req, res) => {
  try {
    const assessments = await Assessment.find({
      'userInfo.email': req.params.email
    }).sort({ createdAt: -1 });
    
    res.json(assessments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/assessments
// @desc    Get all assessments with pagination
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const total = await Assessment.countDocuments();
    const assessments = await Assessment.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    res.json({
      assessments,
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

// @route   GET api/assessments/stats/overview
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats/overview', auth, async (req, res) => {
  try {
    console.log('Fetching dashboard statistics...');
    console.log('Connected to database:', mongoose.connection.name);
    
    // Get total assessments count
    const totalAssessments = await Assessment.countDocuments();
    console.log('Total assessments:', totalAssessments);
    
    if (totalAssessments === 0) {
      console.log('No assessments found in the database');
      console.log('Current database:', mongoose.connection.name);
      console.log('Assessment model collection:', Assessment.collection.name);
    }
    
    // Get unique patient count
    const uniquePatients = await Assessment.distinct('userInfo.email');
    console.log('Unique patients:', uniquePatients);
    
    // Get a sample assessment to verify data structure
    const sampleAssessment = await Assessment.findOne();
    console.log('Sample assessment:', JSON.stringify(sampleAssessment, null, 2));
    
    // Get recent assessments count (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const recentAssessments = await Assessment.countDocuments({
      createdAt: { $gte: lastWeek }
    });
    console.log('Recent assessments:', recentAssessments);
    
    // Get pain locations statistics
    const painLocationsStats = await Assessment.aggregate([
      {
        $unwind: '$painLocations'
      },
      {
        $group: {
          _id: {
            area: '$painLocations.area',
            side: '$painLocations.side'
          },
          count: { $sum: 1 },
          avgIntensity: { 
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ['$painLocations.intensity', 'Mild'] }, then: 1 },
                  { case: { $eq: ['$painLocations.intensity', 'Moderate'] }, then: 2 },
                  { case: { $eq: ['$painLocations.intensity', 'Severe'] }, then: 3 }
                ],
                default: 0
              }
            }
          }
        }
      }
    ]);
    console.log('Pain locations stats:', painLocationsStats);

    // Get medical conditions stats
    const medicalConditions = await Assessment.aggregate([
      {
        $group: {
          _id: null,
          herniatedDisc: { 
            $sum: { $cond: [{ $eq: ['$medicalConditions.herniatedDisc', true] }, 1, 0] }
          },
          spinalStenosis: { 
            $sum: { $cond: [{ $eq: ['$medicalConditions.spinalStenosis', true] }, 1, 0] }
          },
          spondylolisthesis: { 
            $sum: { $cond: [{ $eq: ['$medicalConditions.spondylolisthesis', true] }, 1, 0] }
          },
          scoliosis: { 
            $sum: { $cond: [{ $eq: ['$medicalConditions.scoliosis', true] }, 1, 0] }
          }
        }
      }
    ]);
    console.log('Medical conditions:', medicalConditions);

    // Get treatment statistics
    const treatmentStats = await Assessment.aggregate([
      {
        $group: {
          _id: null,
          medication: { 
            $sum: { $cond: [{ $eq: ['$treatments.medication', true] }, 1, 0] }
          },
          physicalTherapy: { 
            $sum: { $cond: [{ $eq: ['$treatments.physicalTherapy', true] }, 1, 0] }
          },
          surgery: { 
            $sum: { $cond: [{ $eq: ['$treatments.surgery', true] }, 1, 0] }
          },
          alternativeTherapy: { 
            $sum: { $cond: [{ $eq: ['$treatments.alternativeTherapy', true] }, 1, 0] }
          }
        }
      }
    ]);
    console.log('Treatment stats:', treatmentStats);

    // Calculate average pain level
    const painStats = await Assessment.aggregate([
      {
        $group: {
          _id: null,
          avgPain: { $avg: '$painLevel' }
        }
      }
    ]);
    console.log('Pain stats:', painStats);

    const response = {
      totalAssessments,
      uniquePatientCount: uniquePatients.length,
      recentAssessments,
      painLocations: painLocationsStats,
      medicalConditions: medicalConditions[0] || {
        herniatedDisc: 0,
        spinalStenosis: 0,
        spondylolisthesis: 0,
        scoliosis: 0
      },
      treatments: treatmentStats[0] || {
        medication: 0,
        physicalTherapy: 0,
        surgery: 0,
        alternativeTherapy: 0
      },
      averagePain: painStats[0]?.avgPain || 0
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (err) {
    console.error('Error in stats/overview:', err);
    console.error('Database name:', mongoose.connection.name);
    console.error('Collection name:', Assessment.collection.name);
    console.error('Connection state:', mongoose.connection.readyState);
    
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      dbInfo: {
        database: mongoose.connection.name,
        collection: Assessment.collection.name,
        connectionState: mongoose.connection.readyState
      },
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// @route   GET api/assessments/debug/raw
// @desc    Get raw assessment data for debugging
// @access  Private
router.get('/debug/raw', auth, async (req, res) => {
  try {
    console.log('Fetching raw assessment data for debugging...');
    
    // Get all assessments without any transformations
    const assessments = await Assessment.find({})
      .lean()
      .exec();
    
    // Log the first assessment for debugging
    if (assessments.length > 0) {
      console.log('Sample assessment:', JSON.stringify(assessments[0], null, 2));
    }
    
    console.log(`Found ${assessments.length} assessments`);
    
    res.json({
      count: assessments.length,
      assessments: assessments
    });
  } catch (err) {
    console.error('Error fetching raw data:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// @route   GET api/assessments/debug
// @desc    Debug endpoint to check database connection and data
// @access  Public (temporary)
router.get('/debug', async (req, res) => {  // Removed auth middleware temporarily
  try {
    console.log('Debug route accessed');
    console.log('Database name:', mongoose.connection.name);
    console.log('Collection name:', Assessment.collection.name);
    console.log('Connection state:', mongoose.connection.readyState);
    
    // Try direct collection access
    const collection = mongoose.connection.db.collection('assessments');
    const directCount = await collection.countDocuments();
    console.log('Direct collection count:', directCount);
    
    // Try to get a count through mongoose model
    const modelCount = await Assessment.countDocuments();
    console.log('Model count:', modelCount);
    
    // Try to get one document directly
    const directSample = await collection.findOne();
    console.log('Direct sample:', directSample);
    
    // Try to get one document through mongoose model
    const modelSample = await Assessment.findOne();
    console.log('Model sample:', modelSample);
    
    res.json({
      databaseInfo: {
        name: mongoose.connection.name,
        collection: Assessment.collection.name,
        connectionState: mongoose.connection.readyState,
        directCount,
        modelCount,
        directSample,
        modelSample
      }
    });
  } catch (err) {
    console.error('Debug route error:', err);
    res.status(500).json({ 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// @route   GET api/assessments/public-debug
// @desc    Public debug endpoint to check database connection and data
// @access  Public
router.get('/public-debug', async (req, res) => {
  try {
    console.log('Public debug route accessed');
    
    // Get database connection info
    const dbInfo = {
      databaseName: mongoose.connection.name,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      connectionString: process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@')
    };
    console.log('Database info:', dbInfo);

    // Try direct collection access
    const collection = mongoose.connection.db.collection('assessments');
    console.log('Got collection reference');

    // Get document count
    const count = await collection.countDocuments();
    console.log('Document count:', count);

    // Get one document
    const sample = await collection.findOne();
    console.log('Sample document:', sample);

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Available collections:', collectionNames);

    res.json({
      success: true,
      dbInfo,
      collectionInfo: {
        name: collection.collectionName,
        count,
        sampleDocument: sample
      },
      availableCollections: collectionNames
    });
  } catch (err) {
    console.error('Public debug route error:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      dbInfo: {
        databaseName: mongoose.connection.name,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      }
    });
  }
});

// @route   GET api/assessments/health
// @desc    Health check endpoint
// @access  Public
router.get('/health', async (req, res) => {
  try {
    const dbStatus = {
      connected: mongoose.connection.readyState === 1,
      database: mongoose.connection.name,
      collections: await mongoose.connection.db.listCollections().toArray(),
      host: mongoose.connection.host
    };

    const modelStatus = {
      assessmentModel: {
        name: Assessment.modelName,
        collection: Assessment.collection.name,
        schema: Object.keys(Assessment.schema.paths)
      }
    };

    res.json({
      status: 'healthy',
      timestamp: new Date(),
      database: dbStatus,
      models: modelStatus
    });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({
      status: 'unhealthy',
      error: err.message,
      timestamp: new Date()
    });
  }
});

// @route   POST api/assessments
// @desc    Create a new assessment
// @access  Private
router.post('/', [
  auth,
  validateAssessment,
  handleValidation
], async (req, res) => {
  try {
    console.log('Creating new assessment with data:', JSON.stringify(req.body, null, 2));
    
    const assessment = new Assessment({
      userInfo: {
        id: req.user.id,
        name: req.body.userInfo.name,
        email: req.body.userInfo.email
      },
      painLevel: req.body.painLevel,
      painDuration: req.body.painDuration,
      painDescription: req.body.painDescription,
      medicalConditions: req.body.medicalConditions,
      painLocations: req.body.painLocations,
      treatments: req.body.treatments
    });

    const savedAssessment = await assessment.save();
    console.log('Assessment saved successfully:', savedAssessment._id);

    // Emit event for real-time updates (if implemented)
    // io.emit('newAssessment', savedAssessment);

    res.json({
      success: true,
      assessment: savedAssessment,
      message: 'Assessment created successfully'
    });
  } catch (err) {
    console.error('Error creating assessment:', err);
    res.status(500).json({
      success: false,
      message: 'Error creating assessment',
      error: err.message
    });
  }
});

module.exports = router; 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const patientsRoutes = require('./routes/patients');
const assessmentsRoutes = require('./routes/assessments');
const appointmentsRoutes = require('./routes/appointments');

// Initialize Express app
const app = express();

// Root route to check server status
app.get('/', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.json({
    status: 'ok',
    message: 'Back Pain Clinic Dashboard API is running',
    serverTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    mongoConnection: {
      state: mongoose.connection.readyState,
      database: mongoose.connection.name || 'not connected'
    }
  });
});

// Debug route - must be before any middleware
app.get('/debug', async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    const dbInfo = {
      databaseName: mongoose.connection.name,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      connectionString: process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@')
    };

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Try to get assessments count
    const assessmentsCount = await mongoose.connection.db.collection('assessments').countDocuments();

    res.json({
      success: true,
      dbInfo,
      collections: collectionNames,
      assessments: {
        count: assessmentsCount
      }
    });
  } catch (err) {
    console.error('Debug route error:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      dbInfo: {
        databaseName: mongoose.connection.name,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host
      }
    });
  }
});

// Add a route to view data directly from the database
app.get('/data/assessments', async (req, res) => {
  // Add CORS headers to allow all origins
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  console.log('🔍 /data/assessments endpoint accessed from:', req.headers.origin || 'Unknown origin');
  console.log('🔍 User agent:', req.headers['user-agent']);
  
  try {
    console.log('🔍 Checking MongoDB connection state:', mongoose.connection.readyState);
    
    // Get data directly from MongoDB, bypassing Mongoose
    const assessments = await mongoose.connection.db.collection('assessments')
      .find({})
      .limit(50)
      .toArray();
    
    console.log(`✅ Retrieved ${assessments.length} assessments directly from MongoDB`);
    console.log('✅ Sample assessment:', assessments.length > 0 ? JSON.stringify(assessments[0]).substring(0, 200) + '...' : 'No documents');
    
    // Send the response with detailed information
    res.json({
      success: true,
      count: assessments.length,
      data: assessments,
      meta: {
        connectionState: mongoose.connection.readyState,
        database: mongoose.connection.name,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('❌ Error fetching assessments data:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      meta: {
        connectionState: mongoose.connection.readyState,
        database: mongoose.connection ? mongoose.connection.name : 'Not connected'
      }
    });
  }
});

// Add a route to view data by collection name
app.get('/data/:collection', async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    const collectionName = req.params.collection;
    
    // Check if collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(c => c.name === collectionName);
    
    if (!collectionExists) {
      return res.status(404).json({
        success: false,
        error: `Collection '${collectionName}' not found`
      });
    }
    
    // Get data directly from MongoDB, bypassing Mongoose
    const documents = await mongoose.connection.db.collection(collectionName)
      .find({})
      .limit(50)
      .toArray();
    
    console.log(`Retrieved ${documents.length} documents from ${collectionName} collection`);
    
    res.json({
      success: true,
      collection: collectionName,
      count: documents.length,
      data: documents
    });
  } catch (err) {
    console.error(`Error fetching data from collection:`, err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Log MongoDB connection string (without credentials)
const connectionString = process.env.MONGODB_URI;
const sanitizedConnectionString = connectionString.replace(/:([^:@]+)@/, ':****@');
console.log('Attempting to connect to MongoDB with URI:', sanitizedConnectionString);

// Connect to MongoDB with debug logging
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(() => {
  console.log('MongoDB Atlas connected successfully');
  console.log('Connected to database:', mongoose.connection.name);
  console.log('Connection state:', mongoose.connection.readyState);
  console.log('MongoDB host:', mongoose.connection.host);
  
  // List available collections
  mongoose.connection.db.listCollections().toArray()
    .then(collections => {
      console.log('Available collections:', collections.map(c => c.name));
    })
    .catch(err => console.error('Error listing collections:', err));
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.log('Error code:', err.code);
  console.log('Error name:', err.name);
  console.log('Please check if your IP is whitelisted in MongoDB Atlas');
  process.exit(1); // Exit if unable to connect to database
});

// Middleware
app.use(express.json());

// Configure CORS - allow requests from all origins during development
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Allow all methods
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: false // Don't require credentials
}));

// Also add a manual CORS preflight handler
app.options('*', (req, res) => {
  console.log('Handling preflight request from:', req.headers.origin);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.status(204).send();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/appointments', appointmentsRoutes);

// Direct data access route for troubleshooting (no auth required)
app.get('/data/assessments', async (req, res) => {
  try {
    console.log('Direct data access request for assessments');
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: 'Database connection not established',
        status: mongoose.connection.readyState
      });
    }
    
    // Load the Assessment model dynamically
    const Assessment = require('./models/Assessment');
    
    // Get assessments count
    const count = await Assessment.countDocuments();
    
    // Get assessments with pagination
    const assessments = await Assessment.find()
      .sort({ createdAt: -1 })
      .limit(100); // Limit to 100 records for performance
    
    res.json({
      success: true,
      message: 'Direct data access successful',
      count,
      data: assessments
    });
  } catch (err) {
    console.error('Direct data access error:', err);
    res.status(500).json({
      success: false,
      message: 'Error accessing assessment data directly',
      error: err.message
    });
  }
});

// Debug database connection endpoint
app.get('/debug/db', (req, res) => {
  try {
    const status = {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      models: Object.keys(mongoose.models),
      serverTime: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Database connection information',
      data: status
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving database status',
      error: err.message
    });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../', 'client', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// Start the server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; 
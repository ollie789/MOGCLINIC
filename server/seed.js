const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB URI
const MONGODB_URI = 'mongodb://localhost:27017/backpain';

// Check if models directory exists, create it if not
const modelsDir = path.join(__dirname, 'models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir);
}

// Create User model if it doesn't exist
const userModelPath = path.join(modelsDir, 'User.js');
if (!fs.existsSync(userModelPath)) {
  const userSchema = `
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
  `;
  
  fs.writeFileSync(userModelPath, userSchema);
  console.log('Created User model');
}

// Create Assessment model if it doesn't exist
const assessmentModelPath = path.join(modelsDir, 'Assessment.js');
if (!fs.existsSync(assessmentModelPath)) {
  const assessmentSchema = `
const mongoose = require('mongoose');

const painLocationSchema = new mongoose.Schema({
  area: String,
  side: String,
  intensity: String,
  type: String
}, { _id: false });

const assessmentSchema = new mongoose.Schema({
  userInfo: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String
  },
  painLevel: {
    type: Number,
    min: 0,
    max: 10
  },
  painDuration: String,
  painDescription: String,
  medicalConditions: {
    herniatedDisc: Boolean,
    spinalStenosis: Boolean,
    spondylolisthesis: Boolean,
    scoliosis: Boolean,
    otherConditions: String
  },
  painLocations: [painLocationSchema],
  treatments: {
    medication: Boolean,
    physicalTherapy: Boolean,
    surgery: Boolean,
    alternativeTherapy: Boolean,
    notes: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
  `;
  
  fs.writeFileSync(assessmentModelPath, assessmentSchema);
  console.log('Created Assessment model');
}

// Import models after creating them
const User = require('./models/User');
const Assessment = require('./models/Assessment');

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample patient data
const patients = [
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    password: '$2a$10$XgNuH2tuT0h.BDHGKUy3HukHXlGy5gDJHUzNpYeKTzP7jW4XQGMYa' // hashed "password123"
  },
  {
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    password: '$2a$10$XgNuH2tuT0h.BDHGKUy3HukHXlGy5gDJHUzNpYeKTzP7jW4XQGMYa'
  },
  {
    name: 'Michael Williams',
    email: 'michael.williams@example.com',
    password: '$2a$10$XgNuH2tuT0h.BDHGKUy3HukHXlGy5gDJHUzNpYeKTzP7jW4XQGMYa'
  },
  {
    name: 'Sarah Brown',
    email: 'sarah.brown@example.com',
    password: '$2a$10$XgNuH2tuT0h.BDHGKUy3HukHXlGy5gDJHUzNpYeKTzP7jW4XQGMYa'
  },
  {
    name: 'David Miller',
    email: 'david.miller@example.com',
    password: '$2a$10$XgNuH2tuT0h.BDHGKUy3HukHXlGy5gDJHUzNpYeKTzP7jW4XQGMYa'
  }
];

// Sample assessment templates
const createAssessment = (userId, userName, userEmail) => ({
  userInfo: {
    id: userId,
    name: userName,
    email: userEmail
  },
  painLevel: Math.floor(Math.random() * 10) + 1,
  painDuration: ['Few days', 'One week', 'Several weeks', 'More than a month', 'More than a year'][Math.floor(Math.random() * 5)],
  painDescription: 'Patient reports intermittent pain, worse in the morning.',
  medicalConditions: {
    herniatedDisc: Math.random() > 0.7,
    spinalStenosis: Math.random() > 0.7,
    spondylolisthesis: Math.random() > 0.8,
    scoliosis: Math.random() > 0.8,
    otherConditions: Math.random() > 0.7 ? 'Patient has a history of lower back strain' : ''
  },
  painLocations: [
    {
      area: ['Lower back', 'Upper back', 'Neck', 'Hip', 'Leg'][Math.floor(Math.random() * 5)],
      side: ['Left', 'Right', 'Both', 'Central'][Math.floor(Math.random() * 4)],
      intensity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      type: ['Sharp', 'Dull', 'Throbbing', 'Burning'][Math.floor(Math.random() * 4)]
    }
  ],
  treatments: {
    medication: Math.random() > 0.5,
    physicalTherapy: Math.random() > 0.5,
    surgery: Math.random() > 0.8,
    alternativeTherapy: Math.random() > 0.6,
    notes: Math.random() > 0.7 ? 'Patient has responded well to physical therapy in the past.' : ''
  },
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date in last 30 days
});

// Seed database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Assessment.deleteMany({});
    
    console.log('Previous data cleared');
    
    // Insert patients
    const createdPatients = await User.insertMany(patients);
    console.log(`${createdPatients.length} patients inserted`);
    
    // Create assessments for each patient
    const assessments = [];
    
    for (const patient of createdPatients) {
      // Generate 1-3 assessments per patient
      const assessmentCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < assessmentCount; i++) {
        assessments.push(createAssessment(patient._id, patient.name, patient.email));
      }
    }
    
    // Insert assessments
    const createdAssessments = await Assessment.insertMany(assessments);
    console.log(`${createdAssessments.length} assessments inserted`);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase(); 
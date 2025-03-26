const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/backpain')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define User Schema
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

// Create User model
const User = mongoose.model('User', userSchema);

// Sample patient data
const patients = [
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    password: bcrypt.hashSync('password123', 10)
  },
  {
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    password: bcrypt.hashSync('password123', 10)
  },
  {
    name: 'Michael Williams',
    email: 'michael.williams@example.com',
    password: bcrypt.hashSync('password123', 10)
  },
  {
    name: 'Sarah Brown',
    email: 'sarah.brown@example.com',
    password: bcrypt.hashSync('password123', 10)
  },
  {
    name: 'David Miller',
    email: 'david.miller@example.com',
    password: bcrypt.hashSync('password123', 10)
  }
];

// Seed database
const seedDatabase = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Previous user data cleared');
    
    // Insert patients
    const createdPatients = await User.insertMany(patients);
    console.log(`${createdPatients.length} patients inserted`);
    
    console.log('Database seeded with users successfully');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run seeding
seedDatabase(); 
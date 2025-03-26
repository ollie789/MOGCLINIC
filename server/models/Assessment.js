
const mongoose = require('mongoose');

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
  painLocations: [{
    area: String,
    side: String,
    intensity: String,
    type: String
  }],
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
  
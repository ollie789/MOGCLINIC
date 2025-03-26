const { check, validationResult } = require('express-validator');

// Validation middleware for assessment submission
const validateAssessment = [
  check('userInfo.name', 'Name is required').not().isEmpty(),
  check('userInfo.email', 'Please include a valid email').isEmail(),
  check('painLevel', 'Pain level must be between 0 and 10').isInt({ min: 0, max: 10 }),
  check('painDuration', 'Pain duration is required').not().isEmpty(),
  check('painDescription', 'Pain description is required').not().isEmpty(),
  check('painLocations', 'At least one pain location is required').isArray({ min: 1 }),
  check('painLocations.*.area', 'Pain area is required').not().isEmpty(),
  check('painLocations.*.side', 'Pain side is required').not().isEmpty(),
  check('painLocations.*.intensity', 'Pain intensity is required').not().isEmpty(),
  check('medicalConditions', 'Medical conditions information is required').not().isEmpty(),
  check('treatments', 'Treatment information is required').not().isEmpty(),
];

// Middleware to handle validation results
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
      message: 'Invalid assessment data'
    });
  }
  next();
};

module.exports = {
  validateAssessment,
  handleValidation
}; 
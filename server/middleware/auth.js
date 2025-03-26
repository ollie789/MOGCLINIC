const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  console.log('Auth middleware checking token for:', req.originalUrl);
  
  // Get token from header
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    console.log('No Authorization header found');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    console.log('Empty token after Bearer prefix removal');
    return res.status(401).json({ message: 'Invalid token format, authorization denied' });
  }

  try {
    // Verify token
    console.log('Verifying token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add doctor from payload to request object
    req.doctor = decoded.doctor;
    console.log('Token valid for doctor ID:', req.doctor.id);
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    
    // Provide more specific error messages
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 
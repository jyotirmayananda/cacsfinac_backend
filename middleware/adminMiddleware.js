const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ 
      success: false,
      msg: 'No token, authorization denied' 
    });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    
    // Get user from database to check admin status
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        msg: 'User not found' 
      });
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({ 
        success: false,
        msg: 'Access denied. Admin privileges required.' 
      });
    }

    req.user = decoded;
    req.user.isAdmin = true;
    next();
  } catch (err) {
    res.status(401).json({ 
      success: false,
      msg: 'Token is not valid' 
    });
  }
};


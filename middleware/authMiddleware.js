const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from headers - support both x-auth-token and Authorization: Bearer
  let token = req.header('x-auth-token');

  if (!token && req.header('Authorization')) {
    const authHeader = req.header('Authorization');
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    // Payload usually contains { userId, email } or { adminId, email, isAdmin }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

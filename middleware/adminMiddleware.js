const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

module.exports = async function (req, res, next) {
  // Get token from headers - support both x-auth-token and Authorization: Bearer
  let token = req.header("x-auth-token");

  if (!token && req.header("Authorization")) {
    const authHeader = req.header("Authorization");
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  // Check if not token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied",
    });
  }

  // Verify token
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production"
    );

    // Get admin from database to check token validity
    const admin = await Admin.findById(decoded.adminId || decoded.userId);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin access denied: account not found",
      });
    }

    req.user = decoded;
    req.user.isAdmin = true;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Token is not valid or expired",
    });
  }
};

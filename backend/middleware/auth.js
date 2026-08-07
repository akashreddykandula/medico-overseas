const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

// Verifies access token from Authorization header or cookie
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  const user = await User.findById(decoded.id).select('-password -refreshToken');

  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'Account has been deactivated');
  }

  req.user = user;
  next();
});

// Restrict access to specific roles, e.g. authorize('admin', 'superadmin')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError(403, `Role '${req.user?.role}' is not permitted to access this resource`);
  }
  next();
};

// Attaches req.user if a valid token is present, but never blocks the request
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (user?.isActive) req.user = user;
  } catch {
    // invalid/expired token on an optional route — just proceed as anonymous
  }
  next();
});

module.exports = { protect, authorize, optionalAuth };

const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

// ------------------------------------------------------------
// SECURITY HELPERS
// ------------------------------------------------------------

// Extract the access token safely from either:
// 1. Authorization: Bearer <token>
// 2. HttpOnly accessToken cookie
//
// SECURITY:
// - Reject malformed Authorization headers.
// - Do not accept arbitrary authentication schemes.
// - Do not throw errors while parsing malformed headers.
// - Keep token extraction in one place so protect() and
//   optionalAuth() behave consistently.
const getAccessToken = (req) => {
  const authorization = req.headers.authorization;

  if (typeof authorization === "string") {
    const parts = authorization.trim().split(/\s+/);

    if (parts.length === 2 && parts[0].toLowerCase() === "bearer" && parts[1]) {
      return parts[1];
    }
  }

  if (
    typeof req.cookies?.accessToken === "string" &&
    req.cookies.accessToken.trim()
  ) {
    return req.cookies.accessToken.trim();
  }

  return null;
};

// ------------------------------------------------------------
// VERIFY ACCESS TOKEN
// ------------------------------------------------------------
// SECURITY:
// - Requires JWT_ACCESS_SECRET.
// - Restricts accepted JWT algorithm.
// - Validates the decoded payload before using decoded.id.
// - Prevents malformed/object token payloads from reaching
//   User.findById().
// ------------------------------------------------------------

const verifyAccessToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new ApiError(401, "Invalid access token");
  }

  if (!process.env.JWT_ACCESS_SECRET) {
    // Do not expose configuration details to the client.
    throw new ApiError(500, "Authentication service is unavailable");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token expired");
    }

    throw new ApiError(401, "Invalid token");
  }

  // JWT payload must be an object containing a valid user ID.
  if (
    !decoded ||
    typeof decoded !== "object" ||
    Array.isArray(decoded) ||
    typeof decoded.id !== "string" ||
    !decoded.id.trim()
  ) {
    throw new ApiError(401, "Invalid token payload");
  }

  return decoded;
};

// ------------------------------------------------------------
// PROTECT
// @access Private
// ------------------------------------------------------------
// SECURITY CHECKS:
// 1. Requires a valid access token.
// 2. Verifies JWT signature.
// 3. Restricts the JWT algorithm.
// 4. Validates the JWT payload.
// 5. Loads the current user from MongoDB.
// 6. Does not trust role/isActive information from the JWT.
// 7. Removes password and refreshToken from the user object.
// 8. Rejects deleted/non-existent users.
// 9. Rejects deactivated accounts.
// ------------------------------------------------------------

const protect = asyncHandler(async (req, res, next) => {
  const token = getAccessToken(req);

  if (!token) {
    throw new ApiError(401, "Not authorized, no token provided");
  }

  const decoded = verifyAccessToken(token);

  const user = await User.findById(decoded.id)
    .select("-password -refreshToken")
    .lean();

  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  if (user.isActive !== true) {
    throw new ApiError(403, "Account has been deactivated");
  }

  // SECURITY:
  // req.user comes from the database, not from the JWT payload.
  // This prevents stale/tampered role information in a token
  // from being trusted for authorization decisions.
  req.user = user;

  next();
});

// ------------------------------------------------------------
// AUTHORIZE
// ------------------------------------------------------------
// SECURITY:
// Performs server-side role-based access control (RBAC).
//
// Example:
// authorize("super_admin", "admin")
//
// Never rely on frontend role checks for authorization.
// ------------------------------------------------------------

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!Array.isArray(roles) || roles.length === 0) {
      throw new ApiError(500, "Authorization configuration error");
    }

    if (typeof req.user.role !== "string" || !roles.includes(req.user.role)) {
      throw new ApiError(403, "You are not authorized to access this resource");
    }

    next();
  };

// ------------------------------------------------------------
// OPTIONAL AUTH
// ------------------------------------------------------------
// Used for public endpoints where authenticated users may see
// additional permitted content.
//
// SECURITY:
// - Invalid/expired tokens NEVER grant access.
// - Invalid tokens are treated as anonymous.
// - User is loaded from the database.
// - Password and refreshToken are excluded.
// - JWT role data is never trusted directly.
// ------------------------------------------------------------

const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = getAccessToken(req);

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id)
      .select("-password -refreshToken")
      .lean();

    if (user && user.isActive === true) {
      req.user = user;
    }
  } catch {
    // SECURITY:
    // optionalAuth must never turn an invalid/expired token into
    // an authenticated session.
    //
    // The request continues as anonymous.
    // Do not expose JWT verification details to the client.
  }

  next();
});

module.exports = {
  protect,
  authorize,
  optionalAuth,
};

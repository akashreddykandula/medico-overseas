const express = require("express");
const { body, param } = require("express-validator");
const rateLimit = require("express-rate-limit");

const {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} = require("../controllers/authController");

const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");

const router = express.Router();

// ------------------------------------------------------------
// SECURITY: AUTH RATE LIMITER
// ------------------------------------------------------------
// Helps reduce:
// - Brute-force password attacks
// - Credential stuffing
// - Registration abuse
// - Password-reset abuse
//
// The global /api limiter in app.js remains an additional layer.
// ------------------------------------------------------------

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,

  standardHeaders: true,
  legacyHeaders: false,

  // Do not expose implementation details in the response.
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },

  // Keep rate-limit handling predictable.
  skipSuccessfulRequests: false,
});

// ------------------------------------------------------------
// REGISTER
// @route POST /api/auth/register
// @access Public
// ------------------------------------------------------------
// SECURITY:
// - Strict primitive input validation.
// - Length limits prevent oversized input.
// - Password length is bounded to protect bcrypt CPU usage.
// - validate() runs before the controller.
// - authLimiter reduces automated account creation.
// ------------------------------------------------------------

router.post(
  "/register",
  authLimiter,
  [
    body("name")
      .isString()
      .withMessage("Name must be a string")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),

    body("email")
      .isString()
      .withMessage("Email must be a string")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .isLength({ max: 254 })
      .withMessage("Email is too long")
      .normalizeEmail(),

    body("phone")
      .isString()
      .withMessage("Phone number must be a string")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required")
      .isLength({ max: 20 })
      .withMessage("Phone number cannot exceed 20 characters"),

    body("password")
      .isString()
      .withMessage("Password must be a string")
      .isLength({ min: 8, max: 128 })
      .withMessage("Password must be between 8 and 128 characters"),
  ],
  validate,
  register,
);

// ------------------------------------------------------------
// LOGIN
// @route POST /api/auth/login
// @access Public
// ------------------------------------------------------------
// SECURITY:
// Generic authentication errors are returned by the controller
// so attackers cannot easily determine whether an email exists.
// ------------------------------------------------------------

router.post(
  "/login",
  authLimiter,
  [
    body("email")
      .isString()
      .withMessage("Email must be a string")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .isLength({ max: 254 })
      .withMessage("Email is too long")
      .normalizeEmail(),

    body("password")
      .isString()
      .withMessage("Password must be a string")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ max: 128 })
      .withMessage("Password is too long"),
  ],
  validate,
  login,
);

// ------------------------------------------------------------
// REFRESH TOKEN
// @route POST /api/auth/refresh
// @access Public
// ------------------------------------------------------------
// SECURITY:
// The refresh token is read from the HttpOnly cookie by the
// controller. No refresh token should be accepted from req.body.
//
// The controller verifies:
// - JWT signature
// - JWT algorithm
// - JWT expiry
// - User existence
// - Account status
// - Stored refresh-token match
// - Refresh-token rotation
// ------------------------------------------------------------

router.post("/refresh", authLimiter, refresh);

// ------------------------------------------------------------
// LOGOUT
// @route POST /api/auth/logout
// @access Private
// ------------------------------------------------------------
// SECURITY:
// protect() ensures the request is authenticated before the
// server invalidates the stored refresh token.
// ------------------------------------------------------------

router.post("/logout", protect, logout);

// ------------------------------------------------------------
// FORGOT PASSWORD
// @route POST /api/auth/forgot-password
// @access Public
// ------------------------------------------------------------
// SECURITY:
// - Rate limited.
// - Email validated.
// - Controller returns a generic response to prevent
//   account/email enumeration.
// ------------------------------------------------------------

router.post(
  "/forgot-password",
  authLimiter,
  [
    body("email")
      .isString()
      .withMessage("Email must be a string")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .isLength({ max: 254 })
      .withMessage("Email is too long")
      .normalizeEmail(),
  ],
  validate,
  forgotPassword,
);

// ------------------------------------------------------------
// RESET PASSWORD
// @route POST /api/auth/reset-password/:token
// @access Public
// ------------------------------------------------------------
// SECURITY:
// - Rate limited.
// - Token format is validated before reaching the controller.
// - Password has both minimum and maximum length.
// - Controller hashes the token before database lookup.
// - Reset token is single-use.
// - Existing refresh token is invalidated after reset.
// ------------------------------------------------------------

router.post(
  "/reset-password/:token",
  authLimiter,
  [
    param("token")
      .isString()
      .withMessage("Invalid reset token")
      .isLength({ min: 64, max: 64 })
      .withMessage("Invalid reset token")
      .matches(/^[a-fA-F0-9]+$/)
      .withMessage("Invalid reset token"),

    body("password")
      .isString()
      .withMessage("Password must be a string")
      .isLength({ min: 8, max: 128 })
      .withMessage("Password must be between 8 and 128 characters"),
  ],
  validate,
  resetPassword,
);

// ------------------------------------------------------------
// CURRENT USER
// @route GET /api/auth/me
// @access Private
// ------------------------------------------------------------
// SECURITY:
// protect() verifies the access token and loads the current user
// from MongoDB before getMe() executes.
// ------------------------------------------------------------

router.get("/me", protect, getMe);

module.exports = router;

const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} = require('../controllers/authController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Stricter limiter for auth endpoints to slow down brute-force / credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post('/refresh', refresh);
router.post('/logout', protect, logout);

router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().withMessage('Valid email is required')],
  validate,
  forgotPassword
);

router.post(
  '/reset-password/:token',
  [body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')],
  validate,
  resetPassword
);

router.get('/me', protect, getMe);

module.exports = router;

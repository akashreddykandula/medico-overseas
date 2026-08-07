const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { submitContact, getContacts, updateContact } = require('../controllers/contactController');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const contactLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 10 });

router.post(
  '/',
  contactLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  validate,
  submitContact
);

router.use(protect, authorize('super_admin', 'admin', 'counsellor'));
router.get('/', getContacts);
router.patch('/:id', updateContact);

module.exports = router;

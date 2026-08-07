const express = require('express');
const {
  getCountries,
  getCountryBySlug,
  createCountry,
  updateCountry,
  deleteCountry,
} = require('../controllers/countryController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, getCountries);
router.get('/:slug', optionalAuth, getCountryBySlug);

router.use(protect, authorize('super_admin', 'admin', 'content_manager'));
router.post('/', createCountry);
router.put('/:id', updateCountry);
router.delete('/:id', authorize('super_admin', 'admin'), deleteCountry);

module.exports = router;

const express = require('express');
const {
  getUniversities,
  getUniversityBySlug,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} = require('../controllers/universityController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, getUniversities);
router.get('/:slug', optionalAuth, getUniversityBySlug);

router.use(protect, authorize('super_admin', 'admin', 'content_manager'));
router.post('/', createUniversity);
router.put('/:id', updateUniversity);
router.delete('/:id', authorize('super_admin', 'admin'), deleteUniversity);

module.exports = router;

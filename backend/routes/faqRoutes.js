const express = require('express');
const Faq = require('../models/Faq');
const createCrudController = require('../controllers/crudControllerFactory');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const ctrl = createCrudController(Faq, {
  populate: { path: 'relatedCountry', select: 'name slug' },
  sort: { category: 1, displayOrder: 1 },
  resourceName: 'FAQ',
});

router.get('/', optionalAuth, ctrl.list);
router.get('/:id', optionalAuth, ctrl.getOne);

router.use(protect, authorize('super_admin', 'admin', 'content_manager'));
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', authorize('super_admin', 'admin'), ctrl.remove);

module.exports = router;

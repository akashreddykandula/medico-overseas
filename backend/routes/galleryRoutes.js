const express = require('express');
const GalleryItem = require('../models/GalleryItem');
const createCrudController = require('../controllers/crudControllerFactory');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadImage } = require('../controllers/uploadController');

const router = express.Router();
const ctrl = createCrudController(GalleryItem, {
  populate: [
    { path: 'country', select: 'name slug' },
    { path: 'university', select: 'name slug' },
  ],
  sort: { displayOrder: 1, createdAt: -1 },
  resourceName: 'Gallery item',
});

router.get('/', optionalAuth, ctrl.list);
router.get('/:id', optionalAuth, ctrl.getOne);

router.use(protect, authorize('super_admin', 'admin', 'content_manager'));
router.post('/upload', upload.single('image'), uploadImage); // returns { url, publicId } to use in create/update
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', authorize('super_admin', 'admin'), ctrl.remove);

module.exports = router;

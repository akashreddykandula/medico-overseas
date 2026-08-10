const express = require("express");
const GalleryItem = require("../models/GalleryItem");
const createCrudController = require("../controllers/crudControllerFactory");
const { protect, authorize, optionalAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { uploadImage } = require("../controllers/uploadController");

const router = express.Router();

const ctrl = createCrudController(GalleryItem, {
  populate: [
    {
      path: "country",
      select: "name slug",
    },
    {
      path: "university",
      select: "name slug",
    },
  ],
  sort: {
    displayOrder: 1,
    createdAt: -1,
  },
  resourceName: "Gallery item",
});

// ============================================================
// PUBLIC ROUTES
// ============================================================

router.get("/", optionalAuth, ctrl.list);
router.get("/:id", optionalAuth, ctrl.getOne);

// ============================================================
// PROTECTED MANAGEMENT ROUTES
// ============================================================

router.use(protect, authorize("super_admin", "admin", "content_manager"));

// Gallery image upload.
// The upload controller performs the actual Cloudinary upload
// and returns { url, publicId } for create/update.
router.post("/upload", upload.single("image"), uploadImage);

router.post("/", ctrl.create);

router.put("/:id", ctrl.update);

router.delete("/:id", authorize("super_admin", "admin"), ctrl.remove);

module.exports = router;

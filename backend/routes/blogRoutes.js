const express = require("express");
const { body } = require("express-validator");

const {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

const validate = require("../middleware/validate");
const { protect, authorize, optionalAuth } = require("../middleware/auth");

const upload = require("../middleware/uploadMiddleware");
const { uploadImage } = require("../controllers/uploadController");

const router = express.Router();

// ============================================================
// PUBLIC ROUTES
// ============================================================

// List blogs.
// Public users/students see published blogs.
// Staff users may see drafts according to controller logic.
router.get("/", optionalAuth, getBlogs);

// Get blog by slug.
// Public users/students cannot access unpublished blogs.
router.get("/:slug", optionalAuth, getBlogBySlug);

// ============================================================
// STAFF BLOG MANAGEMENT
// ============================================================
//
// Allowed blog-management roles:
// - super_admin
// - admin
// - content_manager
// - marketing_manager
//
// The controller also performs defense-in-depth validation.

router.use(
  protect,
  authorize("super_admin", "admin", "content_manager", "marketing_manager"),
);

// ============================================================
// BLOG IMAGE UPLOAD
// ============================================================

// SECURITY:
// - Authentication required.
// - Staff role required.
// - Multer validates the uploaded file.
// - uploadImage must validate the file before Cloudinary upload.
router.post("/upload", upload.single("image"), uploadImage);

// ============================================================
// CREATE BLOG
// ============================================================

router.post(
  "/",
  [
    body("title")
      .isString()
      .withMessage("Title must be a string")
      .trim()
      .notEmpty()
      .withMessage("Title is required"),

    body("excerpt")
      .isString()
      .withMessage("Excerpt must be a string")
      .trim()
      .notEmpty()
      .withMessage("Excerpt is required"),

    body("body")
      .isString()
      .withMessage("Body must be a string")
      .trim()
      .notEmpty()
      .withMessage("Body content is required"),
  ],
  validate,
  createBlog,
);

// ============================================================
// UPDATE BLOG
// ============================================================

router.put("/:id", updateBlog);

// ============================================================
// DELETE BLOG
// ============================================================
//
// Only super_admin/admin can permanently delete blogs.
// content_manager/marketing_manager cannot delete blogs.

router.delete("/:id", authorize("super_admin", "admin"), deleteBlog);

module.exports = router;

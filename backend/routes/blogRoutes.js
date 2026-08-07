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

router.get("/", optionalAuth, getBlogs);
router.get("/:slug", optionalAuth, getBlogBySlug);

router.use(protect, authorize("super_admin", "admin", "content_manager"));
router.post("/upload", upload.single("image"), uploadImage);

router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("excerpt").trim().notEmpty().withMessage("Excerpt is required"),
    body("body").trim().notEmpty().withMessage("Body content is required"),
  ],
  validate,
  createBlog,
);
router.put("/:id", updateBlog);
router.delete("/:id", authorize("super_admin", "admin"), deleteBlog);

module.exports = router;

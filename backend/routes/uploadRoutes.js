const express = require("express");

const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/auth");
const { uploadImage } = require("../controllers/uploadController");

const router = express.Router();

router.post(
  "/image",
  protect,
  authorize("super_admin", "admin", "content_manager"),
  upload.single("file"),
  uploadImage,
);

module.exports = router;

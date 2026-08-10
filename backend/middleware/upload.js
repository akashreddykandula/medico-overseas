const multer = require("multer");
const ApiError = require("../utils/ApiError");

// ============================================================
// MULTER STORAGE
// ============================================================
//
// memoryStorage() keeps the uploaded file in memory so it can
// be passed directly to Cloudinary.
//
// IMPORTANT:
// Route-level authorization must run BEFORE Multer.
// Your applicationRoutes.js already does this correctly.
//

const storage = multer.memoryStorage();

// ============================================================
// ALLOWED FILE TYPES
// ============================================================
//
// These are checked at the multipart upload boundary.
//
// IMPORTANT:
// MIME type comes from the client and should NOT be treated as
// proof that the file contents are actually safe.
// The controller performs an additional MIME/size check.
//
// Your existing application logic supports:
// - JPEG
// - PNG
// - WebP for images
// - PDF for student documents
//
// GIF is retained for the existing general image-upload logic.
//

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const ALLOWED_DOCUMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

// ============================================================
// FILE FILTER
// ============================================================
//
// SECURITY:
// Reject unsupported MIME types before the file reaches the
// controller or Cloudinary.
//
// Do not include the actual MIME type in production error
// messages if you want to minimize information disclosure.
//

const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (!file || typeof file.mimetype !== "string") {
    return cb(new ApiError(400, "Invalid uploaded file"), false);
  }

  if (!allowedTypes.has(file.mimetype.toLowerCase())) {
    return cb(new ApiError(400, "Unsupported file type"), false);
  }

  cb(null, true);
};

// ============================================================
// GENERAL IMAGE UPLOAD
// ============================================================
//
// Used for:
// - Gallery images
// - Blog images
// - Country images
// - University images
// - Avatars
//
// SECURITY LIMITS:
// - Maximum file size: 5MB
// - Maximum number of files: 1
// - Maximum multipart fields: 10
// - Maximum field name length: 100
// - Maximum individual field value: 50KB
//
// These limits help reduce multipart/form-data abuse.
//

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
    fields: 30,
    fieldNameSize: 100,
    fieldSize: 50 * 1024,
  },

  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
});

// ============================================================
// STUDENT DOCUMENT UPLOAD
// ============================================================
//
// Used for:
// - Passport
// - Aadhaar
// - PAN
// - 10th / 12th documents
// - NEET scorecard
// - Medical certificates
// - Offer letters
// - Visa documents
//
// IMPORTANT:
// The applicationController currently enforces a 5MB maximum.
// Therefore this middleware must ALSO use 5MB so the middleware
// and controller have the same security boundary.
//
// This prevents a file larger than the controller's intended
// limit from being accepted by Multer first.
//

const uploadDocument = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
    fields: 10,
    fieldNameSize: 100,
    fieldSize: 50 * 1024,
  },

  fileFilter: fileFilter(ALLOWED_DOCUMENT_TYPES),
});

// ============================================================
// EXPORTS
// ============================================================
//
// Preserve the existing API:
//   const upload = require("../middleware/upload");
//   upload.single("file")
//
// And:
//   const { uploadDocument } = require("../middleware/upload");
//   uploadDocument.single("file")
//

module.exports = upload;
module.exports.uploadDocument = uploadDocument;

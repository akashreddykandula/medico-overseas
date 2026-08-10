const multer = require("multer");

// ============================================================
// SECURITY: Allowed upload MIME types
// ============================================================
//
// This is the FIRST upload-layer check.
//
// IMPORTANT:
// MIME type alone is NOT sufficient to prove that a file is
// actually a JPEG/PNG/PDF. The controller/service should perform
// additional content/signature validation before trusting the file.
//
// ============================================================

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);

// ============================================================
// SECURITY: Multer memory storage
// ============================================================
//
// Files remain in memory temporarily and are then passed to
// Cloudinary.
//
// IMPORTANT:
// Memory storage can consume server RAM, so the strict file-size
// and multipart limits below are intentional.
//
// ============================================================

const storage = multer.memoryStorage();

// ============================================================
// SECURITY: Multer configuration
// ============================================================

const upload = multer({
  storage,

  limits: {
    // SECURITY:
    // Hard upper limit at the multipart parsing layer.
    //
    // Keep this <= the maximum accepted by your controllers.
    fileSize: 5 * 1024 * 1024, // 5 MB

    // SECURITY:
    // Only one uploaded file is accepted per request.
    files: 1,

    // SECURITY:
    // Prevent attackers from sending huge numbers of multipart
    // fields along with the file.
    fields: 10,

    // SECURITY:
    // Prevent abnormally large multipart field names.
    fieldNameSize: 100,

    // SECURITY:
    // Prevent excessive multipart field values from consuming
    // server memory.
    fieldSize: 50 * 1024,
  },

  fileFilter: (req, file, cb) => {
    // ========================================================
    // SECURITY: Validate MIME type at the upload boundary
    // ========================================================
    //
    // Reject unsupported file types BEFORE they reach the
    // controller or Cloudinary.
    //
    // Do NOT trust req.body values to determine the file type.
    //
    // ========================================================

    if (
      !file ||
      typeof file.mimetype !== "string" ||
      !ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())
    ) {
      return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }

    // ========================================================
    // SECURITY: Basic filename validation
    // ========================================================
    //
    // The original filename is untrusted user input.
    // We do not use it as a filesystem path.
    //
    // Reject control characters and excessively long names.
    // The controller can still sanitize the filename before
    // storing/displaying it.
    //
    // ========================================================

    if (
      typeof file.originalname !== "string" ||
      file.originalname.length === 0 ||
      file.originalname.length > 255 ||
      /[\u0000-\u001F\u007F]/.test(file.originalname)
    ) {
      return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }

    cb(null, true);
  },
});

module.exports = upload;

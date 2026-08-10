const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { uploadBufferToCloudinary } = require("../services/cloudinaryService");

// ============================================================
// SECURITY: Allowed image MIME types
// ============================================================
//
// MIME type comes from the client and MUST NOT be trusted by
// itself. We also validate the actual file signature below.
//

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// ============================================================
// SECURITY: Allowed Cloudinary folders
// ============================================================
//
// Never allow a user to supply an arbitrary Cloudinary folder.
// This prevents uncontrolled resource placement.
//
// Add new folders here only when the application requires them.
// ============================================================

const ALLOWED_FOLDERS = new Set([
  "medico-overseas/misc",
  "medico-overseas/blogs",
  "medico-overseas/countries",
  "medico-overseas/universities",
  "medico-overseas/testimonials",
  "medico-overseas/gallery",
]);

// ============================================================
// SECURITY: Maximum image size
// ============================================================
//
// This should match the Multer upload limit.
// Multer is the first boundary; this controller check is
// defense-in-depth.
// ============================================================

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// ============================================================
// SECURITY: Validate actual file signature
// ============================================================
//
// `req.file.mimetype` is client-controlled and can be forged.
//
// Checking magic bytes prevents a file such as an HTML/script
// payload from being accepted merely because the client says:
//
//     Content-Type: image/png
//
// Supported:
// - JPEG
// - PNG
// - WebP
// ============================================================

const hasValidImageSignature = (buffer, mimetype) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
    return false;
  }

  // JPEG: FF D8 FF
  if (mimetype === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (mimetype === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  // WebP:
  // RIFF....WEBP
  if (mimetype === "image/webp") {
    return (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    );
  }

  return false;
};

// ============================================================
// Upload a single image
//
// @route   POST /api/.../upload
// @access  Private
// ============================================================

const uploadImage = asyncHandler(async (req, res) => {
  // ----------------------------------------------------------
  // 1. Authentication defense-in-depth
  // ----------------------------------------------------------
  //
  // The route should already use protect(), but this prevents
  // accidental use of this controller without authentication.
  // ----------------------------------------------------------

  if (!req.user || !req.user._id) {
    throw new ApiError(401, "Authentication required");
  }

  // ----------------------------------------------------------
  // 2. File existence validation
  // ----------------------------------------------------------

  if (!req.file) {
    throw new ApiError(400, "No file provided");
  }

  // ----------------------------------------------------------
  // 3. Validate MIME type
  // ----------------------------------------------------------
  //
  // This is only the first validation layer because MIME type
  // can be forged by the client.
  // ----------------------------------------------------------

  if (!ALLOWED_IMAGE_TYPES.has(req.file.mimetype)) {
    throw new ApiError(
      400,
      "Invalid image format. Only JPEG, PNG, and WebP images are allowed.",
    );
  }

  // ----------------------------------------------------------
  // 4. Validate file size
  // ----------------------------------------------------------

  if (!Number.isFinite(req.file.size) || req.file.size <= 0) {
    throw new ApiError(400, "Invalid or empty image file");
  }

  if (req.file.size > MAX_IMAGE_SIZE) {
    throw new ApiError(400, "Image size cannot exceed 5MB");
  }

  // ----------------------------------------------------------
  // 5. Validate uploaded buffer
  // ----------------------------------------------------------

  if (
    !req.file.buffer ||
    !Buffer.isBuffer(req.file.buffer) ||
    req.file.buffer.length === 0
  ) {
    throw new ApiError(400, "Invalid image data");
  }

  // ----------------------------------------------------------
  // 6. Validate actual image signature
  // ----------------------------------------------------------
  //
  // SECURITY:
  // Do not rely only on `req.file.mimetype`.
  // ----------------------------------------------------------

  if (!hasValidImageSignature(req.file.buffer, req.file.mimetype)) {
    throw new ApiError(
      400,
      "Invalid image file. The uploaded content does not match the declared image format.",
    );
  }

  // ----------------------------------------------------------
  // 7. Validate Cloudinary folder
  // ----------------------------------------------------------
  //
  // SECURITY:
  // Never directly pass an arbitrary user-controlled folder
  // to Cloudinary.
  //
  // Unlike silently falling back to "misc", an invalid folder
  // is rejected so a caller cannot accidentally upload content
  // to an unintended location.
  // ----------------------------------------------------------

  const requestedFolder =
    typeof req.query.folder === "string"
      ? req.query.folder.trim()
      : "medico-overseas/misc";

  if (!ALLOWED_FOLDERS.has(requestedFolder)) {
    throw new ApiError(400, "Invalid upload folder");
  }

  const folder = requestedFolder;

  // ----------------------------------------------------------
  // 8. Upload only validated image content
  // ----------------------------------------------------------

  const result = await uploadBufferToCloudinary(
    req.file.buffer,
    folder,
    "image",
  );

  // ----------------------------------------------------------
  // 9. Validate Cloudinary response
  // ----------------------------------------------------------
  //
  // Only return the values required by the application.
  // ----------------------------------------------------------

  if (
    !result ||
    typeof result.secure_url !== "string" ||
    typeof result.public_id !== "string" ||
    !result.secure_url ||
    !result.public_id
  ) {
    throw new ApiError(
      502,
      "Image upload service returned an invalid response",
    );
  }

  // ----------------------------------------------------------
  // 10. Return sanitized upload response
  // ----------------------------------------------------------

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        url: result.secure_url,
        publicId: result.public_id,
      },
      "Image uploaded successfully",
    ),
  );
});

module.exports = {
  uploadImage,
};

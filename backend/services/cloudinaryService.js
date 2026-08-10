const cloudinary = require("../config/cloudinary");

// ============================================================
// SECURITY: Allowed Cloudinary resource types
// ============================================================
//
// Keep this allowlist aligned with the application's existing
// usage:
// - image -> normal images
// - raw   -> student PDF documents
//
// Do not accept arbitrary Cloudinary resource types from callers.
// ============================================================

const ALLOWED_RESOURCE_TYPES = new Set(["image", "raw"]);

// ============================================================
// SECURITY: Maximum folder length
// ============================================================
//
// Prevents unnecessarily large values from reaching Cloudinary.
// The actual folder names should still be allowlisted by the
// calling controller where user input is involved.
// ============================================================

const MAX_FOLDER_LENGTH = 200;

// ============================================================
// SECURITY: Maximum public ID length
// ============================================================

const MAX_PUBLIC_ID_LENGTH = 500;

/**
 * Upload a Buffer to Cloudinary.
 *
 * Used by:
 * - Public/admin images -> image
 * - Student documents -> raw
 *
 * @param {Buffer} buffer
 * @param {string} folder
 * @param {"image"|"raw"} resourceType
 * @returns {Promise<object>}
 */
const uploadBufferToCloudinary = (buffer, folder, resourceType = "image") =>
  new Promise((resolve, reject) => {
    // ----------------------------------------------------------
    // SECURITY 1: Validate buffer
    // ----------------------------------------------------------
    //
    // Prevent invalid values from being passed to Cloudinary's
    // upload stream.
    // ----------------------------------------------------------

    if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
      return reject(new Error("Invalid or empty upload buffer"));
    }

    // ----------------------------------------------------------
    // SECURITY 2: Validate resource type
    // ----------------------------------------------------------
    //
    // Never allow callers to pass arbitrary Cloudinary resource
    // types.
    // ----------------------------------------------------------

    if (!ALLOWED_RESOURCE_TYPES.has(resourceType)) {
      return reject(new Error("Invalid Cloudinary resource type"));
    }

    // ----------------------------------------------------------
    // SECURITY 3: Validate folder type and length
    // ----------------------------------------------------------

    if (
      typeof folder !== "string" ||
      !folder.trim() ||
      folder.length > MAX_FOLDER_LENGTH
    ) {
      return reject(new Error("Invalid Cloudinary folder"));
    }

    const safeFolder = folder.trim();

    // ----------------------------------------------------------
    // SECURITY 4: Reject path traversal / malformed folder
    // ----------------------------------------------------------
    //
    // Cloudinary folders should never contain filesystem-style
    // traversal sequences or backslashes.
    //
    // Controllers should ALSO use explicit folder allowlists.
    // This service-level validation is defense-in-depth.
    // ----------------------------------------------------------

    if (
      safeFolder.includes("..") ||
      safeFolder.includes("\\") ||
      safeFolder.includes("\0") ||
      safeFolder.startsWith("/") ||
      safeFolder.endsWith("/")
    ) {
      return reject(new Error("Invalid Cloudinary folder"));
    }

    // ----------------------------------------------------------
    // SECURITY 5: Allow only safe Cloudinary folder characters
    // ----------------------------------------------------------
    //
    // Existing application folders use:
    // letters, numbers, hyphens, underscores and forward slashes.
    //
    // This prevents unexpected control characters and malformed
    // folder paths from reaching the Cloudinary API.
    // ----------------------------------------------------------

    if (!/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(safeFolder)) {
      return reject(new Error("Invalid Cloudinary folder"));
    }

    // ----------------------------------------------------------
    // Upload
    // ----------------------------------------------------------

    let stream;

    try {
      stream = cloudinary.uploader.upload_stream(
        {
          folder: safeFolder,
          resource_type: resourceType,
        },
        (err, result) => {
          // ----------------------------------------------------
          // SECURITY 6: Do not expose Cloudinary internals here.
          //
          // The global error handler will convert the error into
          // a safe API response.
          // ----------------------------------------------------

          if (err) {
            return reject(err);
          }

          // ----------------------------------------------------
          // SECURITY 7: Validate Cloudinary response
          // ----------------------------------------------------

          if (
            !result ||
            typeof result.public_id !== "string" ||
            !result.public_id.trim()
          ) {
            return reject(
              new Error("Cloudinary returned an invalid upload response"),
            );
          }

          resolve(result);
        },
      );

      // --------------------------------------------------------
      // SECURITY 8: Handle stream-level errors
      // --------------------------------------------------------
      //
      // Prevent unhandled stream errors from crashing the
      // request/process.
      // --------------------------------------------------------

      stream.on("error", reject);

      stream.end(buffer);
    } catch (error) {
      reject(error);
    }
  });

/**
 * Delete an asset from Cloudinary.
 *
 * @param {string} publicId
 * @param {"image"|"raw"} resourceType
 */
const deleteFromCloudinary = (publicId, resourceType = "image") => {
  // ----------------------------------------------------------
  // SECURITY 9: Validate public ID
  // ----------------------------------------------------------

  if (
    typeof publicId !== "string" ||
    !publicId.trim() ||
    publicId.length > MAX_PUBLIC_ID_LENGTH
  ) {
    return Promise.reject(new Error("Invalid Cloudinary public ID"));
  }

  const safePublicId = publicId.trim();

  // ----------------------------------------------------------
  // SECURITY 10: Reject malformed / traversal-style IDs
  // ----------------------------------------------------------
  //
  // Public IDs are generated by Cloudinary and stored by the
  // application. Reject obviously malformed values before they
  // reach the Cloudinary API.
  // ----------------------------------------------------------

  if (
    safePublicId.includes("..") ||
    safePublicId.includes("\\") ||
    safePublicId.includes("\0") ||
    safePublicId.startsWith("/") ||
    safePublicId.endsWith("/")
  ) {
    return Promise.reject(new Error("Invalid Cloudinary public ID"));
  }

  // ----------------------------------------------------------
  // SECURITY 11: Validate resource type
  // ----------------------------------------------------------

  if (!ALLOWED_RESOURCE_TYPES.has(resourceType)) {
    return Promise.reject(new Error("Invalid Cloudinary resource type"));
  }

  // ----------------------------------------------------------
  // Delete
  // ----------------------------------------------------------

  return cloudinary.uploader.destroy(safePublicId, {
    resource_type: resourceType,
  });
};

module.exports = {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
};

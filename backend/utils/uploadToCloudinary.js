const cloudinary = require("../config/cloudinary");

// ============================================================
// UPLOAD BUFFER TO CLOUDINARY
// ============================================================
//
// Multer uses memoryStorage(), so the uploaded image is available
// as req.file.buffer.
//
// This helper sends that buffer directly to Cloudinary.
// No temporary file is created on the server.
//

const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      return reject(new Error("Invalid image buffer"));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "medico-overseas/universities",

        resource_type: "image",

        // Automatically optimize the uploaded image.
        quality: "auto",

        // Automatically select the best format.
        fetch_format: "auto",
      },

      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result?.secure_url || !result?.public_id) {
          return reject(new Error("Cloudinary upload failed"));
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    uploadStream.end(buffer);
  });
};

module.exports = uploadToCloudinary;

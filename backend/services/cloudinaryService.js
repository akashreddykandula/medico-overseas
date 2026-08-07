const cloudinary = require('../config/cloudinary');

// Streams a buffer (from multer memoryStorage) to Cloudinary without touching disk
const uploadBufferToCloudinary = (buffer, folder, resourceType = 'image') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: resourceType }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });

const deleteFromCloudinary = (publicId, resourceType = 'image') =>
  cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

module.exports = { uploadBufferToCloudinary, deleteFromCloudinary };

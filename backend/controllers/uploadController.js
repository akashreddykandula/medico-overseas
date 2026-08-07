const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { uploadBufferToCloudinary } = require('../services/cloudinaryService');

// @desc    Upload a single image and return its Cloudinary URL/publicId
// @route   POST /api/.../upload  (mounted per-resource, protected by that resource's auth rules)
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file provided');

  const folder = req.query.folder || 'medico-overseas/misc';
  const result = await uploadBufferToCloudinary(req.file.buffer, folder, 'image');

  res
    .status(201)
    .json(new ApiResponse(201, { url: result.secure_url, publicId: result.public_id }, 'Image uploaded'));
});

module.exports = { uploadImage };

const University = require('../models/University');
const Country = require('../models/Country');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    List universities (optionally filtered by country)
// @route   GET /api/universities?country=<slug>
// @access  Public
const getUniversities = asyncHandler(async (req, res) => {
  const filter = req.user ? {} : { isPublished: true };

  if (req.query.country) {
    const country = await Country.findOne({ slug: req.query.country });
    if (!country) throw new ApiError(404, 'Destination not found');
    filter.country = country._id;
  }

  const universities = await University.find(filter).populate('country', 'name slug').sort({ name: 1 });
  res.status(200).json(new ApiResponse(200, { universities }));
});

// @desc    Get single university by slug
// @route   GET /api/universities/:slug
// @access  Public
const getUniversityBySlug = asyncHandler(async (req, res) => {
  const university = await University.findOne({ slug: req.params.slug }).populate('country', 'name slug');
  if (!university || (!university.isPublished && !req.user)) {
    throw new ApiError(404, 'University not found');
  }
  res.status(200).json(new ApiResponse(200, { university }));
});

// @desc    Create university
// @route   POST /api/universities
// @access  Private (admin/content_manager)
const createUniversity = asyncHandler(async (req, res) => {
  const university = await University.create(req.body);
  await Country.findByIdAndUpdate(university.country, { $inc: { universityCount: 1 } });
  res.status(201).json(new ApiResponse(201, { university }, 'University created'));
});

// @desc    Update university
// @route   PUT /api/universities/:id
// @access  Private (admin/content_manager)
const updateUniversity = asyncHandler(async (req, res) => {
  const university = await University.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!university) throw new ApiError(404, 'University not found');
  res.status(200).json(new ApiResponse(200, { university }, 'University updated'));
});

// @desc    Delete university
// @route   DELETE /api/universities/:id
// @access  Private (admin)
const deleteUniversity = asyncHandler(async (req, res) => {
  const university = await University.findByIdAndDelete(req.params.id);
  if (!university) throw new ApiError(404, 'University not found');
  await Country.findByIdAndUpdate(university.country, { $inc: { universityCount: -1 } });
  res.status(200).json(new ApiResponse(200, null, 'University deleted'));
});

module.exports = { getUniversities, getUniversityBySlug, createUniversity, updateUniversity, deleteUniversity };

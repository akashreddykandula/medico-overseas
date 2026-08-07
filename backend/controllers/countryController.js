const Country = require('../models/Country');
const University = require('../models/University');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    List all published countries (for nav dropdown, homepage grid)
// @route   GET /api/countries
// @access  Public
const getCountries = asyncHandler(async (req, res) => {
  const filter = req.user ? {} : { isPublished: true }; // admins (req.user set) see drafts too
  const countries = await Country.find(filter).sort({ displayOrder: 1, name: 1 });
  res.status(200).json(new ApiResponse(200, { countries }));
});

// @desc    Get single country by slug, with its universities
// @route   GET /api/countries/:slug
// @access  Public
const getCountryBySlug = asyncHandler(async (req, res) => {
  const country = await Country.findOne({ slug: req.params.slug });
  if (!country || (!country.isPublished && !req.user)) {
    throw new ApiError(404, 'Destination not found');
  }

  const universities = await University.find({ country: country._id, isPublished: true }).sort({ name: 1 });

  res.status(200).json(new ApiResponse(200, { country, universities }));
});

// @desc    Create a country (supports adding a 7th+ destination without a code change)
// @route   POST /api/countries
// @access  Private (admin/content_manager)
const createCountry = asyncHandler(async (req, res) => {
  const country = await Country.create(req.body);
  res.status(201).json(new ApiResponse(201, { country }, 'Destination created'));
});

// @desc    Update a country
// @route   PUT /api/countries/:id
// @access  Private (admin/content_manager)
const updateCountry = asyncHandler(async (req, res) => {
  const country = await Country.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!country) throw new ApiError(404, 'Destination not found');
  res.status(200).json(new ApiResponse(200, { country }, 'Destination updated'));
});

// @desc    Delete a country
// @route   DELETE /api/countries/:id
// @access  Private (admin)
const deleteCountry = asyncHandler(async (req, res) => {
  const universityCount = await University.countDocuments({ country: req.params.id });
  if (universityCount > 0) {
    throw new ApiError(400, 'Cannot delete a destination that still has universities linked to it');
  }
  const country = await Country.findByIdAndDelete(req.params.id);
  if (!country) throw new ApiError(404, 'Destination not found');
  res.status(200).json(new ApiResponse(200, null, 'Destination deleted'));
});

module.exports = { getCountries, getCountryBySlug, createCountry, updateCountry, deleteCountry };

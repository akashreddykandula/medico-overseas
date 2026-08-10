const mongoose = require("mongoose");
const Country = require("../models/Country");
const University = require("../models/University");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// ============================================================
// SECURITY HELPERS
// ============================================================

// Validate MongoDB ObjectIds before using them in queries.
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Prevent MongoDB operator/dot notation injection in string values.
const sanitizeString = (value, maxLength = 200) => {
  if (typeof value !== "string") return "";

  return value.replace(/[$.]/g, "").trim().slice(0, maxLength);
};

// ------------------------------------------------------------
// Explicit allowlist for country fields.
//
// IMPORTANT:
// Never pass req.body directly into Country.create() or
// findByIdAndUpdate(). This prevents clients from modifying
// protected/unknown fields such as universityCount, _id, etc.
// ------------------------------------------------------------

const ALLOWED_FIELDS = [
  "name",
  "slug",
  "flagImage",
  "heroImage",
  "shortDescription",
  "overview",
  "fees",
  "capital",
  "currency",
  "flightDuration",
  "timeDifference",
  "internationalAirports",
  "durationYears",
  "mediumOfInstruction",
  "eligibility",
  "admissionProcess",
  "requiredDocuments",
  "visaProcess",
  "livingCost",
  "climateNotes",
  "studentLifeNotes",
  "faqs",
  "isPublished",
  "displayOrder",
  "metaTitle",
  "metaDescription",
];

// ============================================================
// BUILD SAFE COUNTRY PAYLOAD
// ============================================================

const buildSafeCountryData = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "Invalid request body");
  }

  const data = {};

  for (const field of ALLOWED_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) {
      continue;
    }

    const value = body[field];

    // --------------------------------------------------------
    // Prevent MongoDB operators such as:
    // { "$set": ... }
    // { "$where": ... }
    // { "nested.$gt": ... }
    //
    // Arrays are checked recursively below.
    // --------------------------------------------------------

    const containsMongoOperator = (input) => {
      if (!input || typeof input !== "object") {
        return false;
      }

      if (Array.isArray(input)) {
        return input.some((item) => containsMongoOperator(item));
      }

      return Object.entries(input).some(([key, nestedValue]) => {
        if (key.startsWith("$") || key.includes(".")) {
          return true;
        }

        return containsMongoOperator(nestedValue);
      });
    };

    if (containsMongoOperator(value)) {
      throw new ApiError(400, `Invalid value for field: ${field}`);
    }

    data[field] = value;
  }

  return data;
};

// ============================================================
// VALIDATE COMMON COUNTRY FIELDS
// ============================================================

const validateCountryData = (data, { isCreate = false } = {}) => {
  // ----------------------------------------------------------
  // Name
  // ----------------------------------------------------------

  if (isCreate || data.name !== undefined) {
    if (typeof data.name !== "string" || !data.name.trim()) {
      throw new ApiError(400, "Country name is required");
    }

    data.name = sanitizeString(data.name, 150);

    if (!data.name) {
      throw new ApiError(400, "Invalid country name");
    }
  }

  // ----------------------------------------------------------
  // Slug
  // ----------------------------------------------------------

  if (data.slug !== undefined) {
    if (typeof data.slug !== "string" || !data.slug.trim()) {
      throw new ApiError(400, "Invalid country slug");
    }

    data.slug = sanitizeString(data.slug, 200).toLowerCase();

    if (!data.slug) {
      throw new ApiError(400, "Invalid country slug");
    }
  }

  // ----------------------------------------------------------
  // String fields
  //
  // Mongoose performs the final schema validation, while these
  // checks prevent malformed values from reaching the model.
  // ----------------------------------------------------------

  const stringFields = [
    "shortDescription",
    "overview",
    "capital",
    "currency",
    "flightDuration",
    "timeDifference",
    "internationalAirports",
    "mediumOfInstruction",
    "visaProcess",
    "metaTitle",
    "metaDescription",
    "climateNotes",
    "studentLifeNotes",
  ];

  for (const field of stringFields) {
    if (data[field] !== undefined && typeof data[field] !== "string") {
      throw new ApiError(400, `Invalid value for field: ${field}`);
    }
  }

  // ----------------------------------------------------------
  // Boolean fields
  // ----------------------------------------------------------

  if (data.isPublished !== undefined && typeof data.isPublished !== "boolean") {
    throw new ApiError(400, "isPublished must be a boolean");
  }

  // ----------------------------------------------------------
  // Numeric fields
  // ----------------------------------------------------------

  const numericFields = ["durationYears", "displayOrder"];

  for (const field of numericFields) {
    if (data[field] !== undefined) {
      if (typeof data[field] !== "number" || !Number.isFinite(data[field])) {
        throw new ApiError(400, `Invalid value for field: ${field}`);
      }
    }
  }

  return data;
};

// ============================================================
// GET COUNTRIES
// @route   GET /api/countries
// @access  Public
// ============================================================

const getCountries = asyncHandler(async (req, res) => {
  // Existing logic preserved:
  // authenticated users can see drafts, public users cannot.
  const filter = req.user ? {} : { isPublished: true };

  const countries = await Country.find(filter)
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  res.status(200).json(
    new ApiResponse(200, {
      countries,
    }),
  );
});

// ============================================================
// GET COUNTRY BY SLUG
// @route   GET /api/countries/:slug
// @access  Public
// ============================================================

const getCountryBySlug = asyncHandler(async (req, res) => {
  // ----------------------------------------------------------
  // Validate/sanitize route parameter before database query.
  // ----------------------------------------------------------

  const slug = sanitizeString(req.params.slug, 200);

  if (!slug) {
    throw new ApiError(400, "Invalid country slug");
  }

  const country = await Country.findOne({ slug }).lean();

  if (!country || (!country.isPublished && !req.user)) {
    throw new ApiError(404, "Destination not found");
  }

  // Existing behavior preserved:
  // Only published universities are returned.
  const universities = await University.find({
    country: country._id,
    isPublished: true,
  })
    .sort({ name: 1 })
    .lean();

  res.status(200).json(
    new ApiResponse(200, {
      country,
      universities,
    }),
  );
});

// ============================================================
// CREATE COUNTRY
// @route   POST /api/countries
// @access  Private (admin/content_manager)
// ============================================================

const createCountry = asyncHandler(async (req, res) => {
  // ----------------------------------------------------------
  // Defense-in-depth authorization.
  //
  // Route middleware should already enforce this, but keeping
  // this check prevents accidental exposure if the controller
  // is mounted somewhere incorrectly in the future.
  // ----------------------------------------------------------

  if (
    !req.user ||
    !["super_admin", "admin", "content_manager"].includes(req.user.role)
  ) {
    throw new ApiError(403, "Access denied");
  }

  const countryData = buildSafeCountryData(req.body);

  validateCountryData(countryData, {
    isCreate: true,
  });

  let country;

  try {
    country = await Country.create(countryData);
  } catch (error) {
    // --------------------------------------------------------
    // Handle duplicate name/slug safely.
    // --------------------------------------------------------

    if (error.code === 11000) {
      throw new ApiError(
        409,
        "A destination with this name or slug already exists",
      );
    }

    throw error;
  }

  res.status(201).json(
    new ApiResponse(
      201,
      {
        country,
      },
      "Destination created",
    ),
  );
});

// ============================================================
// UPDATE COUNTRY
// @route   PUT /api/countries/:id
// @access  Private (admin/content_manager)
// ============================================================

const updateCountry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ----------------------------------------------------------
  // Validate MongoDB ObjectId before querying.
  // ----------------------------------------------------------

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid destination ID");
  }

  const updateData = buildSafeCountryData(req.body);

  validateCountryData(updateData);

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  // ----------------------------------------------------------
  // Never allow universityCount to be updated by the client.
  //
  // It is intentionally NOT included in ALLOWED_FIELDS.
  // The application maintains this value automatically.
  // ----------------------------------------------------------

  let country;

  try {
    country = await Country.findByIdAndUpdate(
      id,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
        context: "query",
      },
    );
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        409,
        "A destination with this name or slug already exists",
      );
    }

    throw error;
  }

  if (!country) {
    throw new ApiError(404, "Destination not found");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        country,
      },
      "Destination updated",
    ),
  );
});

// ============================================================
// DELETE COUNTRY
// @route   DELETE /api/countries/:id
// @access  Private (admin)
// ============================================================

const deleteCountry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ----------------------------------------------------------
  // Validate ObjectId before using it in MongoDB queries.
  // ----------------------------------------------------------

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid destination ID");
  }

  // ----------------------------------------------------------
  // Preserve existing business rule:
  // A country cannot be deleted while universities are linked.
  // ----------------------------------------------------------

  const universityCount = await University.countDocuments({
    country: id,
  });

  if (universityCount > 0) {
    throw new ApiError(
      400,
      "Cannot delete a destination that still has universities linked to it",
    );
  }

  const country = await Country.findByIdAndDelete(id);

  if (!country) {
    throw new ApiError(404, "Destination not found");
  }

  res.status(200).json(new ApiResponse(200, null, "Destination deleted"));
});

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getCountries,
  getCountryBySlug,
  createCountry,
  updateCountry,
  deleteCountry,
};

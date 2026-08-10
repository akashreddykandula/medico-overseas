const mongoose = require("mongoose");
const University = require("../models/University");
const Country = require("../models/Country");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

// ------------------------------------------------------------
// SECURITY HELPERS
// ------------------------------------------------------------

// Validate MongoDB ObjectId before using it in a query.
// This prevents malformed IDs from reaching MongoDB.
const isValidObjectId = (id) =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

// Safely process normal string input.
// IMPORTANT:
// We do NOT remove "." from normal text because "." is legitimate
// content. MongoDB operators are blocked separately before queries.
const sanitizeString = (value, maxLength = 200) => {
  if (typeof value !== "string") return "";

  return value.trim().slice(0, maxLength);
};

// Recursively detect MongoDB operators / dotted keys inside
// user-controlled objects and arrays.
//
// This protects against payloads such as:
// { "$set": {...} }
// { "nested.$gt": ... }
// { "nested": { "$ne": ... } }
const containsMongoOperators = (value) => {
  if (!value || typeof value !== "object") return false;

  if (Array.isArray(value)) {
    return value.some((item) => containsMongoOperators(item));
  }

  return Object.entries(value).some(([key, nestedValue]) => {
    if (key.startsWith("$") || key.includes(".")) {
      return true;
    }

    return containsMongoOperators(nestedValue);
  });
};

// ------------------------------------------------------------
// EXPLICIT UNIVERSITY FIELD ALLOWLIST
// ------------------------------------------------------------
// IMPORTANT:
// These fields match the current University schema.
// Never pass req.body directly to Mongoose.
//
// Keeping this allowlist synchronized with the schema prevents
// mass-assignment vulnerabilities while preserving the existing
// university functionality.
// ------------------------------------------------------------

const ALLOWED_FIELDS = [
  "name",
  "slug",
  "country",
  "logo",
  "images",
  "nmcApproved",
  "whoRecognized",
  "establishedYear",
  "durationYears",
  "mediumOfInstruction",
  "hostelAvailable",
  "fees",
  "description",
  "highlights",
  "isPartner",
  "isPublished",
  "metaTitle",
  "metaDescription",
];

// ------------------------------------------------------------
// BUILD SAFE PAYLOAD
// ------------------------------------------------------------

const buildSafePayload = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "Invalid request body");
  }

  // Reject MongoDB operators anywhere in the supplied payload.
  if (containsMongoOperators(body)) {
    throw new ApiError(400, "Invalid request payload");
  }

  const payload = {};

  for (const field of ALLOWED_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) {
      continue;
    }

    payload[field] = body[field];
  }

  return payload;
};

// ------------------------------------------------------------
// VALIDATE IMAGE OBJECT
// ------------------------------------------------------------

const validateImageObject = (image, fieldName) => {
  if (image === undefined || image === null) {
    return;
  }

  if (
    typeof image !== "object" ||
    Array.isArray(image) ||
    containsMongoOperators(image)
  ) {
    throw new ApiError(400, `Invalid ${fieldName}`);
  }

  if (image.url !== undefined) {
    if (typeof image.url !== "string" || image.url.length > 2048) {
      throw new ApiError(400, `Invalid ${fieldName} URL`);
    }

    image.url = image.url.trim();
  }

  if (image.publicId !== undefined) {
    if (typeof image.publicId !== "string" || image.publicId.length > 500) {
      throw new ApiError(400, `Invalid ${fieldName} public ID`);
    }

    image.publicId = image.publicId.trim();
  }
};

// ------------------------------------------------------------
// VALIDATE COMMON UNIVERSITY DATA
// ------------------------------------------------------------

const validateUniversityPayload = async (
  payload,
  { isCreate = false } = {},
) => {
  // ----------------------------------------------------------
  // NAME
  // ----------------------------------------------------------

  if (isCreate || payload.name !== undefined) {
    if (typeof payload.name !== "string" || !payload.name.trim()) {
      throw new ApiError(400, "University name is required");
    }

    payload.name = sanitizeString(payload.name, 200);

    if (!payload.name) {
      throw new ApiError(400, "University name is required");
    }
  }

  // ----------------------------------------------------------
  // COUNTRY
  // ----------------------------------------------------------

  if (isCreate || payload.country !== undefined) {
    if (!isValidObjectId(payload.country)) {
      throw new ApiError(400, "Invalid country ID");
    }

    const countryExists = await Country.exists({
      _id: payload.country,
    });

    if (!countryExists) {
      throw new ApiError(404, "Country not found");
    }
  }

  // ----------------------------------------------------------
  // SLUG
  // ----------------------------------------------------------

  if (payload.slug !== undefined) {
    if (typeof payload.slug !== "string" || !payload.slug.trim()) {
      throw new ApiError(400, "Invalid university slug");
    }

    payload.slug = sanitizeString(payload.slug, 200).toLowerCase();

    // Only allow normal URL-slug characters.
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug)) {
      throw new ApiError(400, "Invalid university slug format");
    }
  }

  // ----------------------------------------------------------
  // IMAGE FIELDS
  // ----------------------------------------------------------

  if (payload.logo !== undefined) {
    validateImageObject(payload.logo, "logo");
  }

  if (payload.images !== undefined) {
    if (!Array.isArray(payload.images) || payload.images.length > 20) {
      throw new ApiError(400, "Invalid university images");
    }

    payload.images.forEach((image) =>
      validateImageObject(image, "university image"),
    );
  }

  // ----------------------------------------------------------
  // BOOLEAN FIELDS
  // ----------------------------------------------------------
  // Explicit type checking prevents values such as:
  // "true", "false", {}, "$ne", etc. from being accepted.
  // ----------------------------------------------------------

  const booleanFields = [
    "nmcApproved",
    "whoRecognized",
    "hostelAvailable",
    "isPartner",
    "isPublished",
  ];

  for (const field of booleanFields) {
    if (payload[field] !== undefined && typeof payload[field] !== "boolean") {
      throw new ApiError(400, `${field} must be a boolean`);
    }
  }

  // ----------------------------------------------------------
  // NUMERIC FIELDS
  // ----------------------------------------------------------

  const numericFields = ["establishedYear", "durationYears"];

  for (const field of numericFields) {
    if (payload[field] !== undefined) {
      if (
        typeof payload[field] !== "number" ||
        !Number.isFinite(payload[field])
      ) {
        throw new ApiError(400, `${field} must be a valid number`);
      }
    }
  }

  // ----------------------------------------------------------
  // MEDIUM OF INSTRUCTION
  // ----------------------------------------------------------

  if (payload.mediumOfInstruction !== undefined) {
    if (typeof payload.mediumOfInstruction !== "string") {
      throw new ApiError(400, "Medium of instruction must be a string");
    }

    payload.mediumOfInstruction = sanitizeString(
      payload.mediumOfInstruction,
      100,
    );
  }

  // ----------------------------------------------------------
  // DESCRIPTION
  // ----------------------------------------------------------

  if (payload.description !== undefined) {
    if (typeof payload.description !== "string") {
      throw new ApiError(400, "Description must be a string");
    }

    payload.description = sanitizeString(payload.description, 20000);
  }

  // ----------------------------------------------------------
  // HIGHLIGHTS
  // ----------------------------------------------------------

  if (payload.highlights !== undefined) {
    if (!Array.isArray(payload.highlights) || payload.highlights.length > 50) {
      throw new ApiError(400, "Invalid highlights");
    }

    payload.highlights = payload.highlights.map((item) => {
      if (typeof item !== "string") {
        throw new ApiError(400, "Each highlight must be a string");
      }

      return sanitizeString(item, 500);
    });
  }

  // ----------------------------------------------------------
  // FEES
  // ----------------------------------------------------------

  if (payload.fees !== undefined) {
    if (
      typeof payload.fees !== "object" ||
      Array.isArray(payload.fees) ||
      containsMongoOperators(payload.fees)
    ) {
      throw new ApiError(400, "Invalid fees data");
    }

    const allowedFeeFields = [
      "tuitionPerYear",
      "hostelPerYear",
      "messPerYear",
      "oneTimeCosts",
      "currency",
    ];

    const safeFees = {};

    for (const field of allowedFeeFields) {
      if (!Object.prototype.hasOwnProperty.call(payload.fees, field)) {
        continue;
      }

      safeFees[field] = payload.fees[field];
    }

    const numericFeeFields = [
      "tuitionPerYear",
      "hostelPerYear",
      "messPerYear",
      "oneTimeCosts",
    ];

    for (const field of numericFeeFields) {
      if (safeFees[field] !== undefined) {
        if (
          typeof safeFees[field] !== "number" ||
          !Number.isFinite(safeFees[field]) ||
          safeFees[field] < 0
        ) {
          throw new ApiError(
            400,
            `${field} must be a valid non-negative number`,
          );
        }
      }
    }

    if (safeFees.currency !== undefined) {
      if (
        typeof safeFees.currency !== "string" ||
        !/^[A-Za-z]{3,10}$/.test(safeFees.currency.trim())
      ) {
        throw new ApiError(400, "Invalid currency");
      }

      safeFees.currency = safeFees.currency.trim().toUpperCase();
    }

    payload.fees = safeFees;
  }

  // ----------------------------------------------------------
  // SEO FIELDS
  // ----------------------------------------------------------

  if (payload.metaTitle !== undefined) {
    if (typeof payload.metaTitle !== "string") {
      throw new ApiError(400, "Meta title must be a string");
    }

    payload.metaTitle = sanitizeString(payload.metaTitle, 160);
  }

  if (payload.metaDescription !== undefined) {
    if (typeof payload.metaDescription !== "string") {
      throw new ApiError(400, "Meta description must be a string");
    }

    payload.metaDescription = sanitizeString(payload.metaDescription, 320);
  }

  return payload;
};

// ------------------------------------------------------------
// GET UNIVERSITIES
// @route   GET /api/universities?country=<slug>
// @access  Public
// ------------------------------------------------------------

const getUniversities = asyncHandler(async (req, res) => {
  // Public users only receive published universities.
  // Authenticated admin/content users can access unpublished
  // records as before.
  const filter = req.user ? {} : { isPublished: true };

  if (req.query.country !== undefined) {
    if (typeof req.query.country !== "string") {
      throw new ApiError(400, "Invalid country filter");
    }

    const countrySlug = sanitizeString(req.query.country, 100).toLowerCase();

    if (!countrySlug) {
      throw new ApiError(400, "Invalid country filter");
    }

    // Restrict the value to a normal slug.
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(countrySlug)) {
      throw new ApiError(400, "Invalid country filter");
    }

    const country = await Country.findOne({
      slug: countrySlug,
    })
      .select("_id name slug")
      .lean();

    if (!country) {
      throw new ApiError(404, "Destination not found");
    }

    filter.country = country._id;
  }

  const universities = await University.find(filter)
    .populate("country", "name slug")
    .sort({ name: 1 })
    .lean();

  res.status(200).json(
    new ApiResponse(200, {
      universities,
    }),
  );
});

// ------------------------------------------------------------
// GET UNIVERSITY BY SLUG
// @route   GET /api/universities/:slug
// @access  Public
// ------------------------------------------------------------

const getUniversityBySlug = asyncHandler(async (req, res) => {
  if (typeof req.params.slug !== "string") {
    throw new ApiError(400, "Invalid university slug");
  }

  const slug = sanitizeString(req.params.slug, 200).toLowerCase();

  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new ApiError(400, "Invalid university slug");
  }

  const university = await University.findOne({
    slug,
  })
    .populate("country", "name slug")
    .lean();

  if (!university || (!university.isPublished && !req.user)) {
    throw new ApiError(404, "University not found");
  }

  res.status(200).json(
    new ApiResponse(200, {
      university,
    }),
  );
});

// ------------------------------------------------------------
// CREATE UNIVERSITY
// @route   POST /api/universities
// @access  Private (admin/content_manager)
// ------------------------------------------------------------

const createUniversity = asyncHandler(async (req, res) => {
  // ----------------------------------------------------------

  // CLOUDINARY LOGO UPLOAD

  // ----------------------------------------------------------

  if (req.file) {
    try {
      const uploadedLogo = await uploadToCloudinary(req.file.buffer, {
        folder: "medico-overseas/universities",
      });

      req.body.logo = {
        url: uploadedLogo.url,

        publicId: uploadedLogo.publicId,
      };
    } catch (error) {
      throw new ApiError(500, "Failed to upload university logo");
    }
  }
  // Defense-in-depth authorization.
  // Route middleware already protects this endpoint.
  if (
    !req.user ||
    !["super_admin", "admin", "content_manager"].includes(req.user.role)
  ) {
    throw new ApiError(403, "Access denied");
  }

  const universityData = buildSafePayload(req.body);

  await validateUniversityPayload(universityData, {
    isCreate: true,
  });

  let university;

  try {
    university = await University.create(universityData);
  } catch (error) {
    // Handles unique slug race conditions safely.
    if (error.code === 11000) {
      throw new ApiError(409, "A university with this slug already exists");
    }

    throw error;
  }

  // Maintain the existing country university counter.
  await Country.findByIdAndUpdate(university.country, {
    $inc: {
      universityCount: 1,
    },
  });

  res.status(201).json(
    new ApiResponse(
      201,
      {
        university,
      },
      "University created",
    ),
  );
});

// ------------------------------------------------------------
// UPDATE UNIVERSITY
// @route   PUT /api/universities/:id
// @access  Private (admin/content_manager)
// ------------------------------------------------------------

const updateUniversity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid university ID");
  }

  const updateData = buildSafePayload(req.body);

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  // Get current university before applying changes.
  const existingUniversity = await University.findById(id).select("country");

  if (!existingUniversity) {
    throw new ApiError(404, "University not found");
  }

  await validateUniversityPayload(updateData);

  const oldCountryId = existingUniversity.country
    ? String(existingUniversity.country)
    : null;

  const newCountryId =
    updateData.country !== undefined
      ? String(updateData.country)
      : oldCountryId;

  let university;

  try {
    university = await University.findByIdAndUpdate(
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
      throw new ApiError(409, "A university with this slug already exists");
    }

    throw error;
  }

  if (!university) {
    throw new ApiError(404, "University not found");
  }

  // ----------------------------------------------------------
  // COUNTRY COUNTER MAINTENANCE
  // ----------------------------------------------------------
  // Preserve the existing business logic when a university is
  // moved from one country to another.
  // ----------------------------------------------------------

  if (oldCountryId !== newCountryId) {
    if (oldCountryId) {
      await Country.findByIdAndUpdate(oldCountryId, {
        $inc: {
          universityCount: -1,
        },
      });
    }

    if (newCountryId) {
      await Country.findByIdAndUpdate(newCountryId, {
        $inc: {
          universityCount: 1,
        },
      });
    }
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        university,
      },
      "University updated",
    ),
  );
});

// ------------------------------------------------------------
// DELETE UNIVERSITY
// @route   DELETE /api/universities/:id
// @access  Private (admin)
// ------------------------------------------------------------

const deleteUniversity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid university ID");
  }

  const university = await University.findByIdAndDelete(id);

  if (!university) {
    throw new ApiError(404, "University not found");
  }

  // Preserve existing country university counter logic.
  if (university.country) {
    await Country.findByIdAndUpdate(university.country, {
      $inc: {
        universityCount: -1,
      },
    });
  }

  res.status(200).json(new ApiResponse(200, null, "University deleted"));
});

module.exports = {
  getUniversities,
  getUniversityBySlug,
  createUniversity,
  updateUniversity,
  deleteUniversity,
};

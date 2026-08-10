const mongoose = require("mongoose");
const Lead = require("../models/Lead");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { verifyRecaptcha } = require("../services/recaptchaService");
const User = require("../models/User");

// ============================================================
// SECURITY CONFIGURATION
// ============================================================

const ALLOWED_SOURCES = new Set([
  "homepage",
  "destination_page",
  "exam_page",
  "contact_page",
  "blog",
  "referral",
  "other",
]);

const ALLOWED_STATUSES = new Set([
  "new",
  "contacted",
  "interested",
  "follow_up",
  "converted",
  "rejected",
]);

const MAX_SEARCH_LENGTH = 100;
const MAX_PAGE_LIMIT = 100;

// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (id) =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

const sanitizeText = (value, maxLength = 1000) => {
  if (typeof value !== "string") return "";

  return value.replace(/\0/g, "").trim().slice(0, maxLength);
};

const parsePagination = (page, limit) => {
  const parsedPage = Number.parseInt(page, 10);
  const parsedLimit = Number.parseInt(limit, 10);

  const safePage =
    Number.isInteger(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  const safeLimit =
    Number.isInteger(parsedLimit) && parsedLimit >= 1
      ? Math.min(parsedLimit, MAX_PAGE_LIMIT)
      : 20;

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};

// ============================================================
// CREATE LEAD
// ============================================================

// @desc    Public lead capture
// @route   POST /api/leads
// @access  Public
const createLead = asyncHandler(async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new ApiError(400, "Invalid request body");
  }

  const {
    name,
    phone,
    email,
    city,
    interestedCountry,
    neetScore,
    message,
    source,
    sourcePageUrl,
    recaptchaToken,
  } = req.body;

  // ----------------------------------------------------------
  // Validate country reference
  // ----------------------------------------------------------

  let countryId;

  if (
    interestedCountry !== undefined &&
    interestedCountry !== null &&
    interestedCountry !== ""
  ) {
    if (!isValidObjectId(interestedCountry)) {
      throw new ApiError(400, "Invalid interested country ID");
    }

    countryId = interestedCountry;
  }

  // ----------------------------------------------------------
  // Validate source
  // ----------------------------------------------------------

  const safeSource =
    source === undefined || source === null || source === "" ? "other" : source;

  if (typeof safeSource !== "string" || !ALLOWED_SOURCES.has(safeSource)) {
    throw new ApiError(400, "Invalid lead source");
  }

  // ----------------------------------------------------------
  // Validate NEET score
  // ----------------------------------------------------------

  let safeNeetScore;

  if (neetScore !== undefined && neetScore !== null && neetScore !== "") {
    const numericNeetScore = Number(neetScore);

    if (
      !Number.isFinite(numericNeetScore) ||
      numericNeetScore < 0 ||
      numericNeetScore > 720
    ) {
      throw new ApiError(400, "Invalid NEET score");
    }

    safeNeetScore = numericNeetScore;
  }

  // ----------------------------------------------------------
  // reCAPTCHA
  // ----------------------------------------------------------

  const humanVerified = await verifyRecaptcha(recaptchaToken);

  if (!humanVerified) {
    throw new ApiError(400, "Spam verification failed. Please try again.");
  }

  // ----------------------------------------------------------
  // Explicit payload construction
  // ----------------------------------------------------------

  const lead = await Lead.create({
    name: sanitizeText(name, 150),
    phone: sanitizeText(phone, 50),
    email:
      typeof email === "string"
        ? sanitizeText(email, 254).toLowerCase()
        : undefined,
    city: sanitizeText(city, 100),
    interestedCountry: countryId,
    neetScore: safeNeetScore,
    message: sanitizeText(message, 2000),
    source: safeSource,
    sourcePageUrl: sanitizeText(sourcePageUrl, 2048),
  });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { leadId: lead._id },
        "Thank you! Our team will contact you shortly.",
      ),
    );
});

// ============================================================
// GET LEADS
// ============================================================

// @desc    List leads with filters/pagination
// @route   GET /api/leads
// @access  Private
const getLeads = asyncHandler(async (req, res) => {
  const {
    status,
    assignedCounsellor,
    search,
    page = 1,
    limit = 20,
  } = req.query;

  const {
    page: safePage,
    limit: safeLimit,
    skip,
  } = parsePagination(page, limit);

  const filter = {};

  // ----------------------------------------------------------
  // Status filter
  // ----------------------------------------------------------

  if (status !== undefined) {
    if (typeof status !== "string" || !ALLOWED_STATUSES.has(status)) {
      throw new ApiError(400, "Invalid lead status");
    }

    filter.status = status;
  }

  // ----------------------------------------------------------
  // Counsellor filter
  // ----------------------------------------------------------

  if (assignedCounsellor !== undefined) {
    if (!isValidObjectId(assignedCounsellor)) {
      throw new ApiError(400, "Invalid counsellor ID");
    }

    filter.assignedCounsellor = assignedCounsellor;
  }

  // ----------------------------------------------------------
  // Search
  // ----------------------------------------------------------

  if (search !== undefined) {
    if (typeof search !== "string") {
      throw new ApiError(400, "Invalid search query");
    }

    const cleanSearch = search.trim();

    if (cleanSearch.length > MAX_SEARCH_LENGTH) {
      throw new ApiError(400, "Search query is too long");
    }

    if (cleanSearch) {
      // Escape regex metacharacters to prevent regex injection
      // and expensive user-controlled regular expressions.
      const escapedSearch = cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { phone: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
      ];
    }
  }

  // ----------------------------------------------------------
  // Counsellor isolation
  // ----------------------------------------------------------

  if (req.user.role === "counsellor") {
    filter.assignedCounsellor = req.user._id;
  }

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .populate("interestedCountry", "name")
      .populate("assignedCounsellor", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),

    Lead.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      leads,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        pages: Math.ceil(total / safeLimit),
      },
    }),
  );
});

// ============================================================
// GET SINGLE LEAD
// ============================================================

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
const getLead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid lead ID");
  }

  const lead = await Lead.findById(id)
    .populate("interestedCountry", "name")
    .populate("assignedCounsellor", "name email")
    .populate("notes.addedBy", "name");

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  // Counsellors may only access their assigned leads.
  if (
    req.user.role === "counsellor" &&
    String(lead.assignedCounsellor?._id || lead.assignedCounsellor) !==
      String(req.user._id)
  ) {
    throw new ApiError(403, "You are not authorized to access this lead");
  }

  res.status(200).json(new ApiResponse(200, { lead }));
});

// ============================================================
// UPDATE LEAD
// ============================================================

// @desc    Update lead
// @route   PATCH /api/leads/:id
// @access  Private
const updateLead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid lead ID");
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new ApiError(400, "Invalid request body");
  }

  const allowedFields = [
    "status",
    "assignedCounsellor",
    "followUpDate",
    "isSpam",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  // ----------------------------------------------------------
  // Validate status
  // ----------------------------------------------------------

  if (
    updates.status !== undefined &&
    (typeof updates.status !== "string" ||
      !ALLOWED_STATUSES.has(updates.status))
  ) {
    throw new ApiError(400, "Invalid lead status");
  }

  // ----------------------------------------------------------
  // Validate counsellor
  // ----------------------------------------------------------

  if (updates.assignedCounsellor !== undefined) {
    if (
      updates.assignedCounsellor !== null &&
      updates.assignedCounsellor !== "" &&
      !isValidObjectId(updates.assignedCounsellor)
    ) {
      throw new ApiError(400, "Invalid counsellor ID");
    }

    if (updates.assignedCounsellor) {
      const counsellor = await User.findOne({
        _id: updates.assignedCounsellor,
        role: "counsellor",
        isActive: true,
      }).select("_id");

      if (!counsellor) {
        throw new ApiError(400, "Invalid or inactive counsellor");
      }
    }
  }

  // ----------------------------------------------------------
  // Validate follow-up date
  // ----------------------------------------------------------

  if (updates.followUpDate !== undefined) {
    if (updates.followUpDate === null || updates.followUpDate === "") {
      updates.followUpDate = undefined;
    } else if (typeof updates.followUpDate !== "string") {
      throw new ApiError(400, "Invalid follow-up date");
    } else {
      const followUpDate = new Date(updates.followUpDate);

      if (Number.isNaN(followUpDate.getTime())) {
        throw new ApiError(400, "Invalid follow-up date");
      }

      updates.followUpDate = followUpDate;
    }
  }

  // ----------------------------------------------------------
  // Validate spam flag
  // ----------------------------------------------------------

  if (updates.isSpam !== undefined && typeof updates.isSpam !== "boolean") {
    throw new ApiError(400, "isSpam must be a boolean");
  }

  const lead = await Lead.findById(id);

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  // Counsellors cannot modify another counsellor's lead.
  if (
    req.user.role === "counsellor" &&
    String(lead.assignedCounsellor) !== String(req.user._id)
  ) {
    throw new ApiError(403, "You are not authorized to update this lead");
  }

  Object.assign(lead, updates);

  await lead.save();

  res.status(200).json(new ApiResponse(200, { lead }, "Lead updated"));
});

// ============================================================
// ADD NOTE
// ============================================================

// @desc    Add a note to a lead
// @route   POST /api/leads/:id/notes
// @access  Private
const addNote = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid lead ID");
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new ApiError(400, "Invalid request body");
  }

  const text = sanitizeText(req.body.text, 2000);

  if (!text) {
    throw new ApiError(400, "Note text is required");
  }

  const lead = await Lead.findById(id);

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  // Counsellors can only add notes to their assigned leads.
  if (
    req.user.role === "counsellor" &&
    String(lead.assignedCounsellor) !== String(req.user._id)
  ) {
    throw new ApiError(
      403,
      "You are not authorized to add a note to this lead",
    );
  }

  lead.notes.push({
    text,
    addedBy: req.user._id,
  });

  await lead.save();

  res.status(201).json(new ApiResponse(201, { lead }, "Note added"));
});

// ============================================================
// DELETE LEAD
// ============================================================

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private admin
const deleteLead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid lead ID");
  }

  const lead = await Lead.findByIdAndDelete(id);

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  res.status(200).json(new ApiResponse(200, null, "Lead deleted"));
});

// ============================================================
// GET COUNSELLORS
// ============================================================

const getCounsellors = asyncHandler(async (req, res) => {
  const counsellors = await User.find({
    role: "counsellor",
    isActive: true,
  })
    .select("_id name email")
    .lean();

  res.status(200).json(
    new ApiResponse(200, {
      counsellors,
    }),
  );
});

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createLead,
  getLeads,
  getLead,
  updateLead,
  addNote,
  deleteLead,
  getCounsellors,
};

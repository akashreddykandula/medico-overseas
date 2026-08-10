const mongoose = require("mongoose");
const Application = require("../models/Application");
const User = require("../models/User");
const Country = require("../models/Country");
const University = require("../models/University");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} = require("../services/cloudinaryService");

// ============================================================
// SECURITY CONFIGURATION
// ============================================================

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ADMIN_ROLES = new Set(["super_admin", "admin"]);

const STAFF_ROLES = new Set(["super_admin", "admin", "counsellor"]);

// ============================================================
// HELPERS
// ============================================================

// Require a real MongoDB ObjectId string.
const isValidObjectId = (id) =>
  typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

// ------------------------------------------------------------
// Plain-text sanitization
// ------------------------------------------------------------

const sanitizeText = (value, maxLength = 1000) => {
  if (typeof value !== "string") return "";

  return value
    .replace(/\0/g, "")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, maxLength);
};

// ------------------------------------------------------------
// Ensure authenticated user exists
// ------------------------------------------------------------

const requireUser = (req) => {
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "Authentication required");
  }

  return req.user;
};

// ------------------------------------------------------------
// Controller-level RBAC defense-in-depth
// ------------------------------------------------------------

const requireRoles = (req, roles) => {
  const user = requireUser(req);

  if (!roles.includes(user.role)) {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  return user;
};

// ============================================================
// CLOUDINARY RESOURCE TYPE
// ============================================================

const getCloudinaryResourceType = (document) => {
  if (
    document &&
    typeof document.url === "string" &&
    document.url.includes("/raw/upload/")
  ) {
    return "raw";
  }

  return "image";
};

// ============================================================
// FILE SIGNATURE VALIDATION
// ============================================================
//
// MIME type comes from the client and can be forged.
// Validate the actual file signature as an additional defense.
//

const hasValidFileSignature = (buffer, mimetype) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) {
    return false;
  }

  // JPEG: FF D8 FF
  if (mimetype === "image/jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (mimetype === "image/png") {
    return (
      buffer.length >= 8 &&
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

  // PDF: %PDF
  if (mimetype === "application/pdf") {
    return (
      buffer.length >= 5 &&
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    );
  }

  return false;
};

// ============================================================
// VALIDATE PUBLISHED UNIVERSITY
// ============================================================

const validatePublishedUniversity = async (
  targetUniversity,
  interestedCountry,
) => {
  if (
    targetUniversity === undefined ||
    targetUniversity === null ||
    targetUniversity === ""
  ) {
    return null;
  }

  if (!isValidObjectId(targetUniversity)) {
    throw new ApiError(400, "Invalid target university ID format");
  }

  const universityFilter = {
    _id: targetUniversity,
    isPublished: true,
  };

  if (
    interestedCountry !== undefined &&
    interestedCountry !== null &&
    interestedCountry !== ""
  ) {
    universityFilter.country = interestedCountry;
  }

  const university = await University.findOne(universityFilter)
    .select("_id country")
    .lean();

  if (!university) {
    throw new ApiError(
      400,
      interestedCountry
        ? "Selected university is not available for the selected country"
        : "Selected university is not available",
    );
  }

  return university;
};

// ============================================================
// GET MY APPLICATION
// ============================================================

const getMyApplication = asyncHandler(async (req, res) => {
  const user = requireUser(req);

  const application = await Application.findOne({
    student: user._id,
  })
    .populate("interestedCountry", "name slug")
    .populate("targetUniversity", "name slug")
    .populate("assignedCounsellor", "name")
    .populate("documents.verifiedBy", "name")
    .populate("stageHistory.updatedBy", "name")
    .lean();

  res.status(200).json(
    new ApiResponse(200, {
      application: application || null,
    }),
  );
});

// ============================================================
// CREATE MY APPLICATION
// ============================================================

const createMyApplication = asyncHandler(async (req, res) => {
  const user = requireUser(req);

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new ApiError(400, "Invalid request body");
  }

  const existingApplication = await Application.findOne({
    student: user._id,
  }).lean();

  if (existingApplication) {
    throw new ApiError(409, "You already have an application");
  }

  const { interestedCountry, targetUniversity } = req.body;

  let countryId;

  // ----------------------------------------------------------
  // Validate country
  // ----------------------------------------------------------

  if (
    interestedCountry !== undefined &&
    interestedCountry !== null &&
    interestedCountry !== ""
  ) {
    if (!isValidObjectId(interestedCountry)) {
      throw new ApiError(400, "Invalid interested country ID format");
    }

    const country = await Country.findOne({
      _id: interestedCountry,
      isPublished: true,
    })
      .select("_id")
      .lean();

    if (!country) {
      throw new ApiError(400, "Selected country is not available");
    }

    countryId = country._id;
  }

  // ----------------------------------------------------------
  // Validate university
  // ----------------------------------------------------------

  await validatePublishedUniversity(targetUniversity, countryId);

  let application;

  try {
    application = await Application.create({
      student: user._id,
      interestedCountry: countryId || undefined,
      targetUniversity:
        targetUniversity !== undefined &&
        targetUniversity !== null &&
        targetUniversity !== ""
          ? targetUniversity
          : undefined,
      currentStage: "application_submitted",
    });
  } catch (error) {
    if (error?.code === 11000 || error?.message?.includes("E11000")) {
      throw new ApiError(409, "You already have an application");
    }

    throw error;
  }

  const populatedApplication = await Application.findById(application._id)
    .populate("interestedCountry", "name slug")
    .populate("targetUniversity", "name slug")
    .populate("assignedCounsellor", "name");

  res.status(201).json(
    new ApiResponse(
      201,
      {
        application: populatedApplication,
      },
      "Application started successfully",
    ),
  );
});

// ============================================================
// DELETE APPLICATION
// ============================================================

const deleteApplication = asyncHandler(async (req, res) => {
  const user = requireUser(req);

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid application ID format");
  }

  const application = await Application.findById(id);

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const isAdmin = ADMIN_ROLES.has(user.role);
  const isOwner = String(application.student) === String(user._id);

  if (!isAdmin && !isOwner) {
    throw new ApiError(
      403,
      "You are not authorized to delete this application",
    );
  }

  // ----------------------------------------------------------
  // Delete associated Cloudinary documents
  // ----------------------------------------------------------

  for (const document of application.documents) {
    if (!document.publicId) continue;

    await deleteFromCloudinary(
      document.publicId,
      getCloudinaryResourceType(document),
    ).catch(() => {});
  }

  await application.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Application deleted successfully"));
});

// ============================================================
// UPLOAD DOCUMENT
// ============================================================

const uploadDocument = asyncHandler(async (req, res) => {
  const user = requireUser(req);

  if (!req.file) {
    throw new ApiError(400, "No file provided");
  }

  const { type } = req.body;

  // ----------------------------------------------------------
  // Document type validation
  // ----------------------------------------------------------

  if (typeof type !== "string" || !Application.DOCUMENT_TYPES.includes(type)) {
    throw new ApiError(400, "Invalid document type");
  }

  // ----------------------------------------------------------
  // File size validation
  // ----------------------------------------------------------

  if (!Number.isFinite(req.file.size) || req.file.size <= 0) {
    throw new ApiError(400, "Invalid file");
  }

  if (req.file.size > MAX_FILE_SIZE) {
    throw new ApiError(400, "File size exceeds the 5MB limit");
  }

  // ----------------------------------------------------------
  // MIME validation
  // ----------------------------------------------------------

  if (!ALLOWED_MIME_TYPES.has(req.file.mimetype)) {
    throw new ApiError(
      400,
      "Invalid file format. Only JPEG, PNG, and PDF files are allowed",
    );
  }

  // ----------------------------------------------------------
  // Buffer validation
  // ----------------------------------------------------------

  if (
    !req.file.buffer ||
    !Buffer.isBuffer(req.file.buffer) ||
    req.file.buffer.length === 0
  ) {
    throw new ApiError(400, "Invalid uploaded file");
  }

  // ----------------------------------------------------------
  // File signature validation
  // ----------------------------------------------------------

  if (!hasValidFileSignature(req.file.buffer, req.file.mimetype)) {
    throw new ApiError(400, "Uploaded file content does not match its type");
  }

  // ----------------------------------------------------------
  // Application ownership
  // ----------------------------------------------------------

  const application = await Application.findOne({
    student: user._id,
  });

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const isPdf = req.file.mimetype === "application/pdf";

  const safeUserId = String(user._id);

  // ----------------------------------------------------------
  // Upload to Cloudinary
  // ----------------------------------------------------------

  const result = await uploadBufferToCloudinary(
    req.file.buffer,
    `medico-overseas/documents/${safeUserId}`,
    isPdf ? "raw" : "image",
  );

  if (!result?.secure_url || !result?.public_id) {
    throw new ApiError(502, "Document upload failed");
  }

  // ----------------------------------------------------------
  // Replace existing document of same type
  // ----------------------------------------------------------

  const existing = application.documents.find(
    (document) => document.type === type,
  );

  if (existing && existing.publicId) {
    await deleteFromCloudinary(
      existing.publicId,
      getCloudinaryResourceType(existing),
    ).catch(() => {});
  }

  if (existing) {
    application.documents = application.documents.filter(
      (document) => document.type !== type,
    );
  }

  // ----------------------------------------------------------
  // Safe original filename
  // ----------------------------------------------------------

  const safeFileName = sanitizeText(req.file.originalname, 255)
    .replace(/[\/\\]/g, "_")
    .replace(/[\r\n]/g, "_");

  application.documents.push({
    type,
    fileName: safeFileName || "uploaded-document",
    url: result.secure_url,
    publicId: result.public_id,
  });

  await application.save();

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { application },
        existing ? "Document replaced" : "Document uploaded",
      ),
    );
});

// ============================================================
// DELETE DOCUMENT
// ============================================================

const deleteDocument = asyncHandler(async (req, res) => {
  const user = requireUser(req);

  const { documentId } = req.params;

  if (!isValidObjectId(documentId)) {
    throw new ApiError(400, "Invalid document ID format");
  }

  const application = await Application.findOne({
    student: user._id,
  });

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const document = application.documents.id(documentId);

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  if (document.publicId) {
    await deleteFromCloudinary(
      document.publicId,
      getCloudinaryResourceType(document),
    ).catch(() => {});
  }

  document.deleteOne();

  await application.save();

  res
    .status(200)
    .json(new ApiResponse(200, { application }, "Document deleted"));
});

// ============================================================
// GET APPLICATIONS
// ============================================================

const getApplications = asyncHandler(async (req, res) => {
  const user = requireRoles(req, Array.from(STAFF_ROLES));

  const { stage, page = 1, limit = 20 } = req.query;

  const filter = {};

  if (stage !== undefined) {
    if (
      typeof stage !== "string" ||
      !Application.APPLICATION_STAGES.includes(stage)
    ) {
      throw new ApiError(400, "Invalid stage query filter");
    }

    filter.currentStage = stage;
  }

  if (user.role === "counsellor") {
    filter.assignedCounsellor = user._id;
  }

  const parsedPage = Number.parseInt(page, 10);
  const parsedLimit = Number.parseInt(limit, 10);

  const safePage =
    Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  const safeLimit =
    Number.isFinite(parsedLimit) && parsedLimit >= 1
      ? Math.min(parsedLimit, 100)
      : 20;

  const skip = (safePage - 1) * safeLimit;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate("student", "name email phone")
      .populate("interestedCountry", "name")
      .populate("targetUniversity", "name")
      .populate("assignedCounsellor", "name")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),

    Application.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      applications,
      pagination: {
        total,
        page: safePage,
        pages: Math.ceil(total / safeLimit),
      },
    }),
  );
});

// ============================================================
// UPDATE APPLICATION STAGE
// ============================================================

const updateStage = asyncHandler(async (req, res) => {
  const user = requireRoles(req, Array.from(STAFF_ROLES));

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid application ID format");
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new ApiError(400, "Invalid request body");
  }

  const { stage, counsellorRemark, estimatedCompletionDate } = req.body;

  if (
    typeof stage !== "string" ||
    !Application.APPLICATION_STAGES.includes(stage)
  ) {
    throw new ApiError(400, "Invalid stage");
  }

  const cleanRemark = sanitizeText(counsellorRemark, 1000);

  let parsedCompletionDate;

  if (
    estimatedCompletionDate !== undefined &&
    estimatedCompletionDate !== null &&
    estimatedCompletionDate !== ""
  ) {
    if (typeof estimatedCompletionDate !== "string") {
      throw new ApiError(400, "Invalid completion date");
    }

    parsedCompletionDate = new Date(estimatedCompletionDate);

    if (Number.isNaN(parsedCompletionDate.getTime())) {
      throw new ApiError(400, "Invalid completion date");
    }

    if (parsedCompletionDate.getTime() < Date.now()) {
      throw new ApiError(
        400,
        "Estimated completion date cannot be in the past",
      );
    }
  }

  const application = await Application.findById(id);

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  if (
    user.role === "counsellor" &&
    String(application.assignedCounsellor) !== String(user._id)
  ) {
    throw new ApiError(
      403,
      "Access denied. You are not assigned to this application.",
    );
  }

  application.currentStage = stage;

  await application.save();

  const lastEntry =
    application.stageHistory[application.stageHistory.length - 1];

  if (lastEntry && lastEntry.stage === stage) {
    if (cleanRemark) {
      lastEntry.counsellorRemark = cleanRemark;
    }

    if (parsedCompletionDate) {
      lastEntry.estimatedCompletionDate = parsedCompletionDate;
    }

    lastEntry.updatedBy = user._id;

    await application.save();
  }

  res
    .status(200)
    .json(new ApiResponse(200, { application }, "Application stage updated"));
});

// ============================================================
// ASSIGN COUNSELLOR
// ============================================================

const assignCounsellor = asyncHandler(async (req, res) => {
  requireRoles(req, ["super_admin", "admin"]);

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new ApiError(400, "Invalid request body");
  }

  const { id } = req.params;
  const { counsellorId } = req.body;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid application ID format");
  }

  if (typeof counsellorId !== "string" || !isValidObjectId(counsellorId)) {
    throw new ApiError(400, "Valid Counsellor ID is required");
  }

  const application = await Application.findById(id);

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const counsellor = await User.findOne({
    _id: counsellorId,
    role: "counsellor",
    isActive: true,
  }).select("_id");

  if (!counsellor) {
    throw new ApiError(400, "Invalid or inactive counsellor");
  }

  application.assignedCounsellor = counsellor._id;

  await application.save();

  const populatedApplication = await Application.findById(application._id)
    .populate("student", "name email phone")
    .populate("interestedCountry", "name slug")
    .populate("targetUniversity", "name slug")
    .populate("assignedCounsellor", "name email phone");

  res.status(200).json(
    new ApiResponse(
      200,
      {
        application: populatedApplication,
      },
      "Counsellor assigned successfully",
    ),
  );
});

// ============================================================
// VERIFY DOCUMENT
// ============================================================

const verifyDocument = asyncHandler(async (req, res) => {
  const user = requireRoles(req, Array.from(STAFF_ROLES));

  const { id, documentId } = req.params;

  if (!isValidObjectId(id) || !isValidObjectId(documentId)) {
    throw new ApiError(400, "Invalid application or document ID format");
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new ApiError(400, "Invalid request body");
  }

  const { verified, rejectionReason } = req.body;

  if (typeof verified !== "boolean") {
    throw new ApiError(400, "The verified field must be true or false");
  }

  const application = await Application.findById(id);

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  if (
    user.role === "counsellor" &&
    String(application.assignedCounsellor) !== String(user._id)
  ) {
    throw new ApiError(
      403,
      "Access denied. You are not assigned to this application.",
    );
  }

  const document = application.documents.id(documentId);

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  const cleanRejectionReason = sanitizeText(rejectionReason, 500);

  if (!verified && !cleanRejectionReason) {
    throw new ApiError(
      400,
      "A rejection reason is required when rejecting a document",
    );
  }

  document.verified = verified;
  document.verifiedBy = user._id;
  document.rejectionReason = verified ? undefined : cleanRejectionReason;

  await application.save();

  res
    .status(200)
    .json(new ApiResponse(200, { application }, "Document status updated"));
});

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getMyApplication,
  createMyApplication,
  uploadDocument,
  deleteDocument,
  getApplications,
  updateStage,
  assignCounsellor,
  verifyDocument,
  deleteApplication,
};

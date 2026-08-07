const Application = require("../models/Application");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} = require("../services/cloudinaryService");

const getMyApplication = asyncHandler(async (req, res) => {
  let application = await Application.findOne({ student: req.user._id })
    .populate("interestedCountry", "name slug")
    .populate("targetUniversity", "name slug")
    .populate("assignedCounsellor", "name email phone")
    .populate("documents.verifiedBy", "name")
    .populate("stageHistory.updatedBy", "name");

  if (!application) {
    application = await Application.create({ student: req.user._id });
  }

  res.status(200).json(new ApiResponse(200, { application }));
});

const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findByIdAndDelete(req.params.id);

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Application deleted successfully"));
});

// @desc    Upload a new document (or replace an existing one of the same type)
// @route   POST /api/applications/me/documents
// @access  Private (student)
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file provided");
  const { type } = req.body;
  if (!Application.DOCUMENT_TYPES.includes(type))
    throw new ApiError(400, "Invalid document type");

  const application = await Application.findOne({ student: req.user._id });
  if (!application) throw new ApiError(404, "Application not found");

  const result = await uploadBufferToCloudinary(
    req.file.buffer,
    `medico-overseas/documents/${req.user._id}`,
    req.file.mimetype === "application/pdf" ? "raw" : "image",
  );

  // Replace: remove any existing document of this type first, then push the new one
  const existing = application.documents.find((d) => d.type === type);
  if (existing) {
    await deleteFromCloudinary(
      existing.publicId,
      existing.publicId.endsWith(".pdf") ? "raw" : "image",
    ).catch(() => {});
    application.documents = application.documents.filter(
      (d) => d.type !== type,
    );
  }

  application.documents.push({
    type,
    fileName: req.file.originalname,
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

// @desc    Delete a document
// @route   DELETE /api/applications/me/documents/:documentId
// @access  Private (student)
const deleteDocument = asyncHandler(async (req, res) => {
  const application = await Application.findOne({ student: req.user._id });
  if (!application) throw new ApiError(404, "Application not found");

  const doc = application.documents.id(req.params.documentId);
  if (!doc) throw new ApiError(404, "Document not found");

  await deleteFromCloudinary(
    doc.publicId,
    doc.publicId.endsWith(".pdf") ? "raw" : "image",
  ).catch(() => {});
  doc.deleteOne();
  await application.save();

  res
    .status(200)
    .json(new ApiResponse(200, { application }, "Document deleted"));
});

// @desc    List applications assigned to the logged-in counsellor (or all, for admins)
// @route   GET /api/applications?stage=&search=
// @access  Private (counsellor/admin)
const getApplications = asyncHandler(async (req, res) => {
  const { stage, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (stage) filter.currentStage = stage;
  if (req.user.role === "counsellor") filter.assignedCounsellor = req.user._id;

  const skip = (Number(page) - 1) * Number(limit);
  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate("student", "name email phone")
      .populate("interestedCountry", "name")
      .populate("targetUniversity", "name")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Application.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      applications,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    }),
  );
});

// @desc    Advance/update an application's stage, with remark and estimated completion date
// @route   PATCH /api/applications/:id/stage
// @access  Private (counsellor/admin)
const updateStage = asyncHandler(async (req, res) => {
  const { stage, counsellorRemark, estimatedCompletionDate } = req.body;
  if (!Application.APPLICATION_STAGES.includes(stage))
    throw new ApiError(400, "Invalid stage");

  const application = await Application.findById(req.params.id);
  if (!application) throw new ApiError(404, "Application not found");

  application.currentStage = stage; // triggers stageHistory push + notification via pre-save hook
  await application.save();

  // Attach remark/estimate to the just-pushed history entry
  const lastEntry =
    application.stageHistory[application.stageHistory.length - 1];
  lastEntry.counsellorRemark = counsellorRemark;
  lastEntry.estimatedCompletionDate = estimatedCompletionDate;
  lastEntry.updatedBy = req.user._id;
  await application.save();

  res
    .status(200)
    .json(new ApiResponse(200, { application }, "Application stage updated"));
});

// @desc    Assign a counsellor to an application
// @route   PATCH /api/applications/:id/assign
// @access  Private (admin)
const assignCounsellor = asyncHandler(async (req, res) => {
  const { counsellorId } = req.body;
  const application = await Application.findByIdAndUpdate(
    req.params.id,
    { assignedCounsellor: counsellorId },
    { new: true },
  );
  if (!application) throw new ApiError(404, "Application not found");
  res
    .status(200)
    .json(new ApiResponse(200, { application }, "Counsellor assigned"));
});

// @desc    Verify or reject an uploaded document
// @route   PATCH /api/applications/:id/documents/:documentId/verify
// @access  Private (counsellor/admin)
const verifyDocument = asyncHandler(async (req, res) => {
  const { verified, rejectionReason } = req.body;
  const application = await Application.findById(req.params.id);
  if (!application) throw new ApiError(404, "Application not found");

  const doc = application.documents.id(req.params.documentId);
  if (!doc) throw new ApiError(404, "Document not found");

  doc.verified = !!verified;
  doc.verifiedBy = req.user._id;
  doc.rejectionReason = verified ? undefined : rejectionReason;
  await application.save();

  res
    .status(200)
    .json(new ApiResponse(200, { application }, "Document status updated"));
});

module.exports = {
  getMyApplication,
  uploadDocument,
  deleteDocument,
  getApplications,
  updateStage,
  assignCounsellor,
  verifyDocument,
  deleteApplication,
};

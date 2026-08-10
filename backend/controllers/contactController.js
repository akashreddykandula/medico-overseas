const mongoose = require("mongoose");
const Contact = require("../models/Contact");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { verifyRecaptcha } = require("../services/recaptchaService");
const { sendEmail } = require("../services/emailService");

// ============================================================
// SECURITY HELPERS
// ============================================================

const sanitizeText = (value, maxLength = 2000) => {
  if (typeof value !== "string") return "";
  return value.replace(/\0/g, "").trim().slice(0, maxLength);
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const isValidObjectId = (id) =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

// ============================================================
// SUBMIT CONTACT FORM
// @route   POST /api/contact
// @access  Public
// ============================================================

const submitContact = asyncHandler(async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new ApiError(400, "Invalid request body");
  }

  const { name, phone, email, message, recaptchaToken } = req.body;

  // ----------------------------------------------------------
  // Basic input validation
  // ----------------------------------------------------------

  const safeName = sanitizeText(name, 150);
  const safePhone = sanitizeText(phone, 30);
  const safeEmail = sanitizeText(email, 254);
  const safeMessage = sanitizeText(message, 5000);
  const safeRecaptchaToken = sanitizeText(recaptchaToken, 4096);

  if (!safeName) {
    throw new ApiError(400, "Name is required");
  }

  if (!safePhone) {
    throw new ApiError(400, "Phone is required");
  }

  if (!safeMessage) {
    throw new ApiError(400, "Message is required");
  }

  if (safeEmail) {
    // Basic email validation. Existing application logic remains
    // unchanged for valid email addresses.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(safeEmail)) {
      throw new ApiError(400, "Invalid email address");
    }
  }

  if (!safeRecaptchaToken) {
    throw new ApiError(400, "Spam verification failed. Please try again.");
  }

  // ----------------------------------------------------------
  // reCAPTCHA verification
  // ----------------------------------------------------------

  const humanVerified = await verifyRecaptcha(safeRecaptchaToken);

  if (!humanVerified) {
    throw new ApiError(400, "Spam verification failed. Please try again.");
  }

  // ----------------------------------------------------------
  // Create contact using explicitly validated fields.
  // ----------------------------------------------------------

  const contact = await Contact.create({
    name: safeName,
    phone: safePhone,
    email: safeEmail || undefined,
    message: safeMessage,
  });

  // ----------------------------------------------------------
  // Notification email
  //
  // SECURITY:
  // User-controlled values are HTML-escaped before being placed
  // into the email body.
  // ----------------------------------------------------------

  try {
    const emailName = escapeHtml(safeName);
    const emailPhone = escapeHtml(safePhone);
    const emailAddress = escapeHtml(safeEmail || "—");
    const emailMessage = escapeHtml(safeMessage);

    // Prevent CRLF/header injection if the name is used in a
    // mail subject by removing line breaks.
    const safeSubjectName = safeName.replace(/[\r\n]/g, " ");

    await sendEmail({
      to: process.env.LEAD_NOTIFY_EMAIL,
      subject: `New contact form message from ${safeSubjectName}`,
      html: `<p><b>Name:</b> ${emailName}</p>
<p><b>Phone:</b> ${emailPhone}</p>
<p><b>Email:</b> ${emailAddress}</p>
<p><b>Message:</b> ${emailMessage}</p>`,
    });
  } catch (err) {
    console.error("Contact notification email failed:", err.message);
  }

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { id: contact._id },
        "Thanks for reaching out! We will get back to you soon.",
      ),
    );
});

// ============================================================
// LIST CONTACT SUBMISSIONS
// @route   GET /api/contact
// @access  Private (admin/counsellor)
// ============================================================

const getContacts = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const filter = {};

  // ----------------------------------------------------------
  // Status filter
  // ----------------------------------------------------------

  if (status !== undefined) {
    if (typeof status !== "string" || status.length > 100) {
      throw new ApiError(400, "Invalid contact status");
    }

    filter.status = status.trim();
  }

  // ----------------------------------------------------------
  // Safe pagination
  // ----------------------------------------------------------

  const parsedPage = Number.parseInt(page, 10);
  const parsedLimit = Number.parseInt(limit, 10);

  const safePage =
    Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  const safeLimit =
    Number.isFinite(parsedLimit) && parsedLimit >= 1
      ? Math.min(parsedLimit, 100)
      : 20;

  const skip = (safePage - 1) * safeLimit;

  const [contacts, total] = await Promise.all([
    Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),

    Contact.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      contacts,
      pagination: {
        total,
        page: safePage,
        pages: Math.ceil(total / safeLimit),
      },
    }),
  );
});

// ============================================================
// UPDATE CONTACT STATUS
// @route   PATCH /api/contact/:id
// @access  Private (admin/counsellor)
// ============================================================

const updateContact = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ----------------------------------------------------------
  // Validate ObjectId before database access.
  // ----------------------------------------------------------

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid contact ID");
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new ApiError(400, "Invalid request body");
  }

  const { status } = req.body;

  // ----------------------------------------------------------
  // Only allow the intended field.
  // ----------------------------------------------------------

  if (typeof status !== "string" || !status.trim()) {
    throw new ApiError(400, "Valid contact status is required");
  }

  const safeStatus = status.trim().slice(0, 100);

  // ----------------------------------------------------------
  // Explicit update object prevents mass assignment.
  // ----------------------------------------------------------

  const contact = await Contact.findByIdAndUpdate(
    id,
    {
      $set: {
        status: safeStatus,
        respondedBy: req.user._id,
      },
    },
    {
      new: true,
      runValidators: true,
      context: "query",
    },
  );

  if (!contact) {
    throw new ApiError(404, "Contact submission not found");
  }

  res.status(200).json(new ApiResponse(200, { contact }, "Contact updated"));
});

module.exports = {
  submitContact,
  getContacts,
  updateContact,
};

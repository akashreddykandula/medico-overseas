const Lead = require("../models/Lead");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { verifyRecaptcha } = require("../services/recaptchaService");
// const { sendEmail } = require("../services/emailService");
const User = require("../models/User");
// @desc    Public lead capture (enquiry form used site-wide)
// @route   POST /api/leads
// @access  Public
const createLead = asyncHandler(async (req, res) => {
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

  const humanVerified = await verifyRecaptcha(recaptchaToken);
  if (!humanVerified)
    throw new ApiError(400, "Spam verification failed. Please try again.");

  const lead = await Lead.create({
    name,
    phone,
    email,
    city,
    interestedCountry: interestedCountry || undefined,
    neetScore,
    message,
    source,
    sourcePageUrl,
  });

  // Notify the team — failure to email should not fail the lead capture itself
  // try {
  //   await sendEmail({
  //     to: process.env.LEAD_NOTIFY_EMAIL,
  //     subject: `New enquiry: ${name}`,
  //     html: `
  //       <h3>New website enquiry</h3>
  //       <p><b>Name:</b> ${name}</p>
  //       <p><b>Phone:</b> ${phone}</p>
  //       <p><b>Email:</b> ${email || "—"}</p>
  //       <p><b>City:</b> ${city || "—"}</p>
  //       <p><b>NEET Score:</b> ${neetScore || "—"}</p>
  //       <p><b>Message:</b> ${message || "—"}</p>
  //       <p><b>Source:</b> ${source} (${sourcePageUrl || "n/a"})</p>
  //     `,
  //   });
  // } catch (err) {
  //   console.error("Lead notification email failed:", err.message);
  // }

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

// @desc    List leads with filters/pagination (CRM)
// @route   GET /api/leads
// @access  Private (admin/counsellor)
const getLeads = asyncHandler(async (req, res) => {
  const {
    status,
    assignedCounsellor,
    search,
    page = 1,
    limit = 20,
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (assignedCounsellor) filter.assignedCounsellor = assignedCounsellor;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Counsellors only see their own assigned leads
  if (req.user.role === "counsellor") {
    filter.assignedCounsellor = req.user._id;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .populate("interestedCountry", "name")
      .populate("assignedCounsellor", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Lead.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      leads,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    }),
  );
});

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
const getLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
    .populate("interestedCountry", "name")
    .populate("assignedCounsellor", "name email")
    .populate("notes.addedBy", "name");

  if (!lead) throw new ApiError(404, "Lead not found");
  res.status(200).json(new ApiResponse(200, { lead }));
});

// @desc    Update lead (status, assignment, follow-up date)
// @route   PATCH /api/leads/:id
// @access  Private (admin/counsellor)
const updateLead = asyncHandler(async (req, res) => {
  const allowedFields = [
    "status",
    "assignedCounsellor",
    "followUpDate",
    "isSpam",
  ];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new ApiError(404, "Lead not found");

  Object.assign(lead, updates);
  await lead.save();

  res.status(200).json(new ApiResponse(200, { lead }, "Lead updated"));
});

// @desc    Add a note to a lead
// @route   POST /api/leads/:id/notes
// @access  Private
const addNote = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) throw new ApiError(400, "Note text is required");

  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new ApiError(404, "Lead not found");

  lead.notes.push({ text, addedBy: req.user._id });
  await lead.save();

  res.status(201).json(new ApiResponse(201, { lead }, "Note added"));
});

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private (admin only)
const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) throw new ApiError(404, "Lead not found");
  res.status(200).json(new ApiResponse(200, null, "Lead deleted"));
});
const getCounsellors = asyncHandler(async (req, res) => {
  const counsellors = await User.find({
    role: "counsellor",
    isActive: true,
  }).select("_id name email");

  res.status(200).json(new ApiResponse(200, { counsellors }));
});
module.exports = {
  createLead,
  getLeads,
  getLead,
  updateLead,
  addNote,
  deleteLead,
  getCounsellors,
};

const Contact = require('../models/Contact');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { verifyRecaptcha } = require('../services/recaptchaService');
const { sendEmail } = require('../services/emailService');

// @desc    Submit the Contact Us form
// @route   POST /api/contact
// @access  Public
const submitContact = asyncHandler(async (req, res) => {
  const { name, phone, email, message, recaptchaToken } = req.body;

  const humanVerified = await verifyRecaptcha(recaptchaToken);
  if (!humanVerified) throw new ApiError(400, 'Spam verification failed. Please try again.');

  const contact = await Contact.create({ name, phone, email, message });

  try {
    await sendEmail({
      to: process.env.LEAD_NOTIFY_EMAIL,
      subject: `New contact form message from ${name}`,
      html: `<p><b>Name:</b> ${name}</p><p><b>Phone:</b> ${phone}</p><p><b>Email:</b> ${email || '—'}</p><p><b>Message:</b> ${message}</p>`,
    });
  } catch (err) {
    console.error('Contact notification email failed:', err.message);
  }

  res.status(201).json(new ApiResponse(201, { id: contact._id }, 'Thanks for reaching out! We will get back to you soon.'));
});

// @desc    List contact submissions
// @route   GET /api/contact
// @access  Private (admin/counsellor)
const getContacts = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [contacts, total] = await Promise.all([
    Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Contact.countDocuments(filter),
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, { contacts, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } }));
});

// @desc    Update contact status
// @route   PATCH /api/contact/:id
// @access  Private (admin/counsellor)
const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, respondedBy: req.user._id },
    { new: true }
  );
  if (!contact) throw new ApiError(404, 'Contact submission not found');
  res.status(200).json(new ApiResponse(200, { contact }, 'Contact updated'));
});

module.exports = { submitContact, getContacts, updateContact };

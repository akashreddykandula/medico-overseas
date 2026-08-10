const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const {
  submitContact,
  getContacts,
  updateContact,
} = require("../controllers/contactController");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// ============================================================
// PUBLIC CONTACT FORM RATE LIMIT
// ============================================================

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,

  // Do not expose unnecessary rate-limit internals.
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many contact requests. Please try again later.",
  },
});

// ============================================================
// PUBLIC CONTACT SUBMISSION
// ============================================================

router.post(
  "/",
  contactLimiter,
  [
    body("name")
      .isString()
      .withMessage("Name must be a string")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ max: 150 })
      .withMessage("Name is too long"),

    body("phone")
      .isString()
      .withMessage("Phone must be a string")
      .trim()
      .notEmpty()
      .withMessage("Phone is required")
      .isLength({ max: 30 })
      .withMessage("Phone is too long"),

    body("email")
      .optional({ values: "falsy" })
      .isString()
      .withMessage("Email must be a string")
      .trim()
      .isEmail()
      .withMessage("Invalid email address")
      .normalizeEmail()
      .isLength({ max: 254 })
      .withMessage("Email is too long"),

    body("message")
      .isString()
      .withMessage("Message must be a string")
      .trim()
      .notEmpty()
      .withMessage("Message is required")
      .isLength({ max: 5000 })
      .withMessage("Message is too long"),

    body("recaptchaToken")
      .isString()
      .withMessage("Invalid reCAPTCHA token")
      .trim()
      .notEmpty()
      .withMessage("reCAPTCHA verification is required")
      .isLength({ max: 4096 })
      .withMessage("Invalid reCAPTCHA token"),
  ],
  validate,
  submitContact,
);

// ============================================================
// PROTECTED CONTACT MANAGEMENT
// ============================================================

router.use(protect, authorize("super_admin", "admin", "counsellor"));

router.get("/", getContacts);

router.patch(
  "/:id",
  [
    body("status")
      .isString()
      .withMessage("Status must be a string")
      .trim()
      .notEmpty()
      .withMessage("Status is required")
      .isIn(["unread", "read", "responded"])
      .withMessage("Invalid contact status"),
  ],
  validate,
  updateContact,
);

module.exports = router;

const express = require("express");
const { body, param } = require("express-validator");
const rateLimit = require("express-rate-limit");

const {
  createLead,
  getLeads,
  getLead,
  updateLead,
  addNote,
  deleteLead,
  getCounsellors,
} = require("../controllers/leadController");

const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// ============================================================
// PUBLIC LEAD SUBMISSION
// ============================================================

// Prevent form-spam floods from a single IP.
const leadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many submissions. Please try again later.",
  },
});

router.post(
  "/",
  leadLimiter,
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
      .withMessage("Phone number must be a string")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required")
      .isLength({ max: 30 })
      .withMessage("Phone number is too long"),

    body("email")
      .optional({ values: "falsy" })
      .isString()
      .withMessage("Email must be a string")
      .trim()
      .isEmail()
      .withMessage("Provide a valid email")
      .isLength({ max: 254 })
      .withMessage("Email is too long"),

    body("city")
      .optional({ values: "falsy" })
      .isString()
      .withMessage("City must be a string")
      .trim()
      .isLength({ max: 150 })
      .withMessage("City is too long"),

    body("neetScore")
      .optional({ values: "falsy" })
      .isNumeric()
      .withMessage("NEET score must be numeric"),

    body("message")
      .optional({ values: "falsy" })
      .isString()
      .withMessage("Message must be a string")
      .trim()
      .isLength({ max: 5000 })
      .withMessage("Message is too long"),

    body("source")
      .optional({ values: "falsy" })
      .isIn([
        "homepage",
        "destination_page",
        "exam_page",
        "contact_page",
        "blog",
        "referral",
        "other",
      ])
      .withMessage("Invalid lead source"),

    body("sourcePageUrl")
      .optional({ values: "falsy" })
      .isString()
      .withMessage("Source page URL must be a string")
      .trim()
      .isLength({ max: 2048 })
      .withMessage("Source page URL is too long"),
  ],
  validate,
  createLead,
);

// ============================================================
// PROTECTED STAFF ROUTES
// ============================================================

router.use(protect);

// ============================================================
// LEAD LIST
// ============================================================

router.get(
  "/",
  authorize("super_admin", "admin", "counsellor", "marketing_manager"),
  getLeads,
);

// ============================================================
// COUNSELLORS
// ============================================================

router.get("/counsellors", authorize("super_admin", "admin"), getCounsellors);

// ============================================================
// SINGLE LEAD
// ============================================================

router.get(
  "/:id",
  authorize("super_admin", "admin", "counsellor", "marketing_manager"),
  [param("id").isMongoId().withMessage("Invalid lead ID")],
  validate,
  getLead,
);

// ============================================================
// UPDATE LEAD
// ============================================================

router.patch(
  "/:id",
  authorize("super_admin", "admin", "counsellor"),
  [param("id").isMongoId().withMessage("Invalid lead ID")],
  validate,
  updateLead,
);

// ============================================================
// ADD NOTE
// ============================================================

router.post(
  "/:id/notes",
  authorize("super_admin", "admin", "counsellor"),
  [
    param("id").isMongoId().withMessage("Invalid lead ID"),

    body("text")
      .isString()
      .withMessage("Note must be a string")
      .trim()
      .notEmpty()
      .withMessage("Note text is required")
      .isLength({ max: 2000 })
      .withMessage("Note is too long"),
  ],
  validate,
  addNote,
);

// ============================================================
// DELETE LEAD
// ============================================================

router.delete(
  "/:id",
  authorize("super_admin", "admin"),
  [param("id").isMongoId().withMessage("Invalid lead ID")],
  validate,
  deleteLead,
);

module.exports = router;

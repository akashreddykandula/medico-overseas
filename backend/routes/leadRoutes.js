const express = require("express");
const { body } = require("express-validator");
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

// Prevent form-spam floods from a single IP
const leadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many submissions. Please try again later.",
  },
});
router.post(
  "/",
  leadLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("phone").trim().notEmpty().withMessage("Phone number is required"),
    body("email")
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage("Provide a valid email"),
  ],
  validate,
  createLead,
);
router.use(protect); // everything below requires staff auth
router.get(
  "/",
  authorize("super_admin", "admin", "counsellor", "marketing_manager"),
  getLeads,
);
router.get("/counsellors", authorize("super_admin", "admin"), getCounsellors);

router.get(
  "/:id",
  authorize("super_admin", "admin", "counsellor", "marketing_manager"),
  getLead,
);
router.get(
  "/counsellors",

  authorize("super_admin", "admin"),

  getCounsellors,
);
router.patch(
  "/:id",
  authorize("super_admin", "admin", "counsellor"),
  updateLead,
);
router.post(
  "/:id/notes",
  authorize("super_admin", "admin", "counsellor"),
  addNote,
);
router.delete("/:id", authorize("super_admin", "admin"), deleteLead);

module.exports = router;

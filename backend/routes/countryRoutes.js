const express = require("express");
const {
  getCountries,
  getCountryBySlug,
  createCountry,
  updateCountry,
  deleteCountry,
} = require("../controllers/countryController");
const { protect, authorize, optionalAuth } = require("../middleware/auth");
const {
  generateCountryBrochure,
} = require("../controllers/brochureController");

const router = express.Router();

// ============================================================
// PUBLIC ROUTES
// ============================================================

// List countries.
//
// SECURITY:
// optionalAuth allows authenticated staff to see unpublished
// destinations while anonymous users remain restricted to the
// published data handled by the controller.
router.get("/", optionalAuth, getCountries);

// ============================================================
// PUBLIC BROCHURE
// ============================================================
//
// This route is intentionally public so visitors can download
// destination brochures.
//
// SECURITY:
// - brochureController must validate the slug.
// - It must query only published countries/universities.
// - It must never use the slug as a filesystem path.
// - It must not expose unpublished/private application data.
router.get("/:slug/brochure", generateCountryBrochure);

// Get country by slug.
//
// SECURITY:
// optionalAuth allows authenticated staff to access unpublished
// destinations while anonymous users are restricted to published
// destinations by the controller.
router.get("/:slug", optionalAuth, getCountryBySlug);

// ============================================================
// PROTECTED COUNTRY MANAGEMENT ROUTES
// ============================================================
//
// SECURITY:
// Every route below requires:
// 1. A valid authenticated user.
// 2. One of the approved content-management roles.
//
// Controller-level authorization/validation should remain as
// defense-in-depth.

router.use(protect, authorize("super_admin", "admin", "content_manager"));

// ============================================================
// CREATE COUNTRY
// ============================================================
//
// SECURITY:
// createCountry must explicitly construct the allowed payload.
// Never pass req.body directly to Country.create().
router.post("/", createCountry);

// ============================================================
// UPDATE COUNTRY
// ============================================================
//
// SECURITY:
// updateCountry must:
// - Validate :id as a MongoDB ObjectId.
// - Allow only intended fields.
// - Reject MongoDB operators such as $set/$where.
// - Run Mongoose validators.
// - Prevent modification of protected fields.
router.put("/:id", updateCountry);

// ============================================================
// DELETE COUNTRY
// ============================================================
//
// SECURITY:
// Only super_admin and admin can permanently delete a country.
// content_manager cannot delete destinations.
router.delete("/:id", authorize("super_admin", "admin"), deleteCountry);

module.exports = router;

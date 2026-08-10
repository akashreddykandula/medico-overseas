const express = require("express");
const {
  generateCountryBrochure,
} = require("../controllers/brochureController");

const router = express.Router();

// ============================================================
// PUBLIC BROCHURE ROUTE
// ============================================================
//
// GET /api/brochures/:slug
//
// SECURITY:
// - The controller validates and sanitizes :slug.
// - The controller only generates brochures for published
//   countries.
// - No filesystem path or filename is accepted from the client.
// - No authentication is required because the brochure is
//   intended to be publicly downloadable.
//
// IMPORTANT:
// Do not add req.query.folder, req.body, or any user-controlled
// filesystem path to this route.
// ============================================================

router.get("/:slug", generateCountryBrochure);

module.exports = router;

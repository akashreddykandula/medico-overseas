const express = require("express");
const {
  generateCountryBrochure,
} = require("../controllers/brochureController");

const router = express.Router();

// Download destination brochure
// GET /api/brochures/:slug
router.get("/:slug", generateCountryBrochure);

module.exports = router;

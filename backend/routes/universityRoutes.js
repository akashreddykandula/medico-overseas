const express = require("express");
const {
  getUniversities,
  getUniversityBySlug,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} = require("../controllers/universityController");
const { protect, authorize, optionalAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// ------------------------------------------------------------
// PUBLIC ROUTES
// ------------------------------------------------------------
// SECURITY CHECKS:
// - optionalAuth allows public access while still identifying
//   authenticated users when a valid token is present.
// - Controllers must return only published universities to
//   unauthenticated users.
// - Controllers validate and sanitize query/path parameters.
// - No admin write operation is exposed through these routes.
// ------------------------------------------------------------

router.get("/", optionalAuth, getUniversities);

router.get("/:slug", optionalAuth, getUniversityBySlug);

// ------------------------------------------------------------
// PROTECTED UNIVERSITY MANAGEMENT ROUTES
// ------------------------------------------------------------
// SECURITY CHECKS:
// 1. protect() verifies that the requester is authenticated.
// 2. authorize() enforces role-based access control.
// 3. No unauthenticated requester can reach any write endpoint.
// 4. Controller-level authorization can remain as
//    defense-in-depth, but route-level authorization is the
//    primary protection.
// ------------------------------------------------------------

router.use(protect, authorize("super_admin", "admin", "content_manager"));

// ------------------------------------------------------------
// CREATE UNIVERSITY
// ------------------------------------------------------------
// SECURITY CHECKS:
// - Authentication required.
// - RBAC enforced above.
// - createUniversity() must use an explicit field allowlist.
// - req.body must NOT be passed blindly to Model.create().
// - MongoDB operators must be rejected.
// - Referenced country must be validated.
// - Mongoose schema validation remains enabled.
// ------------------------------------------------------------

router.post("/", upload.single("logo"), createUniversity);

// ------------------------------------------------------------
// UPDATE UNIVERSITY
// ------------------------------------------------------------
// SECURITY CHECKS:
// - Authentication required.
// - RBAC enforced above.
// - Controller validates :id as a MongoDB ObjectId.
// - Controller uses an explicit update-field allowlist.
// - MongoDB operators are rejected.
// - Protected fields cannot be modified arbitrarily.
// - Mongoose validators run during the update.
// - Duplicate-key errors are handled safely.
// ------------------------------------------------------------

router.put("/:id", upload.single("logo"), updateUniversity);

// ------------------------------------------------------------
// DELETE UNIVERSITY
// ------------------------------------------------------------
// SECURITY CHECKS:
// - Authentication required.
// - Only super_admin/admin can delete.
// - content_manager cannot delete.
// - Controller validates :id before querying MongoDB.
// - Only a university document is deleted.
// - Related country university count is updated.
// ------------------------------------------------------------

router.delete("/:id", authorize("super_admin", "admin"), deleteUniversity);

module.exports = router;

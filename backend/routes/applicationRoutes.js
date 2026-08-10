const express = require("express");
const {
  getMyApplication,
  createMyApplication,
  uploadDocument,
  deleteDocument,
  getApplications,
  updateStage,
  assignCounsellor,
  verifyDocument,
  deleteApplication,
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/auth");
const { uploadDocument: uploadDocMiddleware } = require("../middleware/upload");

const router = express.Router();

// ============================================================
// GLOBAL AUTHENTICATION
// ============================================================

// Every application route requires authentication.
router.use(protect);

// ============================================================
// STUDENT SELF-SERVICE
// ============================================================

router.get("/me", authorize("student"), getMyApplication);

router.post("/me", authorize("student"), createMyApplication);

// ============================================================
// STUDENT DOCUMENT UPLOAD
// ============================================================
//
// Security:
// - Student role required.
// - Multer limits file size/type.
// - Controller validates file content and ownership.
// - Cloudinary folder is derived from authenticated user ID.

router.post(
  "/me/documents",
  authorize("student"),
  uploadDocMiddleware.single("file"),
  uploadDocument,
);

// ============================================================
// STUDENT DOCUMENT DELETE
// ============================================================

router.delete(
  "/me/documents/:documentId",
  authorize("student"),
  deleteDocument,
);

// ============================================================
// STAFF APPLICATION MANAGEMENT
// ============================================================

router.get(
  "/",
  authorize("super_admin", "admin", "counsellor"),
  getApplications,
);

// ============================================================
// DELETE APPLICATION
// ============================================================
//
// Permanent deletion is restricted to administrators.
// Controller also performs defense-in-depth authorization.

router.delete("/:id", authorize("super_admin", "admin"), deleteApplication);

// ============================================================
// UPDATE APPLICATION STAGE
// ============================================================
//
// Counsellors are further restricted by the controller to
// applications assigned to them.

router.patch(
  "/:id/stage",
  authorize("super_admin", "admin", "counsellor"),
  updateStage,
);

// ============================================================
// ASSIGN COUNSELLOR
// ============================================================
//
// Only administrators can assign counsellors.
// Controller verifies the target user is an active counsellor.

router.patch(
  "/:id/assign",
  authorize("super_admin", "admin"),
  assignCounsellor,
);

// ============================================================
// VERIFY / REJECT DOCUMENT
// ============================================================
//
// Counsellors can only operate on applications assigned to them.
// Controller validates document ownership and rejection reason.

router.patch(
  "/:id/documents/:documentId/verify",
  authorize("super_admin", "admin", "counsellor"),
  verifyDocument,
);

module.exports = router;

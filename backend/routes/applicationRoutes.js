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
router.use(protect);
// Student self-service
router.get("/me", authorize("student"), getMyApplication);
// Student self-service
router.post("/me", authorize("student"), createMyApplication);

router.post(
  "/me/documents",
  authorize("student"),
  uploadDocMiddleware.single("file"),
  uploadDocument,
);

router.delete(
  "/me/documents/:documentId",
  authorize("student"),
  deleteDocument,
);
router.post(
  "/me/documents",
  authorize("student"),
  uploadDocMiddleware.single("file"),
  uploadDocument,
);
router.delete(
  "/me/documents/:documentId",
  authorize("student"),
  deleteDocument,
);

// Staff management
router.get(
  "/",
  authorize("super_admin", "admin", "counsellor"),
  getApplications,
);

router.delete("/:id", authorize("super_admin", "admin"), deleteApplication);

router.patch(
  "/:id/stage",
  authorize("super_admin", "admin", "counsellor"),
  updateStage,
);

router.patch(
  "/:id/assign",
  authorize("super_admin", "admin"),
  assignCounsellor,
);

router.patch(
  "/:id/documents/:documentId/verify",
  authorize("super_admin", "admin", "counsellor"),
  verifyDocument,
);
module.exports = router;

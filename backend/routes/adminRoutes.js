const express = require("express");

const {
  getDashboardStats,
} = require("../controllers/adminAnalyticsController");

const {
  createCounsellor,
  getCounsellors,
  updateCounsellor,
  deleteCounsellor,
  getStudents,
} = require("../controllers/adminController");

const {
  exportLeadsExcel,
  exportLeadsPdf,
} = require("../controllers/exportController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// ============================================================
// GLOBAL ADMIN AUTHENTICATION
// ============================================================

router.use(protect, authorize("super_admin", "admin", "marketing_manager"));

// ============================================================
// ANALYTICS
// ============================================================

router.get(
  "/analytics",
  authorize("super_admin", "admin", "marketing_manager"),
  getDashboardStats,
);

// ============================================================
// COUNSELLOR MANAGEMENT
// ============================================================

// Create counsellor
router.post("/counsellors", authorize("super_admin"), createCounsellor);

// Get counsellors
router.get("/counsellors", authorize("super_admin", "admin"), getCounsellors);

// Update counsellor
router.put(
  "/counsellors/:id",
  authorize("super_admin", "admin"),
  updateCounsellor,
);

// Delete counsellor
router.delete("/counsellors/:id", authorize("super_admin"), deleteCounsellor);

// ============================================================
// STUDENTS
// ============================================================

// Only super_admin/admin can access student records.
router.get("/students", authorize("super_admin", "admin"), getStudents);

// ============================================================
// LEAD EXPORTS
// ============================================================

router.get(
  "/export/leads/excel",
  authorize("super_admin", "admin", "marketing_manager"),
  exportLeadsExcel,
);

router.get(
  "/export/leads/pdf",
  authorize("super_admin", "admin", "marketing_manager"),
  exportLeadsPdf,
);

module.exports = router;

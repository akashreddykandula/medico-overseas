const express = require("express");

const {
  getDashboardStats,
} = require("../controllers/adminAnalyticsController");

const {
  createCounsellor,
  getCounsellors,
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
//
// SECURITY:
// Every route in this router requires:
// 1. Authentication
// 2. An approved administrative/management role
//
// Individual routes apply stricter authorization where required.

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

// Only super_admin can create counsellors.
router.post("/counsellors", authorize("super_admin"), createCounsellor);

// super_admin/admin can view counsellors.
router.get("/counsellors", authorize("super_admin", "admin"), getCounsellors);

// Only super_admin can permanently delete counsellors.
router.delete("/counsellors/:id", authorize("super_admin"), deleteCounsellor);

// ============================================================
// STUDENTS
// ============================================================

// Only super_admin/admin can access student records.
// marketing_manager is intentionally excluded.
router.get("/students", authorize("super_admin", "admin"), getStudents);

// ============================================================
// LEAD EXPORTS
// ============================================================
//
// super_admin/admin/marketing_manager can export leads,
// matching the existing access policy.

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

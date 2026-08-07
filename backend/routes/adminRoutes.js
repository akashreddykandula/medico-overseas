const express = require("express");
const {
  getDashboardStats,
} = require("../controllers/adminAnalyticsController");
const {
  createCounsellor,
  getCounsellors,
  deleteCounsellor,
} = require("../controllers/adminController");
const {
  exportLeadsExcel,
  exportLeadsPdf,
} = require("../controllers/exportController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("super_admin", "admin", "marketing_manager"));

router.get("/analytics", getDashboardStats);
router.post("/counsellors", authorize("super_admin"), createCounsellor);
router.get("/counsellors", authorize("super_admin", "admin"), getCounsellors);
router.get("/export/leads/excel", exportLeadsExcel);
router.get("/export/leads/pdf", exportLeadsPdf);
router.delete("/counsellors/:id", authorize("super_admin"), deleteCounsellor);

module.exports = router;

const User = require("../models/User");
const Lead = require("../models/Lead");
const Application = require("../models/Application");
const Country = require("../models/Country");
const University = require("../models/University");
const Blog = require("../models/Blog");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

// Roles permitted to view analytics
const ALLOWED_ANALYTICS_ROLES = ["super_admin", "admin", "marketing_manager"];

// @desc    Aggregate stats for the admin dashboard
// @route   GET /api/admin/analytics
// @access  Private (super_admin/admin/marketing_manager)
const getDashboardStats = asyncHandler(async (req, res) => {
  // 1. Controller-level defense-in-depth authorization check
  if (!req.user || !ALLOWED_ANALYTICS_ROLES.includes(req.user.role)) {
    return res
      .status(403)
      .json(
        new ApiResponse(
          403,
          null,
          "Access denied. Unauthorized role for dashboard analytics.",
        ),
      );
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // 2. Safe concurrent execution of aggregation and count queries
  const [
    totalStudents,
    totalLeads,
    newLeadsLast30Days,
    leadsByStatus,
    totalApplications,
    applicationsByStage,
    totalCountries,
    totalUniversities,
    publishedBlogs,
    monthlyLeadGrowth,
  ] = await Promise.all([
    User.countDocuments({ role: "student" }).exec(),
    Lead.countDocuments().exec(),
    Lead.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }).exec(),
    Lead.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]).exec(),
    Application.countDocuments().exec(),
    Application.aggregate([
      { $group: { _id: "$currentStage", count: { $sum: 1 } } },
    ]).exec(),
    Country.countDocuments({ isPublished: true }).exec(),
    University.countDocuments({ isPublished: true }).exec(),
    Blog.countDocuments({ status: "published" }).exec(),
    Lead.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]).exec(),
  ]);

  // 3. Robust calculation handling edge cases safely
  const convertedLeadObj = Array.isArray(leadsByStatus)
    ? leadsByStatus.find((s) => s._id === "converted")
    : null;
  const convertedCount = convertedLeadObj ? convertedLeadObj.count : 0;

  const rawConversionRate =
    totalLeads > 0 ? (convertedCount / totalLeads) * 100 : 0;
  const conversionRate = parseFloat(rawConversionRate.toFixed(1));

  // 4. Return sanitized structured payload
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totals: {
          students: totalStudents || 0,
          leads: totalLeads || 0,
          newLeadsLast30Days: newLeadsLast30Days || 0,
          applications: totalApplications || 0,
          countries: totalCountries || 0,
          universities: totalUniversities || 0,
          publishedBlogs: publishedBlogs || 0,
        },
        leadsByStatus: leadsByStatus || [],
        applicationsByStage: applicationsByStage || [],
        conversionRate: isNaN(conversionRate) ? 0 : conversionRate,
        monthlyLeadGrowth: monthlyLeadGrowth || [],
      },
      "Dashboard analytics retrieved successfully",
    ),
  );
});

module.exports = { getDashboardStats };

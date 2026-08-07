const User = require('../models/User');
const Lead = require('../models/Lead');
const Application = require('../models/Application');
const Country = require('../models/Country');
const University = require('../models/University');
const Blog = require('../models/Blog');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Aggregate stats for the admin dashboard
// @route   GET /api/admin/analytics
// @access  Private (super_admin/admin/marketing_manager)
const getDashboardStats = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

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
    User.countDocuments({ role: 'student' }),
    Lead.countDocuments(),
    Lead.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Application.countDocuments(),
    Application.aggregate([{ $group: { _id: '$currentStage', count: { $sum: 1 } } }]),
    Country.countDocuments({ isPublished: true }),
    University.countDocuments({ isPublished: true }),
    Blog.countDocuments({ status: 'published' }),
    Lead.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const conversionRate = totalLeads
    ? (((leadsByStatus.find((s) => s._id === 'converted')?.count || 0) / totalLeads) * 100).toFixed(1)
    : '0.0';

  res.status(200).json(
    new ApiResponse(200, {
      totals: {
        students: totalStudents,
        leads: totalLeads,
        newLeadsLast30Days,
        applications: totalApplications,
        countries: totalCountries,
        universities: totalUniversities,
        publishedBlogs,
      },
      leadsByStatus,
      applicationsByStage,
      conversionRate: Number(conversionRate),
      monthlyLeadGrowth,
    })
  );
});

module.exports = { getDashboardStats };

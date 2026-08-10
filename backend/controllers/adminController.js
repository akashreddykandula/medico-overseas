const mongoose = require("mongoose");
const User = require("../models/User");
const Lead = require("../models/Lead");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// Helper function to safely process string inputs
const sanitizeInputString = (str) =>
  typeof str === "string" ? str.trim() : "";

// @desc    Create a new counsellor
// @route   POST /api/admin/counsellors
// @access  Private (super_admin/admin)
const createCounsellor = asyncHandler(async (req, res) => {
  let { name, email, phone, password } = req.body;

  // 1. Sanitize string types
  name = sanitizeInputString(name);
  email = sanitizeInputString(email).toLowerCase();
  phone = sanitizeInputString(phone);

  // 2. Strict Input Validation & Length Limits
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  if (name.length > 100) {
    throw new ApiError(400, "Name cannot exceed 100 characters");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email.length > 255 || !emailRegex.test(email)) {
    throw new ApiError(
      400,
      "Please provide a valid email under 255 characters",
    );
  }

  if (phone && phone.length > 20) {
    throw new ApiError(400, "Phone number cannot exceed 20 characters");
  }

  // Password length boundary (Limits prevents ReDoS / bcrypt CPU exhaustion DoS)
  if (typeof password !== "string" || password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }
  if (password.length > 128) {
    throw new ApiError(400, "Password cannot exceed 128 characters");
  }

  // 3. Prevent NoSQL Injection during existence lookup
  const existing = await User.findOne({ email: String(email) });
  if (existing) {
    throw new ApiError(400, "A user with this email already exists");
  }

  let counsellor;
  try {
    // 4. Creation with Data Minimization & Race Condition Safety
    counsellor = await User.create({
      name,
      email,
      phone,
      password,
      role: "counsellor",
      isEmailVerified: true,
    });
  } catch (error) {
    // Catch MongoDB duplicate key error code 11000 (Race condition where 2 identical emails pass check simultaneously)
    if (
      error.code === 11000 ||
      (error.message && error.message.includes("E11000"))
    ) {
      throw new ApiError(400, "A user with this email already exists");
    }
    throw error;
  }

  // 5. Data Minimization - Omit sensitive credentials from output
  const counsellorData = counsellor.toObject();
  delete counsellorData.password;
  delete counsellorData.refreshToken;

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { counsellor: counsellorData },
        "Counsellor created successfully",
      ),
    );
});

// @desc    Get all counsellors
// @route   GET /api/admin/counsellors
// @access  Private (super_admin/admin/marketing_manager)
const getCounsellors = asyncHandler(async (req, res) => {
  const counsellors = await User.find({ role: "counsellor" })
    .select("-password -refreshToken")
    .lean();

  res.status(200).json(new ApiResponse(200, { counsellors }));
});

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private (super_admin/admin/counsellor)
const getStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: "student" })
    .select("-password -refreshToken")
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(
    new ApiResponse(200, {
      students,
    }),
  );
});

// @desc    Delete a counsellor
// @route   DELETE /api/admin/counsellors/:id
// @access  Private (super_admin/admin)
const deleteCounsellor = asyncHandler(async (req, res) => {
  const counsellorId = req.params.id;

  // 1. Parameter / ObjectId validation
  if (!mongoose.Types.ObjectId.isValid(counsellorId)) {
    throw new ApiError(400, "Invalid counsellor ID format");
  }

  // 2. Query execution with casted ObjectId
  const targetId = new mongoose.Types.ObjectId(counsellorId);

  const assignedLeads = await Lead.countDocuments({
    assignedCounsellor: targetId,
  });

  if (assignedLeads > 0) {
    throw new ApiError(
      400,
      `Cannot delete counsellor. ${assignedLeads} lead(s) are assigned.`,
    );
  }

  const counsellor = await User.findOneAndDelete({
    _id: targetId,
    role: "counsellor",
  });

  if (!counsellor) {
    throw new ApiError(404, "Counsellor not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Counsellor deleted successfully"));
});

module.exports = {
  createCounsellor,
  getCounsellors,
  deleteCounsellor,
  getStudents,
};

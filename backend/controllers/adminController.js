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
// @desc    Update a counsellor
// @route   PUT /api/admin/counsellors/:id
// @access  Private (super_admin/admin)
const updateCounsellor = asyncHandler(async (req, res) => {
  const counsellorId = req.params.id;

  // 1. Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(counsellorId)) {
    throw new ApiError(400, "Invalid counsellor ID format");
  }

  const targetId = new mongoose.Types.ObjectId(counsellorId);

  // 2. Get and sanitize input
  let { name, email, phone, password, isActive } = req.body;

  if (name !== undefined) {
    name = sanitizeInputString(name);

    if (!name) {
      throw new ApiError(400, "Name cannot be empty");
    }

    if (name.length > 100) {
      throw new ApiError(400, "Name cannot exceed 100 characters");
    }
  }

  if (email !== undefined) {
    email = sanitizeInputString(email).toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || email.length > 255 || !emailRegex.test(email)) {
      throw new ApiError(400, "Please provide a valid email");
    }

    // Prevent duplicate email
    const existingUser = await User.findOne({
      email: String(email),
      _id: { $ne: targetId },
    });

    if (existingUser) {
      throw new ApiError(400, "A user with this email already exists");
    }
  }

  if (phone !== undefined) {
    phone = sanitizeInputString(phone);

    if (phone.length > 20) {
      throw new ApiError(400, "Phone number cannot exceed 20 characters");
    }
  }

  // 3. Password validation
  if (password !== undefined && password !== "") {
    if (typeof password !== "string" || password.length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters");
    }

    if (password.length > 128) {
      throw new ApiError(400, "Password cannot exceed 128 characters");
    }
  }

  // 4. Build update object
  const updateData = {};

  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;

  if (isActive !== undefined) {
    updateData.isActive = isActive === true || isActive === "true";
  }

  // 5. Find counsellor first
  const counsellor = await User.findOne({
    _id: targetId,
    role: "counsellor",
  }).select("+password");

  if (!counsellor) {
    throw new ApiError(404, "Counsellor not found");
  }

  // 6. Update normal fields
  Object.assign(counsellor, updateData);

  // 7. Password update
  // Using document.save() is important because your User model
  // hashes passwords inside the pre-save hook.
  if (password !== undefined && password !== "") {
    counsellor.password = password;
  }

  try {
    await counsellor.save();
  } catch (error) {
    if (
      error.code === 11000 ||
      (error.message && error.message.includes("E11000"))
    ) {
      throw new ApiError(400, "A user with this email already exists");
    }

    throw error;
  }

  // 8. Remove sensitive fields from response
  const counsellorData = counsellor.toObject();

  delete counsellorData.password;
  delete counsellorData.refreshToken;
  delete counsellorData.passwordResetToken;
  delete counsellorData.passwordResetExpires;
  delete counsellorData.emailVerificationToken;

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { counsellor: counsellorData },
        "Counsellor updated successfully",
      ),
    );
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
  updateCounsellor,
  deleteCounsellor,
  getStudents,
};

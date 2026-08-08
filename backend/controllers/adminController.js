const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Lead = require("../models/Lead");

const createCounsellor = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const existing = await User.findOne({ email });

  if (existing) {
    throw new ApiError(400, "A user with this email already exists");
  }
  const counsellor = await User.create({
    name,
    email,
    phone,
    password,
    role: "counsellor",
    isEmailVerified: true,
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, { counsellor }, "Counsellor created successfully"),
    );
});
const getCounsellors = asyncHandler(async (req, res) => {
  const counsellors = await User.find({
    role: "counsellor",
  }).select("-password -refreshToken");

  res.status(200).json(new ApiResponse(200, { counsellors }));
});
const getStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: "student" })
    .select("-password -refreshToken")
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, {
      students,
    }),
  );
});
const deleteCounsellor = asyncHandler(async (req, res) => {
  const assignedLeads = await Lead.countDocuments({
    assignedCounsellor: req.params.id,
  });

  if (assignedLeads > 0) {
    throw new ApiError(
      400,
      `Cannot delete counsellor. ${assignedLeads} lead(s) are assigned.`,
    );
  }

  const counsellor = await User.findOneAndDelete({
    _id: req.params.id,
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

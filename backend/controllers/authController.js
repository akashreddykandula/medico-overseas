const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const {
  generateAccessToken,
  generateRefreshToken,
  cookieOptions,
} = require("../utils/generateTokens");
const { sendEmail } = require("../services/emailService");

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing)
    throw new ApiError(409, "An account with this email already exists");

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: "student",
  });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: sanitizeUser(user), accessToken },
        "Registration successful",
      ),
    );
});

// @desc    Login (student or staff)
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (!user.isActive)
    throw new ApiError(403, "Account has been deactivated. Contact support.");

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: sanitizeUser(user), accessToken },
        "Login successful",
      ),
    );
});

// @desc    Issue a new access token using refresh token cookie
// @route   POST /api/auth/refresh
// @access  Public
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, "Refresh token does not match");
  }

  const accessToken = generateAccessToken(user._id, user.role);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken,
        user: sanitizeUser(user),
      },
      "Token refreshed",
    ),
  );
});

// @desc    Logout — invalidate refresh token
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: "" });
  res
    .clearCookie("refreshToken", cookieOptions)
    .status(200)
    .json(new ApiResponse(200, null, "Logged out"));
});

// @desc    Request password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  // Always respond the same way to avoid leaking which emails are registered
  const genericResponse = new ApiResponse(
    200,
    null,
    "If an account with that email exists, a reset link has been sent",
  );
  if (!user) return res.status(200).json(genericResponse);

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset your Medico Overseas password",
      html: `<p>Hi ${user.name},</p><p>Click the link below to reset your password. This link expires in 30 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(
      500,
      "Failed to send reset email. Please try again later.",
    );
  }

  res.status(200).json(genericResponse);
});

// @desc    Reset password using token from email
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) throw new ApiError(400, "Reset link is invalid or has expired");

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, null, "Password reset successful. Please log in."),
    );
});

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: sanitizeUser(req.user) }));
});

function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.emailVerificationToken;
  return obj;
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};

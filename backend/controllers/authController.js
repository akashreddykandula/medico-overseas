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

// ------------------------------------------------------------
// SECURITY CONSTANTS
// ------------------------------------------------------------

const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 20;
const MAX_PASSWORD_LENGTH = 128;
const MAX_EMAIL_LENGTH = 254;

// ------------------------------------------------------------
// SECURITY HELPERS
// ------------------------------------------------------------

// Only accept primitive strings for authentication inputs.
// This prevents object/operator payloads such as:
// { "email": { "$ne": null } }
// from reaching MongoDB queries.
const normalizeString = (value, maxLength) => {
  if (typeof value !== "string") return "";

  return value.trim().slice(0, maxLength);
};

const normalizeEmail = (value) => {
  return normalizeString(value, MAX_EMAIL_LENGTH).toLowerCase();
};

// Basic email validation.
// The User schema performs the final Mongoose validation as well.
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Escape user-controlled content before inserting it into HTML email.
const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// ------------------------------------------------------------
// REGISTER
// @route   POST /api/auth/register
// @access  Public
// ------------------------------------------------------------

const register = asyncHandler(async (req, res) => {
  // SECURITY:
  // Never destructure and directly trust req.body values.
  // Validate primitive types before using them.
  const name = normalizeString(req.body?.name, MAX_NAME_LENGTH);
  const email = normalizeEmail(req.body?.email);
  const phone = normalizeString(req.body?.phone, MAX_PHONE_LENGTH);
  const password = req.body?.password;

  if (!name || name.length < 2) {
    throw new ApiError(400, "Name must be at least 2 characters");
  }

  if (!email || !isValidEmail(email)) {
    throw new ApiError(400, "Please provide a valid email");
  }

  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    throw new ApiError(400, "Password must be between 8 and 128 characters");
  }

  // SECURITY:
  // Explicit primitive string query prevents NoSQL operator injection.
  const existing = await User.findOne({ email: String(email) })
    .select("_id")
    .lean();

  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  let user;

  try {
    // SECURITY:
    // Explicitly construct the user object.
    // Never use User.create(req.body).
    //
    // role is ALWAYS forced to student here.
    // A public registration request must never be able to create
    // an admin/super_admin/counsellor account.
    user = await User.create({
      name,
      email,
      phone: phone || undefined,
      password,
      role: "student",
    });
  } catch (error) {
    // SECURITY:
    // Handles duplicate-email race conditions where two requests
    // pass the existence check simultaneously.
    if (error.code === 11000) {
      throw new ApiError(409, "An account with this email already exists");
    }

    throw error;
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // SECURITY:
  // Store the refresh token server-side so it can be invalidated
  // during logout.
  user.refreshToken = refreshToken;

  await user.save({
    validateBeforeSave: false,
  });

  res
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(201)
    .json(
      new ApiResponse(
        201,
        {
          user: sanitizeUser(user),
          accessToken,
        },
        "Registration successful",
      ),
    );
});

// ------------------------------------------------------------
// LOGIN
// @route   POST /api/auth/login
// @access  Public
// ------------------------------------------------------------

const login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;

  if (!email || !isValidEmail(email)) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (
    typeof password !== "string" ||
    password.length === 0 ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    throw new ApiError(401, "Invalid email or password");
  }

  // SECURITY:
  // Only explicitly select the password field when authentication
  // requires it.
  const user = await User.findOne({
    email: String(email),
  }).select("+password");

  // Keep login failure response generic to reduce account enumeration.
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.isActive !== true) {
    throw new ApiError(403, "Account has been deactivated. Contact support.");
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // SECURITY:
  // Replace the previous refresh token.
  // This ensures only the latest refresh token is valid.
  user.refreshToken = refreshToken;

  await user.save({
    validateBeforeSave: false,
  });

  res
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          user: sanitizeUser(user),
          accessToken,
        },
        "Login successful",
      ),
    );
});

// ------------------------------------------------------------
// REFRESH ACCESS TOKEN
// @route   POST /api/auth/refresh
// @access  Public
// ------------------------------------------------------------

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (typeof token !== "string" || !token.trim() || token.length > 2048) {
    throw new ApiError(
      401,
      "Please check your login credentials and try again",
    );
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    throw new ApiError(500, "Authentication service is unavailable");
  }

  let decoded;

  try {
    // SECURITY:
    // Explicitly restrict the JWT signing algorithm.
    // This prevents accepting an unexpected algorithm.
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Refresh token expired");
    }

    throw new ApiError(401, "Invalid refresh token");
  }

  // SECURITY:
  // Never trust arbitrary JWT payload structures.
  if (
    !decoded ||
    typeof decoded !== "object" ||
    Array.isArray(decoded) ||
    typeof decoded.id !== "string" ||
    !decoded.id.trim()
  ) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (user.isActive !== true) {
    throw new ApiError(403, "Account has been deactivated");
  }

  // SECURITY:
  // The refresh token stored in MongoDB must exactly match the
  // token presented by the client.
  //
  // This allows logout/token invalidation to work.
  if (
    typeof user.refreshToken !== "string" ||
    !user.refreshToken ||
    user.refreshToken !== token
  ) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // SECURITY:
  // Refresh-token rotation.
  //
  // A new refresh token replaces the old one after every refresh.
  // If an old token is reused, it will no longer match MongoDB.
  const newRefreshToken = generateRefreshToken(user._id);
  const accessToken = generateAccessToken(user._id, user.role);

  user.refreshToken = newRefreshToken;

  await user.save({
    validateBeforeSave: false,
  });

  return res
    .cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json(
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

// ------------------------------------------------------------
// LOGOUT
// @route   POST /api/auth/logout
// @access  Private
// ------------------------------------------------------------

const logout = asyncHandler(async (req, res) => {
  // SECURITY:
  // Invalidate the server-side refresh token.
  // A previously issued refresh token can no longer be used.
  if (req.user?._id) {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        runValidators: false,
      },
    );
  }

  // Use the same cookie configuration used when creating the cookie.
  res
    .clearCookie("refreshToken", cookieOptions)
    .status(200)
    .json(new ApiResponse(200, null, "Logged out"));
});

// ------------------------------------------------------------
// FORGOT PASSWORD
// @route   POST /api/auth/forgot-password
// @access  Public
// ------------------------------------------------------------

const forgotPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body?.email);

  // SECURITY:
  // Always return the same response regardless of whether the
  // account exists. This prevents email/account enumeration.
  const genericResponse = new ApiResponse(
    200,
    null,
    "If an account with that email exists, a reset link has been sent",
  );

  if (!email || !isValidEmail(email)) {
    return res.status(200).json(genericResponse);
  }

  // SECURITY:
  // Explicit string query prevents NoSQL operator injection.
  const user = await User.findOne({
    email: String(email),
  });

  if (!user) {
    return res.status(200).json(genericResponse);
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({
    validateBeforeSave: false,
  });

  // SECURITY:
  // CLIENT_URL must be configured server-side.
  // The token itself is generated server-side using crypto.randomBytes().
  const clientUrl = process.env.CLIENT_URL;

  if (!clientUrl) {
    // Do not leave a valid reset token stored if the reset email
    // cannot be generated safely.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    throw new ApiError(500, "Password reset service is unavailable");
  }

  // Do not accept a redirect URL from the user.
  const resetUrl = `${clientUrl.replace(/\/+$/, "")}/reset-password/${encodeURIComponent(
    resetToken,
  )}`;

  try {
    // SECURITY:
    // Escape user-controlled name before inserting it into HTML.
    const safeName = escapeHtml(user.name);

    await sendEmail({
      to: user.email,
      subject: "Reset your Medico Overseas password",
      html: `
        <p>Hi ${safeName},</p>
        <p>
          Click the link below to reset your password.
          This link expires in 30 minutes.
        </p>
        <p>
          <a href="${resetUrl}">Reset your password</a>
        </p>
        <p>
          If you did not request this password reset, you can safely ignore this email.
        </p>
      `,
    });
  } catch (err) {
    // SECURITY:
    // Never leave a usable reset token in the database if sending
    // the reset email fails.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    throw new ApiError(
      500,
      "Failed to send reset email. Please try again later.",
    );
  }

  return res.status(200).json(genericResponse);
});

// ------------------------------------------------------------
// RESET PASSWORD
// @route   POST /api/auth/reset-password/:token
// @access  Public
// ------------------------------------------------------------

const resetPassword = asyncHandler(async (req, res) => {
  const token = req.params?.token;
  const password = req.body?.password;

  // SECURITY:
  // Reject malformed/oversized reset tokens before hashing.
  if (
    typeof token !== "string" ||
    token.length < 32 ||
    token.length > 128 ||
    !/^[a-fA-F0-9]+$/.test(token)
  ) {
    throw new ApiError(400, "Reset link is invalid or has expired");
  }

  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    throw new ApiError(400, "Password must be between 8 and 128 characters");
  }

  // SECURITY:
  // Never store the raw password-reset token in MongoDB.
  // Search using the SHA-256 hash created when the reset request
  // was generated.
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: new Date(),
    },
  }).select("+passwordResetToken +passwordResetExpires +password");

  if (!user) {
    throw new ApiError(400, "Reset link is invalid or has expired");
  }

  // SECURITY:
  // Assigning through the document and calling save() ensures
  // the User pre-save bcrypt hashing hook runs.
  user.password = password;

  // SECURITY:
  // Make the reset token immediately single-use.
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // SECURITY:
  // Invalidate the existing refresh token after a password reset.
  // This forces existing sessions to authenticate again.
  user.refreshToken = undefined;

  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, null, "Password reset successful. Please log in."),
    );
});

// ------------------------------------------------------------
// CURRENT USER
// @route   GET /api/auth/me
// @access  Private
// ------------------------------------------------------------

const getMe = asyncHandler(async (req, res) => {
  // protect middleware has already verified authentication.
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  res.status(200).json(
    new ApiResponse(200, {
      user: sanitizeUser(req.user),
    }),
  );
});

// ------------------------------------------------------------
// REMOVE SENSITIVE USER DATA FROM RESPONSE
// ------------------------------------------------------------
// SECURITY:
// Never send authentication credentials/tokens to the frontend
// as part of the user object.
//
// This is defense-in-depth even when Mongoose select:false is used.
// ------------------------------------------------------------

function sanitizeUser(user) {
  const obj = user?.toObject ? user.toObject() : { ...(user || {}) };

  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.emailVerificationToken;

  return obj;
}

// ------------------------------------------------------------
// EXPORTS
// ------------------------------------------------------------

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};

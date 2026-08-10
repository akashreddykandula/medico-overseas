const jwt = require("jsonwebtoken");

// ------------------------------------------------------------
// SECURITY CONFIGURATION
// ------------------------------------------------------------

// SECURITY:
// Fail fast if JWT secrets are missing instead of allowing the
// application to accidentally create/verify tokens incorrectly.
const getRequiredSecret = (name) => {
  const secret = process.env[name];

  if (typeof secret !== "string" || secret.length < 32) {
    throw new Error(
      `${name} must be configured and contain at least 32 characters`,
    );
  }

  return secret;
};

// SECURITY:
// Keep the algorithm explicit. This must match the algorithm
// used by auth middleware when verifying the tokens.
const JWT_ALGORITHM = "HS256";

// ------------------------------------------------------------
// ACCESS TOKEN
// ------------------------------------------------------------
// Short-lived token used for API authentication.
//
// The role is included for application convenience, but IMPORTANT:
// authorization middleware should continue to load the current
// user from MongoDB instead of trusting the JWT role.
// ------------------------------------------------------------

const generateAccessToken = (userId, role) => {
  if (!userId) {
    throw new Error("User ID is required to generate access token");
  }

  if (typeof role !== "string" || !role) {
    throw new Error("Valid user role is required to generate access token");
  }

  const secret = getRequiredSecret("JWT_ACCESS_SECRET");

  return jwt.sign(
    {
      id: String(userId),
      role,
    },
    secret,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
    },
  );
};

// ------------------------------------------------------------
// REFRESH TOKEN
// ------------------------------------------------------------
// Longer-lived token used only to obtain a new access token.
//
// SECURITY:
// Keep the refresh-token payload minimal.
// Do not put password, email, permissions, or sensitive data
// inside the refresh token.
// ------------------------------------------------------------

const generateRefreshToken = (userId) => {
  if (!userId) {
    throw new Error("User ID is required to generate refresh token");
  }

  const secret = getRequiredSecret("JWT_REFRESH_SECRET");

  return jwt.sign(
    {
      id: String(userId),
    },
    secret,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
    },
  );
};

// ------------------------------------------------------------
// REFRESH TOKEN COOKIE
// ------------------------------------------------------------
// SECURITY:
// httpOnly:
//   JavaScript cannot directly read the refresh token.
//
// secure:
//   HTTPS is required in production.
//
// sameSite:
//   "none" is required only when frontend/backend are genuinely
//   cross-site and the application uses HTTPS.
//   Otherwise "lax" provides stronger CSRF protection.
//
// path:
//   Restricts the cookie to the application.
//
// IMPORTANT:
// If your frontend and backend are deployed on different sites,
// keep SameSite=None + Secure in production and ensure CORS is
// restricted to your exact CLIENT_URL.
// ------------------------------------------------------------

const cookieOptions = {
  httpOnly: true,

  secure: process.env.NODE_ENV === "production",

  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

  path: "/",

  // SECURITY:
  // Prevent the browser from treating this cookie as a general-
  // purpose cross-origin resource cookie.
  partitioned: false,
};

// ------------------------------------------------------------
// EXPORTS
// ------------------------------------------------------------

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  cookieOptions,
};

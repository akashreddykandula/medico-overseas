const cloudinary = require("cloudinary").v2;

// ============================================================
// CLOUDINARY CONFIGURATION
// ============================================================
//
// SECURITY:
// - Credentials are read ONLY from backend environment variables.
// - Never hard-code Cloudinary credentials.
// - Never expose CLOUDINARY_API_SECRET to the frontend.
// - This file must only be imported by backend code.
// - `secure: true` ensures generated Cloudinary URLs use HTTPS.
// ============================================================

const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

// ------------------------------------------------------------
// SECURITY: Fail fast when required credentials are missing.
//
// This prevents the application from starting with an
// incomplete Cloudinary configuration.
// ------------------------------------------------------------

for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// ------------------------------------------------------------
// SECURITY: Configure Cloudinary using environment variables.
//
// `.trim()` prevents accidental whitespace from being included
// when credentials are copied into the .env file.
// ------------------------------------------------------------

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
  api_key: process.env.CLOUDINARY_API_KEY.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET.trim(),

  // Always generate HTTPS URLs.
  secure: true,
});

// ============================================================
// SECURITY NOTES
// ============================================================
//
// NEVER:
//
// 1. Log `cloudinary.config()`
// 2. Return `process.env.CLOUDINARY_API_SECRET` in an API response
// 3. Put CLOUDINARY_API_SECRET in VITE_* / frontend variables
// 4. Import this module into React/frontend code
// 5. Commit the backend `.env` file to Git
//
// The Cloudinary API secret must remain server-side only.
// ============================================================

module.exports = cloudinary;

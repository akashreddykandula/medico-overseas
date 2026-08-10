const multer = require("multer");
const ApiError = require("../utils/ApiError");

// ============================================================
// GLOBAL EXPRESS ERROR HANDLER
// ============================================================
//
// SECURITY PURPOSE:
// - Converts known errors into safe API responses.
// - Handles Multer upload errors.
// - Handles Mongoose validation / duplicate / Cast errors.
// - Handles JWT errors.
// - Prevents internal implementation details from leaking in
//   production.
// - Exposes stack traces ONLY in development.
//
// IMPORTANT:
// This middleware should remain the LAST `app.use()` middleware
// in server.js/app.js.
// ============================================================

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // ----------------------------------------------------------
  // Already-normalized application error
  // ----------------------------------------------------------
  //
  // ApiError instances already contain a controlled status code,
  // message and optional validation errors.
  //
  // Do not replace them with generic 500 errors.
  // ----------------------------------------------------------

  if (!(error instanceof ApiError)) {
    // --------------------------------------------------------
    // MULTER UPLOAD ERRORS
    // --------------------------------------------------------
    //
    // These errors are generated before the controller receives
    // the uploaded file.
    //
    // Keep these messages generic so internal upload details
    // are not exposed to the client.
    // --------------------------------------------------------

    if (error instanceof multer.MulterError) {
      switch (error.code) {
        case "LIMIT_FILE_SIZE":
          error = new ApiError(
            400,
            "Uploaded file is too large. Maximum file size is 5MB.",
          );
          break;

        case "LIMIT_FILE_COUNT":
          error = new ApiError(
            400,
            "Too many files uploaded. Only one file is allowed.",
          );
          break;

        case "LIMIT_UNEXPECTED_FILE":
          error = new ApiError(
            400,
            "Invalid file upload or unsupported file type.",
          );
          break;

        case "LIMIT_FIELD_COUNT":
          error = new ApiError(400, "Too many form fields were submitted.");
          break;

        case "LIMIT_FIELD_SIZE":
          error = new ApiError(400, "A submitted form field is too large.");
          break;

        case "LIMIT_FIELD_KEY":
          error = new ApiError(400, "A submitted form field name is too long.");
          break;

        case "LIMIT_PART_COUNT":
          error = new ApiError(
            400,
            "Too many multipart form parts were submitted.",
          );
          break;

        case "MISSING_FIELD_NAME":
          error = new ApiError(400, "Invalid multipart form data.");
          break;

        default:
          error = new ApiError(400, "File upload failed.");
      }
    }

    // --------------------------------------------------------
    // PAYLOAD TOO LARGE
    // --------------------------------------------------------
    //
    // Handles body-parser / raw request payload size errors.
    //
    // Express JSON/urlencoded limits are configured in app.js.
    // --------------------------------------------------------
    else if (error.type === "entity.too.large" || error.status === 413) {
      error = new ApiError(413, "Request payload is too large.");
    }

    // --------------------------------------------------------
    // MONGOOSE VALIDATION ERROR
    // --------------------------------------------------------
    else if (error.name === "ValidationError") {
      const messages = Object.values(error.errors || {})
        .map((e) => e.message)
        .filter(Boolean);

      error = new ApiError(400, "Validation failed", messages);
    }

    // --------------------------------------------------------
    // MONGODB DUPLICATE KEY ERROR
    // --------------------------------------------------------
    //
    // Prevent exposing the complete MongoDB error object.
    // Only return the affected field name.
    // --------------------------------------------------------
    else if (error.code === 11000) {
      const duplicateFields = error.keyPattern
        ? Object.keys(error.keyPattern)
        : error.keyValue
          ? Object.keys(error.keyValue)
          : [];

      const field = duplicateFields[0] || "field";

      error = new ApiError(409, `${field} already exists`);
    }

    // --------------------------------------------------------
    // MONGOOSE CAST / INVALID OBJECTID ERROR
    // --------------------------------------------------------
    else if (error.name === "CastError") {
      error = new ApiError(400, `Invalid ${error.path || "request parameter"}`);
    }

    // --------------------------------------------------------
    // JWT ERRORS
    // --------------------------------------------------------
    else if (error.name === "JsonWebTokenError") {
      error = new ApiError(401, "Invalid token");
    } else if (error.name === "TokenExpiredError") {
      error = new ApiError(401, "Token expired");
    }

    // --------------------------------------------------------
    // GENERIC / UNEXPECTED ERROR
    // --------------------------------------------------------
    //
    // SECURITY:
    // Never expose arbitrary database, Cloudinary, filesystem,
    // stack-trace, environment or implementation details in
    // production.
    // --------------------------------------------------------
    else {
      const isDevelopment = process.env.NODE_ENV === "development";

      const statusCode =
        Number.isInteger(error.statusCode) &&
        error.statusCode >= 400 &&
        error.statusCode <= 599
          ? error.statusCode
          : 500;

      error = new ApiError(
        statusCode,
        isDevelopment
          ? error.message || "Internal server error"
          : "Internal server error",
      );
    }
  }

  // ----------------------------------------------------------
  // SECURITY: SAFE SERVER-SIDE LOGGING
  // ----------------------------------------------------------
  //
  // Do not send these logs to the client.
  //
  // In production, only unexpected 5xx errors are logged here.
  // ----------------------------------------------------------

  if (process.env.NODE_ENV === "development") {
    console.error("API Error:", err);
  } else if ((error.statusCode || 500) >= 500) {
    console.error("Internal server error:", err);
  }

  // ----------------------------------------------------------
  // SECURITY: NEVER TRUST error.errors TO BE AN ARRAY
  // ----------------------------------------------------------

  const safeErrors = Array.isArray(error.errors) ? error.errors : [];

  // ----------------------------------------------------------
  // SAFE RESPONSE
  // ----------------------------------------------------------

  const response = {
    success: false,
    message: error.message || "Internal server error",
    errors: safeErrors,
  };

  // ----------------------------------------------------------
  // DEVELOPMENT ONLY
  // ----------------------------------------------------------
  //
  // Stack traces can expose:
  // - filesystem paths
  // - source code structure
  // - package names
  // - implementation details
  //
  // Therefore they MUST NOT be returned in production.
  // ----------------------------------------------------------

  if (process.env.NODE_ENV === "development" && err?.stack) {
    response.stack = err.stack;
  }

  return res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;

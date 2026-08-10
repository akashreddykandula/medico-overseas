const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

// ------------------------------------------------------------
// VALIDATION MIDDLEWARE
// ------------------------------------------------------------
// SECURITY:
// - Runs after express-validator rules.
// - Stops the request before it reaches the controller.
// - Returns only validation information.
// - Does not expose stack traces, database errors, or internals.
// - Limits the number of returned validation messages to prevent
//   unnecessarily large error responses.
// ------------------------------------------------------------

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // SECURITY:
    // Only expose the field location and validator message.
    // Do not return the complete express-validator error object,
    // because it may contain request values or unnecessary data.
    const messages = errors
      .array({ onlyFirstError: true })
      .slice(0, 20)
      .map((error) => {
        const field =
          typeof error.path === "string" && error.path.trim()
            ? error.path
            : "request";

        const message =
          typeof error.msg === "string" && error.msg.trim()
            ? error.msg
            : "Invalid value";

        return `${field}: ${message}`;
      });

    throw new ApiError(400, "Validation failed", messages);
  }

  // SECURITY:
  // Only validated requests continue to the controller.
  next();
};

module.exports = validate;

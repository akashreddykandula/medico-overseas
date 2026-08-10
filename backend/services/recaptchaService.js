const axios = require("axios");

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

const verifyRecaptcha = async (token) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // SECURITY:
  // Do not silently bypass CAPTCHA when the secret key is missing.
  // This must be explicitly configured in production.
  if (!secretKey || !secretKey.trim()) {
    if (process.env.NODE_ENV === "development") {
      return true;
    }

    return false;
  }

  if (typeof token !== "string" || !token.trim() || token.length > 4096) {
    return false;
  }

  try {
    const { data } = await axios.post(RECAPTCHA_VERIFY_URL, null, {
      params: {
        secret: secretKey.trim(),
        response: token.trim(),
      },
      timeout: 5000,
      maxContentLength: 1024 * 1024,
      maxBodyLength: 1024 * 1024,
    });

    return Boolean(
      data && data.success && (data.score === undefined || data.score >= 0.5),
    );
  } catch (error) {
    // Do not expose Google's response or internal error details.
    console.error("reCAPTCHA verification failed:", error.message);
    return false;
  }
};

module.exports = {
  verifyRecaptcha,
};

const nodemailer = require("nodemailer");

// ============================================================
// SMTP CONFIGURATION
// ============================================================

const smtpPort = Number(process.env.SMTP_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,

  // Preserve existing SMTP behavior.
  secure: smtpPort === 465,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  // Prevent SMTP connections from hanging indefinitely.
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,

  // Do not allow untrusted certificate configuration from
  // application input.
  tls: {
    rejectUnauthorized: true,
  },
});

// ============================================================
// SEND EMAIL
// ============================================================

const sendEmail = async ({ to, subject, html }) => {
  if (typeof to !== "string" || !to.trim()) {
    throw new Error("Email recipient is required");
  }

  if (typeof subject !== "string" || !subject.trim()) {
    throw new Error("Email subject is required");
  }

  if (typeof html !== "string") {
    throw new Error("Email content is invalid");
  }

  // Nodemailer handles header encoding, but explicitly remove
  // CR/LF from the subject to prevent header-injection attempts.
  const safeSubject = subject.replace(/[\r\n]/g, " ").trim();

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: to.trim(),
    subject: safeSubject,
    html,
  });
};

module.exports = {
  sendEmail,
  transporter,
};

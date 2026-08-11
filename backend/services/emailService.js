const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

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

  const safeSubject = subject.replace(/[\r\n]/g, " ").trim();

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [to.trim()],
    subject: safeSubject,
    html,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }

  return data;
};

module.exports = {
  sendEmail,
};

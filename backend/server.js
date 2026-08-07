require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const ApiError = require("./utils/ApiError");

const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const countryRoutes = require("./routes/countryRoutes");
const universityRoutes = require("./routes/universityRoutes");
const blogRoutes = require("./routes/blogRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const faqRoutes = require("./routes/faqRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const contactRoutes = require("./routes/contactRoutes");
const adminRoutes = require("./routes/adminRoutes");

connectDB();

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(compression());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Global rate limit as a baseline safety net (stricter limits also exist per-route)
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/api/health", (req, res) =>
  res.status(200).json({ status: "ok", uptime: process.uptime() }),
);

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/universities", universityRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);

app.all("*", (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Medico Overseas API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`,
  );
});

module.exports = app;

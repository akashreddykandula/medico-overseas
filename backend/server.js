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
const brochureRoutes = require("./routes/brochureRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

connectDB();

const app = express();

app.set("trust proxy", 1);

// ------------------------------------------------------------
// SECURITY HEADERS
// ------------------------------------------------------------

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

// ------------------------------------------------------------
// CORS
// ------------------------------------------------------------

const allowedOrigin = process.env.CLIENT_URL;

if (!allowedOrigin) {
  throw new Error("CLIENT_URL environment variable is required");
}

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ------------------------------------------------------------
// REQUEST BODY LIMITS
// ------------------------------------------------------------
// SECURITY:
// Keep JSON/urlencoded payloads small to reduce DoS risk.
//
// 10kb is intentionally retained because your normal JSON APIs
// should not require large request bodies.
//
// File uploads using multer/memoryStorage are handled separately
// and are NOT controlled by express.json().
//
// If the University update endpoint is sending a very large JSON
// payload, the route/controller should be fixed rather than
// globally increasing this limit.
// ------------------------------------------------------------

app.use(
  express.json({
    limit: "10kb",
    strict: true,
  }),
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "10kb",
    parameterLimit: 100,
  }),
);

// ------------------------------------------------------------
// COOKIE PARSER
// ------------------------------------------------------------

app.use(cookieParser());

// ------------------------------------------------------------
// NoSQL INJECTION PROTECTION
// ------------------------------------------------------------

app.use(mongoSanitize());

// ------------------------------------------------------------
// RESPONSE COMPRESSION
// ------------------------------------------------------------

app.use(compression());

// ------------------------------------------------------------
// DEVELOPMENT LOGGING
// ------------------------------------------------------------

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ------------------------------------------------------------
// GLOBAL API RATE LIMIT
// ------------------------------------------------------------
// SECURITY:
// This is a baseline limit. Sensitive routes should have their
// own stricter rate limits.
// ------------------------------------------------------------

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: "draft-7",
    legacyHeaders: false,

    // Do not expose unnecessary internal details.
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
      });
    },
  }),
);

// ------------------------------------------------------------
// HEALTH CHECK
// ------------------------------------------------------------

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
  });
});

// ------------------------------------------------------------
// API ROUTES
// ------------------------------------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/universities", universityRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/brochures", brochureRoutes);

// ------------------------------------------------------------
// 404 HANDLER
// ------------------------------------------------------------

app.all("*", (req, res, next) => {
  next(new ApiError(404, "Route not found"));
});

// ------------------------------------------------------------
// GLOBAL ERROR HANDLER
// IMPORTANT: Must remain AFTER all routes.
// ------------------------------------------------------------

app.use(errorHandler);

// ------------------------------------------------------------
// SERVER
// ------------------------------------------------------------

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(
    `Medico Overseas API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`,
  );
});

module.exports = app;
ApiError.js;

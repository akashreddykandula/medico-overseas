const mongoose = require("mongoose");
const slugify = require("slugify");

// ============================================================
// SECURITY-HARDENED COUNTRY MODEL
// ============================================================
//
// SECURITY:
// - Explicit field types and length limits
// - Numeric min/max boundaries
// - Array size limits
// - Nested object validation
// - Strict schema mode
// - Safe slug generation
// - Prevents excessively large database payloads
//
// Existing field names and application logic are preserved.
// ============================================================

const feeStructureSchema = new mongoose.Schema(
  {
    tuitionPerYear: {
      type: Number,
      default: 0,
      min: 0,
      max: 1000000000,
    },

    hostelPerYear: {
      type: Number,
      default: 0,
      min: 0,
      max: 1000000000,
    },

    messPerYear: {
      type: Number,
      default: 0,
      min: 0,
      max: 1000000000,
    },

    oneTimeCosts: {
      type: Number,
      default: 0,
      min: 0,
      max: 1000000000,
    },

    currency: {
      type: String,
      default: "USD",
      trim: true,
      uppercase: true,
      maxlength: 10,
    },
  },
  { _id: false },
);

// ============================================================
// FAQ SUB-SCHEMA
// ============================================================

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
  },
  { _id: false },
);

// ============================================================
// ADMISSION STEP SUB-SCHEMA
// ============================================================

const admissionStepSchema = new mongoose.Schema(
  {
    step: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
  },
  { _id: false },
);

// ============================================================
// COUNTRY SCHEMA
// ============================================================

const countrySchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------
    // BASIC DESTINATION INFORMATION
    // ----------------------------------------------------------

    name: {
      type: String,
      required: [true, "Country name is required"],
      unique: true,
      trim: true,
      maxlength: 150,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
      index: true,
    },

    // ----------------------------------------------------------
    // IMAGES
    // ----------------------------------------------------------
    //
    // SECURITY:
    // Length limits prevent oversized URL/publicId values.
    // Actual file validation remains in the upload layer.
    // ----------------------------------------------------------

    flagImage: {
      url: {
        type: String,
        trim: true,
        maxlength: 2048,
      },

      publicId: {
        type: String,
        trim: true,
        maxlength: 500,
      },
    },

    heroImage: {
      url: {
        type: String,
        trim: true,
        maxlength: 2048,
      },

      publicId: {
        type: String,
        trim: true,
        maxlength: 500,
      },
    },

    // ----------------------------------------------------------
    // DESCRIPTION
    // ----------------------------------------------------------

    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: 300,
    },

    overview: {
      type: String,
      required: [true, "Country overview is required"],
      trim: true,
      maxlength: 30000,
    },

    // ----------------------------------------------------------
    // FEES
    // ----------------------------------------------------------

    fees: {
      type: feeStructureSchema,
      default: () => ({}),
    },

    // ----------------------------------------------------------
    // COUNTRY QUICK FACTS
    // ----------------------------------------------------------

    capital: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    currency: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 10,
    },

    flightDuration: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    timeDifference: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    internationalAirports: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // ----------------------------------------------------------
    // MBBS PROGRAM INFORMATION
    // ----------------------------------------------------------

    durationYears: {
      type: Number,
      default: 6,
      min: 1,
      max: 20,
    },

    mediumOfInstruction: {
      type: String,
      default: "English",
      trim: true,
      maxlength: 100,
    },

    // ----------------------------------------------------------
    // ELIGIBILITY
    // ----------------------------------------------------------

    eligibility: {
      minAge: {
        type: Number,
        default: 17,
        min: 1,
        max: 100,
      },

      neetRequired: {
        type: Boolean,
        default: true,
      },

      minAcademicPercent: {
        type: Number,
        default: 50,
        min: 0,
        max: 100,
      },

      notes: {
        type: String,
        trim: true,
        maxlength: 5000,
      },
    },

    // ----------------------------------------------------------
    // ADMISSION PROCESS
    // ----------------------------------------------------------
    //
    // SECURITY:
    // Limit the number of admission steps to prevent oversized
    // nested payloads.
    // ----------------------------------------------------------

    admissionProcess: {
      type: [admissionStepSchema],
      default: [],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length <= 50;
        },
        message: "A country cannot have more than 50 admission steps",
      },
    },

    // ----------------------------------------------------------
    // REQUIRED DOCUMENTS
    // ----------------------------------------------------------

    requiredDocuments: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 300,
        },
      ],
      default: [],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length <= 50;
        },
        message: "A country cannot have more than 50 required documents",
      },
    },

    // ----------------------------------------------------------
    // VISA
    // ----------------------------------------------------------

    visaProcess: {
      type: String,
      trim: true,
      maxlength: 15000,
    },

    // ----------------------------------------------------------
    // LIVING COST
    // ----------------------------------------------------------

    livingCost: {
      monthlyEstimate: {
        type: Number,
        min: 0,
        max: 1000000000,
      },

      currency: {
        type: String,
        default: "USD",
        trim: true,
        uppercase: true,
        maxlength: 10,
      },

      notes: {
        type: String,
        trim: true,
        maxlength: 5000,
      },
    },

    // ----------------------------------------------------------
    // STUDENT LIFE
    // ----------------------------------------------------------

    climateNotes: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    studentLifeNotes: {
      type: String,
      trim: true,
      maxlength: 10000,
    },

    // ----------------------------------------------------------
    // FAQS
    // ----------------------------------------------------------

    faqs: {
      type: [faqSchema],
      default: [],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length <= 100;
        },
        message: "A country cannot have more than 100 FAQs",
      },
    },

    // ----------------------------------------------------------
    // PUBLISHING
    // ----------------------------------------------------------

    isPublished: {
      type: Boolean,
      default: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
      max: 1000000,
    },

    // ----------------------------------------------------------
    // SEO
    // ----------------------------------------------------------

    metaTitle: {
      type: String,
      trim: true,
      maxlength: 160,
    },

    metaDescription: {
      type: String,
      trim: true,
      maxlength: 320,
    },

    // ----------------------------------------------------------
    // DENORMALIZED DATA
    // ----------------------------------------------------------
    //
    // universityCount is maintained by the university
    // controller when universities are created/deleted/moved.
    // ----------------------------------------------------------

    universityCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 1000000000,
    },
  },

  {
    timestamps: true,

    // ----------------------------------------------------------
    // SECURITY:
    // Reject fields that are not explicitly defined in this
    // schema instead of silently storing arbitrary properties.
    // ----------------------------------------------------------

    strict: true,
  },
);

// ============================================================
// AUTO-GENERATE SLUG
// ============================================================
//
// Existing manually supplied slugs are preserved.
// Automatically generated slugs come from the country name.
//
// This preserves the existing application behavior.
// ============================================================

countrySchema.pre("validate", function setSlug(next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  next();
});

// ============================================================
// INDEXES
// ============================================================

// Public country listing / ordering.
countrySchema.index({
  isPublished: 1,
  displayOrder: 1,
});

// `name` and `slug` already have unique indexes declared above.

// ============================================================
// EXPORT MODEL
// ============================================================

module.exports = mongoose.model("Country", countrySchema);

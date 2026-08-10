const mongoose = require("mongoose");
const slugify = require("slugify");

// ============================================================
// UNIVERSITY SCHEMA
// ============================================================
//
// SECURITY HARDENING:
// - Strict field definitions
// - String length limits
// - Numeric boundaries
// - Boolean/type validation through Mongoose
// - Array size limits
// - Nested object protection
// - Safe slug generation
// - MongoDB ObjectId validation through schema type
//
// IMPORTANT:
// Existing application fields and their names are preserved.
// No business logic has been removed.
// ============================================================

const universitySchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------
    // BASIC INFORMATION
    // ----------------------------------------------------------

    name: {
      type: String,
      required: [true, "University name is required"],
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
      index: true,
    },

    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: [true, "Country is required"],
      index: true,
    },

    // ----------------------------------------------------------
    // IMAGES
    // ----------------------------------------------------------
    //
    // SECURITY:
    // Length limits prevent unnecessarily large strings from
    // being stored.
    //
    // Actual file/MIME/signature validation is handled by the
    // upload middleware/controller.
    // ----------------------------------------------------------

    logo: {
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

    images: {
      type: [
        {
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
      ],

      // SECURITY:
      // Prevent an attacker from submitting an excessively large
      // images array and consuming database/storage resources.
      default: [],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length <= 50;
        },
        message: "A university cannot have more than 50 images",
      },
    },

    // ----------------------------------------------------------
    // RECOGNITION / BASIC UNIVERSITY DETAILS
    // ----------------------------------------------------------

    nmcApproved: {
      type: Boolean,
      default: true,
    },

    whoRecognized: {
      type: Boolean,
      default: true,
    },

    establishedYear: {
      type: Number,
      min: 1000,
      max: new Date().getFullYear(),
    },

    durationYears: {
      type: Number,
      default: 6,
      min: 1,
      max: 20,
    },

    mediumOfInstruction: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "English",
    },

    hostelAvailable: {
      type: Boolean,
      default: true,
    },

    // ----------------------------------------------------------
    // FEES
    // ----------------------------------------------------------
    //
    // SECURITY:
    // Numeric bounds prevent negative values and unreasonable
    // values from being stored.
    // ----------------------------------------------------------

    fees: {
      tuitionPerYear: {
        type: Number,
        required: [true, "Tuition fee is required"],
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
        trim: true,
        uppercase: true,
        maxlength: 10,
        default: "USD",
      },
    },

    // ----------------------------------------------------------
    // CONTENT
    // ----------------------------------------------------------

    description: {
      type: String,
      trim: true,
      maxlength: 20000,
    },

    highlights: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 500,
        },
      ],

      // SECURITY:
      // Prevent an excessively large number of highlight entries.
      default: [],

      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length <= 50;
        },
        message: "A university cannot have more than 50 highlights",
      },
    },

    // ----------------------------------------------------------
    // STATUS
    // ----------------------------------------------------------

    isPartner: {
      type: Boolean,
      default: true,
    },

    isPublished: {
      type: Boolean,
      default: true,
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
  },

  {
    timestamps: true,

    // ----------------------------------------------------------
    // SECURITY:
    // Reject fields that are not defined in this schema instead
    // of silently storing arbitrary properties.
    // ----------------------------------------------------------

    strict: true,
  },
);

// ============================================================
// SLUG GENERATION
// ============================================================
//
// Existing manually supplied slugs are preserved.
// Automatically generated slugs are derived from the university
// name using slugify.
//
// This preserves the existing application behavior.
// ============================================================

universitySchema.pre("validate", function setSlug(next) {
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
//
// Useful for public country-based university listings.
// ============================================================

universitySchema.index({
  country: 1,
  isPublished: 1,
});

// `slug` already has `unique: true` and `index: true` above.
// No duplicate slug index is created here.

// ============================================================
// EXPORT MODEL
// ============================================================

module.exports = mongoose.model("University", universitySchema);

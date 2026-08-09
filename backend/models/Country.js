const mongoose = require("mongoose");
const slugify = require("slugify");

const feeStructureSchema = new mongoose.Schema(
  {
    tuitionPerYear: { type: Number, default: 0 },
    hostelPerYear: { type: Number, default: 0 },
    messPerYear: { type: Number, default: 0 },
    oneTimeCosts: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
  },
  { _id: false },
);

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false },
);

const admissionStepSchema = new mongoose.Schema(
  {
    step: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false },
);

const countrySchema = new mongoose.Schema(
  {
    // Basic destination information
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },

    flagImage: {
      url: String,
      publicId: String,
    },

    heroImage: {
      url: String,
      publicId: String,
    },

    shortDescription: {
      type: String,
      required: true,
      maxlength: 300,
    },

    overview: {
      type: String,
      required: true,
    },
    fees: {
      type: feeStructureSchema,
      default: () => ({}),
    },

    // Country Quick Facts
    capital: {
      type: String,
      trim: true,
    },

    currency: {
      type: String,
      trim: true,
    },

    flightDuration: {
      type: String,
      trim: true,
    },

    timeDifference: {
      type: String,
      trim: true,
    },

    internationalAirports: {
      type: String,
      trim: true,
    },

    // MBBS program information
    durationYears: {
      type: Number,
      default: 6,
    },

    mediumOfInstruction: {
      type: String,
      default: "English",
      trim: true,
    },

    eligibility: {
      minAge: {
        type: Number,
        default: 17,
      },

      neetRequired: {
        type: Boolean,
        default: true,
      },

      minAcademicPercent: {
        type: Number,
        default: 50,
      },

      notes: {
        type: String,
      },
    },

    // --------------------------------------------------
    // ADMISSION PROCESS
    // --------------------------------------------------
    admissionProcess: [admissionStepSchema],

    // --------------------------------------------------
    // REQUIRED DOCUMENTS
    // --------------------------------------------------
    requiredDocuments: [
      {
        type: String,
        trim: true,
      },
    ],

    // --------------------------------------------------
    // VISA
    // --------------------------------------------------
    visaProcess: {
      type: String,
    },

    // --------------------------------------------------
    // LIVING COST
    // --------------------------------------------------
    livingCost: {
      monthlyEstimate: {
        type: Number,
      },

      currency: {
        type: String,
        default: "USD",
      },

      notes: {
        type: String,
      },
    },

    // --------------------------------------------------
    // STUDENT LIFE
    // --------------------------------------------------
    climateNotes: {
      type: String,
    },

    studentLifeNotes: {
      type: String,
    },

    // --------------------------------------------------
    // FAQs
    // --------------------------------------------------
    faqs: [faqSchema],

    // --------------------------------------------------
    // PUBLISHING
    // --------------------------------------------------
    isPublished: {
      type: Boolean,
      default: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    // --------------------------------------------------
    // SEO
    // --------------------------------------------------
    metaTitle: {
      type: String,
    },

    metaDescription: {
      type: String,
    },

    // --------------------------------------------------
    // DENORMALIZED DATA
    // --------------------------------------------------
    universityCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// --------------------------------------------------
// AUTO-GENERATE SLUG
// --------------------------------------------------
countrySchema.pre("validate", function setSlug(next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }

  next();
});

// --------------------------------------------------
// INDEXES
// --------------------------------------------------
countrySchema.index({ isPublished: 1, displayOrder: 1 });

module.exports = mongoose.model("Country", countrySchema);

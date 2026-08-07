const mongoose = require('mongoose');
const slugify = require('slugify');

const feeStructureSchema = new mongoose.Schema(
  {
    tuitionPerYear: { type: Number, required: true },
    hostelPerYear: { type: Number, default: 0 },
    messPerYear: { type: Number, default: 0 },
    oneTimeCosts: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const countrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    flagImage: { url: String, publicId: String },
    heroImage: { url: String, publicId: String },
    shortDescription: { type: String, required: true, maxlength: 300 },
    overview: { type: String, required: true },

    eligibility: {
      minAge: { type: Number, default: 17 },
      neetRequired: { type: Boolean, default: true },
      minAcademicPercent: { type: Number, default: 50 },
      notes: { type: String },
    },

    admissionProcess: [{ step: String, description: String }],
    requiredDocuments: [{ type: String }],
    visaProcess: { type: String },

    livingCost: {
      monthlyEstimate: { type: Number },
      currency: { type: String, default: 'USD' },
      notes: { type: String },
    },
    climateNotes: { type: String },
    studentLifeNotes: { type: String },

    faqs: [faqSchema],

    isPublished: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },

    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },

    universityCount: { type: Number, default: 0 }, // denormalized for quick display
  },
  { timestamps: true }
);

countrySchema.pre('validate', function setSlug(next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

countrySchema.index({ slug: 1 });
countrySchema.index({ isPublished: 1, displayOrder: 1 });

module.exports = mongoose.model('Country', countrySchema);

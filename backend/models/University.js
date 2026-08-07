const mongoose = require('mongoose');
const slugify = require('slugify');

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },

    logo: { url: String, publicId: String },
    images: [{ url: String, publicId: String }],

    nmcApproved: { type: Boolean, default: true },
    whoRecognized: { type: Boolean, default: true },
    establishedYear: { type: Number },
    durationYears: { type: Number, default: 6 },
    mediumOfInstruction: { type: String, default: 'English' },
    hostelAvailable: { type: Boolean, default: true },

    fees: {
      tuitionPerYear: { type: Number, required: true },
      hostelPerYear: { type: Number, default: 0 },
      messPerYear: { type: Number, default: 0 },
      oneTimeCosts: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },

    description: { type: String },
    highlights: [{ type: String }],
    isPartner: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: true },

    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

universitySchema.pre('validate', function setSlug(next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

universitySchema.index({ country: 1, isPublished: 1 });
universitySchema.index({ slug: 1 });

module.exports = mongoose.model('University', universitySchema);

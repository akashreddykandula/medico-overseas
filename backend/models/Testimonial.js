const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    photo: {
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

    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
    },

    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },

    quote: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    videoUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    isFeaturedOnHomepage: {
      type: Boolean,
      default: false,
    },

    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
      max: 100000,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

testimonialSchema.index({
  isPublished: 1,
  isFeaturedOnHomepage: 1,
});

testimonialSchema.index({
  country: 1,
  university: 1,
});

module.exports = mongoose.model("Testimonial", testimonialSchema);

const mongoose = require("mongoose");

const GALLERY_CATEGORIES = [
  "campus",
  "hostel",
  "student_life",
  "office",
  "events",
  "graduation",
];

const galleryItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    image: {
      url: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2048,
      },

      publicId: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
      },
    },

    category: {
      type: String,
      enum: GALLERY_CATEGORIES,
      default: "campus",
    },

    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
    },

    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },

    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
      max: 100000,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

galleryItemSchema.index({
  category: 1,
  isPublished: 1,
});

galleryItemSchema.index({
  country: 1,
  university: 1,
});

galleryItemSchema.statics.GALLERY_CATEGORIES = GALLERY_CATEGORIES;

module.exports = mongoose.model("GalleryItem", galleryItemSchema);

const mongoose = require("mongoose");
const slugify = require("slugify");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      minlength: [3, "Blog title must be at least 3 characters"],
      maxlength: [200, "Blog title cannot exceed 200 characters"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [220, "Slug cannot exceed 220 characters"],
    },

    excerpt: {
      type: String,
      required: [true, "Blog excerpt is required"],
      trim: true,
      maxlength: [300, "Blog excerpt cannot exceed 300 characters"],
    },

    // Rich-text HTML.
    // Must be sanitized by the controller before saving.
    body: {
      type: String,
      required: [true, "Blog body is required"],
      maxlength: [100000, "Blog body cannot exceed 100KB"],
    },

    featuredImage: {
      url: {
        type: String,
        trim: true,
        maxlength: [2048, "Image URL is too long"],
      },
      publicId: {
        type: String,
        trim: true,
        maxlength: [500, "Image public ID is too long"],
      },
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Blog author is required"],
    },

    category: {
      type: String,
      enum: {
        values: ["country", "exam", "general", "visa", "scholarship"],
        message: "Invalid blog category",
      },
      default: "general",
    },

    relatedCountry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
    },

    tags: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true,
          maxlength: [50, "Each tag cannot exceed 50 characters"],
        },
      ],
      validate: {
        validator: (tags) => Array.isArray(tags) && tags.length <= 20,
        message: "A blog cannot have more than 20 tags",
      },
    },

    status: {
      type: String,
      enum: {
        values: ["draft", "scheduled", "published"],
        message: "Invalid blog status",
      },
      default: "draft",
    },

    publishedAt: {
      type: Date,
    },

    scheduledFor: {
      type: Date,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
      min: [0, "Views cannot be negative"],
    },

    metaTitle: {
      type: String,
      trim: true,
      maxlength: [70, "Meta title cannot exceed 70 characters"],
    },

    metaDescription: {
      type: String,
      trim: true,
      maxlength: [170, "Meta description cannot exceed 170 characters"],
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

// ============================================================
// SLUG GENERATION
// ============================================================

blogSchema.pre("validate", function setSlug(next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  next();
});

// ============================================================
// PUBLISHED DATE
// ============================================================

blogSchema.pre("save", function setPublishedAt(next) {
  if (
    this.isModified("status") &&
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }

  next();
});

// ============================================================
// INDEXES
// ============================================================

blogSchema.index({ slug: 1 }, { unique: true });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({
  title: "text",
  excerpt: "text",
  body: "text",
});

module.exports = mongoose.model("Blog", blogSchema);

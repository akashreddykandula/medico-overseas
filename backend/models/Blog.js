const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    excerpt: { type: String, required: true, maxlength: 300 },
    body: { type: String, required: true }, // rich-text HTML from editor

    featuredImage: { url: String, publicId: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    category: {
      type: String,
      enum: ['country', 'exam', 'general', 'visa', 'scholarship'],
      default: 'general',
    },
    relatedCountry: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    tags: [{ type: String, trim: true, lowercase: true }],

    status: { type: String, enum: ['draft', 'scheduled', 'published'], default: 'draft' },
    publishedAt: { type: Date },
    scheduledFor: { type: Date },

    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },

    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

blogSchema.pre('validate', function setSlug(next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

blogSchema.pre('save', function setPublishedAt(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ title: 'text', excerpt: 'text', body: 'text' });

module.exports = mongoose.model('Blog', blogSchema);

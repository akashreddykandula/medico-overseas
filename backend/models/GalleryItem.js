const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    category: {
      type: String,
      enum: ['campus', 'hostel', 'student_life', 'office', 'events', 'graduation'],
      default: 'campus',
    },
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    displayOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

galleryItemSchema.index({ category: 1, isPublished: 1 });

module.exports = mongoose.model('GalleryItem', galleryItemSchema);

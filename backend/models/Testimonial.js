const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true, trim: true },
    photo: { url: String, publicId: String },
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    quote: { type: String, required: true, maxlength: 1000 },
    videoUrl: { type: String }, // optional YouTube/Vimeo link
    rating: { type: Number, min: 1, max: 5, default: 5 },
    isPublished: { type: Boolean, default: true },
    isFeaturedOnHomepage: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

testimonialSchema.index({ isPublished: 1, isFeaturedOnHomepage: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);

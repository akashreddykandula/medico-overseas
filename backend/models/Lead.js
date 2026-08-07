const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    city: { type: String, trim: true },
    interestedCountry: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    neetScore: { type: Number },
    message: { type: String },

    source: {
      type: String,
      enum: ['homepage', 'destination_page', 'exam_page', 'contact_page', 'blog', 'referral', 'other'],
      default: 'other',
    },
    sourcePageUrl: { type: String },

    status: {
      type: String,
      enum: ['new', 'contacted', 'interested', 'follow_up', 'converted', 'rejected'],
      default: 'new',
    },
    assignedCounsellor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    followUpDate: { type: Date },
    notes: [noteSchema],
    statusHistory: [statusHistorySchema],

    isSpam: { type: Boolean, default: false },
  },
  { timestamps: true }
);

leadSchema.pre('save', function trackStatusChange(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status });
  }
  next();
});

leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ assignedCounsellor: 1 });
leadSchema.index({ phone: 1 });

module.exports = mongoose.model('Lead', leadSchema);

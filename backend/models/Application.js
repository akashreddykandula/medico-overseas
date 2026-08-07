const mongoose = require('mongoose');

const DOCUMENT_TYPES = [
  'passport',
  'aadhaar',
  'pan',
  '10th_memo',
  '12th_memo',
  'neet_scorecard',
  'passport_photo',
  'medical_certificate',
  'offer_letter',
  'visa_documents',
  'other',
];

const APPLICATION_STAGES = [
  'application_submitted',
  'documents_verified',
  'university_shortlisted',
  'application_sent',
  'offer_letter',
  'admission_confirmed',
  'visa_processing',
  'visa_approved',
  'flight_booked',
  'departure',
  'university_reached',
  'completed',
];

const documentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: DOCUMENT_TYPES, required: true },
    fileName: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

const stageHistorySchema = new mongoose.Schema(
  {
    stage: { type: String, enum: APPLICATION_STAGES, required: true },
    reachedAt: { type: Date, default: Date.now },
    estimatedCompletionDate: { type: Date },
    counsellorRemark: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const notificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    interestedCountry: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    targetUniversity: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    assignedCounsellor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    currentStage: { type: String, enum: APPLICATION_STAGES, default: 'application_submitted' },
    stageHistory: [stageHistorySchema],

    documents: [documentSchema],
    notifications: [notificationSchema],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

applicationSchema.pre('save', function trackStage(next) {
  if (this.isModified('currentStage')) {
    this.stageHistory.push({ stage: this.currentStage });
    this.notifications.push({
      message: `Your application has moved to: ${this.currentStage.replace(/_/g, ' ')}`,
    });
  }
  next();
});

applicationSchema.index({ student: 1 });
applicationSchema.index({ assignedCounsellor: 1, currentStage: 1 });

applicationSchema.statics.DOCUMENT_TYPES = DOCUMENT_TYPES;
applicationSchema.statics.APPLICATION_STAGES = APPLICATION_STAGES;

module.exports = mongoose.model('Application', applicationSchema);

const mongoose = require("mongoose");

// ============================================================
// ENUMS
// ============================================================

const DOCUMENT_TYPES = [
  "passport",
  "aadhaar",
  "pan",
  "10th_memo",
  "12th_memo",
  "neet_scorecard",
  "passport_photo",
  "medical_certificate",
  "offer_letter",
  "visa_documents",
  "other",
];

const APPLICATION_STAGES = [
  "application_submitted",
  "documents_required",
  "documents_verified",
  "university_shortlisted",
  "application_sent",
  "offer_letter",
  "admission_confirmed",
  "visa_processing",
  "visa_approved",
  "flight_booked",
  "departure",
  "university_reached",
  "completed",
];

// ============================================================
// DOCUMENT SCHEMA
// ============================================================

const documentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: DOCUMENT_TYPES,
      required: true,
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
      validate: {
        validator: (value) => {
          if (typeof value !== "string" || !value.trim()) return false;

          try {
            const parsed = new URL(value);

            // Documents are expected to come from HTTPS URLs.
            return parsed.protocol === "https:";
          } catch {
            return false;
          }
        },
        message: "Invalid document URL",
      },
    },

    publicId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
      validate: {
        validator: (value) => {
          if (typeof value !== "string" || !value.trim()) return false;

          // Prevent MongoDB-style operators/dot notation from
          // accidentally entering persisted Cloudinary IDs.
          return !value.includes("$") && !value.includes("..");
        },
        message: "Invalid document public ID",
      },
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);
// ============================================================
// REQUIRED DOCUMENT SCHEMA
// ============================================================

const requiredDocumentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: DOCUMENT_TYPES,
      required: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    instructions: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    required: {
      type: Boolean,
      default: true,
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    _id: true,
    strict: true,
  },
);

// ============================================================
// STAGE HISTORY SCHEMA
// ============================================================

const stageHistorySchema = new mongoose.Schema(
  {
    stage: {
      type: String,
      enum: APPLICATION_STAGES,
      required: true,
      trim: true,
    },

    reachedAt: {
      type: Date,
      default: Date.now,
    },

    estimatedCompletionDate: {
      type: Date,
    },

    counsellorRemark: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    _id: false,
    strict: true,
  },
);

// ============================================================
// NOTIFICATION SCHEMA
// ============================================================

const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
    strict: true,
  },
);

// ============================================================
// APPLICATION SCHEMA
// ============================================================

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    interestedCountry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      index: true,
    },

    targetUniversity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      index: true,
    },

    assignedCounsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    currentStage: {
      type: String,
      enum: APPLICATION_STAGES,
      default: "application_submitted",
      index: true,
      trim: true,
    },

    stageHistory: {
      type: [stageHistorySchema],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length <= 100,
        message: "Too many stage history entries",
      },
    },

    documents: {
      type: [documentSchema],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length <= 50,
        message: "Too many documents",
      },
    },
    requiredDocuments: {
      type: [requiredDocumentSchema],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length <= 50,
        message: "Too many required document entries",
      },
    },
    notifications: {
      type: [notificationSchema],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length <= 500,
        message: "Too many notifications",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

// ============================================================
// STAGE TRACKING
// ============================================================

applicationSchema.pre("save", function trackStage(next) {
  if (this.isModified("currentStage")) {
    this.stageHistory.push({
      stage: this.currentStage,
      counsellorRemark: this._pendingCounsellorRemark || undefined,
      estimatedCompletionDate:
        this._pendingEstimatedCompletionDate || undefined,
      updatedBy: this._pendingUpdatedBy || undefined,
    });

    this.notifications.push({
      message: `Your application has moved to: ${this.currentStage.replace(
        /_/g,
        " ",
      )}`,
    });

    // Remove temporary values after they have been used.
    this._pendingCounsellorRemark = undefined;
    this._pendingEstimatedCompletionDate = undefined;
    this._pendingUpdatedBy = undefined;
  }

  next();
});

// ============================================================
// INDEXES
// ============================================================

applicationSchema.index({
  assignedCounsellor: 1,
  currentStage: 1,
});

// Prevent duplicate active applications for the same student.
// Existing controller checks remain unchanged.
applicationSchema.index(
  { student: 1 },
  {
    unique: true,
    name: "unique_application_per_student",
  },
);

// ============================================================
// STATIC ENUM ACCESS
// ============================================================

applicationSchema.statics.DOCUMENT_TYPES = DOCUMENT_TYPES;
applicationSchema.statics.APPLICATION_STAGES = APPLICATION_STAGES;

// ============================================================
// EXPORT
// ============================================================

module.exports = mongoose.model("Application", applicationSchema);

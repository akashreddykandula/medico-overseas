const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: [
        "new",
        "contacted",
        "interested",
        "follow_up",
        "converted",
        "rejected",
      ],
      maxlength: 50,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },

    city: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    interestedCountry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
    },

    neetScore: {
      type: Number,
      min: 0,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    source: {
      type: String,
      enum: [
        "homepage",
        "destination_page",
        "exam_page",
        "contact_page",
        "blog",
        "referral",
        "other",
      ],
      default: "other",
    },

    sourcePageUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
    },

    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "interested",
        "follow_up",
        "converted",
        "rejected",
      ],
      default: "new",
    },

    assignedCounsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    followUpDate: {
      type: Date,
    },

    notes: {
      type: [noteSchema],
      default: [],
    },

    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },

    isSpam: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

leadSchema.pre("save", function trackStatusChange(next) {
  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
    });
  }

  next();
});

leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ assignedCounsellor: 1 });
leadSchema.index({ phone: 1 });

module.exports = mongoose.model("Lead", leadSchema);

const mongoose = require("mongoose");

const FAQ_CATEGORIES = [
  "general",
  "admission",
  "fees",
  "visa",
  "fmge",
  "nmat",
  "country_specific",
];

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },

    category: {
      type: String,
      enum: FAQ_CATEGORIES,
      default: "general",
    },

    relatedCountry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
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

faqSchema.index({
  category: 1,
  isPublished: 1,
  displayOrder: 1,
});

faqSchema.statics.FAQ_CATEGORIES = FAQ_CATEGORIES;

module.exports = mongoose.model("Faq", faqSchema);

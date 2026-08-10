const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const USER_ROLES = [
  "super_admin",
  "admin",
  "counsellor",
  "content_manager",
  "marketing_manager",
  "student",
];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, "Email cannot exceed 254 characters"],
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },

    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
    },

    // SECURITY:
    // - select:false prevents accidental password exposure in queries.
    // - maxlength prevents unnecessarily expensive password hashing.
    // - Password hashing is handled by the pre-save hook below.
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      maxlength: [128, "Password cannot exceed 128 characters"],
      select: false,
    },

    // SECURITY:
    // Mongoose enum prevents arbitrary roles from being stored.
    // Never trust a role supplied by the frontend.
    role: {
      type: String,
      enum: USER_ROLES,
      default: "student",
      index: true,
    },

    avatar: {
      url: {
        type: String,
        default: "",
        maxlength: 2048,
      },
      publicId: {
        type: String,
        default: "",
        maxlength: 500,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // SECURITY:
    // These authentication secrets are never returned by default.
    emailVerificationToken: {
      type: String,
      select: false,
      maxlength: 128,
    },

    passwordResetToken: {
      type: String,
      select: false,
      maxlength: 128,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    refreshToken: {
      type: String,
      select: false,
      maxlength: 512,
    },

    // ----------------------------------------------------------
    // STUDENT PROFILE
    // ----------------------------------------------------------

    studentProfile: {
      neetScore: {
        type: Number,
        min: [0, "NEET score cannot be negative"],
        max: [1000, "Invalid NEET score"],
      },

      neetRollNumber: {
        type: String,
        trim: true,
        maxlength: [50, "NEET roll number cannot exceed 50 characters"],
      },

      interestedCountry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
      },

      dateOfBirth: {
        type: Date,
      },

      address: {
        type: String,
        trim: true,
        maxlength: [500, "Address cannot exceed 500 characters"],
      },

      city: {
        type: String,
        trim: true,
        maxlength: [100, "City cannot exceed 100 characters"],
      },

      state: {
        type: String,
        trim: true,
        maxlength: [100, "State cannot exceed 100 characters"],
      },

      assignedCounsellor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    // ----------------------------------------------------------
    // STAFF PROFILE
    // ----------------------------------------------------------

    staffProfile: {
      designation: {
        type: String,
        trim: true,
        maxlength: [150, "Designation cannot exceed 150 characters"],
      },

      bio: {
        type: String,
        trim: true,
        maxlength: [2000, "Bio cannot exceed 2000 characters"],
      },

      photo: {
        url: {
          type: String,
          default: "",
          maxlength: 2048,
        },
        publicId: {
          type: String,
          default: "",
          maxlength: 500,
        },
      },

      isPublicTeamMember: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,

    // SECURITY:
    // Prevent unexpected fields from silently becoming part of
    // the Mongoose document.
    strict: true,
  },
);

// ------------------------------------------------------------
// INDEXES
// ------------------------------------------------------------

userSchema.index({ role: 1 });

// email already has a unique index because of unique:true.

// ------------------------------------------------------------
// PASSWORD HASHING
// ------------------------------------------------------------
// SECURITY:
// Passwords are hashed before being stored in MongoDB.
// bcrypt cost 12 provides strong password hashing while remaining
// practical for normal authentication traffic.
//
// IMPORTANT:
// This hook runs only for document save/create operations.
// Password updates using findOneAndUpdate/findByIdAndUpdate()
// must be handled explicitly in the authentication/user controller.
// ------------------------------------------------------------

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------------
// PASSWORD COMPARISON
// ------------------------------------------------------------

userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword,
) {
  if (typeof candidatePassword !== "string" || candidatePassword.length === 0) {
    return false;
  }

  if (!this.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

// ------------------------------------------------------------
// PASSWORD RESET TOKEN
// ------------------------------------------------------------
// SECURITY:
// - Cryptographically secure random token.
// - Only SHA-256 hash is stored in MongoDB.
// - Raw token is returned once to the controller so it can be
//   sent to the user by email.
// - 30-minute expiration limits the attack window.
// ------------------------------------------------------------

userSchema.methods.createPasswordResetToken =
  function createPasswordResetToken() {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    this.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);

    return resetToken;
  };

// ------------------------------------------------------------
// EXPORT
// ------------------------------------------------------------

module.exports = mongoose.model("User", userSchema);

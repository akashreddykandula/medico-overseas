const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: { type: String, trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 8, select: false },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'counsellor', 'content_manager', 'marketing_manager', 'student'],
      default: 'student',
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshToken: { type: String, select: false },

    // Student-specific profile fields (only populated when role === 'student')
    studentProfile: {
      neetScore: { type: Number },
      neetRollNumber: { type: String },
      interestedCountry: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
      dateOfBirth: { type: Date },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      assignedCounsellor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },

    // Staff-specific fields
    staffProfile: {
      designation: { type: String },
      bio: { type: String },
      photo: { url: String, publicId: String },
      isPublicTeamMember: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);

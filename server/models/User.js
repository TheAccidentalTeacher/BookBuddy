const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  settings: {
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'extra-large'],
      default: 'medium',
    },
    colorScheme: {
      type: String,
      enum: ['light', 'dark', 'high-contrast'],
      default: 'light',
    },
    lineSpacing: {
      type: String,
      enum: ['normal', 'relaxed', 'loose'],
      default: 'normal',
    },
  },
  trackedNames: [{
    name: String,
    type: {
      type: String,
      enum: ['character', 'place', 'other'],
      default: 'other',
    },
    firstAppearance: {
      chapterId: mongoose.Schema.Types.ObjectId,
      chapterNumber: Number,
    },
    variants: [String], // Different spellings/capitalizations
  }],
  feedback: [{
    chapterId: mongoose.Schema.Types.ObjectId,
    correctionId: String,
    type: {
      type: String,
      enum: ['shouldnt-flag', 'missed-issue', 'general'],
    },
    comment: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  return user;
};

module.exports = mongoose.model('User', userSchema);

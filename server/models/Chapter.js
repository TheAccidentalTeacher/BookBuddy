const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
  start: Number,
  end: Number,
  type: {
    type: String,
    enum: ['repetition', 'awkward-phrasing', 'inconsistency', 'correction'],
    required: true,
  },
  text: String,
  reason: String,
  suggestion: String,
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
});

const correctionSchema = new mongoose.Schema({
  original: String,
  corrected: String,
  type: {
    type: String,
    enum: ['typo', 'spelling', 'punctuation', 'quotation', 'grammar'],
    required: true,
  },
  position: {
    start: Number,
    end: Number,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8,
  },
});

const chapterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Chapter title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  content: {
    type: String,
    required: [true, 'Chapter content is required'],
  },
  originalContent: {
    type: String,
    required: true,
  },
  chapterNumber: {
    type: Number,
    required: true,
  },
  wordCount: {
    type: Number,
    default: 0,
  },
  highlights: [highlightSchema],
  corrections: [correctionSchema],
  summary: {
    corrections: [String],
    literaryFeedback: String,
    awkwardPhrases: [{
      phrase: String,
      suggestion: String,
      position: {
        start: Number,
        end: Number,
      },
    }],
    inconsistencies: [{
      issue: String,
      details: String,
      references: [String],
    }],
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'error'],
    default: 'pending',
  },
  processingError: String,
  aiInteractions: [{
    prompt: String,
    response: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ['correction', 'analysis', 'consistency', 'summary'],
    },
    tokenUsage: {
      prompt: Number,
      completion: Number,
      total: Number,
    },
  }],
  extractedNames: [{
    name: String,
    type: {
      type: String,
      enum: ['character', 'place', 'other'],
    },
    positions: [{
      start: Number,
      end: Number,
    }],
    confidence: Number,
  }],
}, {
  timestamps: true,
});

// Index for efficient queries
chapterSchema.index({ userId: 1, chapterNumber: 1 });
chapterSchema.index({ userId: 1, createdAt: -1 });

// Pre-save middleware to calculate word count
chapterSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Simple word count (splits on whitespace and filters empty strings)
    this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;
  }
  next();
});

module.exports = mongoose.model('Chapter', chapterSchema);

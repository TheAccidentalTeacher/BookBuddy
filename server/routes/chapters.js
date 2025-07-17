const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Chapter = require('../models/Chapter');
const User = require('../models/User');
const aiService = require('../services/aiService');

const router = express.Router();

// @route   POST /api/chapters
// @desc    Create and process a new chapter
// @access  Private
router.post('/', auth, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be under 200 characters'),
  body('content').isLength({ min: 1 }).withMessage('Content is required'),
  body('chapterNumber').isInt({ min: 1 }).withMessage('Chapter number must be a positive integer'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { title, content, chapterNumber } = req.body;

    // Check if chapter number already exists for this user
    const existingChapter = await Chapter.findOne({
      userId: req.user._id,
      chapterNumber,
    });

    if (existingChapter) {
      return res.status(400).json({
        message: 'Chapter number already exists',
      });
    }

    // Create chapter with initial data
    const chapter = new Chapter({
      userId: req.user._id,
      title,
      content,
      originalContent: content,
      chapterNumber,
      processingStatus: 'processing',
    });

    await chapter.save();

    // Process the chapter asynchronously
    processChapterAsync(chapter._id, req.user._id);

    res.status(201).json({
      message: 'Chapter created and processing started',
      chapter: {
        id: chapter._id,
        title: chapter.title,
        chapterNumber: chapter.chapterNumber,
        wordCount: chapter.wordCount,
        processingStatus: chapter.processingStatus,
        createdAt: chapter.createdAt,
      },
    });
  } catch (error) {
    console.error('Create chapter error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Async processing function
async function processChapterAsync(chapterId, userId) {
  try {
    const chapter = await Chapter.findById(chapterId);
    const user = await User.findById(userId);
    
    if (!chapter || !user) {
      throw new Error('Chapter or user not found');
    }

    // Get previous chapters for consistency checking
    const previousChapters = await Chapter.find({
      userId,
      chapterNumber: { $lt: chapter.chapterNumber },
    }).sort({ chapterNumber: 1 });

    // Step 1: Correct text
    const correctionResult = await aiService.correctText(chapter.content);
    
    chapter.content = correctionResult.correctedText;
    chapter.corrections = correctionResult.corrections;
    chapter.aiInteractions.push({
      prompt: 'Text correction',
      response: JSON.stringify(correctionResult),
      type: 'correction',
      tokenUsage: correctionResult.tokenUsage,
    });

    // Step 2: Detect repetitions
    const repetitions = aiService.detectRepetitions(chapter.content);
    
    // Step 3: Detect awkward phrasing
    const awkwardResult = await aiService.detectAwkwardPhrasing(chapter.content);
    
    chapter.aiInteractions.push({
      prompt: 'Awkward phrasing detection',
      response: JSON.stringify(awkwardResult),
      type: 'analysis',
      tokenUsage: awkwardResult.tokenUsage,
    });

    // Step 4: Extract names and places
    const extractedNames = aiService.extractNames(chapter.content);
    chapter.extractedNames = extractedNames;

    // Step 5: Check consistency
    const inconsistencies = aiService.checkConsistency(
      chapter,
      previousChapters,
      user.trackedNames
    );

    // Step 6: Create highlights
    const highlights = [];

    // Add repetition highlights
    repetitions.forEach(rep => {
      rep.positions.forEach(pos => {
        highlights.push({
          start: pos.start,
          end: pos.end,
          type: 'repetition',
          text: pos.word,
          reason: rep.reason,
          severity: 'medium',
        });
      });
    });

    // Add awkward phrasing highlights
    awkwardResult.phrases.forEach(phrase => {
      highlights.push({
        start: phrase.start,
        end: phrase.end,
        type: 'awkward-phrasing',
        text: phrase.phrase,
        reason: phrase.reason,
        suggestion: phrase.suggestion,
        severity: 'medium',
      });
    });

    // Add inconsistency highlights
    inconsistencies.forEach(inconsistency => {
      if (inconsistency.positions) {
        inconsistency.positions.forEach(pos => {
          highlights.push({
            start: pos.start,
            end: pos.end,
            type: 'inconsistency',
            text: chapter.content.substring(pos.start, pos.end),
            reason: inconsistency.issue,
            severity: inconsistency.severity || 'medium',
          });
        });
      }
    });

    chapter.highlights = highlights;

    // Step 7: Generate summary
    const summary = await aiService.generateSummary(
      chapter,
      correctionResult.corrections,
      awkwardResult.phrases,
      inconsistencies
    );

    chapter.summary = summary;
    chapter.aiInteractions.push({
      prompt: 'Summary generation',
      response: JSON.stringify(summary),
      type: 'summary',
      tokenUsage: summary.tokenUsage,
    });

    // Step 8: Update user's tracked names
    const newTrackedNames = [];
    extractedNames.forEach(name => {
      const existing = user.trackedNames.find(t => 
        t.name.toLowerCase() === name.name.toLowerCase()
      );
      
      if (!existing) {
        newTrackedNames.push({
          name: name.name,
          type: name.type,
          firstAppearance: {
            chapterId: chapter._id,
            chapterNumber: chapter.chapterNumber,
          },
          variants: [name.name],
        });
      }
    });

    if (newTrackedNames.length > 0) {
      user.trackedNames.push(...newTrackedNames);
      await user.save();
    }

    chapter.processingStatus = 'completed';
    await chapter.save();

  } catch (error) {
    console.error('Chapter processing error:', error);
    
    // Update chapter with error status
    await Chapter.findByIdAndUpdate(chapterId, {
      processingStatus: 'error',
      processingError: error.message,
    });
  }
}

// @route   GET /api/chapters
// @desc    Get user's chapters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    
    const chapters = await Chapter.find({ userId: req.user._id })
      .select('title chapterNumber wordCount processingStatus createdAt updatedAt')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Chapter.countDocuments({ userId: req.user._id });

    res.json({
      chapters,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Get chapters error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/chapters/:id
// @desc    Get a specific chapter
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const chapter = await Chapter.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!chapter) {
      return res.status(404).json({
        message: 'Chapter not found',
      });
    }

    res.json({ chapter });
  } catch (error) {
    console.error('Get chapter error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   PUT /api/chapters/:id
// @desc    Update a chapter
// @access  Private
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('content').optional().isLength({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { title, content } = req.body;
    const updateFields = {};

    if (title !== undefined) updateFields.title = title;
    if (content !== undefined) {
      updateFields.content = content;
      updateFields.processingStatus = 'pending';
    }

    const chapter = await Chapter.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateFields,
      { new: true }
    );

    if (!chapter) {
      return res.status(404).json({
        message: 'Chapter not found',
      });
    }

    // If content was updated, reprocess the chapter
    if (content !== undefined) {
      processChapterAsync(chapter._id, req.user._id);
    }

    res.json({
      message: 'Chapter updated successfully',
      chapter,
    });
  } catch (error) {
    console.error('Update chapter error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   DELETE /api/chapters/:id
// @desc    Delete a chapter
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const chapter = await Chapter.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!chapter) {
      return res.status(404).json({
        message: 'Chapter not found',
      });
    }

    res.json({
      message: 'Chapter deleted successfully',
    });
  } catch (error) {
    console.error('Delete chapter error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/chapters/:id/status
// @desc    Get chapter processing status
// @access  Private
router.get('/:id/status', auth, async (req, res) => {
  try {
    const chapter = await Chapter.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select('processingStatus processingError updatedAt');

    if (!chapter) {
      return res.status(404).json({
        message: 'Chapter not found',
      });
    }

    res.json({
      status: chapter.processingStatus,
      error: chapter.processingError,
      lastUpdated: chapter.updatedAt,
    });
  } catch (error) {
    console.error('Get chapter status error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;

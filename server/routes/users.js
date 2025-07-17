const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @route   PUT /api/users/settings
// @desc    Update user settings
// @access  Private
router.put('/settings', auth, [
  body('fontSize').optional().isIn(['small', 'medium', 'large', 'extra-large']),
  body('colorScheme').optional().isIn(['light', 'dark', 'high-contrast']),
  body('lineSpacing').optional().isIn(['normal', 'relaxed', 'loose']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { fontSize, colorScheme, lineSpacing } = req.body;

    const updateFields = {};
    if (fontSize !== undefined) updateFields['settings.fontSize'] = fontSize;
    if (colorScheme !== undefined) updateFields['settings.colorScheme'] = colorScheme;
    if (lineSpacing !== undefined) updateFields['settings.lineSpacing'] = lineSpacing;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Settings updated successfully',
      settings: user.settings,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   POST /api/users/feedback
// @desc    Submit user feedback
// @access  Private
router.post('/feedback', auth, [
  body('chapterId').isMongoId().withMessage('Valid chapter ID is required'),
  body('correctionId').optional().isString(),
  body('type').isIn(['shouldnt-flag', 'missed-issue', 'general']),
  body('comment').optional().isString().isLength({ max: 1000 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { chapterId, correctionId, type, comment } = req.body;

    const feedback = {
      chapterId,
      correctionId,
      type,
      comment,
      timestamp: new Date(),
    };

    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { feedback } },
      { new: true }
    );

    res.json({
      message: 'Feedback submitted successfully',
      feedback,
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/users/tracked-names
// @desc    Get user's tracked names and places
// @access  Private
router.get('/tracked-names', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('trackedNames');
    
    res.json({
      trackedNames: user.trackedNames || [],
    });
  } catch (error) {
    console.error('Get tracked names error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   PUT /api/users/tracked-names
// @desc    Update tracked names and places
// @access  Private
router.put('/tracked-names', auth, async (req, res) => {
  try {
    const { trackedNames } = req.body;

    if (!Array.isArray(trackedNames)) {
      return res.status(400).json({
        message: 'trackedNames must be an array',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { trackedNames } },
      { new: true, runValidators: true }
    ).select('trackedNames');

    res.json({
      message: 'Tracked names updated successfully',
      trackedNames: user.trackedNames,
    });
  } catch (error) {
    console.error('Update tracked names error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const Chapter = require('../models/Chapter');
    
    const stats = await Chapter.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalChapters: { $sum: 1 },
          totalWords: { $sum: '$wordCount' },
          totalCorrections: { $sum: { $size: '$corrections' } },
          totalHighlights: { $sum: { $size: '$highlights' } },
          avgWordsPerChapter: { $avg: '$wordCount' },
        },
      },
    ]);

    const userStats = stats[0] || {
      totalChapters: 0,
      totalWords: 0,
      totalCorrections: 0,
      totalHighlights: 0,
      avgWordsPerChapter: 0,
    };

    res.json({
      stats: userStats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;

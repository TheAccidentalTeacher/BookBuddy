const express = require('express');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

// @route   POST /api/ai/correct
// @desc    Test AI correction service
// @access  Private
router.post('/correct', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        message: 'Text is required',
      });
    }

    const result = await aiService.correctText(text);

    res.json({
      message: 'Text correction completed',
      result,
    });
  } catch (error) {
    console.error('AI correction error:', error);
    res.status(500).json({
      message: 'AI service error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   POST /api/ai/detect-repetitions
// @desc    Test repetition detection
// @access  Private
router.post('/detect-repetitions', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        message: 'Text is required',
      });
    }

    const repetitions = aiService.detectRepetitions(text);

    res.json({
      message: 'Repetition detection completed',
      repetitions,
    });
  } catch (error) {
    console.error('Repetition detection error:', error);
    res.status(500).json({
      message: 'Service error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   POST /api/ai/detect-awkward
// @desc    Test awkward phrasing detection
// @access  Private
router.post('/detect-awkward', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        message: 'Text is required',
      });
    }

    const result = await aiService.detectAwkwardPhrasing(text);

    res.json({
      message: 'Awkward phrasing detection completed',
      result,
    });
  } catch (error) {
    console.error('Awkward phrasing detection error:', error);
    res.status(500).json({
      message: 'AI service error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   POST /api/ai/extract-names
// @desc    Test name extraction
// @access  Private
router.post('/extract-names', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        message: 'Text is required',
      });
    }

    const names = aiService.extractNames(text);

    res.json({
      message: 'Name extraction completed',
      names,
    });
  } catch (error) {
    console.error('Name extraction error:', error);
    res.status(500).json({
      message: 'Service error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   GET /api/ai/health
// @desc    Check AI service health
// @access  Private
router.get('/health', auth, async (req, res) => {
  try {
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    
    res.json({
      status: 'OK',
      services: {
        openai: hasOpenAIKey ? 'configured' : 'not configured',
        natural: 'available',
        compromise: 'available',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI health check error:', error);
    res.status(500).json({
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;

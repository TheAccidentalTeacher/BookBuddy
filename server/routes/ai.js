const express = require('express');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

// Store for user data (character names, etc.) - in production, use database
const userDataStore = new Map();

// Common words that don't count as repetitions
const COMMON_WORDS = new Set([
  'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'up', 'about', 'into', 'over', 'after', 'beneath', 'under', 'above',
  'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
  'can', 'must', 'shall', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me',
  'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'this', 'that', 'these', 'those', 'what', 'which', 'who', 'when', 'where',
  'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
  'too', 'very', 'just', 'now', 'said', 'says', 'went', 'came', 'come', 'go'
]);

// @route   POST /api/ai/process-chapter
// @desc    Comprehensive AI chapter processing
// @access  Private
router.post('/process-chapter', auth, async (req, res) => {
  try {
    console.log('Processing chapter request received'); // Debug log
    const { text, preserveFormatting = true } = req.body;
    const userId = req.user.id;

    if (!text || typeof text !== 'string') {
      console.log('Invalid text provided:', typeof text); // Debug log
      return res.status(400).json({ message: 'Text is required' });
    }

    console.log('Text length:', text.length); // Debug log

    // Get or create user data store
    if (!userDataStore.has(userId)) {
      userDataStore.set(userId, {
        characterNames: new Set(),
        placeNames: new Set(),
        previousChapters: []
      });
    }

    const userData = userDataStore.get(userId);
    
    // Extract dialogue sections for context-aware processing
    const dialogueSections = aiService.extractDialogueSections(text);
    
    // Run all AI processing in parallel for better performance
    const [
      correctionResult,
      repetitions,
      awkwardPhrasing,
      extractedNames
    ] = await Promise.all([
      aiService.correctText(text, dialogueSections),
      Promise.resolve(aiService.detectRepetitions(text)),
      aiService.detectAwkwardPhrasing(text),
      Promise.resolve(aiService.extractNames(text))
    ]);

    // Update user data with extracted names
    extractedNames.forEach(nameObj => {
      if (nameObj.type === 'person') {
        userData.characterNames.add(nameObj.name);
      } else if (nameObj.type === 'place') {
        userData.placeNames.add(nameObj.name);
      }
    });

    // Prepare comprehensive analysis
    const analysis = {
      corrections: correctionResult.corrections || [],
      repetitions: repetitions || [],
      awkwardPhrasing: awkwardPhrasing || [],
      dialogue: {
        sections: dialogueSections,
        count: dialogueSections.length,
        averageLength: dialogueSections.length > 0 
          ? Math.round(dialogueSections.reduce((sum, d) => sum + d.text.length, 0) / dialogueSections.length)
          : 0
      },
      names: extractedNames,
      statistics: {
        wordCount: text.split(/\s+/).length,
        characterCount: text.length,
        sentenceCount: (text.match(/[.!?]+/g) || []).length,
        paragraphCount: text.split(/\n\s*\n/).length,
        dialogueRatio: dialogueSections.length > 0 
          ? Math.round((dialogueSections.reduce((sum, d) => sum + d.text.length, 0) / text.length) * 100)
          : 0
      }
    };

    // Store chapter for future consistency checking
    userData.previousChapters.push({
      content: text,
      correctedContent: correctionResult.correctedText,
      timestamp: new Date(),
      names: extractedNames
    });

    // Keep only last 10 chapters for memory management
    if (userData.previousChapters.length > 10) {
      userData.previousChapters.shift();
    }

    res.json({
      message: 'Chapter processing completed',
      correctedText: correctionResult.correctedText,
      analysis,
      tokenUsage: correctionResult.tokenUsage,
      processingTime: Date.now()
    });

  } catch (error) {
    console.error('AI processing error:', error);
    res.status(500).json({
      message: 'AI processing failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

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

async function processTextWithAI(text, userData, userId) {
  const openai = require('openai');
  
  // Initialize OpenAI
  const client = new openai.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // Step 1: Get AI corrections and analysis
    const aiResponse = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional fiction editor. Your task is to:
          
1. CORRECT OBVIOUS ERRORS ONLY:
   - Fix clear typos (e.g., "teh" → "the")
   - Fix misspelled names you recognize from context
   - Add missing punctuation at sentence ends
   - Fix mismatched quotation marks
   
2. PRESERVE CREATIVE CHOICES:
   - Do NOT change dialogue grammar (character voice is intentional)
   - Do NOT change author's style or word choices
   - Do NOT restructure sentences
   
3. IDENTIFY ISSUES:
   - Find repeated words (same word within 100-200 words for common words, twice in 225 words for uncommon words)
   - Identify character and place names
   - Note any awkward phrasing (don't fix, just identify)
   
4. PROVIDE ANALYSIS:
   - Brief story/character/readability feedback
   - List all corrections made
   - Suggest rewrites for up to 3 awkward sentences
   
Return your response as JSON with:
{
  "correctedText": "text with only obvious corrections applied",
  "corrections": [{"type": "typo|repetition|consistency|awkward", "original": "text", "suggestion": "fix", "position": number, "reason": "why"}],
  "repetitions": [{"word": "repeated_word", "positions": [pos1, pos2]}],
  "characterNames": ["name1", "name2"],
  "placeNames": ["place1", "place2"],
  "summary": "HTML formatted summary with corrections, brief story feedback, and up to 3 rewrite suggestions"
}`
        },
        {
          role: "user",
          content: `Please process this fiction chapter:\n\n${text}`
        }
      ],
      temperature: 0.3,
    });

    let aiResult;
    try {
      const rawResponse = aiResponse.choices[0].message.content;
      console.log('Raw AI response:', rawResponse.substring(0, 200) + '...'); // Log first 200 chars for debugging
      
      // Try to extract JSON from response if it's wrapped in other text
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      const jsonContent = jsonMatch ? jsonMatch[0] : rawResponse;
      
      aiResult = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('AI response parsing error:', parseError);
      console.error('Raw response causing error:', aiResponse.choices[0].message.content);
      // Fallback processing
      aiResult = await fallbackProcessing(text);
    }

    // Step 2: Check consistency with previous chapters
    const consistencyIssues = checkConsistency(aiResult, userData);
    aiResult.corrections.push(...consistencyIssues);

    // Step 3: Enhanced repetition detection
    const repetitions = detectRepetitions(text);
    aiResult.repetitions = [...aiResult.repetitions, ...repetitions];

    return aiResult;

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback to rule-based processing if AI fails
    return await fallbackProcessing(text);
  }
}

function detectRepetitions(text) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const repetitions = [];
  const wordPositions = new Map();

  // Track word positions
  words.forEach((word, index) => {
    if (!wordPositions.has(word)) {
      wordPositions.set(word, []);
    }
    wordPositions.get(word).push(index);
  });

  // Find repetitions based on rules
  wordPositions.forEach((positions, word) => {
    if (positions.length < 2) return;

    const isCommon = COMMON_WORDS.has(word);
    const maxDistance = isCommon ? 150 : 225; // words

    for (let i = 0; i < positions.length - 1; i++) {
      const distance = positions[i + 1] - positions[i];
      if (distance <= maxDistance) {
        repetitions.push({
          word: word,
          positions: [positions[i], positions[i + 1]]
        });
      }
    }
  });

  return repetitions;
}

function checkConsistency(aiResult, userData) {
  const issues = [];
  
  // Check character name consistency
  aiResult.characterNames.forEach(name => {
    const existingNames = Array.from(userData.characterNames);
    const similarName = existingNames.find(existing => 
      levenshteinDistance(name.toLowerCase(), existing.toLowerCase()) <= 2 &&
      name.toLowerCase() !== existing.toLowerCase()
    );
    
    if (similarName) {
      issues.push({
        type: 'consistency',
        original: name,
        suggestion: similarName,
        position: 0,
        reason: `Character name "${name}" may be inconsistent with previous chapters ("${similarName}")`
      });
    }
  });

  return issues;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

async function fallbackProcessing(text) {
  // Basic rule-based processing when AI fails
  const corrections = [];
  const repetitions = detectRepetitions(text);
  
  // Basic typo detection
  const commonTypos = {
    'teh': 'the',
    'adn': 'and',
    'hte': 'the',
    'taht': 'that',
    'wth': 'with',
    'fro': 'for',
    'fo': 'of'
  };

  let correctedText = text;
  Object.entries(commonTypos).forEach(([typo, correction]) => {
    const regex = new RegExp(`\\b${typo}\\b`, 'gi');
    if (regex.test(correctedText)) {
      correctedText = correctedText.replace(regex, correction);
      corrections.push({
        type: 'typo',
        original: typo,
        suggestion: correction,
        position: 0,
        reason: 'Common typo correction'
      });
    }
  });

  // Basic name extraction (capitalized words)
  const names = text.match(/\b[A-Z][a-z]+\b/g) || [];
  const characterNames = [...new Set(names.slice(0, 10))]; // Limit to first 10 unique

  return {
    correctedText,
    corrections,
    repetitions,
    characterNames,
    placeNames: [],
    summary: `<h3>Chapter Analysis</h3>
    <p><strong>Corrections:</strong> ${corrections.length} automatic corrections applied.</p>
    <p><strong>Repetitions:</strong> ${repetitions.length} potential word repetitions detected.</p>
    <p><strong>Characters:</strong> Found ${characterNames.length} character names.</p>
    <p><em>Note: Using fallback processing. For full AI analysis, check your OpenAI API key.</em></p>`
  };
}

module.exports = router;

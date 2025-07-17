const OpenAI = require('openai');
const natural = require('natural');
const nlp = require('compromise');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Common words that should be ignored for repetition detection
    this.commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
      'above', 'below', 'between', 'among', 'while', 'until', 'since', 'without',
      'under', 'over', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
      'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
      'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
      'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should',
      'now', 'he', 'she', 'it', 'they', 'them', 'their', 'his', 'her', 'its',
      'i', 'you', 'we', 'us', 'me', 'my', 'your', 'our', 'am', 'is', 'are',
      'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
      'did', 'get', 'got', 'go', 'went', 'come', 'came', 'see', 'saw', 'look',
      'looked', 'take', 'took', 'give', 'gave', 'make', 'made', 'know', 'knew',
      'think', 'thought', 'say', 'said', 'tell', 'told', 'ask', 'asked'
    ]);
  }

  async correctText(text, dialogueSections = []) {
    try {
      const prompt = `You are a professional fiction editor. Fix ONLY the most obvious errors in this text:

1. Clear typos (misspellings like "teh" → "the")
2. Missing end punctuation at sentence boundaries
3. Missing or mismatched quotation marks
4. Character/place name spelling consistency

IMPORTANT RULES:
- In dialogue (text within quotation marks), fix ONLY spelling errors, NOT grammar
- Do NOT change the author's style or voice
- Do NOT fix intentional informal speech
- Do NOT add or remove words
- Be conservative - only fix obvious errors

Text to edit:
${text}

Return a JSON object with:
{
  "correctedText": "the corrected text",
  "corrections": [
    {
      "original": "original text",
      "corrected": "corrected text",
      "type": "typo|spelling|punctuation|quotation",
      "position": {"start": 0, "end": 10},
      "confidence": 0.9
    }
  ]
}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 4000,
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      return {
        correctedText: result.correctedText,
        corrections: result.corrections || [],
        tokenUsage: {
          prompt: response.usage.prompt_tokens,
          completion: response.usage.completion_tokens,
          total: response.usage.total_tokens,
        },
      };
    } catch (error) {
      console.error('AI correction error:', error);
      throw new Error('Failed to process text corrections');
    }
  }

  detectRepetitions(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const repetitions = [];
    const wordPositions = new Map();

    // Build word position map
    let position = 0;
    for (const word of words) {
      const wordStart = text.toLowerCase().indexOf(word, position);
      if (!wordPositions.has(word)) {
        wordPositions.set(word, []);
      }
      wordPositions.get(word).push({
        word,
        start: wordStart,
        end: wordStart + word.length,
        position: wordPositions.get(word).length,
      });
      position = wordStart + word.length;
    }

    // Check for repetitions
    for (const [word, positions] of wordPositions) {
      if (positions.length < 2 || this.commonWords.has(word)) continue;

      const isCommonWord = this.commonWords.has(word);
      const windowSize = isCommonWord ? 200 : 225; // words

      for (let i = 0; i < positions.length - 1; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const distance = positions[j].position - positions[i].position;
          
          if ((isCommonWord && distance <= 150) || (!isCommonWord && distance <= 168)) {
            repetitions.push({
              word,
              positions: [positions[i], positions[j]],
              distance,
              type: 'repetition',
              reason: `"${word}" repeated ${distance} words apart`,
            });
          }
        }
      }
    }

    return repetitions;
  }

  async detectAwkwardPhrasing(text) {
    try {
      const prompt = `Analyze this fiction text and identify up to 3 awkwardly worded sentences or phrases. Focus on:
- Unclear or confusing sentence structure
- Overly complex or convoluted phrasing
- Unnatural dialogue attribution
- Passive voice where active would be better
- Redundant or unnecessarily wordy expressions

Text:
${text}

Return a JSON array of up to 3 items:
[
  {
    "phrase": "the awkward phrase",
    "suggestion": "suggested improvement",
    "reason": "why it's awkward",
    "start": 0,
    "end": 50
  }
]`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const awkwardPhrases = JSON.parse(response.choices[0].message.content);
      
      return {
        phrases: awkwardPhrases.slice(0, 3),
        tokenUsage: {
          prompt: response.usage.prompt_tokens,
          completion: response.usage.completion_tokens,
          total: response.usage.total_tokens,
        },
      };
    } catch (error) {
      console.error('Awkward phrasing detection error:', error);
      return { phrases: [], tokenUsage: null };
    }
  }

  extractNames(text) {
    const doc = nlp(text);
    const names = [];

    // Extract people, places, and proper nouns
    const people = doc.people().out('array');
    const places = doc.places().out('array');
    const properNouns = doc.match('#ProperNoun').out('array');

    // Process people
    people.forEach(name => {
      if (name.length > 1) {
        names.push({
          name: name,
          type: 'character',
          confidence: 0.8,
          positions: this.findWordPositions(text, name),
        });
      }
    });

    // Process places
    places.forEach(place => {
      if (place.length > 1) {
        names.push({
          name: place,
          type: 'place',
          confidence: 0.8,
          positions: this.findWordPositions(text, place),
        });
      }
    });

    // Process other proper nouns
    properNouns.forEach(noun => {
      if (noun.length > 1 && !people.includes(noun) && !places.includes(noun)) {
        names.push({
          name: noun,
          type: 'other',
          confidence: 0.6,
          positions: this.findWordPositions(text, noun),
        });
      }
    });

    return names;
  }

  findWordPositions(text, word) {
    const positions = [];
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    let match;

    while ((match = regex.exec(text)) !== null) {
      positions.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    return positions;
  }

  checkConsistency(currentChapter, previousChapters, trackedNames) {
    const inconsistencies = [];
    const currentNames = this.extractNames(currentChapter.content);

    // Check against tracked names
    trackedNames.forEach(trackedName => {
      currentNames.forEach(currentName => {
        const similarity = natural.JaroWinklerDistance(
          trackedName.name.toLowerCase(),
          currentName.name.toLowerCase()
        );

        // If names are similar but not exact, flag as potential inconsistency
        if (similarity > 0.8 && similarity < 1.0) {
          inconsistencies.push({
            type: 'name-spelling',
            issue: `Possible spelling inconsistency: "${currentName.name}" vs "${trackedName.name}"`,
            details: `Found in chapter ${currentChapter.chapterNumber}`,
            positions: currentName.positions,
            severity: 'medium',
          });
        }
      });
    });

    return inconsistencies;
  }

  async generateSummary(chapter, corrections, awkwardPhrases, inconsistencies) {
    try {
      const prompt = `Analyze this fiction chapter and provide a brief literary assessment:

Chapter content: ${chapter.content.substring(0, 2000)}...

Provide a 1-2 sentence comment focusing on:
- Story progression and pacing
- Character development
- Readability and flow
- Literary merit

Be constructive and encouraging while noting areas for improvement.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      });

      const literaryFeedback = response.choices[0].message.content;

      const correctionSummary = corrections.map(c => 
        `Fixed ${c.type}: "${c.original}" → "${c.corrected}"`
      );

      return {
        corrections: correctionSummary,
        literaryFeedback,
        awkwardPhrases: awkwardPhrases.map(p => ({
          phrase: p.phrase,
          suggestion: p.suggestion,
          position: { start: p.start, end: p.end },
        })),
        inconsistencies: inconsistencies.map(i => ({
          issue: i.issue,
          details: i.details,
          references: i.references || [],
        })),
        tokenUsage: {
          prompt: response.usage.prompt_tokens,
          completion: response.usage.completion_tokens,
          total: response.usage.total_tokens,
        },
      };
    } catch (error) {
      console.error('Summary generation error:', error);
      return {
        corrections: [],
        literaryFeedback: 'Unable to generate feedback at this time.',
        awkwardPhrases: [],
        inconsistencies: [],
        tokenUsage: null,
      };
    }
  }
}

module.exports = new AIService();

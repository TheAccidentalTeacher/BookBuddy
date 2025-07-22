const OpenAI = require('openai');
const natural = require('natural');
const nlp = require('compromise');

class AIService {
  constructor() {
    this.useMockAPI = process.env.OPENAI_API_KEY === 'mock' || !process.env.OPENAI_API_KEY;
    
    if (!this.useMockAPI) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      console.log('Using mock AI responses for development');
    }
    
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
    if (this.useMockAPI) {
      return this.mockCorrectText(text, dialogueSections);
    }
    
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

  // Extract dialogue sections from text
  extractDialogueSections(text) {
    const dialogues = [];
    // Match dialogue in quotes with optional attribution
    const dialoguePattern = /(['"])((?:(?!\1)[^\\]|\\.)*)(\1)(\s*[,.]?\s*[A-Za-z\s]+(?:said|asked|replied|whispered|shouted|muttered|exclaimed|declared|admitted|confessed|demanded|insisted|suggested|observed|remarked|announced|continued|added|concluded|interrupted|answered|responded|nodded|smiled|laughed|sighed|frowned|grimaced|shrugged|paused).*?)?/g;
    
    let match;
    while ((match = dialoguePattern.exec(text)) !== null) {
      const fullMatch = match[0];
      const quote = match[1];
      const dialogue = match[2];
      const attribution = match[4] ? match[4].trim() : '';
      
      dialogues.push({
        text: dialogue,
        fullText: fullMatch,
        attribution: attribution,
        position: {
          start: match.index,
          end: match.index + fullMatch.length
        },
        quote: quote,
        type: 'dialogue'
      });
    }

    // Also catch standalone dialogue without attribution
    const standalonePattern = /(['"])((?:(?!\1)[^\\]|\\.)*)\1/g;
    let standaloneMatch;
    while ((standaloneMatch = standalonePattern.exec(text)) !== null) {
      const fullMatch = standaloneMatch[0];
      const dialogue = standaloneMatch[2];
      
      // Skip if already captured by the more complex pattern
      const alreadyCaptured = dialogues.some(d => 
        d.position.start <= standaloneMatch.index && 
        d.position.end >= standaloneMatch.index + fullMatch.length
      );
      
      if (!alreadyCaptured && dialogue.trim().length > 0) {
        dialogues.push({
          text: dialogue,
          fullText: fullMatch,
          attribution: '',
          position: {
            start: standaloneMatch.index,
            end: standaloneMatch.index + fullMatch.length
          },
          quote: standaloneMatch[1],
          type: 'dialogue'
        });
      }
    }

    return dialogues.sort((a, b) => a.position.start - b.position.start);
  }

  async detectAwkwardPhrasing(text) {
    if (this.useMockAPI) {
      return this.mockDetectAwkwardPhrasing(text);
    }
    
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

  // Mock AI methods for development/testing
  mockCorrectText(text, dialogueSections = []) {
    const corrections = [
      {
        original: "teh",
        corrected: "the",
        type: "typo",
        position: { start: text.indexOf("teh"), end: text.indexOf("teh") + 3 },
        confidence: 0.95
      },
      {
        original: "Hello world",
        corrected: "Hello world.",
        type: "punctuation", 
        position: { start: text.indexOf("Hello world"), end: text.indexOf("Hello world") + 11 },
        confidence: 0.9
      }
    ].filter(c => c.position.start >= 0);

    let correctedText = text;
    corrections.reverse().forEach(correction => {
      correctedText = correctedText.substring(0, correction.position.start) + 
                     correction.corrected + 
                     correctedText.substring(correction.position.end);
    });

    return {
      correctedText,
      corrections,
      tokenUsage: {
        prompt: Math.ceil(text.length / 4),
        completion: Math.ceil(correctedText.length / 4), 
        total: Math.ceil((text.length + correctedText.length) / 4)
      }
    };
  }

  async mockDetectAwkwardPhrasing(text) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
    
    const awkwardPhrases = [
      {
        phrase: "very very good",
        suggestion: "excellent", 
        reason: "Avoid repetitive intensifiers",
        position: { start: text.indexOf("very very good"), end: text.indexOf("very very good") + 14 },
        confidence: 0.8
      }
    ].filter(p => p.position.start >= 0);

    return awkwardPhrases;
  }
}

module.exports = new AIService();

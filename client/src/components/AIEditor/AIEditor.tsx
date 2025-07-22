import React, { useState, useCallback, useRef } from 'react';
import { Editor, EditorState, RichUtils, Modifier } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { stateFromHTML } from 'draft-js-import-html';
import toast from 'react-hot-toast';
import 'draft-js/dist/Draft.css';

interface AIEditorProps {
  content: string;
  onChange: (content: string, editorState: EditorState) => void;
  onSave: (content: string, corrections: Correction[], summary: string) => void;
}

interface Correction {
  original: string;
  corrected: string;
  type: 'typo' | 'spelling' | 'punctuation' | 'quotation';
  position: { start: number; end: number };
  confidence: number;
  accepted?: boolean;
}

interface AwkwardPhrasing {
  phrase: string;
  suggestion: string;
  reason: string;
  position: { start: number; end: number };
  confidence: number;
  accepted?: boolean;
}

interface DialogueSection {
  text: string;
  fullText: string;
  attribution: string;
  position: { start: number; end: number };
  quote: string;
  type: 'dialogue';
}

interface Analysis {
  corrections: Correction[];
  repetitions: Array<{
    word: string;
    positions: Array<{ start: number; end: number; position: number }>;
    distance: number;
    type: 'repetition';
    reason: string;
  }>;
  awkwardPhrasing: AwkwardPhrasing[];
  dialogue: {
    sections: DialogueSection[];
    count: number;
    averageLength: number;
  };
  names: Array<{
    name: string;
    type: 'person' | 'place' | 'other';
    confidence: number;
    positions: Array<{ start: number; end: number }>;
  }>;
  statistics: {
    wordCount: number;
    characterCount: number;
    sentenceCount: number;
    paragraphCount: number;
    dialogueRatio: number;
  };
}

interface AIResponse {
  correctedText: string;
  analysis: Analysis;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  processingTime: number;
}

function AIEditor({ content, onChange, onSave }: AIEditorProps) {
  const [editorState, setEditorState] = useState(() => {
    if (content) {
      const contentState = stateFromHTML(content);
      return EditorState.createWithContent(contentState);
    }
    return EditorState.createEmpty();
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [summary, setSummary] = useState('');
  
  const editorRef = useRef<Editor>(null);

  // Handle editor changes
  const handleEditorChange = useCallback((newEditorState: EditorState) => {
    setEditorState(newEditorState);
    const contentState = newEditorState.getCurrentContent();
    const htmlContent = stateToHTML(contentState);
    onChange(htmlContent, newEditorState);
  }, [onChange]);

  // Process text with AI
  const processWithAI = useCallback(async () => {
    const contentState = editorState.getCurrentContent();
    const plainText = contentState.getPlainText();
    
    if (!plainText.trim()) {
      toast.error('Please enter some text to process');
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/ai/process-chapter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          text: plainText,
          preserveFormatting: true,
        }),
      });

      if (!response.ok) {
        throw new Error('AI processing failed');
      }

      const aiResponse: AIResponse = await response.json();
      
      // Update editor with corrected text
      if (aiResponse.correctedText) {
        const correctedContentState = stateFromHTML(aiResponse.correctedText);
        const correctedEditorState = EditorState.createWithContent(correctedContentState);
        setEditorState(correctedEditorState);
        onChange(aiResponse.correctedText, correctedEditorState);
      }
      
      // Set analysis and corrections
      setAnalysis(aiResponse.analysis);
      setCorrections(aiResponse.analysis?.corrections || []);
      
      // Highlight issues in the text
      if (aiResponse.analysis) {
        highlightIssues(aiResponse.analysis);
      }
      
      // Create summary from statistics
      const stats = aiResponse.analysis?.statistics;
      const summaryText = stats 
        ? `Analysis: ${stats.wordCount} words, ${stats.sentenceCount} sentences, ${stats.dialogueRatio}% dialogue. Found ${aiResponse.analysis.corrections.length} corrections, ${aiResponse.analysis.repetitions.length} repetitions, and ${aiResponse.analysis.awkwardPhrasing.length} awkward phrases.`
        : 'Text processed successfully.';
      setSummary(summaryText);
      
      toast.success(`AI processing complete! Found ${aiResponse.analysis?.corrections.length || 0} improvements`);

    } catch (error) {
      console.error('AI processing error:', error);
      toast.error('Failed to process text with AI');
    } finally {
      setIsProcessing(false);
    }
  }, [editorState, onChange]);  // Highlight repetitions and issues in the text
  const highlightIssues = (analysis: Analysis) => {
    const ranges: Array<{ start: number; end: number; type: string }> = [];
    
    // Add correction highlights
    analysis.corrections.forEach(correction => {
      ranges.push({
        start: correction.position.start,
        end: correction.position.end,
        type: 'correction'
      });
    });
    
    // Add repetition highlights
    analysis.repetitions.forEach(rep => {
      rep.positions.forEach(pos => {
        ranges.push({
          start: pos.start,
          end: pos.end,
          type: 'repetition'
        });
      });
    });

    // Add awkward phrasing highlights
    analysis.awkwardPhrasing.forEach(awkward => {
      ranges.push({
        start: awkward.position.start,
        end: awkward.position.end,
        type: 'awkward'
      });
    });

    // TODO: Apply highlights to editor (would need custom entity implementation)
    console.log('Issue ranges:', ranges);
  };

  // Handle keyboard shortcuts
  const handleKeyCommand = useCallback((command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleEditorChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }, [handleEditorChange]);

  // Toggle inline styles (bold, italic, underline)
  const toggleInlineStyle = useCallback((style: string) => {
    handleEditorChange(RichUtils.toggleInlineStyle(editorState, style));
  }, [editorState, handleEditorChange]);

  // Toggle block type (headings, etc.)
  // Get block styles for rendering
  const getBlockStyle = useCallback((block: any) => {
    switch (block.getType()) {
      case 'header-one':
        return 'text-3xl font-bold mb-4 text-gray-900';
      case 'header-two':
        return 'text-2xl font-bold mb-3 text-gray-900';
      case 'header-three':
        return 'text-xl font-bold mb-2 text-gray-900';
      default:
        return '';
    }
  }, []);

  // Get current block type for toolbar highlighting
  const getCurrentBlockType = useCallback((): string => {
    const selection = editorState.getSelection();
    const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
    return blockType;
  }, [editorState]);

  const toggleBlockType = useCallback((blockType: string) => {
    handleEditorChange(RichUtils.toggleBlockType(editorState, blockType));
  }, [editorState, handleEditorChange]);

  // Insert scene break
  const insertSceneBreak = useCallback(() => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    
    // Insert the scene break text
    const newContentState = Modifier.insertText(
      contentState,
      selection,
      '\n* * *\n'
    );
    
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      'insert-characters'
    );
    
    handleEditorChange(newEditorState);
  }, [editorState, handleEditorChange]);

  // Save chapter
  const handleSave = useCallback(() => {
    const contentState = editorState.getCurrentContent();
    const htmlContent = stateToHTML(contentState);
    onSave(htmlContent, corrections, summary);
    toast.success('Chapter saved successfully');
  }, [editorState, corrections, summary, onSave]);

  return (
    <div className="ai-editor">
      {/* Toolbar */}
      <div className="editor-toolbar mb-4 p-3 bg-gray-100 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          {/* Formatting buttons */}
          <button
            type="button"
            className={`px-3 py-1 rounded text-sm font-medium ${
              editorState.getCurrentInlineStyle().has('BOLD')
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => toggleInlineStyle('BOLD')}
            aria-label="Bold"
          >
            <strong>B</strong>
          </button>
          
          <button
            type="button"
            className={`px-3 py-1 rounded text-sm font-medium ${
              editorState.getCurrentInlineStyle().has('ITALIC')
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => toggleInlineStyle('ITALIC')}
            aria-label="Italic"
          >
            <em>I</em>
          </button>
          
          <button
            type="button"
            className={`px-3 py-1 rounded text-sm font-medium ${
              editorState.getCurrentInlineStyle().has('UNDERLINE')
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => toggleInlineStyle('UNDERLINE')}
            aria-label="Underline"
          >
            <span style={{ textDecoration: 'underline' }}>U</span>
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-2" />
          
          {/* Block formatting buttons */}
          <button
            type="button"
            className={`px-3 py-1 rounded text-sm font-medium ${
              getCurrentBlockType() === 'header-one'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => toggleBlockType('header-one')}
            aria-label="Heading 1"
          >
            H1
          </button>
          
          <button
            type="button"
            className={`px-3 py-1 rounded text-sm font-medium ${
              getCurrentBlockType() === 'header-two'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => toggleBlockType('header-two')}
            aria-label="Heading 2"
          >
            H2
          </button>
          
          <button
            type="button"
            className={`px-3 py-1 rounded text-sm font-medium ${
              getCurrentBlockType() === 'header-three'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => toggleBlockType('header-three')}
            aria-label="Heading 3"
          >
            H3
          </button>
          
          <button
            type="button"
            className="px-3 py-1 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
            onClick={insertSceneBreak}
            aria-label="Insert Scene Break"
          >
            * * *
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-2" />
          
          {/* AI Process button */}
          <button
            type="button"
            onClick={processWithAI}
            disabled={isProcessing}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin">🔄</span>
                Processing...
              </>
            ) : (
              <>
                <span>🤖</span>
                AI Process
              </>
            )}
          </button>
          
          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <span>💾</span>
            Save Chapter
          </button>
        </div>
        
        {corrections.length > 0 && (
          <div className="text-sm text-gray-600">
            Found {corrections.length} corrections • Click AI Process to apply
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="editor-container">
        <div 
          className="editor-content min-h-96 p-4 border rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500"
          onClick={() => editorRef.current?.focus()}
        >
          <Editor
            ref={editorRef}
            editorState={editorState}
            onChange={handleEditorChange}
            handleKeyCommand={handleKeyCommand}
            blockStyleFn={getBlockStyle}
            placeholder="Paste your chapter text here. The AI will preserve all formatting while making corrections..."
            spellCheck={true}
            aria-label="Chapter text editor"
          />
        </div>
      </div>

      {/* Summary Panel */}
      {summary && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <span>📋</span>
            Chapter Summary
          </h3>
          <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: summary }} />
        </div>
      )}

      {/* Corrections Panel */}
      {corrections.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span>✏️</span>
            Corrections Made ({corrections.length})
          </h3>
          <div className="space-y-2">
            {corrections.map((correction, index) => (
              <div key={index} className="flex items-start gap-3 p-2 bg-white rounded border">
                <span className="text-sm font-medium text-gray-500 mt-1">
                  {correction.type === 'typo' ? '🔤' : 
                   correction.type === 'spelling' ? '🔤' :
                   correction.type === 'punctuation' ? '❓' : 
                   correction.type === 'quotation' ? '�' : '✨'}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="line-through text-red-600">{correction.original}</span>
                    <span>→</span>
                    <span className="text-green-600 font-medium">{correction.corrected}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {correction.type.charAt(0).toUpperCase() + correction.type.slice(1)} correction 
                    (confidence: {Math.round(correction.confidence * 100)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Analysis Panel */}
      {analysis && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span>📊</span>
            Text Analysis
          </h3>
          
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analysis.statistics.wordCount}</div>
              <div className="text-sm text-gray-600">Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analysis.statistics.sentenceCount}</div>
              <div className="text-sm text-gray-600">Sentences</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analysis.dialogue.count}</div>
              <div className="text-sm text-gray-600">Dialogue Lines</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analysis.statistics.dialogueRatio}%</div>
              <div className="text-sm text-gray-600">Dialogue Ratio</div>
            </div>
          </div>

          {/* Repetitions */}
          {analysis.repetitions.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Repetitions Found ({analysis.repetitions.length})</h4>
              <div className="space-y-1">
                {analysis.repetitions.slice(0, 5).map((rep, idx) => (
                  <div key={idx} className="text-sm text-amber-700 bg-amber-100 px-2 py-1 rounded">
                    "{rep.word}" repeated {rep.positions.length} times - {rep.reason}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awkward Phrasing */}
          {analysis.awkwardPhrasing.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Awkward Phrasing ({analysis.awkwardPhrasing.length})</h4>
              <div className="space-y-2">
                {analysis.awkwardPhrasing.map((awkward, idx) => (
                  <div key={idx} className="p-2 bg-orange-100 rounded">
                    <div className="text-sm text-orange-800">"{awkward.phrase}"</div>
                    <div className="text-sm text-orange-600 mt-1">
                      Suggestion: {awkward.suggestion}
                    </div>
                    <div className="text-xs text-orange-500 mt-1">{awkward.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIEditor;

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
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
  type: 'typo' | 'repetition' | 'consistency' | 'awkward';
  original: string;
  suggestion?: string;
  position: number;
  reason: string;
}

interface AIResponse {
  correctedText: string;
  corrections: Correction[];
  summary: string;
  repetitions: Array<{ word: string; positions: number[] }>;
  characterNames: string[];
  placeNames: string[];
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
  const [summary, setSummary] = useState('');
  const [highlightedRanges, setHighlightedRanges] = useState<Array<{ start: number; end: number; type: string }>>([]);
  
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
      const correctedContentState = stateFromHTML(aiResponse.correctedText);
      const correctedEditorState = EditorState.createWithContent(correctedContentState);
      setEditorState(correctedEditorState);
      
      // Set corrections and summary
      setCorrections(aiResponse.corrections);
      setSummary(aiResponse.summary);
      
      // Highlight repetitions and issues
      highlightIssues(aiResponse);
      
      toast.success(`Found ${aiResponse.corrections.length} corrections`);
      
    } catch (error) {
      console.error('AI processing error:', error);
      toast.error('Failed to process text with AI');
    } finally {
      setIsProcessing(false);
    }
  }, [editorState]);

  // Highlight repetitions and issues in the text
  const highlightIssues = (aiResponse: AIResponse) => {
    const ranges: Array<{ start: number; end: number; type: string }> = [];
    
    // Add repetition highlights
    aiResponse.repetitions.forEach(rep => {
      rep.positions.forEach(pos => {
        ranges.push({
          start: pos,
          end: pos + rep.word.length,
          type: 'repetition'
        });
      });
    });
    
    setHighlightedRanges(ranges);
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
                   correction.type === 'repetition' ? '🔁' :
                   correction.type === 'consistency' ? '📝' : '✨'}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="line-through text-red-600">{correction.original}</span>
                    {correction.suggestion && (
                      <>
                        <span>→</span>
                        <span className="text-green-600 font-medium">{correction.suggestion}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{correction.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AIEditor;

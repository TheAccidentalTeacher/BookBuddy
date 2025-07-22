import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import AIEditor from '../components/AIEditor/AIEditor';

function Home() {
  const [chapters, setChapters] = useState<Array<{id: string, title: string, content: string}>>([]);
  const [currentChapter, setCurrentChapter] = useState<{id: string, title: string, content: string} | null>(null);
  const [showChapterList, setShowChapterList] = useState(false);

  const handleSaveChapter = (content: string, corrections: any[], summary: string) => {
    if (currentChapter) {
      // Update existing chapter
      const updated = { ...currentChapter, content };
      setCurrentChapter(updated);
      setChapters(prev => prev.map(ch => ch.id === updated.id ? updated : ch));
    } else {
      // Create new chapter
      const newChapter = {
        id: Date.now().toString(),
        title: `Chapter ${chapters.length + 1}`,
        content
      };
      setChapters(prev => [...prev, newChapter]);
      setCurrentChapter(newChapter);
    }
  };

  const handleNewChapter = () => {
    setCurrentChapter(null);
    setShowChapterList(false);
  };

  const handleLoadChapter = (chapter: {id: string, title: string, content: string}) => {
    setCurrentChapter(chapter);
    setShowChapterList(false);
  };

  return (
    <>
      <Helmet>
        <title>BookBuddy - AI Fiction Editor</title>
        <meta name="description" content="Clean, modern AI fiction editor for writers" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  📖 BookBuddy
                </h1>
                <span className="text-sm text-gray-500">AI Fiction Editor</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleNewChapter}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  ✨ New Chapter
                </button>
                
                <button
                  onClick={() => setShowChapterList(!showChapterList)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  📚 Chapters ({chapters.length})
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showChapterList && (
            <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Chapters</h2>
              {chapters.length === 0 ? (
                <p className="text-gray-500 italic">No chapters yet. Create your first chapter to get started!</p>
              ) : (
                <div className="grid gap-3">
                  {chapters.map(chapter => (
                    <div
                      key={chapter.id}
                      onClick={() => handleLoadChapter(chapter)}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{chapter.title}</h3>
                        <p className="text-sm text-gray-500">
                          {chapter.content.length} characters
                        </p>
                      </div>
                      <div className="text-blue-600">→</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentChapter ? currentChapter.title : 'New Chapter'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Write your fiction and let AI help you polish it to perfection
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>🤖</span>
                  <span>AI-Powered</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <AIEditor
                content={currentChapter?.content || ''}
                onChange={(content, editorState) => {
                  // Handle content changes
                }}
                onSave={handleSaveChapter}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default Home;

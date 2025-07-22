import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AIEditor from '../components/AIEditor/AIEditor';

function NewChapter() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleContentChange = (newContent: string, editorState: any) => {
    setContent(newContent);
  };

  const handleSave = async (content: string, corrections: any[], summary: string) => {
    if (!title.trim()) {
      toast.error('Please enter a chapter title');
      return;
    }

    try {
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content,
          chapterNumber: Date.now(), // Simple chapter numbering for now
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save chapter');
      }

      const result = await response.json();
      console.log('Chapter saved:', result);
      toast.success('Chapter saved successfully!');
      navigate('/chapters');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save chapter');
    }
  };

  return (
    <>
      <Helmet>
        <title>New Chapter - BookBuddy</title>
      </Helmet>
      
      <div className="new-chapter-container">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Write New Chapter</h1>
            <p className="text-gray-600">Create your fiction with AI-powered editing assistance</p>
          </div>
          
          {/* Chapter Title Input */}
          <div className="mb-6">
            <label htmlFor="chapter-title" className="block text-sm font-medium text-gray-700 mb-2">
              Chapter Title
            </label>
            <input
              id="chapter-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter chapter title..."
              required
              aria-describedby="title-help"
            />
            <p id="title-help" className="mt-1 text-sm text-gray-500">
              Give your chapter a descriptive title
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border">
            <AIEditor 
              content={content}
              onChange={handleContentChange}
              onSave={handleSave}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default NewChapter;

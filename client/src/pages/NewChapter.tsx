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
    try {
      // TODO: Implement save to backend
      console.log('Saving chapter:', { title, content, corrections, summary });
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

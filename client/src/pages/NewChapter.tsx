import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

function NewChapter() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Save chapter to backend
      toast.success('Chapter saved successfully!');
      navigate('/chapters');
    } catch (error) {
      toast.error('Failed to save chapter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>New Chapter - BookBuddy</title>
      </Helmet>
      
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">New Chapter</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Chapter Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter chapter title..."
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Chapter Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg h-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Start writing your chapter..."
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Chapter'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/chapters')}
              className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default NewChapter;

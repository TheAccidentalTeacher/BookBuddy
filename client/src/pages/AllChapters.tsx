import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

interface Chapter {
  _id: string;
  title: string;
  chapterNumber: number;
  wordCount: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: string;
  updatedAt: string;
}

function AllChapters() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    try {
      const response = await fetch('/api/chapters', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chapters');
      }

      const data = await response.json();
      setChapters(data.chapters || []);
    } catch (error) {
      console.error('Fetch chapters error:', error);
      setError('Failed to load chapters');
      toast.error('Failed to load chapters');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '⚡';
      case 'pending': return '⏳';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const deleteChapter = async (chapterId: string) => {
    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete chapter');
      }

      toast.success('Chapter deleted successfully');
      fetchChapters(); // Refresh the list
    } catch (error) {
      console.error('Delete chapter error:', error);
      toast.error('Failed to delete chapter');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading chapters...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>All Chapters - BookBuddy</title>
      </Helmet>
      
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Chapters</h1>
          <Link
            to="/new-chapter"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 no-underline"
          >
            New Chapter
          </Link>
        </div>

        <div className="grid gap-4">
          {error ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  fetchChapters();
                }}
                className="text-blue-600 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : chapters.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-500 mb-4">No chapters yet</p>
              <Link
                to="/new-chapter"
                className="text-blue-600 hover:underline"
              >
                Create your first chapter
              </Link>
            </div>
          ) : (
            chapters.map((chapter) => (
              <div
                key={chapter._id}
                className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        role="img" 
                        aria-label={`Status: ${chapter.processingStatus}`}
                        title={chapter.processingStatus}
                      >
                        {getStatusIcon(chapter.processingStatus)}
                      </span>
                      <h3 className="text-lg font-semibold">
                        Chapter {chapter.chapterNumber}: {chapter.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {chapter.wordCount.toLocaleString()} words • Last edited {formatDate(chapter.updatedAt)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Status: {chapter.processingStatus}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      to={`/editor/${chapter._id}`}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this chapter?')) {
                          deleteChapter(chapter._id);
                        }
                      }}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default AllChapters;

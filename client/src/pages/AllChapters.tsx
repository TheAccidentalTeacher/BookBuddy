import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

function AllChapters() {
  // TODO: Fetch chapters from backend
  const chapters = [
    { id: 1, title: 'Chapter 1: The Beginning', wordCount: 2500, lastEdited: '2024-01-15' },
    { id: 2, title: 'Chapter 2: Rising Action', wordCount: 3200, lastEdited: '2024-01-16' },
  ];

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
          {chapters.length === 0 ? (
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
                key={chapter.id}
                className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{chapter.title}</h3>
                    <p className="text-sm text-gray-600">
                      {chapter.wordCount} words • Last edited {chapter.lastEdited}
                    </p>
                  </div>
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                    Edit
                  </button>
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

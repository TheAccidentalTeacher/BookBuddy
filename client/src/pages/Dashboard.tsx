import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { useDebug } from '../contexts/DebugContext';

interface ChapterSummary {
  id: string;
  title: string;
  chapterNumber: number;
  wordCount: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalChapters: number;
  totalWords: number;
  totalCorrections: number;
  totalHighlights: number;
  avgWordsPerChapter: number;
}

function Dashboard() {
  const { user, token } = useAuth();
  const { log } = useDebug();
  const [recentChapters, setRecentChapters] = useState<ChapterSummary[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        log('info', 'dashboard', 'Fetching dashboard data');

        // Fetch recent chapters
        const chaptersResponse = await fetch('/api/chapters?limit=5', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (chaptersResponse.ok) {
          const chaptersData = await chaptersResponse.json();
          setRecentChapters(chaptersData.chapters || []);
        } else {
          throw new Error('Failed to fetch chapters');
        }

        // Fetch user stats
        const statsResponse = await fetch('/api/users/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats);
        } else {
          throw new Error('Failed to fetch stats');
        }

        log('info', 'dashboard', 'Dashboard data loaded successfully');
      } catch (err: any) {
        log('error', 'dashboard', 'Failed to load dashboard data', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, log]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '⏳';
      case 'pending': return '⏸️';
      case 'error': return '❌';
      default: return '📄';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'processing': return 'Processing';
      case 'pending': return 'Pending';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
          <p className="text-[var(--text-muted)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - AI Fiction Editing Tool</title>
        <meta name="description" content="Your AI Fiction Editing Tool dashboard" />
      </Helmet>

      <div className="max-w-6xl mx-auto p-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-color)] mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-[var(--text-muted)]">
            Ready to edit some fiction? Let's make your writing shine.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/editor"
            className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6 
              hover:shadow-lg transition-shadow text-decoration-none group"
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3" role="img" aria-label="Edit icon">✏️</span>
              <h2 className="text-xl font-semibold text-[var(--text-color)] group-hover:text-[var(--primary-color)]">
                New Chapter
              </h2>
            </div>
            <p className="text-[var(--text-muted)]">
              Start writing a new chapter and get AI-powered editing suggestions.
            </p>
          </Link>

          <Link
            to="/chapters"
            className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6 
              hover:shadow-lg transition-shadow text-decoration-none group"
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3" role="img" aria-label="Book icon">📚</span>
              <h2 className="text-xl font-semibold text-[var(--text-color)] group-hover:text-[var(--primary-color)]">
                All Chapters
              </h2>
            </div>
            <p className="text-[var(--text-muted)]">
              View and manage all your chapters in one place.
            </p>
          </Link>

          <Link
            to="/settings"
            className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6 
              hover:shadow-lg transition-shadow text-decoration-none group"
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3" role="img" aria-label="Settings icon">⚙️</span>
              <h2 className="text-xl font-semibold text-[var(--text-color)] group-hover:text-[var(--primary-color)]">
                Settings
              </h2>
            </div>
            <p className="text-[var(--text-muted)]">
              Customize your experience with accessibility and display options.
            </p>
          </Link>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-[var(--text-color)] mb-4">Your Writing Stats</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--primary-color)]">
                  {stats.totalChapters}
                </div>
                <div className="text-sm text-[var(--text-muted)]">Chapters</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--primary-color)]">
                  {stats.totalWords.toLocaleString()}
                </div>
                <div className="text-sm text-[var(--text-muted)]">Total Words</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--success-color)]">
                  {stats.totalCorrections}
                </div>
                <div className="text-sm text-[var(--text-muted)]">Corrections</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--warning-color)]">
                  {stats.totalHighlights}
                </div>
                <div className="text-sm text-[var(--text-muted)]">Highlights</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--text-color)]">
                  {Math.round(stats.avgWordsPerChapter)}
                </div>
                <div className="text-sm text-[var(--text-muted)]">Avg Words</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Chapters */}
        <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--text-color)]">Recent Chapters</h2>
            <Link 
              to="/chapters"
              className="text-[var(--primary-color)] hover:text-[var(--primary-hover)] text-sm font-medium"
            >
              View all
            </Link>
          </div>

          {error ? (
            <div className="text-center py-8">
              <p className="text-[var(--error-color)] mb-2">Failed to load chapters</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-[var(--primary-color)] hover:text-[var(--primary-hover)] text-sm"
              >
                Try again
              </button>
            </div>
          ) : recentChapters.length > 0 ? (
            <div className="space-y-3">
              {recentChapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  to={`/editor/${chapter.id}`}
                  className="block p-4 border border-[var(--border-color)] rounded-md 
                    hover:bg-[var(--bg-color)] transition-colors text-decoration-none"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span 
                        role="img" 
                        aria-label={`Status: ${getStatusText(chapter.processingStatus)}`}
                        title={getStatusText(chapter.processingStatus)}
                      >
                        {getStatusIcon(chapter.processingStatus)}
                      </span>
                      <div>
                        <h3 className="font-medium text-[var(--text-color)]">
                          Chapter {chapter.chapterNumber}: {chapter.title}
                        </h3>
                        <p className="text-sm text-[var(--text-muted)]">
                          {chapter.wordCount.toLocaleString()} words • 
                          Updated {new Date(chapter.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-[var(--text-muted)]">
                      {getStatusText(chapter.processingStatus)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block" role="img" aria-label="Empty state">📝</span>
              <p className="text-[var(--text-muted)] mb-4">No chapters yet</p>
              <Link 
                to="/editor"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)] 
                  text-white rounded-md hover:bg-[var(--primary-hover)] transition-colors text-decoration-none"
              >
                <span role="img" aria-hidden="true">✏️</span>
                Write your first chapter
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;

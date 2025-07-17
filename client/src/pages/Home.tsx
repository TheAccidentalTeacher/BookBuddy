import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

function Home() {
  return (
    <>
      <Helmet>
        <title>AI Fiction Editing Tool - Write Better Fiction</title>
        <meta name="description" content="AI-powered fiction editing tool with full accessibility support. Get real-time suggestions, consistency checking, and professional editing assistance." />
      </Helmet>

      <div className="min-h-screen bg-[var(--bg-color)]">
        {/* Hero Section */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <span role="img" aria-label="Book and AI icon" className="text-6xl">📖✨</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                AI Fiction Editing Tool
              </h1>
              
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Write better fiction with AI-powered editing, consistency checking, 
                and real-time suggestions. Fully accessible and designed for writers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium 
                    bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium 
                    border border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section className="py-16" id="features">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-color)] mb-4">
                Powerful Features for Writers
              </h2>
              <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto">
                Everything you need to polish your fiction and make it shine
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* AI Editing */}
              <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6">
                <div className="text-4xl mb-4" role="img" aria-label="AI icon">🤖</div>
                <h3 className="text-xl font-semibold text-[var(--text-color)] mb-3">
                  AI-Powered Editing
                </h3>
                <p className="text-[var(--text-muted)]">
                  Get intelligent suggestions for typos, grammar, and style improvements. 
                  AI respects dialogue and author voice.
                </p>
              </div>

              {/* Repetition Detection */}
              <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6">
                <div className="text-4xl mb-4" role="img" aria-label="Repeat icon">🔄</div>
                <h3 className="text-xl font-semibold text-[var(--text-color)] mb-3">
                  Repetition Detection
                </h3>
                <p className="text-[var(--text-muted)]">
                  Automatically detect repeated words and phrases with smart distance-based analysis.
                </p>
              </div>

              {/* Consistency Checking */}
              <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6">
                <div className="text-4xl mb-4" role="img" aria-label="Check icon">✅</div>
                <h3 className="text-xl font-semibold text-[var(--text-color)] mb-3">
                  Consistency Checking
                </h3>
                <p className="text-[var(--text-muted)]">
                  Track character names, places, and story elements across chapters for perfect consistency.
                </p>
              </div>

              {/* Accessibility */}
              <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6">
                <div className="text-4xl mb-4" role="img" aria-label="Accessibility icon">♿</div>
                <h3 className="text-xl font-semibold text-[var(--text-color)] mb-3">
                  Fully Accessible
                </h3>
                <p className="text-[var(--text-muted)]">
                  WCAG 2.1 AA compliant with screen reader support, keyboard navigation, and customizable display.
                </p>
              </div>

              {/* Rich Text Editor */}
              <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6">
                <div className="text-4xl mb-4" role="img" aria-label="Editor icon">✏️</div>
                <h3 className="text-xl font-semibold text-[var(--text-color)] mb-3">
                  Rich Text Editor
                </h3>
                <p className="text-[var(--text-muted)]">
                  Full formatting support with italics, bold, scene breaks, and more. Paste from anywhere.
                </p>
              </div>

              {/* Debug Console */}
              <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6">
                <div className="text-4xl mb-4" role="img" aria-label="Debug icon">🔧</div>
                <h3 className="text-xl font-semibold text-[var(--text-color)] mb-3">
                  Built-in Debugging
                </h3>
                <p className="text-[var(--text-muted)]">
                  F12 debug console with live logs, performance metrics, and accessibility auditing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-[var(--surface-color)]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-color)] mb-4">
                How It Works
              </h2>
              <p className="text-xl text-[var(--text-muted)]">
                Simple, powerful editing in three steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--primary-color)] text-white rounded-full 
                  flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-color)] mb-3">
                  Write or Paste
                </h3>
                <p className="text-[var(--text-muted)]">
                  Create a new chapter or paste your existing text into our accessible editor.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--primary-color)] text-white rounded-full 
                  flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-color)] mb-3">
                  AI Analysis
                </h3>
                <p className="text-[var(--text-muted)]">
                  Our AI instantly analyzes your text for errors, repetitions, and inconsistencies.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--primary-color)] text-white rounded-full 
                  flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-color)] mb-3">
                  Review & Improve
                </h3>
                <p className="text-[var(--text-muted)]">
                  See highlighted suggestions and detailed feedback to polish your writing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-color)] mb-4">
              Ready to Improve Your Fiction?
            </h2>
            <p className="text-xl text-[var(--text-muted)] mb-8 max-w-2xl mx-auto">
              Join writers who are already using AI to make their stories better. 
              Free to start, powerful to use.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium 
                  bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
              >
                Start Writing Better Fiction
              </Link>
              <Link
                to="/help"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium 
                  border border-[var(--border-color)] text-[var(--text-color)] rounded-lg 
                  hover:bg-[var(--surface-color)] transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[var(--surface-color)] border-t border-[var(--border-color)] py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <span role="img" aria-label="Book icon" className="text-2xl">📖</span>
                <span className="text-lg font-semibold text-[var(--text-color)]">
                  AI Fiction Editing Tool
                </span>
              </div>
              
              <div className="flex items-center gap-6 text-[var(--text-muted)]">
                <Link to="/help" className="hover:text-[var(--text-color)] transition-colors">
                  Help
                </Link>
                <span className="text-sm">
                  Built with accessibility in mind
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-[var(--border-color)] text-center text-sm text-[var(--text-muted)]">
              <p>Press F12 anywhere for debug console • Fully keyboard accessible • Screen reader compatible</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Home;

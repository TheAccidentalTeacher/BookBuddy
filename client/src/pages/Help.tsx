import React from 'react';
import { Helmet } from 'react-helmet-async';

function Help() {
  return (
    <>
      <Helmet>
        <title>Help - AI Fiction Editing Tool</title>
        <meta name="description" content="Get help using the AI Fiction Editing Tool" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-[var(--text-color)] mb-8">
          Help & Support
        </h1>

        {/* Quick Start */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--text-color)] mb-4">
            Quick Start Guide
          </h2>
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6">
            <ol className="space-y-3 text-[var(--text-color)]">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[var(--primary-color)] text-white rounded-full 
                  flex items-center justify-center text-sm font-medium">1</span>
                <div>
                  <strong>Create an account</strong> - Sign up with your email and create a secure password
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[var(--primary-color)] text-white rounded-full 
                  flex items-center justify-center text-sm font-medium">2</span>
                <div>
                  <strong>Start a new chapter</strong> - Click "New Chapter" or use the editor to begin writing
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[var(--primary-color)] text-white rounded-full 
                  flex items-center justify-center text-sm font-medium">3</span>
                <div>
                  <strong>Write or paste your text</strong> - The editor supports rich formatting and pasting from other sources
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[var(--primary-color)] text-white rounded-full 
                  flex items-center justify-center text-sm font-medium">4</span>
                <div>
                  <strong>Review AI suggestions</strong> - See highlights for corrections, repetitions, and improvements
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Features */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--text-color)] mb-4">
            Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-3">
                🤖 AI Editing
              </h3>
              <p className="text-[var(--text-muted)]">
                Automatic correction of typos, spelling errors, and basic grammar issues. 
                AI respects dialogue and preserves your author voice.
              </p>
            </div>

            <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-3">
                🔄 Repetition Detection
              </h3>
              <p className="text-[var(--text-muted)]">
                Smart detection of repeated words and phrases with customizable distance thresholds 
                for common vs. uncommon words.
              </p>
            </div>

            <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-3">
                ✅ Consistency Checking
              </h3>
              <p className="text-[var(--text-muted)]">
                Automatic tracking of character names, places, and story elements across chapters 
                to maintain consistency.
              </p>
            </div>

            <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-3">
                📝 Rich Text Editor
              </h3>
              <p className="text-[var(--text-muted)]">
                Full formatting support including italics, bold, scene breaks, headings, 
                and preservation of pasted formatting.
              </p>
            </div>
          </div>
        </section>

        {/* Accessibility */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--text-color)] mb-4">
            Accessibility Features
          </h2>
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-color)] mb-3">
                  Screen Reader Support
                </h3>
                <ul className="space-y-2 text-[var(--text-muted)]">
                  <li>• ARIA labels and descriptions</li>
                  <li>• Semantic HTML structure</li>
                  <li>• Live regions for dynamic updates</li>
                  <li>• Descriptive text for all elements</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[var(--text-color)] mb-3">
                  Keyboard Navigation
                </h3>
                <ul className="space-y-2 text-[var(--text-muted)]">
                  <li>• Tab/Shift+Tab navigation</li>
                  <li>• Enter/Space activation</li>
                  <li>• Arrow key menu navigation</li>
                  <li>• F12 for debug console</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[var(--text-color)] mb-3">
                  Visual Customization
                </h3>
                <ul className="space-y-2 text-[var(--text-muted)]">
                  <li>• Font size adjustment</li>
                  <li>• Light/dark/high-contrast themes</li>
                  <li>• Line spacing options</li>
                  <li>• Focus indicators</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[var(--text-color)] mb-3">
                  Content Accessibility
                </h3>
                <ul className="space-y-2 text-[var(--text-muted)]">
                  <li>• Descriptive tooltips</li>
                  <li>• Error announcements</li>
                  <li>• Progress indicators</li>
                  <li>• Status updates</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Debug Console */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--text-color)] mb-4">
            Debug Console (F12)
          </h2>
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6">
            <p className="text-[var(--text-muted)] mb-4">
              Press <kbd className="px-2 py-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded text-xs">F12</kbd> 
              to open the built-in debug console with these features:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-[var(--text-color)] mb-2">Logs Tab (Ctrl+1)</h4>
                <p className="text-sm text-[var(--text-muted)]">
                  Real-time application logs with filtering by level (info, warn, error)
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-[var(--text-color)] mb-2">Network Tab (Ctrl+2)</h4>
                <p className="text-sm text-[var(--text-muted)]">
                  Monitor API calls and network requests
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-[var(--text-color)] mb-2">AI Tab (Ctrl+3)</h4>
                <p className="text-sm text-[var(--text-muted)]">
                  View AI interactions and responses
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-[var(--text-color)] mb-2">Performance Tab (Ctrl+4)</h4>
                <p className="text-sm text-[var(--text-muted)]">
                  Check performance metrics and timing
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-[var(--text-color)] mb-2">Accessibility Tab (Ctrl+5)</h4>
                <p className="text-sm text-[var(--text-muted)]">
                  Run accessibility audits and view issues
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-[var(--text-color)] mb-2">Export Logs</h4>
                <p className="text-sm text-[var(--text-muted)]">
                  Export all logs and data as JSON for troubleshooting
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--text-color)] mb-4">
            Keyboard Shortcuts
          </h2>
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-color)] mb-3">Global</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Debug Console</span>
                    <kbd className="px-2 py-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded text-xs">F12</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Close Modal/Console</span>
                    <kbd className="px-2 py-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded text-xs">Esc</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[var(--text-color)] mb-3">Debug Console</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Logs Tab</span>
                    <kbd className="px-2 py-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded text-xs">Ctrl+1</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Network Tab</span>
                    <kbd className="px-2 py-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded text-xs">Ctrl+2</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">AI Tab</span>
                    <kbd className="px-2 py-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded text-xs">Ctrl+3</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Performance Tab</span>
                    <kbd className="px-2 py-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded text-xs">Ctrl+4</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Accessibility Tab</span>
                    <kbd className="px-2 py-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded text-xs">Ctrl+5</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--text-color)] mb-4">
            Need More Help?
          </h2>
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg p-6">
            <p className="text-[var(--text-muted)] mb-4">
              If you need additional assistance or have found a bug, here are some ways to get help:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span role="img" aria-label="Bug icon">🐛</span>
                <span className="text-[var(--text-color)]">
                  Use the F12 debug console to export logs when reporting issues
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <span role="img" aria-label="Accessibility icon">♿</span>
                <span className="text-[var(--text-color)]">
                  Run accessibility audits (F12 → Accessibility tab) to check for issues
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <span role="img" aria-label="Settings icon">⚙️</span>
                <span className="text-[var(--text-color)]">
                  Adjust display settings in your account settings for better accessibility
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Help;

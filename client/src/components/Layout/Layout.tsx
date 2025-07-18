import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useDebug } from '../../contexts/DebugContext';

interface LayoutProps {
  children?: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { colorScheme } = useSettings();
  const { log } = useDebug();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    log('info', 'auth', 'User logging out');
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'New Chapter', href: '/editor', icon: '✏️' },
    { name: 'All Chapters', href: '/chapters', icon: '📚' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
    { name: 'Help', href: '/help', icon: '❓' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <nav 
        className="w-64 bg-[var(--surface-color)] border-r border-[var(--border-color)] flex flex-col"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo/Header */}
        <div className="p-4 border-b border-[var(--border-color)]">
          <Link 
            to="/dashboard"
            className="flex items-center gap-2 text-xl font-bold text-[var(--primary-color)] no-underline"
            aria-label="AI Fiction Editing Tool - Go to dashboard"
          >
            <span role="img" aria-label="Book icon">📖</span>
            <span>BookBuddy</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white font-medium">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-color)] truncate">
                {user?.username}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 p-4">
          <ul className="space-y-2" role="list">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                             (item.href === '/dashboard' && location.pathname === '/');
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--primary-color)] text-white'
                        : 'text-[var(--text-color)] hover:bg-[var(--border-color)]'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span role="img" aria-hidden="true">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-color)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--error-color)] hover:bg-[var(--border-color)] rounded-md transition-colors"
            aria-label="Sign out of your account"
          >
            <span role="img" aria-hidden="true">🚪</span>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[var(--bg-color)] border-b border-[var(--border-color)] px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[var(--text-color)]">
              AI Fiction Editing Tool
            </h1>
            
            <div className="flex items-center gap-4">
              {/* Theme indicator */}
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <span role="img" aria-label={`Current theme: ${colorScheme}`}>
                  {colorScheme === 'dark' ? '🌙' : colorScheme === 'high-contrast' ? '🔆' : '☀️'}
                </span>
                <span className="hidden sm:inline">
                  {colorScheme === 'high-contrast' ? 'High Contrast' : 
                   colorScheme === 'dark' ? 'Dark' : 'Light'}
                </span>
              </div>

              {/* Debug indicator */}
              <button
                onClick={() => log('info', 'ui', 'Debug console toggled from header')}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors"
                aria-label="Press F12 to open debug console"
                title="Press F12 for debug console"
              >
                F12 Debug
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main 
          id="main-content"
          className="flex-1 overflow-auto"
          role="main"
        >
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default Layout;

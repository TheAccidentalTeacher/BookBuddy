import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children?: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'New Chapter', href: '/new-chapter', icon: '📝' },
    { name: 'All Chapters', href: '/chapters', icon: '📚' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
    { name: 'Help', href: '/help', icon: '❓' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <Link to="/" className="text-2xl font-bold text-white hover:text-gray-300 no-underline">
            📚 BookBuddy
          </Link>
        </div>
        
        <nav className="mt-8">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 transition-colors no-underline ${
                  isActive ? 'bg-gray-800 border-l-4 border-blue-500' : ''
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        {children || <Outlet />}
      </main>
    </div>
  );
}

export default Layout;

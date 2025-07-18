import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Help from './pages/Help';
import DebugConsole from './components/Debug/DebugConsole';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div 
        role="status" 
        aria-live="polite"
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color mx-auto mb-4"></div>
          <span className="sr-only">Loading application...</span>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>AI Fiction Editing Tool</title>
        <meta name="description" content="AI-powered fiction editing tool with full accessibility support" />
      </Helmet>

      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/help" element={<Help />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>

      <DebugConsole />
    </>
  );
}

export default App;

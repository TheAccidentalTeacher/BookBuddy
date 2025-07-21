import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { DebugProvider } from './contexts/DebugContext';

// Components
import Layout from './components/Layout/Layout';
import DebugConsole from './components/Debug/DebugConsole';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import NewChapter from './pages/NewChapter';
import AllChapters from './pages/AllChapters';
import Settings from './pages/Settings';
import Help from './pages/Help';

// Styles
import './styles/index.css';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <SettingsProvider>
          <DebugProvider>
            <Router>
              <div className="App">
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/new-chapter" element={<NewChapter />} />
                    <Route path="/chapters" element={<AllChapters />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
                <DebugConsole />
                <Toaster position="top-right" />
              </div>
            </Router>
          </DebugProvider>
        </SettingsProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;

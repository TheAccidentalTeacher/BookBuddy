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
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
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
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
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

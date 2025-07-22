import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

// Context Providers  
import { SettingsProvider } from './contexts/SettingsContext';
import { DebugProvider } from './contexts/DebugContext';

// Components
import DebugConsole from './components/Debug/DebugConsole';

// Pages
import Home from './pages/Home';

// Styles
import './styles/index.css';

function App() {
  return (
    <HelmetProvider>
      <SettingsProvider>
        <DebugProvider>
          <div className="App">
            <Home />
            <DebugConsole />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </DebugProvider>
      </SettingsProvider>
    </HelmetProvider>
  );
}

export default App;

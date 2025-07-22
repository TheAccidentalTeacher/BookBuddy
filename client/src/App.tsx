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
            <Toaster position="top-right" />
          </div>
        </DebugProvider>
      </SettingsProvider>
    </HelmetProvider>
  );
}

export default App;

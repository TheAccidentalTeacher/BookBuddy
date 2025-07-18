import React, { createContext, useContext, useState, useCallback } from 'react';

interface DebugLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  category: string;
  message: string;
  data?: any;
}

interface DebugState {
  isOpen: boolean;
  logs: DebugLog[];
  networkRequests: any[];
  aiInteractions: any[];
  performanceMetrics: Record<string, number>;
}

interface DebugContextType extends DebugState {
  toggle: () => void;
  close: () => void;
  log: (level: 'info' | 'warn' | 'error', category: string, message: string, data?: any) => void;
  addNetworkRequest: (request: any) => void;
  addAIInteraction: (interaction: any) => void;
  addPerformanceMetric: (name: string, value: number) => void;
  clearLogs: () => void;
  exportLogs: () => void;
  runAccessibilityAudit: () => Promise<any[]>;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DebugState>({
    isOpen: false,
    logs: [],
    networkRequests: [],
    aiInteractions: [],
    performanceMetrics: {},
  });

  const toggle = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const close = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const log = useCallback((
    level: 'info' | 'warn' | 'error',
    category: string,
    message: string,
    data?: any
  ) => {
    const logEntry: DebugLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      level,
      category,
      message,
      data,
    };

    setState(prev => ({
      ...prev,
      logs: [logEntry, ...prev.logs].slice(0, 1000), // Keep last 1000 logs
    }));

    // Also log to browser console for development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = level === 'error' ? console.error : 
                           level === 'warn' ? console.warn : console.log;
      consoleMethod(`[${category}] ${message}`, data);
    }
  }, []);

  const addNetworkRequest = useCallback((request: any) => {
    setState(prev => ({
      ...prev,
      networkRequests: [request, ...prev.networkRequests].slice(0, 100),
    }));
  }, []);

  const addAIInteraction = useCallback((interaction: any) => {
    setState(prev => ({
      ...prev,
      aiInteractions: [interaction, ...prev.aiInteractions].slice(0, 50),
    }));
  }, []);

  const addPerformanceMetric = useCallback((name: string, value: number) => {
    setState(prev => ({
      ...prev,
      performanceMetrics: {
        ...prev.performanceMetrics,
        [name]: value,
      },
    }));
  }, []);

  const clearLogs = useCallback(() => {
    setState(prev => ({
      ...prev,
      logs: [],
      networkRequests: [],
      aiInteractions: [],
      performanceMetrics: {},
    }));
  }, []);

  const exportLogs = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      logs: state.logs,
      networkRequests: state.networkRequests,
      aiInteractions: state.aiInteractions,
      performanceMetrics: state.performanceMetrics,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state]);

  const runAccessibilityAudit = useCallback(async () => {
    const issues: any[] = [];

    // Check for missing alt text
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push({
        type: 'missing-alt-text',
        severity: 'error',
        count: images.length,
        message: `${images.length} images missing alt text`,
        elements: Array.from(images),
      });
    }

    // Check for missing form labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputs.forEach(input => {
      const inputElement = input as HTMLInputElement;
      const label = document.querySelector(`label[for="${inputElement.id}"]`);
      if (!label && inputElement.type !== 'hidden' && inputElement.type !== 'submit') {
        issues.push({
          type: 'missing-label',
          severity: 'error',
          message: `Input missing label: ${inputElement.outerHTML}`,
          element: inputElement,
        });
      }
    });

    // Check for missing headings hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        issues.push({
          type: 'heading-hierarchy',
          severity: 'warning',
          message: `Heading level skipped: ${heading.tagName} after h${lastLevel}`,
          element: heading,
        });
      }
      lastLevel = level;
    });

    // Check color contrast (basic check)
    const elements = document.querySelectorAll('*');
    const contrastIssues: any[] = [];
    
    elements.forEach(element => {
      const style = window.getComputedStyle(element);
      const bgColor = style.backgroundColor;
      const textColor = style.color;
      
      // Basic contrast check (would need a proper library for accurate calculation)
      if (bgColor && textColor && element.textContent?.trim()) {
        // This is a simplified check - in production, use a proper contrast calculator
        const isLowContrast = bgColor === textColor || 
                             (bgColor === 'rgb(255, 255, 255)' && textColor === 'rgb(200, 200, 200)');
        
        if (isLowContrast) {
          contrastIssues.push({
            type: 'low-contrast',
            severity: 'warning',
            message: `Potential contrast issue`,
            element: element,
            colors: { background: bgColor, text: textColor },
          });
        }
      }
    });

    if (contrastIssues.length > 0) {
      issues.push({
        type: 'contrast-issues',
        severity: 'warning',
        count: contrastIssues.length,
        message: `${contrastIssues.length} potential contrast issues found`,
        details: contrastIssues.slice(0, 10), // Show first 10
      });
    }

    // Check for missing ARIA landmarks
    const main = document.querySelector('main, [role="main"]');
    if (!main) {
      issues.push({
        type: 'missing-landmark',
        severity: 'warning',
        message: 'No main landmark found',
      });
    }

    const nav = document.querySelector('nav, [role="navigation"]');
    if (!nav) {
      issues.push({
        type: 'missing-landmark',
        severity: 'info',
        message: 'No navigation landmark found',
      });
    }

    log('info', 'accessibility-audit', `Accessibility audit completed. Found ${issues.length} issues.`, issues);
    
    return issues;
  }, [log]);

  // Set up F12 key listener
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F12') {
        event.preventDefault();
        toggle();
      }
      if (event.key === 'Escape' && state.isOpen) {
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle, close, state.isOpen]);

  // Log initial load
  React.useEffect(() => {
    log('info', 'app', 'Application initialized', {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }, [log]);

  const value: DebugContextType = {
    ...state,
    toggle,
    close,
    log,
    addNetworkRequest,
    addAIInteraction,
    addPerformanceMetric,
    clearLogs,
    exportLogs,
    runAccessibilityAudit,
  };

  return (
    <DebugContext.Provider value={value}>
      {children}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
}

import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorScheme: 'light' | 'dark' | 'high-contrast';
  lineSpacing: 'normal' | 'relaxed' | 'loose';
  updateSettings: (settings: Partial<SettingsContextType>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser, token } = useAuth();

  const defaultSettings = {
    fontSize: 'medium' as const,
    colorScheme: 'light' as const,
    lineSpacing: 'normal' as const,
  };

  const settings = user?.settings || defaultSettings;

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-font-size', settings.fontSize);
    root.setAttribute('data-color-scheme', settings.colorScheme);
    root.setAttribute('data-line-spacing', settings.lineSpacing);
  }, [settings]);

  const updateSettings = async (newSettings: Partial<SettingsContextType>) => {
    if (!token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newSettings),
      });

      const data = await response.json();

      if (response.ok) {
        updateUser({
          settings: {
            ...settings,
            ...newSettings,
          },
        });
      } else {
        throw new Error(data.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Settings update failed:', error);
      throw error;
    }
  };

  const value: SettingsContextType = {
    ...settings,
    updateSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

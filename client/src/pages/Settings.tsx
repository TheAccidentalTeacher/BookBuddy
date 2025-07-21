import React from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

function Settings() {
  // Mock settings - in real app these would come from context/state
  const [settings, setSettings] = React.useState({
    fontSize: 'medium',
    theme: 'light',
    autoCorrect: true,
    highlightRepetition: true,
  });

  const updateSettings = (updates: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ fontSize: e.target.value as any });
    toast.success('Font size updated');
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ theme: e.target.value as any });
    toast.success('Theme updated');
  };

  return (
    <>
      <Helmet>
        <title>Settings - BookBuddy</title>
      </Helmet>
      
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="fontSize" className="block text-sm font-medium mb-2">
                  Font Size
                </label>
                <select
                  id="fontSize"
                  value={settings.fontSize}
                  onChange={handleFontSizeChange}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div>
                <label htmlFor="theme" className="block text-sm font-medium mb-2">
                  Theme
                </label>
                <select
                  id="theme"
                  value={settings.theme}
                  onChange={handleThemeChange}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="high-contrast">High Contrast</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">AI Settings</h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.autoCorrect}
                  onChange={(e) => {
                    updateSettings({ autoCorrect: e.target.checked });
                    toast.success('Auto-correct ' + (e.target.checked ? 'enabled' : 'disabled'));
                  }}
                  className="w-4 h-4"
                />
                <span>Enable auto-corrections</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.highlightRepetition}
                  onChange={(e) => {
                    updateSettings({ highlightRepetition: e.target.checked });
                    toast.success('Repetition highlighting ' + (e.target.checked ? 'enabled' : 'disabled'));
                  }}
                  className="w-4 h-4"
                />
                <span>Highlight repeated words</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;

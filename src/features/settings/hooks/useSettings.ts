import { useState, useEffect } from 'react';
import { Settings } from '../types';
import { loadSettings, saveSettings } from '../utils/settingsStorage';

const defaultSettings: Settings = {
  editor: {
    fontSize: 1,
    indentSize: 2,
    wordWrap: true,
    lineNumbers: true,
    minimap: true,
  },
  theme: {
    theme: "dark",
  },
  app: {
    autoSave: false,
    defaultFileExtension: "ms",
  }
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  
  useEffect(() => {
    const savedSettings = loadSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);
  
  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };
  
  return { settings, updateSettings };
}

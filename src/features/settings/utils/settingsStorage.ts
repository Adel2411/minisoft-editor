import { Settings } from '../types';

const SETTINGS_STORAGE_KEY = 'minisoft-editor-settings';

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function loadSettings(): Settings | null {
  const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (savedSettings) {
    try {
      return JSON.parse(savedSettings);
    } catch (e) {
      console.error('Failed to parse saved settings:', e);
    }
  }
  return null;
}

import { useEffect } from 'react';
import { useSettings } from './hooks/useSettings';
import SettingsPanel from './SettingsPanel';
import { Settings } from './types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  setFontSizeMultiplier?: (size: number) => void;
  setIndentSize?: (size: number) => void;
  setShowMinimap?: (show: boolean) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  setTheme,
  setFontSizeMultiplier,
  setIndentSize,
  setShowMinimap,
}: SettingsModalProps) {
  const { settings, updateSettings } = useSettings();

  // Apply settings to the app when they change
  useEffect(() => {
    if (settings) {
      // Apply theme
      setTheme(settings.theme.theme);
      
      // Apply editor settings if available
      if (setFontSizeMultiplier) {
        setFontSizeMultiplier(settings.editor.fontSize);
      }
      
      if (setIndentSize) {
        setIndentSize(settings.editor.indentSize);
      }
      
      if (setShowMinimap) {
        setShowMinimap(settings.editor.minimap);
      }
    }
  }, [settings, setTheme, setFontSizeMultiplier, setIndentSize, setShowMinimap]);

  // Handle settings changes
  const handleSettingsChange = (newSettings: Settings) => {
    updateSettings(newSettings);
  };
  
  return (
    <SettingsPanel
      isOpen={isOpen}
      onClose={onClose}
      settings={settings}
      onSettingsChange={handleSettingsChange}
      theme={theme}
    />
  );
}

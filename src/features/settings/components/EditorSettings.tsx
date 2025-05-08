import React from 'react';
import { Settings } from '../types';

interface EditorSettingsProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  theme: "dark" | "light";
}

export default function EditorSettings({ 
  settings, 
  onSettingsChange,
  theme
}: EditorSettingsProps) {
  const handleFontSizeChange = (size: number) => {
    const newSettings = {
      ...settings,
      editor: {
        ...settings.editor,
        fontSize: size,
      }
    };
    onSettingsChange(newSettings);
  };

  const handleIndentSizeChange = (size: number) => {
    const newSettings = {
      ...settings,
      editor: {
        ...settings.editor,
        indentSize: size,
      }
    };
    onSettingsChange(newSettings);
  };

  const handleToggleSetting = (setting: keyof Settings['editor']) => {
    const newSettings = {
      ...settings,
      editor: {
        ...settings.editor,
        [setting]: !settings.editor[setting],
      }
    };
    onSettingsChange(newSettings);
  };

  const labelClass = `block text-sm font-medium mb-1 ${
    theme === "dark" ? "text-[#d9cec9]" : "text-[#495057]"
  }`;

  const toggleClass = `relative inline-flex items-center cursor-pointer`;

  return (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-[#f3ebe7]" : "text-[#212529]"}`}>
        Editor Settings
      </h3>
      
      {/* Font Size */}
      <div className="mb-4">
        <label className={labelClass}>
          Font Size: {Math.round(settings.editor.fontSize * 100)}%
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs">50%</span>
          <input 
            type="range" 
            min="0.5" 
            max="2" 
            step="0.1" 
            value={settings.editor.fontSize} 
            onChange={(e) => handleFontSizeChange(parseFloat(e.target.value))}
            className="w-full"
            style={{
              accentColor: theme === "dark" ? "#e86f42" : "#e05d30",
            }}
          />
          <span className="text-xs">200%</span>
        </div>
      </div>
      
      {/* Indent Size */}
      <div className="mb-4">
        <label className={labelClass}>
          Indent Size: {settings.editor.indentSize} spaces
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs">2</span>
          <input 
            type="range" 
            min="2" 
            max="8" 
            step="2" 
            value={settings.editor.indentSize} 
            onChange={(e) => handleIndentSizeChange(parseInt(e.target.value))}
            className="w-full"
            style={{
              accentColor: theme === "dark" ? "#e86f42" : "#e05d30",
            }}
          />
          <span className="text-xs">8</span>
        </div>
      </div>
      
      {/* Word Wrap */}
      <div className="flex items-center justify-between mb-4">
        <label className={labelClass}>
          Word Wrap
        </label>
        <label className={toggleClass}>
          <input 
            type="checkbox" 
            checked={settings.editor.wordWrap}
            onChange={() => handleToggleSetting('wordWrap')}
            className="sr-only peer"
          />
          <div 
            className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
              theme === "dark"
                ? "bg-[#3e3632] peer-checked:bg-[#e86f42] peer-focus:ring-[#e86f42]"
                : "bg-[#efe0d9] peer-checked:bg-[#e05d30] peer-focus:ring-[#e05d30]"
            }`}
          ></div>
        </label>
      </div>
      
      {/* Line Numbers */}
      <div className="flex items-center justify-between mb-4">
        <label className={labelClass}>
          Show Line Numbers
        </label>
        <label className={toggleClass}>
          <input 
            type="checkbox" 
            checked={settings.editor.lineNumbers}
            onChange={() => handleToggleSetting('lineNumbers')}
            className="sr-only peer"
          />
          <div 
            className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
              theme === "dark"
                ? "bg-[#3e3632] peer-checked:bg-[#e86f42] peer-focus:ring-[#e86f42]"
                : "bg-[#efe0d9] peer-checked:bg-[#e05d30] peer-focus:ring-[#e05d30]"
            }`}
          ></div>
        </label>
      </div>
      
      {/* Minimap */}
      <div className="flex items-center justify-between mb-4">
        <label className={labelClass}>
          Show Minimap
        </label>
        <label className={toggleClass}>
          <input 
            type="checkbox" 
            checked={settings.editor.minimap}
            onChange={() => handleToggleSetting('minimap')}
            className="sr-only peer"
          />
          <div 
            className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
              theme === "dark"
                ? "bg-[#3e3632] peer-checked:bg-[#e86f42] peer-focus:ring-[#e86f42]"
                : "bg-[#efe0d9] peer-checked:bg-[#e05d30] peer-focus:ring-[#e05d30]"
            }`}
          ></div>
        </label>
      </div>
    </div>
  );
}

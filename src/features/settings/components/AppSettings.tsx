import React from 'react';
import { Settings } from '../types';

interface AppSettingsProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  theme: "dark" | "light";
}

export default function AppSettings({ 
  settings, 
  onSettingsChange,
  theme
}: AppSettingsProps) {
  const handleAutoSaveChange = () => {
    const newSettings = {
      ...settings,
      app: {
        ...settings.app,
        autoSave: !settings.app.autoSave,
      }
    };
    onSettingsChange(newSettings);
  };

  const handleFileExtensionChange = (extension: string) => {
    const newSettings = {
      ...settings,
      app: {
        ...settings.app,
        defaultFileExtension: extension,
      }
    };
    onSettingsChange(newSettings);
  };

  const labelClass = `block text-sm font-medium mb-1 ${
    theme === "dark" ? "text-[#d9cec9]" : "text-[#495057]"
  }`;

  const inputClass = `w-full p-2 rounded-md border ${
    theme === "dark" 
      ? "bg-[#262220] border-[#3e3632] text-[#f3ebe7] focus:border-[#e86f42]" 
      : "bg-white border-[#efe0d9] text-[#212529] focus:border-[#e05d30]"
  } focus:outline-none focus:ring-1 ${
    theme === "dark" ? "focus:ring-[#e86f42]" : "focus:ring-[#e05d30]"
  }`;

  return (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-[#f3ebe7]" : "text-[#212529]"}`}>
        Application Settings
      </h3>
      
      {/* Auto Save */}
      <div className="flex items-center justify-between mb-4">
        <label className={labelClass}>
          Auto Save
        </label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={settings.app.autoSave}
            onChange={handleAutoSaveChange}
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
      
      {/* Default File Extension */}
      <div className="mb-4">
        <label className={labelClass}>
          Default File Extension
        </label>
        <input 
          type="text" 
          value={settings.app.defaultFileExtension} 
          onChange={(e) => handleFileExtensionChange(e.target.value)}
          className={inputClass}
          placeholder="ms"
        />
        <p className={`mt-1 text-xs ${theme === "dark" ? "text-[#b5a9a2]" : "text-[#868e96]"}`}>
          Extension will be used when saving files without a specified extension.
        </p>
      </div>
    </div>
  );
}

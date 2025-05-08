import React from 'react';
import { Settings } from '../types';
import { Moon, Sun } from 'lucide-react';

interface ThemeSettingsProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  theme: "dark" | "light";
}

export default function ThemeSettings({ 
  settings, 
  onSettingsChange,
  theme
}: ThemeSettingsProps) {
  const handleThemeChange = (newTheme: "dark" | "light") => {
    const newSettings = {
      ...settings,
      theme: {
        ...settings.theme,
        theme: newTheme,
      }
    };
    onSettingsChange(newSettings);
  };

  return (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-[#f3ebe7]" : "text-[#212529]"}`}>
        Theme Settings
      </h3>
      
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-3 ${
          theme === "dark" ? "text-[#d9cec9]" : "text-[#495057]"
        }`}>
          Editor Theme
        </label>
        
        <div className="flex gap-4">
          <div 
            className={`relative cursor-pointer rounded-md overflow-hidden transition-all ${
              settings.theme.theme === 'light' 
                ? 'ring-2 ring-offset-2 ring-[#e05d30]' 
                : 'hover:ring-1 hover:ring-[#b5a9a2]'
            }`}
            onClick={() => handleThemeChange('light')}
          >
            <div className="w-40 h-24 bg-[#fefaf8] border border-[#efe0d9]">
              <div className="w-full h-6 bg-white border-b border-[#efe0d9] flex items-center px-2">
                <div className="w-2 h-2 rounded-full bg-[#e05d30] mr-1"></div>
                <div className="w-2 h-2 rounded-full bg-[#FFB86C] mr-1"></div>
                <div className="w-2 h-2 rounded-full bg-[#50FA7B]"></div>
              </div>
              <div className="p-2">
                <div className="w-full h-2 bg-[#fff1ec] mb-1 rounded-sm"></div>
                <div className="w-2/3 h-2 bg-[#fff1ec] rounded-sm"></div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 py-1 bg-white text-center text-xs font-medium text-[#495057]">
              Light
            </div>
            {settings.theme.theme === 'light' && (
              <div className="absolute top-1 right-1">
                <Sun size={16} className="text-[#e05d30]" />
              </div>
            )}
          </div>
          
          <div 
            className={`relative cursor-pointer rounded-md overflow-hidden transition-all ${
              settings.theme.theme === 'dark' 
                ? 'ring-2 ring-offset-2 ring-[#e86f42]' 
                : 'hover:ring-1 hover:ring-[#b5a9a2]'
            }`}
            onClick={() => handleThemeChange('dark')}
          >
            <div className="w-40 h-24 bg-[#1e1a17] border border-[#3e3632]">
              <div className="w-full h-6 bg-[#262220] border-b border-[#3e3632] flex items-center px-2">
                <div className="w-2 h-2 rounded-full bg-[#e86f42] mr-1"></div>
                <div className="w-2 h-2 rounded-full bg-[#FFB86C] mr-1"></div>
                <div className="w-2 h-2 rounded-full bg-[#50FA7B]"></div>
              </div>
              <div className="p-2">
                <div className="w-full h-2 bg-[#312c28] mb-1 rounded-sm"></div>
                <div className="w-2/3 h-2 bg-[#312c28] rounded-sm"></div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 py-1 bg-[#262220] text-center text-xs font-medium text-[#d9cec9]">
              Dark
            </div>
            {settings.theme.theme === 'dark' && (
              <div className="absolute top-1 right-1">
                <Moon size={16} className="text-[#e86f42]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

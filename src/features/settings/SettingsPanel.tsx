import React, { useState } from 'react';
import { X } from 'lucide-react';
import EditorSettings from './components/EditorSettings';
import ThemeSettings from './components/ThemeSettings';
import AppSettings from './components/AppSettings';
import ShortcutSettings from './components/ShortcutSettings';
import { Settings } from './types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  theme: "dark" | "light";
}

export default function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  theme,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('editor');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className={`w-full max-w-2xl rounded-lg shadow-xl ${
          theme === "dark" ? "bg-[#262220]" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"
          }`}
        >
          <h3
            className={`text-lg font-medium ${
              theme === "dark" ? "text-[#f3ebe7]" : "text-[#212529]"
            }`}
          >
            Settings
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-full transition-colors ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                : "hover:bg-[#fff1ec] text-[#868e96] hover:text-[#212529]"
            }`}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs and Content */}
        <div className="flex h-[500px]">
          {/* Sidebar tabs */}
          <div 
            className={`w-1/4 border-r ${
              theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"
            }`}
          >
            <nav className="p-2">
              <ul>
                <li>
                  <button
                    onClick={() => setActiveTab('editor')}
                    className={`px-3 py-2 rounded-md text-sm font-medium w-full text-left transition-colors ${
                      activeTab === 'editor'
                        ? theme === "dark"
                          ? "bg-[#312c28] text-[#e86f42]"
                          : "bg-[#fff1ec] text-[#e05d30]"
                        : theme === "dark"
                          ? "hover:bg-[#312c28] text-[#d9cec9]"
                          : "hover:bg-[#fff1ec] text-[#495057]"
                    }`}
                  >
                    Editor
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('theme')}
                    className={`px-3 py-2 rounded-md text-sm font-medium w-full text-left transition-colors ${
                      activeTab === 'theme'
                        ? theme === "dark"
                          ? "bg-[#312c28] text-[#e86f42]"
                          : "bg-[#fff1ec] text-[#e05d30]"
                        : theme === "dark"
                          ? "hover:bg-[#312c28] text-[#d9cec9]"
                          : "hover:bg-[#fff1ec] text-[#495057]"
                      }`}
                  >
                    Theme
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('app')}
                    className={`px-3 py-2 rounded-md text-sm font-medium w-full text-left transition-colors ${
                      activeTab === 'app'
                        ? theme === "dark"
                          ? "bg-[#312c28] text-[#e86f42]"
                          : "bg-[#fff1ec] text-[#e05d30]"
                        : theme === "dark"
                          ? "hover:bg-[#312c28] text-[#d9cec9]"
                          : "hover:bg-[#fff1ec] text-[#495057]"
                      }`}
                  >
                    Application
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('shortcuts')}
                    className={`px-3 py-2 rounded-md text-sm font-medium w-full text-left transition-colors ${
                      activeTab === 'shortcuts'
                        ? theme === "dark"
                          ? "bg-[#312c28] text-[#e86f42]"
                          : "bg-[#fff1ec] text-[#e05d30]"
                        : theme === "dark"
                          ? "hover:bg-[#312c28] text-[#d9cec9]"
                          : "hover:bg-[#fff1ec] text-[#495057]"
                      }`}
                  >
                    Shortcuts
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Content area */}
          <div className="w-3/4 p-6 overflow-y-auto">
            {activeTab === 'editor' && (
              <EditorSettings
                settings={settings}
                onSettingsChange={onSettingsChange}
                theme={theme}
              />
            )}
            
            {activeTab === 'theme' && (
              <ThemeSettings
                settings={settings}
                onSettingsChange={onSettingsChange}
                theme={theme}
              />
            )}
            
            {activeTab === 'app' && (
              <AppSettings
                settings={settings}
                onSettingsChange={onSettingsChange}
                theme={theme}
              />
            )}
            
            {activeTab === 'shortcuts' && (
              <ShortcutSettings theme={theme} />
            )}
          </div>
        </div>

        {/* Footer with buttons */}
        <div 
          className={`p-4 border-t flex justify-end gap-2 ${
            theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              theme === "dark"
                ? "bg-[#312c28] hover:bg-[#3e3632] text-[#d9cec9]"
                : "bg-[#fff1ec] hover:bg-[#efe0d9] text-[#495057]"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import Image from "next/image";
import {
  FolderOpen,
  Save,
  Play,
  Terminal as TerminalIcon,
  Moon,
  Sun,
  Settings,
} from "lucide-react";

interface AppHeaderProps {
  theme: "dark" | "light";
  currentFileName: string | null;
  isCompiling: boolean;
  isTerminalOpen: boolean;
  setIsFileModalOpen: (open: boolean) => void;
  downloadFile: () => void;
  compileCode: () => void;
  setIsTerminalOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setIsSettingsModalOpen: (open: boolean) => void;
}

export default function AppHeader({
  theme,
  currentFileName,
  isCompiling,
  isTerminalOpen,
  setIsFileModalOpen,
  downloadFile,
  compileCode,
  setIsTerminalOpen,
  toggleTheme,
  setIsSettingsModalOpen,
}: AppHeaderProps) {
  return (
    <header
      className={`flex items-center justify-between p-3 border-b transition-colors duration-300 ${
        theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"
      }`}
    >
      <div className="flex items-center gap-2">
        <Image
          src={"/minisoft-icon.png"}
          alt="MiniSoft Editor Logo"
          width={30}
          height={30}
        />
        <h1 className="text-xl font-bold">MiniSoft Editor</h1>
        {currentFileName && (
          <span
            className={`text-sm px-2 py-0.5 rounded-md ml-2 ${
              theme === "dark"
                ? "bg-[#312c28] text-[#b5a9a2]"
                : "bg-[#fff1ec] text-gray-600"
            }`}
          >
            {currentFileName}
          </span>
        )}
      </div>

      <div className="flex items-center">
        {/* File operations */}
        <div
          className={`flex items-center mr-4 border-r pr-4 ${theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"}`}
        >
          <button
            onClick={() => setIsFileModalOpen(true)}
            className={`p-2 rounded-md transition-colors flex items-center gap-1.5 ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#d9cec9]"
                : "hover:bg-[#fff1ec] text-gray-700"
            }`}
            title="Open File"
          >
            <FolderOpen size={16} />
            <span className="text-sm">Open</span>
          </button>

          <button
            onClick={downloadFile}
            className={`p-2 rounded-md transition-colors flex items-center gap-1.5 ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#d9cec9]"
                : "hover:bg-[#fff1ec] text-gray-700"
            }`}
            title="Save File"
          >
            <Save size={16} />
            <span className="text-sm">Save</span>
          </button>
        </div>

        {/* Compile button */}
        <button
          onClick={compileCode}
          disabled={isCompiling}
          className={`p-2 rounded-md text-white font-medium transition-colors duration-200 flex items-center gap-1.5 mr-4 ${
            isCompiling
              ? "bg-gray-500 cursor-not-allowed"
              : theme === "dark"
                ? "bg-[#e86f42] hover:bg-[#f39c78]"
                : "bg-[#e05d30] hover:bg-[#cb502a]"
          }`}
          title="Compile Code"
        >
          <Play size={16} />
          <span className="text-sm">
            {isCompiling ? "Compiling..." : "Compile"}
          </span>
        </button>

        {/* Settings and view options */}
        <div className="flex items-center gap-1">
          {/* Terminal toggle button */}
          <button
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className={`p-2 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#d9cec9]"
                : "hover:bg-[#fff1ec] text-gray-700"
            } ${isTerminalOpen ? (theme === "dark" ? "bg-[#312c28] text-[#e86f42]" : "bg-[#fff1ec] text-[#e05d30]") : ""}`}
            title="Toggle Terminal"
          >
            <TerminalIcon size={16} />
          </button>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#d9cec9]"
                : "hover:bg-[#fff1ec] text-gray-700"
            }`}
            title={
              theme === "dark"
                ? "Switch to Light Mode"
                : "Switch to Dark Mode"
            }
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className={`p-2 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#d9cec9]"
                : "hover:bg-[#fff1ec] text-gray-700"
            }`}
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

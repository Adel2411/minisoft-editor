import React from 'react';
import { Code, Terminal as TerminalIcon } from "lucide-react";

interface WelcomeOverlayProps {
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
  theme: "dark" | "light";
}

export default function WelcomeOverlay({ showWelcome, setShowWelcome, theme }: WelcomeOverlayProps) {
  if (!showWelcome) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div
        className={`p-6 rounded-lg shadow-xl max-w-md text-center transform transition-all duration-500 animate-fadeIn ${
          theme === "dark" ? "bg-[#262220]" : "bg-white"
        }`}
      >
        <h2 className="text-2xl font-bold mb-4">
          Welcome to MiniSoft Editor
        </h2>
        <p className="mb-6">
          A beautiful code editor for the MiniSoft language
        </p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            className={`p-3 rounded-md ${theme === "dark" ? "bg-[#312c28]" : "bg-[#fff1ec]"}`}
          >
            <div className="text-[#e86f42] mb-2">
              <Code size={24} className="mx-auto" />
            </div>
            <p className="text-sm">Syntax highlighting</p>
          </div>
          <div
            className={`p-3 rounded-md ${theme === "dark" ? "bg-[#312c28]" : "bg-[#fff1ec]"}`}
          >
            <div className="text-[#e86f42] mb-2">
              <TerminalIcon size={24} className="mx-auto" />
            </div>
            <p className="text-sm">Compilation results</p>
          </div>
        </div>
        <button
          onClick={() => setShowWelcome(false)}
          className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
            theme === "dark"
              ? "bg-[#e86f42] hover:bg-[#f39c78]"
              : "bg-[#e05d30] hover:bg-[#cb502a]"
          }`}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

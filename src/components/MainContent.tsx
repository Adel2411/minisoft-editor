import React from 'react';
import { Code } from "lucide-react";
import Editor from "@/features/editor/CodeEditor";
import type { CompilationResult } from "@/types";
import ResultPanel from "@/features/results/ResultPanel";
import ResultTabs from "@/components/ResultTabs";

interface MainContentProps {
  theme: "dark" | "light";
  activeTab: string;
  setActiveTab: (tab: string) => void;
  editorReady: boolean;
  code: string;
  setCode: (code: string) => void;
  compileCode: () => void;
  fontSizeMultiplier: number;
  indentSize: number;
  showMinimap: boolean;
  compilationResult: CompilationResult | null;
}

export default function MainContent({
  theme,
  activeTab,
  setActiveTab,
  editorReady,
  code,
  setCode,
  compileCode,
  fontSizeMultiplier,
  indentSize,
  showMinimap,
  compilationResult,
}: MainContentProps) {
  return (
    <div className={`flex flex-col md:flex-row flex-1`}>
      <div
        className={`w-full md:w-1/2 border-r transition-colors duration-300 ${
          theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"
        } `}
      >
        <div
          className={`flex border-b transition-colors duration-300 ${
            theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"
          }`}
        >
          <button
            onClick={() => setActiveTab("editor")}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${
              activeTab === "editor"
                ? theme === "dark"
                  ? "border-b-2 border-[#e86f42] text-[#e86f42]"
                  : "border-b-2 border-[#e05d30] text-[#e05d30]"
                : ""
            }`}
          >
            <Code size={16} />
            Editor
          </button>
        </div>
        {editorReady && (
          <Editor
            code={code}
            setCode={setCode}
            theme={theme}
            onCompile={compileCode}
            fontSizeMultiplier={fontSizeMultiplier}
            indentSize={indentSize}
            showMinimap={showMinimap}
          />
        )}
      </div>

      {compilationResult && (
        <div
          className={`w-full md:w-1/2 transition-colors duration-300 ${
            theme === "dark" ? "bg-[#262220]" : "bg-white"
          } `}
        >
          <ResultTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            theme={theme}
          />
          <ResultPanel
            result={compilationResult}
            activeTab={activeTab}
            theme={theme}
          />
        </div>
      )}
    </div>
  );
}

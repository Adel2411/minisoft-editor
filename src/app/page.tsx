"use client";

import { useState, useEffect } from "react";
import type { CompilationErrors, CompilationResult } from "@/types";
import Editor from "@/features/editor/CodeEditor";
import ResultPanel from "@/features/results/ResultPanel";
import FileModal from "@/components/FileModal";
import {
  Code,
  Terminal as TerminalIcon,
  FileText,
  Database,
  FolderOpen,
  Save,
  Play,
  Moon,
  Sun,
  Settings,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import ErrorReporter from "@/components/ErrorReporter";
import Image from "next/image";
import Terminal from "@/features/terminal/Terminal";
import SettingsModal from "@/features/settings/SettingsModal";

export default function Home() {
  const [code, setCode] = useState<string>(
    `MainPrgm Factorial;
Var
  let n, result: Int;
  let numbers: [Int; 5] = {1, 2, 3, 4, 5};
  let pi: Float = (-3.14);
  let initialized: [Float; 3] = {1.1, 2.2, 3.3};
  @define Const Max_value: Int = (+100);

  let i: Int = 0;
BeginPg
{
  output("Factorial Calculator");
  output("Enter a number: ");
  input(n);
  
  if (n > Max_value) then {
    output("Number too large!");
  } else {
    result := 1;
    
    do {
      result := result * n;
      n := n - 1;
    } while (n > 0);
    
    output("Factorial result: ", result);
  }
  
  for numbers[0] from 1 to 10 step 2 {
    output("Counter: ", numbers[0]);
  }
  
  if (pi == 3.14) then {
    output("Pi is approximately ", pi);
  }
  
  do {
    numbers[i] := numbers[i] * 2;
    i := i + 1;
  } while (i < 5);
  
  if ((numbers[0] > 0) AND (numbers[1] > 0)) then {
    output("First two numbers are positive");
  }
  
  if (!((numbers[0] + numbers[1]) <= 0) OR (pi >= 3.0)) then {
    output("Complex condition met");
  }
}
EndPg;`,
  );
  const [compilationResult, setCompilationResult] =
    useState<CompilationResult | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("editor");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [editorReady, setEditorReady] = useState<boolean>(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [isFileModalOpen, setIsFileModalOpen] = useState<boolean>(false);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [error, setError] = useState<CompilationErrors | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState<number>(1);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [showMinimap, setShowMinimap] = useState<boolean>(true);

  // Set editor as ready after initial render
  useEffect(() => {
    setEditorReady(true);

    // Hide welcome message after 5 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Apply theme class to body
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    }
  }, [theme]);

  const compileCode = async () => {
    setIsCompiling(true);
    try {
      const compilationResult = await invoke<CompilationResult>(
        "compile_minisoft",
        {
          code,
          verbose: false,
        },
      );
      setCompilationResult(compilationResult);

      if (compilationResult.errors) {
        setError(compilationResult.errors);
        showNotification("Compilation process failed with errors", true);
      } else {
        setError(null);
        showNotification("Compilation process completed successfully!");
      }
    } catch (err: unknown) {
      setError({
        lexical_errors: [],
        syntax_errors: [],
        semantic_errors: [],
      });
      showNotification("Compilation process failed unexpectedly", true);
    } finally {
      setIsCompiling(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleFileUpload = (content: string, fileName: string) => {
    setCode(content);
    setCurrentFileName(fileName);
  };

  const downloadFile = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFileName || "minisoft-code.ms";
    a.click();
    URL.revokeObjectURL(url);

    // Show success notification
    showNotification(
      `File "${currentFileName || "minisoft-code.ms"}" downloaded!`,
    );
  };

  const showNotification = (message: string, isError = false) => {
    const notification = document.createElement("div");
    notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 transition-opacity duration-300 flex items-center gap-2 ${
      isError
        ? theme === "dark"
          ? "bg-red-900 text-red-100 border border-red-800"
          : "bg-red-100 text-red-800 border border-red-200"
        : theme === "dark"
          ? "bg-[#312c28] text-gray-200 border border-[#3e3632]"
          : "bg-white text-gray-800 border border-[#efe0d9]"
    }`;

    // Add icon
    const icon = document.createElement("span");
    if (isError) {
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else {
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    }

    const textNode = document.createElement("span");
    textNode.textContent = message;

    notification.appendChild(icon);
    notification.appendChild(textNode);
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const getThemeClass = (darkClass: string, lightClass: string) => {
    return theme === "dark" ? darkClass : lightClass;
  };

  return (
    <main
      className={`flex min-h-screen flex-col transition-colors duration-300 ${
        theme === "dark"
          ? "bg-[#1e1a17] text-[#f3ebe7]"
          : "bg-[#fefaf8] text-gray-900"
      }`}
    >
      {/* Welcome overlay */}
      {showWelcome && (
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
      )}

      {/* File upload modal */}
      <FileModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onFileUpload={handleFileUpload}
        theme={theme}
      />

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
            <div
              className={`flex border-b transition-colors duration-300 ${
                theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"
              }`}
            >
              <button
                onClick={() => setActiveTab("tokens")}
                className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${
                  activeTab === "tokens"
                    ? theme === "dark"
                      ? "border-b-2 border-[#e86f42] text-[#e86f42]"
                      : "border-b-2 border-[#e05d30] text-[#e05d30]"
                    : ""
                }`}
              >
                <FileText size={16} />
                Tokens
              </button>
              <button
                onClick={() => setActiveTab("ast")}
                className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${
                  activeTab === "ast"
                    ? theme === "dark"
                      ? "border-b-2 border-[#e86f42] text-[#e86f42]"
                      : "border-b-2 border-[#e05d30] text-[#e05d30]"
                    : ""
                }`}
              >
                <Code size={16} />
                AST
              </button>
              <button
                onClick={() => setActiveTab("symbols")}
                className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${
                  activeTab === "symbols"
                    ? theme === "dark"
                      ? "border-b-2 border-[#e86f42] text-[#e86f42]"
                      : "border-b-2 border-[#e05d30] text-[#e05d30]"
                    : ""
                }`}
              >
                <Database size={16} />
                Symbols
              </button>
              <button
                onClick={() => setActiveTab("quadruples")}
                className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${
                  activeTab === "quadruples"
                    ? theme === "dark"
                      ? "border-b-2 border-[#e86f42] text-[#e86f42]"
                      : "border-b-2 border-[#e05d30] text-[#e05d30]"
                    : ""
                }`}
              >
                <TerminalIcon size={16} />
                Quadruples
              </button>
            </div>
            <ResultPanel
              result={compilationResult}
              activeTab={activeTab}
              theme={theme}
            />
          </div>
        )}
      </div>
      {error && (
        <ErrorReporter
          sourceCode={code}
          errors={error}
          onDismiss={() => setError(null)}
          theme={theme}
        />
      )}

      {/* Terminal component */}
      <Terminal
        theme={theme}
        isVisible={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        compileCode={async (code, filePath) => {
          setCode(code);
          if (filePath) {
            setCurrentFileName(filePath);
          }
          await compileCode();
        }}
        setCurrentFileName={setCurrentFileName}
      />

      {/* Settings modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        theme={theme}
        setTheme={setTheme}
        setFontSizeMultiplier={setFontSizeMultiplier}
        setIndentSize={setIndentSize}
        setShowMinimap={setShowMinimap}
      />
    </main>
  );
}

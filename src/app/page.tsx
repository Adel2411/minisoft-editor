"use client";

import { useState, useEffect } from "react";
import type { CompilationErrors, CompilationResult } from "@/types";
import Editor from "@/components/CodeEditor";
import ResultPanel from "@/components/ResultPanel";
import FileModal from "@/components/FileModal";
import {
  Code,
  Terminal,
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

export default function Home() {
  const [code, setCode] = useState<string>(
    `MainPrgm Factorial;
Var
  let n: Int;
  let result: Float = 4.2;
  let i: Int = (-10);
BeginPg
{
  n := 5;
  result := 1.0;
  
  for i from 1 to n step 1 {
    result := result * i;
  }
  
  output(result);  <!- Outputs: 120 -!>
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

      // Check for errors in the compilation result
      if (compilationResult.errors) {
        setError(compilationResult.errors);
      } else {
        setError(null); // Clear errors if no errors exist
      }
    } catch (err: unknown) {
      setError({
        lexical_errors: [],
        syntax_errors: [],
        semantic_errors: [],
      });
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
          ? "bg-gray-800 text-gray-200 border border-gray-700"
          : "bg-white text-gray-800 border border-gray-200"
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
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Welcome overlay */}
      {showWelcome && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
          <div
            className={`p-6 rounded-lg shadow-xl max-w-md text-center transform transition-all duration-500 animate-fadeIn ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
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
                className={`p-3 rounded-md ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
              >
                <div className="text-emerald-500 mb-2">
                  <Code size={24} className="mx-auto" />
                </div>
                <p className="text-sm">Syntax highlighting</p>
              </div>
              <div
                className={`p-3 rounded-md ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
              >
                <div className="text-emerald-500 mb-2">
                  <Terminal size={24} className="mx-auto" />
                </div>
                <p className="text-sm">Compilation results</p>
              </div>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                theme === "dark"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
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
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              theme === "dark" ? "bg-emerald-500" : "bg-emerald-600"
            }`}
          ></div>
          <h1 className="text-xl font-bold">MiniSoft Editor</h1>
          {currentFileName && (
            <span
              className={`text-sm px-2 py-0.5 rounded-md ml-2 ${
                theme === "dark"
                  ? "bg-gray-800 text-gray-400"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {currentFileName}
            </span>
          )}
        </div>

        <div className="flex items-center">
          {/* File operations */}
          <div
            className={`flex items-center mr-4 border-r pr-4 ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}
          >
            <button
              onClick={() => setIsFileModalOpen(true)}
              className={`p-2 rounded-md transition-colors flex items-center gap-1.5 ${
                theme === "dark"
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-200 text-gray-700"
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
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-200 text-gray-700"
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
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
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
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-md transition-colors ${
                theme === "dark"
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-200 text-gray-700"
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
              className={`p-2 rounded-md transition-colors ${
                theme === "dark"
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-200 text-gray-700"
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
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          } `}
        >
          <div
            className={`flex border-b transition-colors duration-300 ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${
                activeTab === "editor"
                  ? theme === "dark"
                    ? "border-b-2 border-emerald-500 text-emerald-500"
                    : "border-b-2 border-emerald-600 text-emerald-600"
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
            />
          )}
        </div>

        {compilationResult && (
          <div
            className={`w-full md:w-1/2 transition-colors duration-300 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } `}
          >
            <div
              className={`flex border-b transition-colors duration-300 ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={() => setActiveTab("tokens")}
                className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${
                  activeTab === "tokens"
                    ? theme === "dark"
                      ? "border-b-2 border-emerald-500 text-emerald-500"
                      : "border-b-2 border-emerald-600 text-emerald-600"
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
                      ? "border-b-2 border-emerald-500 text-emerald-500"
                      : "border-b-2 border-emerald-600 text-emerald-600"
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
                      ? "border-b-2 border-emerald-500 text-emerald-500"
                      : "border-b-2 border-emerald-600 text-emerald-600"
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
                      ? "border-b-2 border-emerald-500 text-emerald-500"
                      : "border-b-2 border-emerald-600 text-emerald-600"
                    : ""
                }`}
              >
                <Terminal size={16} />
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
          errors={error}
          onDismiss={() => setError(null)}
          theme={theme}
        />
      )}
    </main>
  );
}

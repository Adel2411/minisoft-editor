"use client";

import React, { useState, useRef, useEffect } from "react";
import "./CodeEditor.css"; // Import CSS for syntax highlighting
import {
  ChevronDown,
  ChevronRight,
  Search,
  Settings,
  Save,
  Play,
} from "lucide-react";
import { tokenize } from "@/utils/tokenizer";

interface EditorProps {
  code: string;
  setCode: (code: string) => void;
  theme: "dark" | "light";
  onCompile: () => void;
}

export default function Editor({
  code,
  setCode,
  theme,
  onCompile,
}: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState<number>(2);
  const [cursorPosition, setCursorPosition] = useState<{
    line: number;
    column: number;
  }>({ line: 1, column: 1 });
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
  const [matches, setMatches] = useState<number[]>([]);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [foldedLines, setFoldedLines] = useState<number[]>([]);
  const [highlightedCode, setHighlightedCode] = useState<string>("");

  // Update line numbers when code changes
  useEffect(() => {
    const lines = code.split("\n").length;
    setLineCount(lines);
  }, [code]);

  // Add keyboard shortcut for search (Ctrl+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync scrolling between textarea and line numbers
  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;

    if (!textarea || !lineNumbers) return;

    const handleScroll = () => {
      lineNumbers.scrollTop = textarea.scrollTop;
    };

    textarea.addEventListener("scroll", handleScroll);
    return () => textarea.removeEventListener("scroll", handleScroll);
  }, []);

  // Tokenize and highlight the code whenever it changes
  useEffect(() => {
    const tokens = tokenize(code); // Tokenize the code
    console.log(tokens);
    const highlighted = tokens
      .map((token) => {
        // Escape HTML characters to prevent them from being interpreted as HTML tags
        const escapedValue = token.value
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        return `<span class="token ${token.type}">${escapedValue}</span>`;
      })
      .join("");
    setHighlightedCode(highlighted);
  }, [code]);

  // Function to generate line numbers considering folded sections
  const renderLineNumbers = () => {
    if (!code) return [];

    const codeLines = code.split("\n");
    const visibleLineNumbers = [];

    for (let i = 0; i < codeLines.length; i++) {
      const lineNumber = i + 1;

      // Check if this line should be hidden due to folding
      const shouldHide = foldedLines.some((foldedLine) => {
        return (
          foldedLine < lineNumber && isFoldedSection(code, foldedLine - 1, i)
        );
      });

      if (!shouldHide) {
        visibleLineNumbers.push(lineNumber);
      }
    }

    return visibleLineNumbers;
  };

  // Helper function to determine if a line is part of a folded section
  const isFoldedSection = (
    text: string,
    foldStart: number,
    currentLine: number,
  ) => {
    const lines = text.split("\n");
    const startLine = lines[foldStart];

    let openChar = startLine.trim().slice(-1);
    let closeChar;

    switch (openChar) {
      case "{":
        closeChar = "}";
        break;
      case "[":
        closeChar = "]";
        break;
      case "(":
        closeChar = ")";
        break;
      default:
        return false;
    }

    let depth = 1;
    for (let i = foldStart + 1; i <= currentLine; i++) {
      const line = lines[i];
      for (const char of line) {
        if (char === openChar) depth++;
        if (char === closeChar) depth--;

        if (depth === 0) return false;
      }
    }

    return depth > 0;
  };

  // Toggle line folding
  const toggleFold = (lineNumber: number) => {
    if (foldedLines.includes(lineNumber)) {
      setFoldedLines(foldedLines.filter((l) => l !== lineNumber));
    } else {
      setFoldedLines([...foldedLines, lineNumber]);
    }
  };

  // Search logic
  const getSearchMatches = () => {
    if (!searchTerm) return { matches: [], currentMatch: 0, totalMatches: 0 };

    const indices: number[] = [];
    let startIndex = 0;
    let index;

    while (
      (index = code
        .toLowerCase()
        .indexOf(searchTerm.toLowerCase(), startIndex)) > -1
    ) {
      indices.push(index);
      startIndex = index + searchTerm.length;
    }

    return {
      matches: indices,
      currentMatch: indices.length > 0 ? currentMatchIndex + 1 : 0,
      totalMatches: indices.length,
    };
  };

  const executeSearch = () => {
    if (!searchTerm) return;

    const { matches: searchMatches } = getSearchMatches();
    setMatches(searchMatches);
    setCurrentMatchIndex(0);

    if (searchMatches.length > 0) {
      highlightMatch(searchMatches[0]);
    }
  };

  const findNext = () => {
    const { matches } = getSearchMatches();
    if (matches.length === 0) return;

    const nextIndex = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(nextIndex);
    highlightMatch(matches[nextIndex]);
  };

  const findPrevious = () => {
    const { matches } = getSearchMatches();
    if (matches.length === 0) return;

    const prevIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
    setCurrentMatchIndex(prevIndex);
    highlightMatch(matches[prevIndex]);
  };

  const highlightMatch = (position: number) => {
    if (!textareaRef.current) return;

    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(
      position,
      position + searchTerm.length,
    );

    // Update cursor position
    const textBeforeCursor = code.substring(0, position);
    const line = (textBeforeCursor.match(/\n/g) || []).length + 1;
    const lastNewLine = textBeforeCursor.lastIndexOf("\n");
    const column = lastNewLine === -1 ? position + 1 : position - lastNewLine;
    setCursorPosition({ line, column });
  };

  return (
    <div
      ref={editorRef}
      className={`relative h-full min-h-[400px] font-mono text-sm border rounded-md overflow-hidden transition-colors duration-200 ${
        theme === "dark"
          ? "bg-[#262220] border-[#3e3632]"
          : "bg-white border-[#efe0d9]"
      } ${
        isFocused && theme === "dark"
          ? "border-[#e86f42]/50"
          : isFocused
            ? "border-[#e05d30]/50"
            : ""
      }`}
    >
      {/* Editor toolbar */}
      <div
        className={`flex items-center justify-between px-3 py-2 border-b ${
          theme === "dark"
            ? "bg-[#1e1a17] border-[#3e3632]"
            : "bg-[#fff1ec] border-[#efe0d9]"
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-1 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                : "hover:bg-[#efe0d9] text-[#495057] hover:text-[#212529]"
            }`}
            title="Search (Ctrl+F)"
          >
            <Search size={16} />
          </button>
          <button
            onClick={() => {
              const blob = new Blob([code], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "minisoft-code.ms";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className={`p-1 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                : "hover:bg-[#efe0d9] text-[#495057] hover:text-[#212529]"
            }`}
            title="Save (Ctrl+S)"
          >
            <Save size={16} />
          </button>
          <button
            onClick={onCompile}
            className={`p-1 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                : "hover:bg-[#efe0d9] text-[#495057] hover:text-[#212529]"
            }`}
            title="Run (Ctrl+Enter)"
          >
            <Play size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`p-1 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                : "hover:bg-[#efe0d9] text-[#495057] hover:text-[#212529]"
            }`}
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Search panel */}
      {isSearchOpen && (
        <div
          className={`p-2 flex items-center gap-2 border-b ${
            theme === "dark"
            ? "bg-[#1e1a17] border-[#3e3632]"
            : "bg-[#fff1ec] border-[#efe0d9]"
          }`}
        >
          <Search
            size={14}
            className={theme === "dark" ? "text-[#b5a9a2]" : "text-[#495057]"}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                executeSearch();
              }
            }}
            placeholder="Search"
            className={`flex-1 bg-transparent border outline-none px-2 py-1 rounded ${
              theme === "dark"
            ? "bg-[#1e1a17] border-[#3e3632]"
            : "bg-[#fff1ec] border-[#efe0d9]"
            }`}
            autoFocus
          />
          <button
            onClick={executeSearch}
            className={`px-2 py-1 rounded ${
              theme === "dark"
                ? "bg-[#312c28] hover:bg-[#3e3632] text-[#f3ebe7]"
                : "bg-[#efe0d9] hover:bg-[#e6d5ce] text-[#495057]"
            }`}
          >
            Search
          </button>
          <div className={`text-xs ${
            theme === "dark" ? "text-[#b5a9a2]" : "text-[#868e96]"
          }`}>
            {getSearchMatches().currentMatch}/{getSearchMatches().totalMatches}
          </div>
          <button
            onClick={findPrevious}
            className={`p-1 rounded ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                : "hover:bg-[#efe0d9] text-[#495057] hover:text-[#212529]"
            }`}
          >
            ↑
          </button>
          <button
            onClick={findNext}
            className={`p-1 rounded ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                : "hover:bg-[#efe0d9] text-[#495057] hover:text-[#212529]"
            }`}
          >
            ↓
          </button>
          <button
            onClick={() => setIsSearchOpen(false)}
            className={`p-1 rounded ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                : "hover:bg-[#efe0d9] text-[#495057] hover:text-[#212529]"
            }`}
          >
            ✕
          </button>
        </div>
      )}

      {/* Editor content with single scroll container */}
      <div
        className={`flex w-full`}
        style={{
          height: `calc(100% - ${isSearchOpen ? "6rem" : "3.5rem"})`,
        }}
      >
        {/* Line numbers with fold indicators */}
        <div
          ref={lineNumbersRef}
          className={`sticky left-0 w-12 select-none flex-shrink-0 ${
            theme === "dark"
              ? "bg-[#1e1a17] text-[#b5a9a2]"
              : "bg-[#fefaf8] text-[#868e96]"
          }`}
          style={{
            paddingTop: "16px", // Match the textarea's padding-top
            lineHeight: "24px", // Consistent line height
          }}
        >
          {renderLineNumbers().map((lineNum) => (
            <div
              key={lineNum}
              className={`flex items-center justify-end pr-2 h-6 leading-6 ${
                code.split("\n")[lineNum - 1]?.trim().endsWith("{") ||
                code.split("\n")[lineNum - 1]?.trim().endsWith("(") ||
                code.split("\n")[lineNum - 1]?.trim().endsWith("[")
                  ? "cursor-pointer"
                  : ""
              }`}
              onClick={() => {
                if (
                  code.split("\n")[lineNum - 1]?.trim().endsWith("{") ||
                  code.split("\n")[lineNum - 1]?.trim().endsWith("(") ||
                  code.split("\n")[lineNum - 1]?.trim().endsWith("[")
                ) {
                  toggleFold(lineNum);
                }
              }}
            >
              <span className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {(code.split("\n")[lineNum - 1]?.trim().endsWith("{") ||
                  code.split("\n")[lineNum - 1]?.trim().endsWith("(") ||
                  code.split("\n")[lineNum - 1]?.trim().endsWith("[")) &&
                  (foldedLines.includes(lineNum) ? (
                    <ChevronRight size={12} />
                  ) : (
                    <ChevronDown size={12} />
                  ))}
              </span>
              <span>{lineNum}</span>
            </div>
          ))}
        </div>

        {/* Code editor area */}
        <div className="relative flex-grow">
          {/* Highlighted code */}
          <div
            data-theme={theme}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
            className={`absolute top-0 left-0 w-full h-full p-4 pointer-events-none ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}
            style={{
              fontFamily: "inherit",
              fontSize: "inherit",
              lineHeight: "24px",
              tabSize: 2,
              whiteSpace: "pre",
              boxSizing: "border-box",
            }}
          />

          {/* Input textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onClick={() => {
              const cursorPos = textareaRef.current?.selectionStart || 0;
              const textBeforeCursor = code.substring(0, cursorPos);
              const line = (textBeforeCursor.match(/\n/g) || []).length + 1;
              const lastNewLine = textBeforeCursor.lastIndexOf("\n");
              const column =
                lastNewLine === -1 ? cursorPos + 1 : cursorPos - lastNewLine;
              setCursorPosition({ line, column });
            }}
            className="w-full h-full resize-none outline-none p-4 font-mono leading-6"
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            style={{
              whiteSpace: "pre",
              tabSize: 2,
              color: "transparent",
              caretColor: theme === "dark" ? "#e86f42" : "#e05d30",
              lineHeight: "24px",
              background: "transparent",
              boxSizing: "border-box",
              position: "relative",
              zIndex: 1,
            }}
          />
        </div>
      </div>

      {/* Status bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-6 flex items-center justify-between px-3 text-xs border-t ${
          theme === "dark"
            ? "bg-[#1e1a17] border-[#3e3632] text-[#b5a9a2]"
            : "bg-[#fff1ec] border-[#efe0d9] text-[#868e96]"
        }`}
      >
        <div>
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </div>
        <div>{lineCount} lines | MiniSoft</div>
      </div>
    </div>
  );
}

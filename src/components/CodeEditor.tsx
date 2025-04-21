"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Settings,
  Save,
  Play,
} from "lucide-react";

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
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [foldedLines, setFoldedLines] = useState<number[]>([]);

  // Update line numbers when code changes
  useEffect(() => {
    if (textareaRef.current) {
      const lines = textareaRef.current.value.split("\n").length;
      setLineCount(lines);
    }
  }, [code]);

  // Update cursor position
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;

    const cursorPos = textareaRef.current.selectionStart;
    const textBeforeCursor = code.substring(0, cursorPos);
    const line = (textBeforeCursor.match(/\n/g) || []).length + 1;
    const lastNewLine = textBeforeCursor.lastIndexOf("\n");
    const column = lastNewLine === -1 ? cursorPos + 1 : cursorPos - lastNewLine;

    setCursorPosition({ line, column });
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab key
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;

      // If text is selected, indent multiple lines
      if (start !== end) {
        const selectedText = code.substring(start, end);
        const lines = selectedText.split("\n");

        if (e.shiftKey) {
          // Unindent
          const newText = lines
            .map((line) => (line.startsWith("  ") ? line.substring(2) : line))
            .join("\n");
          const newCode =
            code.substring(0, start) + newText + code.substring(end);
          setCode(newCode);

          // Adjust selection
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = start;
              textareaRef.current.selectionEnd = start + newText.length;
            }
          }, 0);
        } else {
          // Indent
          const newText = lines.map((line) => "  " + line).join("\n");
          const newCode =
            code.substring(0, start) + newText + code.substring(end);
          setCode(newCode);

          // Adjust selection
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = start;
              textareaRef.current.selectionEnd = start + newText.length;
            }
          }, 0);
        }
      } else {
        // No selection, just insert tab at cursor
        const newText = code.substring(0, start) + "  " + code.substring(end);
        setCode(newText);

        // Set cursor position after the inserted tab
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart =
              textareaRef.current.selectionEnd = start + 2;
          }
        }, 0);
      }
    }

    // Enter key for automatic indentation
    if (e.key === "Enter") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const currentLine = code.substring(0, start).split("\n").pop() || "";

      // Calculate the indentation for the new line
      const indentation = getIndentation(currentLine);

      const newText =
        code.substring(0, start) + "\n" + indentation + code.substring(start);
      setCode(newText);

      // Set cursor position after the indentation
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = start + 1 + indentation.length;
        }
      }, 0);
    }

    // Auto-close brackets and quotes
    if (e.key === "(" || e.key === "[" || e.key === "{" || e.key === '"') {
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;

      // If text is selected, wrap it
      if (start !== end) {
        e.preventDefault();
        const selectedText = code.substring(start, end);
        let closingChar = "";

        switch (e.key) {
          case "(":
            closingChar = ")";
            break;
          case "[":
            closingChar = "]";
            break;
          case "{":
            closingChar = "}";
            break;
          case '"':
            closingChar = '"';
            break;
        }

        const newText =
          code.substring(0, start) +
          e.key +
          selectedText +
          closingChar +
          code.substring(end);
        setCode(newText);

        // Keep the selection
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start + 1;
            textareaRef.current.selectionEnd = end + 1;
          }
        }, 0);
      } else {
        // Auto-close the bracket/quote
        if (e.key === "(" || e.key === "[" || e.key === "{" || e.key === '"') {
          e.preventDefault();
          let closingChar = "";

          switch (e.key) {
            case "(":
              closingChar = ")";
              break;
            case "[":
              closingChar = "]";
              break;
            case "{":
              closingChar = "}";
              break;
            case '"':
              closingChar = '"';
              break;
          }

          const newText =
            code.substring(0, start) +
            e.key +
            closingChar +
            code.substring(end);
          setCode(newText);

          // Place cursor between the brackets/quotes
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart =
                textareaRef.current.selectionEnd = start + 1;
            }
          }, 0);
        }
      }
    }

    // Search shortcut (Ctrl+F)
    if (e.key === "f" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setIsSearchOpen(true);
    }

    // Save shortcut (Ctrl+S)
    if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      // Mock save functionality
      const blob = new Blob([code], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "minisoft-code.ms";
      a.click();
      URL.revokeObjectURL(url);
    }

    // Run shortcut (Ctrl+Enter)
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onCompile();
    }
  };

  // Sync scroll between line numbers and textarea
  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Simple indentation logic
  const getIndentation = (line: string): string => {
    const currentIndentation = line.match(/^\s*/)?.[0] || "";

    // Check if we need to increase indentation
    if (/[{[(]$/.test(line.trim())) {
      return currentIndentation + "  "; // Add two spaces for indentation
    }

    // Keep the same indentation level
    return currentIndentation;
  };

  // Toggle line folding
  const toggleFold = (lineNumber: number) => {
    if (foldedLines.includes(lineNumber)) {
      setFoldedLines(foldedLines.filter((l) => l !== lineNumber));
    } else {
      setFoldedLines([...foldedLines, lineNumber]);
    }
  };

  // Search in code
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm || !textareaRef.current) return;

    const searchIndex = code.indexOf(
      searchTerm,
      textareaRef.current.selectionStart + 1,
    );
    if (searchIndex !== -1) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        searchIndex,
        searchIndex + searchTerm.length,
      );

      // Ensure the found text is visible
      const textBeforeSearch = code.substring(0, searchIndex);
      const linesBeforeSearch = (textBeforeSearch.match(/\n/g) || []).length;
      const lineHeight = 24; // Approximate line height in pixels
      textareaRef.current.scrollTop = linesBeforeSearch * lineHeight;
    }
  };

  return (
    <div
      ref={editorRef}
      className={`relative h-full min-h-[400px] font-mono text-sm border rounded-md overflow-hidden transition-colors duration-200 ${
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      } ${isFocused && theme === "dark" ? "border-emerald-500/50" : isFocused ? "border-emerald-600/50" : ""}`}
    >
      {/* Editor toolbar */}
      <div
        className={`flex items-center justify-between px-3 py-2 border-b ${
          theme === "dark"
            ? "bg-gray-900 border-gray-700"
            : "bg-gray-100 border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-1 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                : "hover:bg-gray-200 text-gray-600 hover:text-gray-800"
            }`}
            title="Search (Ctrl+F)"
          >
            <Search size={16} />
          </button>
          <button
            onClick={() => {
              // Mock save functionality
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
                ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                : "hover:bg-gray-200 text-gray-600 hover:text-gray-800"
            }`}
            title="Save (Ctrl+S)"
          >
            <Save size={16} />
          </button>
          <button
            onClick={onCompile}
            className={`p-1 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                : "hover:bg-gray-200 text-gray-600 hover:text-gray-800"
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
                ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                : "hover:bg-gray-200 text-gray-600 hover:text-gray-800"
            }`}
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      {isSearchOpen && (
        <div
          className={`absolute top-12 right-4 z-10 p-2 rounded-md shadow-lg border ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className={`px-2 py-1 text-sm rounded-md border outline-none ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                  : "bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500"
              }`}
              autoFocus
            />
            <button
              type="submit"
              className={`px-2 py-1 text-sm rounded-md ${
                theme === "dark"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              Find
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className={`px-2 py-1 text-sm rounded-md ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              Close
            </button>
          </form>
        </div>
      )}

      {/* Line numbers with fold indicators */}
      <div
        ref={lineNumbersRef}
        className={`absolute left-0 top-12 bottom-6 w-12 overflow-hidden select-none ${
          theme === "dark"
            ? "bg-gray-900 text-gray-500"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {Array.from({ length: lineCount }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center justify-end pr-2 h-6 group ${
              code.split("\n")[i]?.trim().endsWith("{") ||
              code.split("\n")[i]?.trim().endsWith("(") ||
              code.split("\n")[i]?.trim().endsWith("[")
                ? "cursor-pointer"
                : ""
            }`}
            onClick={() => {
              if (
                code.split("\n")[i]?.trim().endsWith("{") ||
                code.split("\n")[i]?.trim().endsWith("(") ||
                code.split("\n")[i]?.trim().endsWith("[")
              ) {
                toggleFold(i + 1);
              }
            }}
          >
            <span className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {(code.split("\n")[i]?.trim().endsWith("{") ||
                code.split("\n")[i]?.trim().endsWith("(") ||
                code.split("\n")[i]?.trim().endsWith("[")) &&
                (foldedLines.includes(i + 1) ? (
                  <ChevronRight size={12} />
                ) : (
                  <ChevronDown size={12} />
                ))}
            </span>
            <span>{i + 1}</span>
          </div>
        ))}
      </div>

      {/* Editor textarea */}
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onClick={updateCursorPosition}
        onKeyUp={updateCursorPosition}
        className={`w-full h-[calc(100%-3rem)] resize-none outline-none p-4 pl-14 font-mono ${
          theme === "dark"
            ? "bg-gray-800 text-gray-100 caret-emerald-500"
            : "bg-white text-gray-900 caret-emerald-600"
        } transition-colors duration-200`}
        spellCheck="false"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
      />

      {/* Status bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-6 flex items-center justify-between px-3 text-xs border-t ${
          theme === "dark"
            ? "bg-gray-900 border-gray-700 text-gray-400"
            : "bg-gray-100 border-gray-200 text-gray-600"
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

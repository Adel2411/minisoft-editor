"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import "./styles/CodeEditor.css";
import { tokenize } from "@/utils/tokenizer";

// Import types
import { EditorProps, CursorPosition, CommandItem } from "./types";

// Import hooks
import { useEditorSearch } from "./hooks/useEditorSearch";
import { useEditorHistory } from "./hooks/useEditorHistory";
import { useCodeOperations } from "./hooks/useCodeOperations";
import { useCommandPalette } from "./hooks/useCommandPalette";

// Import components
import EditorToolbar from "./components/EditorToolbar";
import SearchPanel from "./components/SearchPanel";
import CommandPalette from "./components/CommandPalette";
import LineNumbers from "./components/LineNumbers";
import EditorContent from "./components/EditorContent";
import StatusBar from "./components/StatusBar";

export default function Editor({
  code,
  setCode,
  theme,
  onCompile,
}: EditorProps) {
  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // State
  const [lineCount, setLineCount] = useState<number>(2);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({
    line: 1,
    column: 1,
  });
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [foldedLines, setFoldedLines] = useState<number[]>([]);
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [selectedText, setSelectedText] = useState<string>("");
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState<number>(1);
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [indentSize, setIndentSize] = useState<number>(2);

  // Custom hooks
  const {
    searchState,
    setSearchState,
    getSearchMatches,
    executeSearch,
    findNext,
    findPrevious,
    replaceMatch,
    replaceAll,
    toggleSearchPanel,
    toggleReplacePanel,
  } = useEditorSearch({ code, setCursorPosition, textareaRef });

  const {
    isFileModified,
    undo: handleUndo,
    redo: handleRedo,
    saveFile,
    updateCode,
  } = useEditorHistory({ initialCode: code, code, setCode });

  const {
    goToLine,
    toggleComment,
    indentSelectedLines,
    outdentSelectedLines,
    duplicateLines,
    deleteLines,
    moveLines,
    handleBracketPairs,
  } = useCodeOperations({
    code,
    indentSize,
    textareaRef,
    updateCode,
    lineCount,
    setCursorPosition,
  });

  // Define commands for command palette - memoized to prevent infinite rendering
  const commands = useMemo<CommandItem[]>(
    () => [
      {
        id: "search",
        name: "Search",
        shortcut: "Ctrl+F",
        action: () => toggleSearchPanel(true),
      },
      {
        id: "replace",
        name: "Find and Replace",
        shortcut: "Ctrl+H",
        action: () => {
          toggleSearchPanel(true);
          toggleReplacePanel(true);
        },
      },
      { id: "save", name: "Save File", shortcut: "Ctrl+S", action: saveFile },
      {
        id: "run",
        name: "Run Code",
        shortcut: "Ctrl+Enter",
        action: onCompile,
      },
      {
        id: "toggle-comment",
        name: "Toggle Comment",
        shortcut: "Ctrl+/",
        action: toggleComment,
      },
      {
        id: "go-to-line",
        name: "Go to Line",
        shortcut: "Ctrl+G",
        action: () => {
          const lineNumber = prompt("Go to line:");
          if (lineNumber && !isNaN(parseInt(lineNumber))) {
            goToLine(parseInt(lineNumber));
          }
        },
      },
    ],
    [
      toggleSearchPanel,
      toggleReplacePanel,
      saveFile,
      onCompile,
      toggleComment,
      goToLine,
    ],
  );

  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    commandInput,
    setCommandInput,
    commandSuggestions,
    executeCommand,
    openCommandPalette,
  } = useCommandPalette(commands);

  // Update line numbers when code changes
  useEffect(() => {
    const lines = code.split("\n").length;
    setLineCount(lines);
  }, [code]);

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
    const tokens = tokenize(code);

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

  // Keyboard shortcut handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Search shortcuts
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        toggleSearchPanel(true);
      }

      // Run code shortcut
      if ((e.ctrlKey && e.key === "Enter") || (e.ctrlKey && e.key === "r")) {
        e.preventDefault();
        onCompile();
      }

      // Save shortcut
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        saveFile();
      }

      // Find and replace shortcut
      if (e.ctrlKey && e.key === "h") {
        e.preventDefault();
        toggleSearchPanel(true);
        toggleReplacePanel(true);
      }

      // Command palette
      if (
        (e.ctrlKey && e.shiftKey && e.key === "P") ||
        (e.ctrlKey && e.key === "p")
      ) {
        e.preventDefault();
        openCommandPalette();
      }

      // Go to line
      if (e.ctrlKey && e.key === "g") {
        e.preventDefault();
        const lineNumber = prompt("Go to line:");
        if (lineNumber && !isNaN(parseInt(lineNumber))) {
          goToLine(parseInt(lineNumber));
        }
      }

      // Undo/redo
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }

      // Comment/uncomment
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        toggleComment();
      }

      // Indent/outdent
      if (e.key === "Tab") {
        if (e.shiftKey) {
          e.preventDefault();
          outdentSelectedLines();
        } else {
          e.preventDefault();
          indentSelectedLines();
        }
      }

      // Zoom in/out
      if (e.ctrlKey && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        setFontSizeMultiplier((prev) => Math.min(prev + 0.1, 2.0));
      }
      if (e.ctrlKey && e.key === "-") {
        e.preventDefault();
        setFontSizeMultiplier((prev) => Math.max(prev - 0.1, 0.5));
      }
      if (e.ctrlKey && e.key === "0") {
        e.preventDefault();
        setFontSizeMultiplier(1);
      }

      // Duplicate lines
      if (e.ctrlKey && e.shiftKey && e.key === "d") {
        e.preventDefault();
        duplicateLines();
      }

      // Delete lines
      if (e.ctrlKey && e.shiftKey && e.key === "k") {
        e.preventDefault();
        deleteLines();
      }

      // Move lines up/down
      if (e.altKey && e.key === "ArrowUp") {
        e.preventDefault();
        moveLines("up");
      }
      if (e.altKey && e.key === "ArrowDown") {
        e.preventDefault();
        moveLines("down");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [code, onCompile, selectedText]);

  // Enhanced auto-pairing of brackets
  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd } = textarea;
    const currentSelectedText = code.substring(selectionStart, selectionEnd);

    // Handle bracket pairs
    handleBracketPairs(e, selectionStart, selectionEnd, currentSelectedText);
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
      } ${isFileModified ? "modified" : ""}`}
    >
      {/* Editor toolbar */}
      <EditorToolbar
        theme={theme}
        isFileModified={isFileModified}
        onSearchClick={() => toggleSearchPanel(!searchState.isSearchOpen)}
        onReplaceClick={() => {
          toggleSearchPanel(true);
          toggleReplacePanel(true);
        }}
        onSaveClick={saveFile}
        onCompileClick={onCompile}
        onCommandPaletteClick={openCommandPalette}
        onCommentClick={toggleComment}
        onIndentClick={indentSelectedLines}
        onOutdentClick={outdentSelectedLines}
        onSettingsClick={() => {}}
      />

      {/* Search panel */}
      {searchState.isSearchOpen && (
        <SearchPanel
          theme={theme}
          searchState={searchState}
          setSearchTerm={(term) =>
            setSearchState({ ...searchState, searchTerm: term })
          }
          setReplaceTerm={(term) =>
            setSearchState({ ...searchState, replaceTerm: term })
          }
          setIsRegexSearch={(value) =>
            setSearchState({ ...searchState, isRegexSearch: value })
          }
          setIsCaseSensitive={(value) =>
            setSearchState({ ...searchState, isCaseSensitive: value })
          }
          executeSearch={executeSearch}
          findPrevious={findPrevious}
          findNext={findNext}
          closeSearch={() => {
            toggleSearchPanel(false);
            toggleReplacePanel(false);
          }}
          replaceMatch={() => {
            const result = replaceMatch();
            if (result) {
              setCode(result.newCode);
              executeSearch();
            }
          }}
          replaceAll={() => {
            const result = replaceAll();
            setCode(result.newCode);
          }}
          getSearchMatches={getSearchMatches}
        />
      )}

      {/* Command palette */}
      <CommandPalette
        theme={theme}
        isOpen={isCommandPaletteOpen}
        commandInput={commandInput}
        setCommandInput={setCommandInput}
        commandSuggestions={commandSuggestions}
        executeCommand={executeCommand}
        commands={commands}
      />

      {/* Editor content */}
      <div
        className={`flex w-full`}
        style={{
          height: `calc(100% - ${searchState.isSearchOpen && searchState.isReplaceOpen ? "8.5rem" : searchState.isSearchOpen ? "6rem" : "3.5rem"})`,
        }}
      >
        {/* Line numbers */}
        <LineNumbers
          theme={theme}
          code={code}
          lineNumbers={renderLineNumbers()}
          foldedLines={foldedLines}
          toggleFold={toggleFold}
          lineNumbersRef={lineNumbersRef}
        />

        {/* Code editor area */}
        <EditorContent
          theme={theme}
          highlightedCode={highlightedCode}
          code={code}
          setCode={setCode}
          setSelectedText={setSelectedText}
          handleTextareaKeyDown={handleTextareaKeyDown}
          setIsFocused={setIsFocused}
          setCursorPosition={setCursorPosition}
          textareaRef={textareaRef}
          fontSizeMultiplier={fontSizeMultiplier}
          indentSize={indentSize}
          showMinimap={showMinimap}
        />
      </div>

      {/* Status bar */}
      <StatusBar
        theme={theme}
        cursorPosition={cursorPosition}
        selectedText={selectedText}
        indentSize={indentSize}
        isFileModified={isFileModified}
        lineCount={lineCount}
        fontSizeMultiplier={fontSizeMultiplier}
      />
    </div>
  );
}

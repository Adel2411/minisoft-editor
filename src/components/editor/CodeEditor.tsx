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
  Replace,
  Indent,
  Outdent,
  AlignJustify,
  Command,
} from "lucide-react";
import { tokenize } from "@/utils/tokenizer";

interface EditorProps {
  code: string;
  setCode: (code: string) => void;
  theme: "dark" | "light";
  onCompile: () => void;
}

// Additional interfaces for advanced features
interface HistoryState {
  code: string;
  cursorPosition: number;
}

interface MultiCursorPosition {
  start: number;
  end: number;
}

export default function Editor({
  code,
  setCode,
  theme,
  onCompile,
}: EditorProps) {
  // Existing state
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

  // New state for advanced features
  const [isReplaceOpen, setIsReplaceOpen] = useState<boolean>(false);
  const [replaceTerm, setReplaceTerm] = useState<string>("");
  const [isRegexSearch, setIsRegexSearch] = useState<boolean>(false);
  const [isCaseSensitive, setIsCaseSensitive] = useState<boolean>(false);
  const [multiCursorPositions, setMultiCursorPositions] = useState<MultiCursorPosition[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [commandInput, setCommandInput] = useState<string>("");
  const [commandSuggestions, setCommandSuggestions] = useState<string[]>([]);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState<number>(1);
  const [history, setHistory] = useState<HistoryState[]>([{ code: code, cursorPosition: 0 }]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [undoStack, setUndoStack] = useState<string[]>([code]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [lastSavedText, setLastSavedText] = useState<string>(code);
  const [isFileModified, setIsFileModified] = useState<boolean>(false);
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [selectedText, setSelectedText] = useState<string>("");

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

  // New keyboard shortcut handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Existing shortcuts
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        setIsSearchOpen(true);
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
        setIsSearchOpen(true);
        setIsReplaceOpen(true);
      }

      // Command palette
      if ((e.ctrlKey && e.shiftKey && e.key === "P") || (e.ctrlKey && e.key === "p")) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
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
        setFontSizeMultiplier(prev => Math.min(prev + 0.1, 2.0));
      }
      if (e.ctrlKey && e.key === "-") {
        e.preventDefault();
        setFontSizeMultiplier(prev => Math.max(prev - 0.1, 0.5));
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

      // Multi-cursor with Alt+Click is handled in the textarea's onClick handler
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [code, onCompile, selectedText]);

  // Code operation implementations
  const saveFile = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "minisoft-code.ms";
    a.click();
    URL.revokeObjectURL(url);
    setLastSavedText(code);
    setIsFileModified(false);
  };

  const handleUndo = () => {
    if (undoStack.length <= 1) return;

    const currentCode = undoStack[undoStack.length - 1];
    const previousCode = undoStack[undoStack.length - 2];

    setRedoStack([...redoStack, currentCode]);
    setUndoStack(undoStack.slice(0, -1));
    setCode(previousCode);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const codeToRestore = redoStack[redoStack.length - 1];
    setUndoStack([...undoStack, codeToRestore]);
    setRedoStack(redoStack.slice(0, -1));
    setCode(codeToRestore);
  };

  const goToLine = (lineNumber: number) => {
    if (lineNumber < 1 || lineNumber > lineCount) return;

    const lines = code.split('\n');
    let position = 0;

    for (let i = 0; i < lineNumber - 1; i++) {
      position += lines[i].length + 1; // +1 for the newline character
    }

    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(position, position);

      // Update cursor position state
      setCursorPosition({ line: lineNumber, column: 1 });
    }
  };

  const toggleComment = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    // Get the selected text
    const selectedText = code.substring(selectionStart, selectionEnd);

    // Check if there are multiple lines selected
    if (selectedText.includes('\n')) {
      // Multiple line comment logic
      const lines = selectedText.split('\n');
      const commentedLines = lines.map(line => {
        if (line.trimStart().startsWith('// ')) {
          return line.replace(/^\s*\/\/\s?/, '');
        } else {
          return `// ${line}`;
        }
      });

      const newText = commentedLines.join('\n');
      const newCode = code.substring(0, selectionStart) + newText + code.substring(selectionEnd);

      // Add to undo stack
      setUndoStack([...undoStack, newCode]);
      setRedoStack([]);

      setCode(newCode);

      // Restore selection
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart, selectionStart + newText.length);
      }, 0);
    } else {
      // Single line comment logic
      const lineStartPos = code.lastIndexOf('\n', selectionStart - 1) + 1;
      const lineEndPos = code.indexOf('\n', selectionStart);
      const line = code.substring(lineStartPos, lineEndPos === -1 ? code.length : lineEndPos);

      let newLine;
      if (line.trimStart().startsWith('// ')) {
        newLine = line.replace(/^\s*\/\/\s?/, '');
      } else {
        newLine = `// ${line}`;
      }

      const newCode = code.substring(0, lineStartPos) + newLine +
        code.substring(lineEndPos === -1 ? code.length : lineEndPos);

      // Add to undo stack
      setUndoStack([...undoStack, newCode]);
      setRedoStack([]);

      setCode(newCode);

      // Restore cursor position
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart, selectionStart);
      }, 0);
    }
  };

  const indentSelectedLines = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    // Get the text before and after the selection
    const beforeSelection = code.substring(0, selectionStart);
    const selectedText = code.substring(selectionStart, selectionEnd);
    const afterSelection = code.substring(selectionEnd);

    // Find the start of the line containing the selection start
    const lineStartPos = beforeSelection.lastIndexOf('\n') + 1;

    // Indent each line in the selection
    const indentedText = selectedText.replace(/^|(\n)/g, `$1${' '.repeat(indentSize)}`);

    const newCode = beforeSelection.substring(0, lineStartPos) +
      ' '.repeat(indentSize) +
      beforeSelection.substring(lineStartPos) +
      indentedText +
      afterSelection;

    // Add to undo stack
    setUndoStack([...undoStack, newCode]);
    setRedoStack([]);

    setCode(newCode);

    // Adjust selection to include the added indentation
    const indentOffset = indentSize;
    const newSelectionEnd = selectionEnd + indentOffset +
      (indentedText.length - selectedText.length);

    setTimeout(() => {
      textarea.setSelectionRange(selectionStart + indentOffset, newSelectionEnd);
    }, 0);
  };

  const outdentSelectedLines = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    // Get the text of the selected lines
    const beforeSelection = code.substring(0, selectionStart);
    const selectedText = code.substring(selectionStart, selectionEnd);
    const afterSelection = code.substring(selectionEnd);

    // Remove indentation from each line
    const outdentedText = selectedText.replace(new RegExp(`^${' '.repeat(indentSize)}|\\n${' '.repeat(indentSize)}`, 'g'), match =>
      match.startsWith('\n') ? '\n' : ''
    );

    // Find the start of the line containing selection
    const lineStartPos = beforeSelection.lastIndexOf('\n') + 1;
    const beforeLine = beforeSelection.substring(0, lineStartPos);
    const lineBeforeSelection = beforeSelection.substring(lineStartPos);

    // Remove indentation from the first line if not included in selection
    const outdentedFirstLine = lineBeforeSelection.replace(new RegExp(`^${' '.repeat(indentSize)}`), '');

    const newCode = beforeLine + outdentedFirstLine + outdentedText + afterSelection;

    // Add to undo stack
    setUndoStack([...undoStack, newCode]);
    setRedoStack([]);

    setCode(newCode);

    // Adjust selection to account for removed indentation
    const firstLineAdjustment = lineBeforeSelection.length - outdentedFirstLine.length;
    const totalAdjustment = (selectedText.length - outdentedText.length) + firstLineAdjustment;

    setTimeout(() => {
      textarea.setSelectionRange(selectionStart - firstLineAdjustment, selectionEnd - totalAdjustment);
    }, 0);
  };

  const duplicateLines = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    // Determine the start and end positions of the current line(s)
    const lines = code.split('\n');
    let startLine = 0;
    let currentPos = 0;

    // Find the line numbers for the selection
    for (let i = 0; i < lines.length; i++) {
      if (currentPos + lines[i].length >= selectionStart) {
        startLine = i;
        break;
      }
      currentPos += lines[i].length + 1; // +1 for the newline
    }

    let endLine = startLine;
    currentPos = 0;

    for (let i = 0; i < lines.length; i++) {
      if (currentPos + lines[i].length >= selectionEnd) {
        endLine = i;
        break;
      }
      currentPos += lines[i].length + 1;
    }

    // Get the text of the lines to duplicate
    const linesToDuplicate = lines.slice(startLine, endLine + 1);
    const duplicatedText = linesToDuplicate.join('\n');

    // Calculate positions for inserting the duplicated text
    let lineStartPos = 0;
    for (let i = 0; i < startLine; i++) {
      lineStartPos += lines[i].length + 1;
    }

    let lineEndPos = lineStartPos;
    for (let i = startLine; i <= endLine; i++) {
      lineEndPos += lines[i].length + 1;
    }

    // Insert the duplicated lines after the current selection
    const newCode = code.substring(0, lineEndPos) + '\n' + duplicatedText + code.substring(lineEndPos);

    // Add to undo stack
    setUndoStack([...undoStack, newCode]);
    setRedoStack([]);

    setCode(newCode);
  };

  const deleteLines = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    // Determine the start and end of the current line
    const lineStartPos = code.lastIndexOf('\n', selectionStart - 1) + 1;
    let lineEndPos = code.indexOf('\n', selectionStart);
    if (lineEndPos === -1) lineEndPos = code.length;

    // Delete the line
    const newCode = code.substring(0, lineStartPos) + code.substring(lineEndPos + 1);

    // Add to undo stack
    setUndoStack([...undoStack, newCode]);
    setRedoStack([]);

    setCode(newCode);

    // Position cursor at the start of the next line
    setTimeout(() => {
      textarea.setSelectionRange(lineStartPos, lineStartPos);
    }, 0);
  };

  const moveLines = (direction: "up" | "down") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    const lines = code.split('\n');

    // Find the line numbers for current selection
    let startLineNum = 0;
    let currentPos = 0;
    for (let i = 0; i < lines.length; i++) {
      if (currentPos + lines[i].length >= selectionStart) {
        startLineNum = i;
        break;
      }
      currentPos += lines[i].length + 1;
    }

    let endLineNum = startLineNum;
    currentPos = 0;
    for (let i = 0; i < lines.length; i++) {
      if (currentPos + lines[i].length >= selectionEnd) {
        endLineNum = i;
        break;
      }
      currentPos += lines[i].length + 1;
    }

    if (direction === "up" && startLineNum > 0) {
      // Move lines up
      const linesToMove = lines.splice(startLineNum, endLineNum - startLineNum + 1);
      lines.splice(startLineNum - 1, 0, ...linesToMove);
    } else if (direction === "down" && endLineNum < lines.length - 1) {
      // Move lines down
      const linesToMove = lines.splice(startLineNum, endLineNum - startLineNum + 1);
      lines.splice(startLineNum + 1, 0, ...linesToMove);
    } else {
      return; // Can't move further up/down
    }

    const newCode = lines.join('\n');

    // Add to undo stack
    setUndoStack([...undoStack, newCode]);
    setRedoStack([]);

    setCode(newCode);
  };

  // Track code changes for undo/redo and modified state
  useEffect(() => {
    if (code !== undoStack[undoStack.length - 1]) {
      setUndoStack([...undoStack, code]);
      setRedoStack([]);
    }

    setIsFileModified(code !== lastSavedText);
  }, [code]);

  // Enhanced auto-pairing of brackets
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd } = textarea;
    const selectedText = code.substring(selectionStart, selectionEnd);

    // Auto-pair brackets and quotes
    if (e.key === '(' || e.key === '{' || e.key === '[' || e.key === '"' || e.key === "'") {
      const pairs: Record<string, string> = {
        '(': ')',
        '{': '}',
        '[': ']',
        '"': '"',
        "'": "'"
      };

      e.preventDefault();

      if (selectedText) {
        // Wrap selected text in pairs
        const newCode = code.substring(0, selectionStart) +
          e.key + selectedText + pairs[e.key] +
          code.substring(selectionEnd);

        setCode(newCode);

        // Position cursor after the closing bracket
        setTimeout(() => {
          textarea.setSelectionRange(selectionEnd + 2, selectionEnd + 2);
        }, 0);
      } else {
        // Add pair and position cursor between them
        const newCode = code.substring(0, selectionStart) +
          e.key + pairs[e.key] +
          code.substring(selectionEnd);

        setCode(newCode);

        // Position cursor between the brackets
        setTimeout(() => {
          textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
        }, 0);
      }
    }
  };

  // Add command palette functionality
  const commands = [
    { id: 'search', name: 'Search', shortcut: 'Ctrl+F', action: () => setIsSearchOpen(true) },
    { id: 'replace', name: 'Find and Replace', shortcut: 'Ctrl+H', action: () => { setIsSearchOpen(true); setIsReplaceOpen(true); } },
    { id: 'save', name: 'Save File', shortcut: 'Ctrl+S', action: saveFile },
    { id: 'run', name: 'Run Code', shortcut: 'Ctrl+Enter', action: onCompile },
    { id: 'toggle-comment', name: 'Toggle Comment', shortcut: 'Ctrl+/', action: toggleComment },
    { id: 'go-to-line', name: 'Go to Line', shortcut: 'Ctrl+G', action: () => {
      const lineNumber = prompt('Go to line:');
      if (lineNumber && !isNaN(parseInt(lineNumber))) {
        goToLine(parseInt(lineNumber));
      }
    }}
  ];

  const filterCommands = (input: string) => {
    if (!input) {
      return commands.map(cmd => cmd.name);
    }
    return commands
      .filter(cmd => cmd.name.toLowerCase().includes(input.toLowerCase()))
      .map(cmd => cmd.name);
  };

  useEffect(() => {
    setCommandSuggestions(filterCommands(commandInput));
  }, [commandInput]);

  const executeCommand = (commandName: string) => {
    const command = commands.find(cmd => cmd.name === commandName);
    if (command) {
      command.action();
    }
    setIsCommandPaletteOpen(false);
    setCommandInput('');
  };

  // Render the command palette
  const renderCommandPalette = () => {
    if (!isCommandPaletteOpen) return null;

    return (
      <div
        className={`absolute top-1/4 left-1/2 transform -translate-x-1/2 w-80 rounded-md shadow-lg z-10 ${
          theme === "dark" ? "bg-[#1e1a17] border-[#3e3632]" : "bg-white border-[#efe0d9]"
        }`}
      >
        <div className="p-2">
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Type a command..."
            className={`w-full p-2 outline-none rounded ${
              theme === "dark" ? "bg-[#262220] text-white" : "bg-[#fff1ec] text-black"
            }`}
            autoFocus
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {commandSuggestions.map((cmd, index) => (
            <div
              key={index}
              onClick={() => executeCommand(cmd)}
              className={`p-2 cursor-pointer ${
                theme === "dark" 
                  ? "hover:bg-[#312c28] text-white" 
                  : "hover:bg-[#efe0d9] text-black"
              }`}
            >
              <div className="flex justify-between">
                <span>{cmd}</span>
                <span className="text-xs opacity-50">
                  {commands.find(c => c.name === cmd)?.shortcut}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
      {/* Editor toolbar with expanded buttons */}
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
              setIsSearchOpen(true);
              setIsReplaceOpen(true);
            }}
            className={`p-1 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                : "hover:bg-[#efe0d9] text-[#495057] hover:text-[#212529]"
            }`}
            title="Replace (Ctrl+H)"
          >
            <Replace size={16} />
          </button>
          <button
            onClick={saveFile}
            className={`p-1 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                : "hover:bg-[#efe0d9] text-[#495057] hover:text-[#212529]"
            } ${isFileModified ? (theme === "dark" ? "text-[#e86f42]" : "text-[#e05d30]") : ""}`}
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
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className={`p-1 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                : "hover:bg-[#efe0d9] text-[#495057] hover:text-[#212529]"
            }`}
            title="Command Palette (Ctrl+Shift+P)"
          >
            <Command size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleComment()}
            className={`p-1 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                : "hover:bg-[#efe0d9] text-[#495057] hover:text-[#212529]"
            }`}
            title="Toggle Comment (Ctrl+/)"
          >
            <AlignJustify size={16} />
          </button>
          <button
            onClick={() => indentSelectedLines()}
            className={`p-1 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                : "hover:bg-[#efe0d9] text-[#495057] hover:text-[#212529]"
            }`}
            title="Indent (Tab)"
          >
            <Indent size={16} />
          </button>
          <button
            onClick={() => outdentSelectedLines()}
            className={`p-1 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                : "hover:bg-[#efe0d9] text-[#495057] hover:text-[#212529]"
            }`}
            title="Outdent (Shift+Tab)"
          >
            <Outdent size={16} />
          </button>
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

      {/* Enhanced search panel with replace functionality */}
      {isSearchOpen && (
        <div
          className={`p-2 flex flex-col gap-2 border-b ${
            theme === "dark"
            ? "bg-[#1e1a17] border-[#3e3632]"
            : "bg-[#fff1ec] border-[#efe0d9]"
          }`}
        >
          <div className="flex items-center gap-2">
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
                  if (e.shiftKey) {
                    findPrevious();
                  } else {
                    executeSearch();
                  }
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
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                id="regex-search"
                checked={isRegexSearch}
                onChange={() => setIsRegexSearch(!isRegexSearch)}
                className="cursor-pointer"
              />
              <label
                htmlFor="regex-search"
                className={`text-xs cursor-pointer ${
                  theme === "dark" ? "text-[#b5a9a2]" : "text-[#495057]"
                }`}
              >
                Regex
              </label>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                id="case-sensitive"
                checked={isCaseSensitive}
                onChange={() => setIsCaseSensitive(!isCaseSensitive)}
                className="cursor-pointer"
              />
              <label
                htmlFor="case-sensitive"
                className={`text-xs cursor-pointer ${
                  theme === "dark" ? "text-[#b5a9a2]" : "text-[#495057]"
                }`}
              >
                Case
              </label>
            </div>
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
              title="Previous (Shift+Enter)"
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
              title="Next (Enter)"
            >
              ↓
            </button>
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setIsReplaceOpen(false);
              }}
              className={`p-1 rounded ${
                theme === "dark"
                  ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                  : "hover:bg-[#efe0d9] text-[#495057] hover:text-[#212529]"
              }`}
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
          {isReplaceOpen && (
            <div className="flex items-center gap-2">
              <Replace
                size={14}
                className={theme === "dark" ? "text-[#b5a9a2]" : "text-[#495057]"}
              />
              <input
                type="text"
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                placeholder="Replace"
                className={`flex-1 bg-transparent border outline-none px-2 py-1 rounded ${
                  theme === "dark"
                ? "bg-[#1e1a17] border-[#3e3632]"
                : "bg-[#fff1ec] border-[#efe0d9]"
                }`}
              />
              <button
                onClick={() => {
                  // Replace current match
                  if (matches.length === 0) return;

                  const currentMatchPos = matches[currentMatchIndex];

                  const newCode = code.substring(0, currentMatchPos) +
                    replaceTerm +
                    code.substring(currentMatchPos + searchTerm.length);

                  setCode(newCode);
                  executeSearch(); // Re-search after replacing
                }}
                className={`px-2 py-1 rounded ${
                  theme === "dark"
                    ? "bg-[#312c28] hover:bg-[#3e3632] text-[#f3ebe7]"
                    : "bg-[#efe0d9] hover:bg-[#e6d5ce] text-[#495057]"
                }`}
              >
                Replace
              </button>
              <button
                onClick={() => {
                  // Replace all matches
                  if (searchTerm === "") return;

                  let result = code;
                  if (isRegexSearch) {
                    try {
                      const flags = isCaseSensitive ? 'g' : 'gi';
                      const regex = new RegExp(searchTerm, flags);
                      result = result.replace(regex, replaceTerm);
                    } catch (e) {
                      console.error("Invalid regex:", e);
                    }
                  } else {
                    const flags = isCaseSensitive ? 'g' : 'gi';
                    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
                    result = result.replace(regex, replaceTerm);
                  }

                  setCode(result);
                }}
                className={`px-2 py-1 rounded ${
                  theme === "dark"
                    ? "bg-[#312c28] hover:bg-[#3e3632] text-[#f3ebe7]"
                    : "bg-[#efe0d9] hover:bg-[#e6d5ce] text-[#495057]"
                }`}
              >
                Replace All
              </button>
            </div>
          )}
        </div>
      )}

      {renderCommandPalette()}

      {/* Editor content with single scroll container - adding enhanced functionality */}
      <div
        className={`flex w-full`}
        style={{
          height: `calc(100% - ${isSearchOpen && isReplaceOpen ? "8.5rem" : isSearchOpen ? "6rem" : "3.5rem"})`,
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
              className={`flex items-center justify-end pr-2 h-6 leading-6 group ${
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

        {/* Code editor area with enhanced functionality */}
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
              fontSize: `${1 * fontSizeMultiplier}em`,
              lineHeight: "24px",
              tabSize: indentSize,
              whiteSpace: "pre",
              boxSizing: "border-box",
            }}
          />

          {/* Input textarea with enhanced keyboard handling */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setSelectedText(e.target.value.substring(
                e.target.selectionStart,
                e.target.selectionEnd
              ));
            }}
            onKeyDown={handleTextareaKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSelect={(e) => {
              const target = e.target as HTMLTextAreaElement;
              setSelectedText(code.substring(target.selectionStart, target.selectionEnd));
            }}
            onClick={(e) => {
              // Handle regular click for cursor position
              const cursorPos = textareaRef.current?.selectionStart || 0;
              const textBeforeCursor = code.substring(0, cursorPos);
              const line = (textBeforeCursor.match(/\n/g) || []).length + 1;
              const lastNewLine = textBeforeCursor.lastIndexOf("\n");
              const column =
                lastNewLine === -1 ? cursorPos + 1 : cursorPos - lastNewLine;
              setCursorPosition({ line, column });

              // Multiple cursor support with Alt+Click
              if (e.altKey) {
                e.preventDefault();
                // This is just a placeholder - full implementation would require complex DOM manipulation
                // that might be better handled by a specialized library like CodeMirror or Monaco
                console.log("Alt+Click detected for multiple cursors");
              }
            }}
            className="w-full h-full resize-none outline-none p-4 font-mono leading-6"
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            style={{
              fontSize: `${1 * fontSizeMultiplier}em`,
              whiteSpace: "pre",
              tabSize: indentSize,
              color: "transparent",
              caretColor: theme === "dark" ? "#e86f42" : "#e05d30",
              lineHeight: "24px",
              background: "transparent",
              boxSizing: "border-box",
              position: "relative",
              zIndex: 1,
            }}
          />

          {/* Optional minimap */}
          {showMinimap && (
            <div
              className={`absolute top-0 right-0 w-20 h-full border-l ${
                theme === "dark" ? "border-[#3e3632] bg-[#1e1a17]/50" : "border-[#efe0d9] bg-[#fff1ec]/50"
              }`}
              style={{ pointerEvents: "none" }}
            >
              <div
                className="w-full h-full opacity-30"
                style={{
                  transform: "scale(0.2)",
                  transformOrigin: "top right",
                  overflow: "hidden",
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced status bar with more information */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-6 flex items-center justify-between px-3 text-xs border-t ${
          theme === "dark"
            ? "bg-[#1e1a17] border-[#3e3632] text-[#b5a9a2]"
            : "bg-[#fff1ec] border-[#efe0d9] text-[#868e96]"
        }`}
      >
        <div className="flex items-center gap-4">
          <div>
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </div>
          {selectedText && <div>Selection: {selectedText.length} chars</div>}
          <div>Spaces: {indentSize}</div>
          {isFileModified && <div className="text-amber-500">●</div>}
        </div>
        <div className="flex items-center gap-4">
          <div>{lineCount} lines</div>
          <div>
            {fontSizeMultiplier !== 1 && `${Math.round(fontSizeMultiplier * 100)}%`}
          </div>
          <div>MiniSoft</div>
        </div>
      </div>
    </div>
  );
}

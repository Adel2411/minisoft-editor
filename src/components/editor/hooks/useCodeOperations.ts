import { RefObject } from 'react';

interface UseCodeOperationsProps {
  code: string;
  indentSize: number;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  updateCode: (newCode: string) => void;
  lineCount: number;
  setCursorPosition: (position: { line: number; column: number }) => void;
}

export function useCodeOperations({
  code,
  indentSize,
  textareaRef,
  updateCode,
  lineCount,
  setCursorPosition
}: UseCodeOperationsProps) {
  
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
        if (line.trimStart().startsWith('<!-') && line.trimEnd().endsWith('-!>')) {
          // Remove comments
          return line.replace(/^\s*<!-\s?/, '').replace(/\s?-!>$/, '');
        } else {
          // Add comments
          return `<!- ${line} -!>`;
        }
      });
  
      const newText = commentedLines.join('\n');
      const newCode = code.substring(0, selectionStart) + newText + code.substring(selectionEnd);
      
      updateCode(newCode);
  
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
      if (line.trimStart().startsWith('<!-') && line.trimEnd().endsWith('-!>')) {
        // Remove comment
        newLine = line.replace(/^\s*<!-\s?/, '').replace(/\s?-!>$/, '');
      } else {
        // Add comment
        newLine = `<!- ${line} -!>`;
      }
  
      const newCode = code.substring(0, lineStartPos) + newLine +
        code.substring(lineEndPos === -1 ? code.length : lineEndPos);
  
      updateCode(newCode);
  
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

    updateCode(newCode);

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

    updateCode(newCode);

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

    updateCode(newCode);
  };

  const deleteLines = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selectionStart = textarea.selectionStart;

    // Determine the start and end of the current line
    const lineStartPos = code.lastIndexOf('\n', selectionStart - 1) + 1;
    let lineEndPos = code.indexOf('\n', selectionStart);
    if (lineEndPos === -1) lineEndPos = code.length;

    // Delete the line
    const newCode = code.substring(0, lineStartPos) + code.substring(lineEndPos + 1);

    updateCode(newCode);

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

    updateCode(newCode);
  };

  const handleBracketPairs = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    selectionStart: number,
    selectionEnd: number,
    selectedText: string
  ) => {
    if (e.key === '(' || e.key === '{' || e.key === '[' || e.key === '"' || e.key === "'") {
      const pairs: Record<string, string> = {
        '(': ')',
        '{': '}',
        '[': ']',
        '"': '"',
        "'": "'"
      };

      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (selectedText) {
        // Wrap selected text in pairs
        const newCode = code.substring(0, selectionStart) +
          e.key + selectedText + pairs[e.key] +
          code.substring(selectionEnd);

        updateCode(newCode);

        // Position cursor after the closing bracket
        setTimeout(() => {
          textarea.setSelectionRange(selectionEnd + 2, selectionEnd + 2);
        }, 0);
      } else {
        // Add pair and position cursor between them
        const newCode = code.substring(0, selectionStart) +
          e.key + pairs[e.key] +
          code.substring(selectionEnd);

        updateCode(newCode);

        // Position cursor between the brackets
        setTimeout(() => {
          textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
        }, 0);
      }

      return true;
    }
    
    return false;
  };

  return {
    goToLine,
    toggleComment,
    indentSelectedLines,
    outdentSelectedLines,
    duplicateLines,
    deleteLines,
    moveLines,
    handleBracketPairs
  };
}

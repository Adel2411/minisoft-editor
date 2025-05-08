export const saveFile = (code: string, setLastSavedText: (text: string) => void, setIsFileModified: (modified: boolean) => void): void => {
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

export const indentSelectedLines = (
  code: string,
  selectionStart: number,
  selectionEnd: number,
  indentSize: number,
  setUndoStack: (stack: string[]) => void,
  undoStack: string[],
  setRedoStack: (stack: string[]) => void,
  setCode: (code: string) => void
): { newCode: string, newSelectionStart: number, newSelectionEnd: number } => {
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

  return {
    newCode,
    newSelectionStart: selectionStart + indentOffset,
    newSelectionEnd
  };
};

export const outdentSelectedLines = (
  code: string,
  selectionStart: number,
  selectionEnd: number,
  indentSize: number,
  setUndoStack: (stack: string[]) => void,
  undoStack: string[],
  setRedoStack: (stack: string[]) => void,
  setCode: (code: string) => void
): { newCode: string, newSelectionStart: number, newSelectionEnd: number } => {
  // Get the text of the selected lines
  const beforeSelection = code.substring(0, selectionStart);
  const selectedText = code.substring(selectionStart, selectionEnd);
  const afterSelection = code.substring(selectionEnd);

  // Remove indentation from each line
  const outdentedText = selectedText.replace(
    new RegExp(`^${' '.repeat(indentSize)}|\\n${' '.repeat(indentSize)}`, 'g'), 
    match => match.startsWith('\n') ? '\n' : ''
  );

  // Find the start of the line containing selection
  const lineStartPos = beforeSelection.lastIndexOf('\n') + 1;
  const beforeLine = beforeSelection.substring(0, lineStartPos);
  const lineBeforeSelection = beforeSelection.substring(lineStartPos);

  // Remove indentation from the first line if not included in selection
  const outdentedFirstLine = lineBeforeSelection.replace(
    new RegExp(`^${' '.repeat(indentSize)}`), 
    ''
  );

  const newCode = beforeLine + outdentedFirstLine + outdentedText + afterSelection;

  // Add to undo stack
  setUndoStack([...undoStack, newCode]);
  setRedoStack([]);

  setCode(newCode);

  // Adjust selection to account for removed indentation
  const firstLineAdjustment = lineBeforeSelection.length - outdentedFirstLine.length;
  const totalAdjustment = (selectedText.length - outdentedText.length) + firstLineAdjustment;

  return {
    newCode,
    newSelectionStart: selectionStart - firstLineAdjustment,
    newSelectionEnd: selectionEnd - totalAdjustment
  };
};

export const toggleComment = (
  code: string,
  selectionStart: number,
  selectionEnd: number,
  setUndoStack: (stack: string[]) => void,
  undoStack: string[],
  setRedoStack: (stack: string[]) => void,
  setCode: (code: string) => void
): { newCode: string, newSelectionStart: number, newSelectionEnd: number } => {
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
  
    // Add to undo stack
    setUndoStack([...undoStack, newCode]);
    setRedoStack([]);
  
    setCode(newCode);
  
    return {
      newCode,
      newSelectionStart: selectionStart,
      newSelectionEnd: selectionStart + newText.length
    };
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
  
    // Add to undo stack
    setUndoStack([...undoStack, newCode]);
    setRedoStack([]);
  
    setCode(newCode);
  
    return {
      newCode,
      newSelectionStart: selectionStart,
      newSelectionEnd: selectionStart
    };
  }
};

export const duplicateLines = (
  code: string,
  selectionStart: number,
  selectionEnd: number,
  setUndoStack: (stack: string[]) => void,
  undoStack: string[],
  setRedoStack: (stack: string[]) => void,
  setCode: (code: string) => void
): void => {
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

export const moveLines = (
  direction: "up" | "down",
  code: string,
  selectionStart: number,
  selectionEnd: number,
  setUndoStack: (stack: string[]) => void,
  undoStack: string[],
  setRedoStack: (stack: string[]) => void,
  setCode: (code: string) => void
): void => {
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

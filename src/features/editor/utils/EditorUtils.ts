import { CursorPosition } from "../types";

export const calculateCursorPosition = (code: string, cursorPos: number): CursorPosition => {
  const textBeforeCursor = code.substring(0, cursorPos);
  const line = (textBeforeCursor.match(/\n/g) || []).length + 1;
  const lastNewLine = textBeforeCursor.lastIndexOf("\n");
  const column = lastNewLine === -1 ? cursorPos + 1 : cursorPos - lastNewLine;
  
  return { line, column };
};

export const getLineStartPosition = (code: string, lineNumber: number): number => {
  const lines = code.split('\n');
  let position = 0;

  for (let i = 0; i < lineNumber - 1; i++) {
    position += lines[i].length + 1; // +1 for the newline character
  }

  return position;
};

export const isFoldedSection = (
  text: string,
  foldStart: number,
  currentLine: number,
): boolean => {
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

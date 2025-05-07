import { useState, useEffect } from 'react';

interface UseEditorHistoryProps {
  initialCode: string;
  code: string;
  setCode: (code: string) => void;
}

export function useEditorHistory({ 
  initialCode,
  code,
  setCode
}: UseEditorHistoryProps) {
  const [undoStack, setUndoStack] = useState<string[]>([initialCode]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [lastSavedText, setLastSavedText] = useState<string>(initialCode);
  const [isFileModified, setIsFileModified] = useState<boolean>(false);

  // Track code changes for undo/redo and modified state
  useEffect(() => {
    if (code !== undoStack[undoStack.length - 1]) {
      setUndoStack(prev => [...prev, code]);
      setRedoStack([]);
    }

    setIsFileModified(code !== lastSavedText);
  }, [code, undoStack, lastSavedText]);

  const undo = () => {
    if (undoStack.length <= 1) return;

    const currentCode = undoStack[undoStack.length - 1];
    const previousCode = undoStack[undoStack.length - 2];

    setRedoStack(prev => [...prev, currentCode]);
    setUndoStack(prev => prev.slice(0, -1));
    setCode(previousCode);
  };

  const redo = () => {
    if (redoStack.length === 0) return;

    const codeToRestore = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, codeToRestore]);
    setRedoStack(prev => prev.slice(0, -1));
    setCode(codeToRestore);
  };

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

  const updateCode = (newCode: string) => {
    setUndoStack(prev => [...prev, newCode]);
    setRedoStack([]);
    setCode(newCode);
  };

  return {
    undoStack,
    redoStack,
    isFileModified,
    lastSavedText,
    undo,
    redo,
    saveFile,
    updateCode,
    setLastSavedText
  };
}

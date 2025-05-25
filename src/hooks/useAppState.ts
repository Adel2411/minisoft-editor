import { useState } from 'react';
import type { CompilationErrors, CompilationResult } from "@/types";

export interface AppState {
  code: string;
  compilationResult: CompilationResult | null;
  isCompiling: boolean;
  activeTab: string;
  theme: "dark" | "light";
  editorReady: boolean;
  showWelcome: boolean;
  isFileModalOpen: boolean;
  currentFileName: string | null;
  error: CompilationErrors | null;
  isTerminalOpen: boolean;
  isSettingsModalOpen: boolean;
  fontSizeMultiplier: number;
  indentSize: number;
  showMinimap: boolean;
}

const initialCode = `MainPrgm Factorial;
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
EndPg;`;

export function useAppState() {
  const [code, setCode] = useState<string>(initialCode);
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
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

  return {
    // State values
    code,
    compilationResult,
    isCompiling,
    activeTab,
    theme,
    editorReady,
    showWelcome,
    isFileModalOpen,
    currentFileName,
    error,
    isTerminalOpen,
    isSettingsModalOpen,
    fontSizeMultiplier,
    indentSize,
    showMinimap,
    
    // State setters
    setCode,
    setCompilationResult,
    setIsCompiling,
    setActiveTab,
    setTheme,
    setEditorReady,
    setShowWelcome,
    setIsFileModalOpen,
    setCurrentFileName,
    setError,
    setIsTerminalOpen,
    setIsSettingsModalOpen,
    setFontSizeMultiplier,
    setIndentSize,
    setShowMinimap,
  };
}

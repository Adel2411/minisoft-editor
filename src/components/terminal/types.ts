import { ReactNode } from 'react';

export interface TerminalProps {
  theme: 'dark' | 'light';
  isVisible: boolean;
  onClose: () => void;
  compileCode: (code: string, filePath?: string) => Promise<void>;
  setCurrentFileName?: (name: string) => void;
}

export interface CommandEntry {
  id: number;
  command: string;
  output: string | ReactNode;
  timestamp: Date;
  isLoading?: boolean;
}

export interface FileOperation {
  status: 'pending' | 'success' | 'error';
  message?: string;
  filePath?: string;
}

export interface TerminalHeaderProps {
  theme: 'dark' | 'light';
  isProcessing: boolean;
  onOpenFile: () => void;
  onCopyContent: () => void;
  onClearTerminal: () => void;
  onClose: () => void;
}

export interface TerminalContentProps {
  theme: 'dark' | 'light';
  commandHistory: CommandEntry[];
  terminalRef: React.RefObject<HTMLDivElement | null>;
}

export interface TerminalInputProps {
  theme: 'dark' | 'light';
  currentCommand: string;
  setCurrentCommand: (cmd: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isProcessing: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export interface FileDialogOptions {
  multiple?: boolean;
  filters?: Array<{ name: string; extensions: string[] }>;
}

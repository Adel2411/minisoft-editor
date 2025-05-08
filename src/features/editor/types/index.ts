export interface EditorProps {
  code: string;
  setCode: (code: string) => void;
  theme: "dark" | "light";
  onCompile: () => void;
  fontSizeMultiplier?: number;
  indentSize?: number;
  showMinimap?: boolean;
}

export interface HistoryState {
  code: string;
  cursorPosition: number;
}

export interface MultiCursorPosition {
  start: number;
  end: number;
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface CommandItem {
  id: string;
  name: string;
  shortcut: string;
  action: () => void;
}

export interface SearchState {
  searchTerm: string;
  replaceTerm: string;
  isRegexSearch: boolean;
  isCaseSensitive: boolean;
  isSearchOpen: boolean;
  isReplaceOpen: boolean;
  currentMatchIndex: number;
  matches: number[];
}

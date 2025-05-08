export interface EditorSettings {
  fontSize: number;
  indentSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
}

export interface ThemeSettings {
  theme: "dark" | "light";
}

export interface AppSettings {
  autoSave: boolean;
  defaultFileExtension: string;
}

export interface Settings {
  editor: EditorSettings;
  theme: ThemeSettings;
  app: AppSettings;
}

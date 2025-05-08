import React from 'react';
import {
  Search,
  Replace,
  Save,
  Play,
  Command,
  AlignJustify,
  Indent,
  Outdent,
  Settings,
} from "lucide-react";

interface EditorToolbarProps {
  theme: "dark" | "light";
  isFileModified: boolean;
  onSearchClick: () => void;
  onReplaceClick: () => void;
  onSaveClick: () => void;
  onCompileClick: () => void;
  onCommandPaletteClick: () => void;
  onCommentClick: () => void;
  onIndentClick: () => void;
  onOutdentClick: () => void;
  onSettingsClick: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  theme,
  isFileModified,
  onSearchClick,
  onReplaceClick,
  onSaveClick,
  onCompileClick,
  onCommandPaletteClick,
  onCommentClick,
  onIndentClick,
  onOutdentClick,
  onSettingsClick,
}) => {
  const buttonClass = `p-1 rounded-md transition-colors ${
    theme === "dark"
      ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
      : "hover:bg-[#efe0d9] text-[#495057] hover:text-[#212529]"
  }`;

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 border-b ${
        theme === "dark"
          ? "bg-[#1e1a17] border-[#3e3632]"
          : "bg-[#fff1ec] border-[#efe0d9]"
      }`}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onSearchClick}
          className={buttonClass}
          title="Search (Ctrl+F)"
        >
          <Search size={16} />
        </button>
        <button
          onClick={onReplaceClick}
          className={buttonClass}
          title="Replace (Ctrl+H)"
        >
          <Replace size={16} />
        </button>
        <button
          onClick={onSaveClick}
          className={`${buttonClass} ${isFileModified ? (theme === "dark" ? "text-[#e86f42]" : "text-[#e05d30]") : ""}`}
          title="Save (Ctrl+S)"
        >
          <Save size={16} />
        </button>
        <button
          onClick={onCompileClick}
          className={buttonClass}
          title="Run (Ctrl+Enter)"
        >
          <Play size={16} />
        </button>
        <button
          onClick={onCommandPaletteClick}
          className={buttonClass}
          title="Command Palette (Ctrl+Shift+P)"
        >
          <Command size={16} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onCommentClick}
          className={buttonClass}
          title="Toggle Comment (Ctrl+/)"
        >
          <AlignJustify size={16} />
        </button>
        <button
          onClick={onIndentClick}
          className={buttonClass}
          title="Indent (Tab)"
        >
          <Indent size={16} />
        </button>
        <button
          onClick={onOutdentClick}
          className={buttonClass}
          title="Outdent (Shift+Tab)"
        >
          <Outdent size={16} />
        </button>
        <button
          onClick={onSettingsClick}
          className={buttonClass}
          title="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;

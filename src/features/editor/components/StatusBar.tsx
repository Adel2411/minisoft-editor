import React from 'react';
import { CursorPosition } from '../types';


interface StatusBarProps {
  theme: "dark" | "light";
  cursorPosition: CursorPosition;
  selectedText: string;
  indentSize: number;
  isFileModified: boolean;
  lineCount: number;
  fontSizeMultiplier: number;
}

const StatusBar: React.FC<StatusBarProps> = ({
  theme,
  cursorPosition,
  selectedText,
  indentSize,
  isFileModified,
  lineCount,
  fontSizeMultiplier
}) => {
  return (
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
  );
};

export default StatusBar;

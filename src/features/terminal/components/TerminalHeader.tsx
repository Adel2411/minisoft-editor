import React from 'react';
import { Terminal as TerminalIcon, X, Copy, RotateCcw, Loader2, Folder } from 'lucide-react';
import { TerminalHeaderProps } from '../types';

const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  theme,
  isProcessing,
  onOpenFile,
  onCopyContent,
  onClearTerminal,
  onClose
}) => {
  return (
    <div 
      className={`flex items-center justify-between p-2 border-b ${
        theme === 'dark' ? 'border-[#3e3632]' : 'border-[#efe0d9]'
      }`}
    >
      <div className="flex items-center gap-2">
        <TerminalIcon size={16} className={theme === 'dark' ? 'text-[#e86f42]' : 'text-[#e05d30]'} />
        <span className="font-medium text-sm">MiniSoft Terminal</span>
        {isProcessing && (
          <span className="flex items-center gap-1">
            <Loader2 size={12} className="animate-spin" />
            <span className="text-xs opacity-80">Processing...</span>
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={onOpenFile}
          className={`p-1.5 rounded hover:opacity-80 transition-opacity ${
            theme === 'dark' ? 'hover:bg-[#312c28]' : 'hover:bg-[#fff1ec]'
          }`}
          title="Open file"
        >
          <Folder size={14} />
        </button>
        <button 
          onClick={onCopyContent}
          className={`p-1.5 rounded hover:opacity-80 transition-opacity ${
            theme === 'dark' ? 'hover:bg-[#312c28]' : 'hover:bg-[#fff1ec]'
          }`}
          title="Copy terminal content"
        >
          <Copy size={14} />
        </button>
        <button 
          onClick={onClearTerminal}
          className={`p-1.5 rounded hover:opacity-80 transition-opacity ${
            theme === 'dark' ? 'hover:bg-[#312c28]' : 'hover:bg-[#fff1ec]'
          }`}
          title="Clear terminal"
        >
          <RotateCcw size={14} />
        </button>
        <button 
          onClick={onClose}
          className={`p-1.5 rounded hover:opacity-80 transition-opacity ${
            theme === 'dark' ? 'hover:bg-[#312c28]' : 'hover:bg-[#fff1ec]'
          }`}
          title="Close terminal"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default TerminalHeader;

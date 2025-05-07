import React from 'react';
import { ChevronRight } from 'lucide-react';
import { TerminalInputProps } from '../types';

const TerminalInput: React.FC<TerminalInputProps> = ({
  theme,
  currentCommand,
  setCurrentCommand,
  handleKeyDown,
  isProcessing,
  inputRef
}) => {
  return (
    <div 
      className={`flex items-center p-2 border-t ${
        theme === 'dark' ? 'border-[#3e3632] bg-[#262220]' : 'border-[#efe0d9] bg-white'
      }`}
      onClick={() => inputRef.current?.focus()}
    >
      <ChevronRight 
        size={16} 
        className={theme === 'dark' ? 'text-[#e86f42]' : 'text-[#e05d30]'} 
      />
      <input
        ref={inputRef}
        type="text"
        value={currentCommand}
        onChange={(e) => setCurrentCommand(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`flex-grow ml-2 bg-transparent outline-none ${
          theme === 'dark' ? 'text-[#f3ebe7]' : 'text-gray-900'
        }`}
        placeholder={isProcessing ? "Processing command..." : "Type a command... (try 'help')"}
        autoFocus
        disabled={isProcessing}
      />
    </div>
  );
};

export default TerminalInput;

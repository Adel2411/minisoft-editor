import React from 'react';
import { Loader2 } from 'lucide-react';
import { TerminalContentProps } from '../types';

const TerminalContent: React.FC<TerminalContentProps> = ({
  theme,
  commandHistory,
  terminalRef
}) => {
  return (
    <div 
      ref={terminalRef}
      className={`flex-grow overflow-auto p-2 font-mono text-sm ${
        theme === 'dark' ? 'bg-[#1e1a17] text-[#f3ebe7]' : 'bg-[#fefaf8] text-gray-900'
      }`}
    >
      {commandHistory.map((entry) => (
        <div key={entry.id} className="mb-3">
          <div className="flex items-center">
            <span className={theme === 'dark' ? 'text-[#e86f42]' : 'text-[#e05d30]'}>$</span>
            <span className="ml-2">{entry.command}</span>
            <span className="ml-2 text-xs opacity-50">
              {entry.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <div className="mt-1 ml-4 whitespace-pre-wrap">
            {entry.isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" />
                <span>{entry.output}</span>
              </div>
            ) : entry.output}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TerminalContent;

import React from 'react';
import { CommandItem } from '../types';

interface CommandPaletteProps {
  theme: "dark" | "light";
  isOpen: boolean;
  commandInput: string;
  setCommandInput: (input: string) => void;
  commandSuggestions: string[];
  executeCommand: (commandName: string) => void;
  commands: CommandItem[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  theme,
  isOpen,
  commandInput,
  setCommandInput,
  commandSuggestions,
  executeCommand,
  commands
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute top-1/4 left-1/2 transform -translate-x-1/2 w-80 rounded-md shadow-lg z-10 ${
        theme === "dark" ? "bg-[#1e1a17] border-[#3e3632]" : "bg-white border-[#efe0d9]"
      }`}
    >
      <div className="p-2">
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="Type a command..."
          className={`w-full p-2 outline-none rounded ${
            theme === "dark" ? "bg-[#262220] text-white" : "bg-[#fff1ec] text-black"
          }`}
          autoFocus
        />
      </div>
      <div className="max-h-64 overflow-y-auto">
        {commandSuggestions.map((cmd, index) => (
          <div
            key={index}
            onClick={() => executeCommand(cmd)}
            className={`p-2 cursor-pointer ${
              theme === "dark" 
                ? "hover:bg-[#312c28] text-white" 
                : "hover:bg-[#efe0d9] text-black"
            }`}
          >
            <div className="flex justify-between">
              <span>{cmd}</span>
              <span className="text-xs opacity-50">
                {commands.find(c => c.name === cmd)?.shortcut}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommandPalette;

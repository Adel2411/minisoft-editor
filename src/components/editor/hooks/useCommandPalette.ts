import { useState, useEffect, useCallback, useRef } from 'react';
import { CommandItem } from '../types/EditorTypes';

export function useCommandPalette(commands: CommandItem[]) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [commandInput, setCommandInput] = useState<string>("");
  const [commandSuggestions, setCommandSuggestions] = useState<string[]>(
    commands.map(cmd => cmd.name)
  );
  
  // Store commands in a ref to avoid dependency issues
  const commandsRef = useRef<CommandItem[]>(commands);
  
  // Update ref when commands change
  useEffect(() => {
    commandsRef.current = commands;
  }, [commands]);

  // Memoize the filter function to avoid recreating it on every render
  const filterCommands = useCallback((input: string) => {
    if (!input) {
      return commandsRef.current.map(cmd => cmd.name);
    }
    return commandsRef.current
      .filter(cmd => cmd.name.toLowerCase().includes(input.toLowerCase()))
      .map(cmd => cmd.name);
  }, []);

  // Now this effect only depends on commandInput and the memoized filterCommands
  useEffect(() => {
    setCommandSuggestions(filterCommands(commandInput));
  }, [commandInput, filterCommands]);

  const executeCommand = (commandName: string) => {
    const command = commandsRef.current.find(cmd => cmd.name === commandName);
    if (command) {
      command.action();
    }
    setIsCommandPaletteOpen(false);
    setCommandInput('');
  };

  const openCommandPalette = () => {
    setIsCommandPaletteOpen(true);
    // Reset suggestions to show all commands
    setCommandSuggestions(commandsRef.current.map(cmd => cmd.name));
  };

  return {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    commandInput,
    setCommandInput,
    commandSuggestions,
    executeCommand,
    openCommandPalette
  };
}

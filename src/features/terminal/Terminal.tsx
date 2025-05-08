import React, { useState, useRef, useEffect, JSX } from 'react';
import { TerminalProps, CommandEntry, FileOperation } from './types';
import { generateFileListOutput, generateHelpOutput } from './components/Commands';
import { exampleFilesMap } from './constants';
import { dialog, fileSystem } from './utils';
import TerminalHeader from './components/TerminalHeader';
import TerminalContent from './components/TerminalContent';
import TerminalInput from './components/TerminalInput';
import { 
  getTerminalBackgroundColor, 
  getTerminalBorderColor,
  getTerminalHeaderColor,
  getTerminalTextColor,
  getTerminalSecondaryTextColor,
  getTerminalCommandColor
} from '../../utils/theme';


const Terminal: React.FC<TerminalProps> = ({ 
  theme, 
  isVisible, 
  onClose, 
  compileCode,
  setCurrentFileName 
}) => {
  const [commandHistory, setCommandHistory] = useState<CommandEntry[]>([
    {
      id: 0,
      command: 'help',
      output: generateHelpOutput(theme),
      timestamp: new Date(),
    },
  ]);
  const [currentCommand, setCurrentCommand] = useState<string>('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandCount = useRef<number>(1);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [commandHistory, isVisible]);

  const addCommandEntry = (command: string, output: string | JSX.Element, isLoading = false) => {
    const newEntry: CommandEntry = {
      id: commandCount.current,
      command,
      output,
      timestamp: new Date(),
      isLoading
    };
    commandCount.current += 1;
    setCommandHistory(prev => [...prev, newEntry]);
    return newEntry.id;
  };

  const updateCommandOutput = (id: number, output: string | JSX.Element, isLoading = false) => {
    setCommandHistory(prev => 
      prev.map(entry => 
        entry.id === id 
          ? { ...entry, output, isLoading } 
          : entry
      )
    );
  };

  const processCommand = async (command: string) => {
    const cmd = command.trim();
    if (cmd === '') return;
    
    // Always add the command to history first
    const cmdId = addCommandEntry(cmd, "", true);
    setCurrentCommand('');
    setHistoryIndex(-1);
    setIsProcessing(true);
    
    // Process the command
    const normalizedCmd = cmd.toLowerCase();
    
    try {
      if (normalizedCmd === 'clear') {
        setCommandHistory([]);
        setIsProcessing(false);
        return;
      } else if (normalizedCmd === 'help') {
        updateCommandOutput(cmdId, generateHelpOutput(theme));
      } else if (normalizedCmd.startsWith('echo ')) {
        updateCommandOutput(cmdId, cmd.substring(5));
      } else if (normalizedCmd === 'date') {
        updateCommandOutput(cmdId, new Date().toLocaleString());
      } else if (normalizedCmd === 'version') {
        updateCommandOutput(cmdId, 'MiniSoft Editor v1.0.0');
      } else if (normalizedCmd === 'theme') {
        updateCommandOutput(cmdId, `Current theme: ${theme}`);
      } else if (normalizedCmd === 'ls') {
        updateCommandOutput(cmdId, generateFileListOutput(theme));
      } else if (normalizedCmd === 'open') {
        await handleOpenFileCommand(cmdId);
      } else if (normalizedCmd.startsWith('cat ')) {
        await handleCatCommand(cmdId, normalizedCmd.substring(4).trim());
      } else if (normalizedCmd.startsWith('msc ')) {
        await handleCompileCommand(cmdId, cmd.substring(4).trim());
      } else {
        updateCommandOutput(
          cmdId,
          <span>Command not found: <span className="font-bold">{cmd}</span>. Type <span className={theme === 'dark' ? 'text-[#e86f42]' : 'text-[#e05d30]'}>help</span> for available commands.</span>
        );
      }
    } catch (error) {
      updateCommandOutput(
        cmdId, 
        <span className="text-red-500">Error: {error instanceof Error ? error.message : String(error)}</span>
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCatCommand = async (cmdId: number, fileName: string) => {
    if (!fileName) {
      updateCommandOutput(cmdId, "Please specify a file name");
      return;
    }
    
    // Check if it's an example file
    if (exampleFilesMap[fileName]) {
      const codeOutput = (
        <div>
          <div className={`p-2 rounded ${theme === 'dark' ? 'bg-[#2a2420]' : 'bg-[#fff8f5]'}`}>
            <pre className="whitespace-pre-wrap overflow-x-auto">{exampleFilesMap[fileName]}</pre>
          </div>
          <div className="mt-2">
            <button
              onClick={() => handleCompileExampleFile(fileName)}
              className={`px-3 py-1 text-sm rounded ${
                theme === 'dark' 
                  ? 'bg-[#e86f42] hover:bg-[#f39c78] text-white'
                  : 'bg-[#e05d30] hover:bg-[#cb502a] text-white'
              }`}
            >
              Compile this example
            </button>
          </div>
        </div>
      );
      updateCommandOutput(cmdId, codeOutput);
    } else {
      updateCommandOutput(cmdId, `File not found: ${fileName}`);
    }
  };
  
  const handleCompileExampleFile = async (fileName: string) => {
    const code = exampleFilesMap[fileName];
    if (!code) return;
    
    const cmdId = addCommandEntry(`msc ${fileName}`, "Compiling...", true);
    
    try {
      await compileCode(code, fileName);
      if (setCurrentFileName) {
        setCurrentFileName(fileName);
      }
      updateCommandOutput(cmdId, (
        <span className={theme === 'dark' ? 'text-green-400' : 'text-green-600'}>
          Compilation successful! Check the results panel for details.
        </span>
      ));
    } catch (error) {
      updateCommandOutput(cmdId, (
        <span className="text-red-500">
          Compilation failed: {error instanceof Error ? error.message : String(error)}
        </span>
      ));
    }
  };
  
  const handleOpenFileCommand = async (cmdId: number) => {
    try {
      updateCommandOutput(cmdId, "Opening file browser...", true);
      
      const selected = await dialog.open({
        multiple: false,
        filters: [{
          name: 'MiniSoft Files',
          extensions: ['ms']
        }]
      });
      
      if (!selected || Array.isArray(selected)) {
        updateCommandOutput(cmdId, "No file selected");
        return;
      }
      
      const filePath = selected as string;
      const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || filePath;
      
      updateCommandOutput(cmdId, `Selected file: ${fileName}`);
      
      // Now compile the selected file
      const newCmdId = addCommandEntry(`msc "${filePath}"`, "Loading and compiling file...", true);
      await handleCompileCommand(newCmdId, filePath);
      
    } catch (error) {
      updateCommandOutput(
        cmdId, 
        <span className="text-red-500">Error opening file: {error instanceof Error ? error.message : String(error)}</span>
      );
    }
  };
  
  const handleCompileCommand = async (cmdId: number, filePath: string) => {
    if (!filePath) {
      updateCommandOutput(cmdId, "Please specify a file path");
      return;
    }
    
    try {
      updateCommandOutput(cmdId, `Checking file: ${filePath}...`, true);
      
      // Extract filename if it's an absolute path
      const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || filePath;
      
      // Check if it's an example file
      if (exampleFilesMap[fileName]) {
        await compileCode(exampleFilesMap[fileName], fileName);
        if (setCurrentFileName) {
          setCurrentFileName(fileName);
        }
        updateCommandOutput(cmdId, (
          <span className={theme === 'dark' ? 'text-green-400' : 'text-green-600'}>
            Compilation successful! Check the results panel for details.
          </span>
        ));
        return;
      }
      
      // Check if the file exists and has .ms extension
      const fileExists = await fileSystem.exists(filePath);
      if (!fileExists) {
        updateCommandOutput(cmdId, `File not found: ${filePath}`);
        return;
      }
      
      if (!filePath.toLowerCase().endsWith('.ms')) {
        updateCommandOutput(cmdId, `File must have .ms extension: ${filePath}`);
        return;
      }
      
      // Read the file content
      updateCommandOutput(cmdId, `Reading file: ${filePath}...`, true);
      const fileContent = await fileSystem.readTextFile(filePath);
      
      // Compile the code
      updateCommandOutput(cmdId, `Compiling file: ${filePath}...`, true);
      await compileCode(fileContent, fileName);
      
      if (setCurrentFileName) {
        setCurrentFileName(fileName);
      }
      
      updateCommandOutput(cmdId, (
        <span className={theme === 'dark' ? 'text-green-400' : 'text-green-600'}>
          Compilation successful! Check the results panel for details.
        </span>
      ));
    } catch (error) {
      updateCommandOutput(
        cmdId, 
        <span className="text-red-500">
          Compilation failed: {error instanceof Error ? error.message : String(error)}
        </span>
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (isProcessing) return;
      processCommand(currentCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Navigate command history backwards
      const newIndex = historyIndex + 1;
      if (newIndex <= commandHistory.length - 1) {
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex].command);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Navigate command history forwards
      const newIndex = historyIndex - 1;
      if (newIndex >= 0) {
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex].command);
      } else {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      
      // Simple tab completion for commands
      const partialCmd = currentCommand.toLowerCase();
      const commands = ['help', 'clear', 'msc ', 'echo ', 'date', 'version', 'theme', 'ls', 'cat ', 'open'];
      
      if (partialCmd === '') return;
      
      const matchingCmd = commands.find(cmd => cmd.startsWith(partialCmd));
      if (matchingCmd) {
        setCurrentCommand(matchingCmd);
      }
      
      // Tab completion for example files with cat or msc
      if (partialCmd.startsWith('cat ') || partialCmd.startsWith('msc ')) {
        const parts = partialCmd.split(' ');
        const filePrefix = parts[1] || '';
        const exampleFilesList = Object.keys(exampleFilesMap);
        
        const matchingFile = exampleFilesList.find(file => 
          file.toLowerCase().startsWith(filePrefix.toLowerCase())
        );
        
        if (matchingFile) {
          setCurrentCommand(`${parts[0]} ${matchingFile}`);
        }
      }
    }
  };

  const clearTerminal = () => {
    setCommandHistory([]);
  };

  const copyTerminalContent = () => {
    const content = commandHistory
      .map(entry => `$ ${entry.command}\n${typeof entry.output === 'string' ? entry.output : 'Output is not plain text'}\n`)
      .join('\n');
    
    navigator.clipboard.writeText(content).then(
      () => {
        // Flash feedback for copy
        const terminal = terminalRef.current;
        if (terminal) {
          terminal.classList.add('flash-copy');
          setTimeout(() => terminal.classList.remove('flash-copy'), 200);
        }
      },
      (err) => console.error('Could not copy text: ', err)
    );
  };

  // Don't render anything if terminal is not visible
  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ height: '40%', minHeight: '200px', maxHeight: '50vh' }}
    >
      <div 
        className={`w-full h-full flex flex-col shadow-lg border-t ${
          getTerminalBackgroundColor(theme) + " " + getTerminalBorderColor(theme)
        }`}
      >
        <TerminalHeader 
          theme={theme}
          isProcessing={isProcessing}
          onOpenFile={() => processCommand('open')}
          onCopyContent={copyTerminalContent}
          onClearTerminal={clearTerminal}
          onClose={onClose}
        />
        
        <TerminalContent
          theme={theme}
          commandHistory={commandHistory}
          terminalRef={terminalRef}
        />
        
        <TerminalInput
          theme={theme}
          currentCommand={currentCommand}
          setCurrentCommand={setCurrentCommand}
          handleKeyDown={handleKeyDown}
          isProcessing={isProcessing}
          inputRef={inputRef}
        />
      </div>
      
      <style jsx>{`
        .flash-copy {
          background-color: var(--border-color);
          transition: background-color 0.2s;
        }
      `}</style>
    </div>
  );
};

export default Terminal;
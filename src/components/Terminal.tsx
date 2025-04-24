import React, { useState, useRef, useEffect, JSX } from 'react';
import { Terminal as TerminalIcon, X, ChevronRight, Copy, RotateCcw, Loader2, Folder } from 'lucide-react';

// Example files content
const exampleFilesMap: { [key: string]: string } = {
  'factorial.ms': `MainPrgm Factorial;
Var
  let n: Int;
  let result: Int;
  let i: Int;
BeginPg
{
  n := 5;
  result := 1;
  
  for i from 1 to n step 1 {
    result := result * i;
  }
  
  output(result);  <!- Outputs: 120 -!>
}
EndPg;`,
  'fibonacci.ms': `MainPrgm Fibonacci;
Var
  let n: Int = 10;
  let a: Int = 0;
  let b: Int = 1;
  let temp: Int;
  let i: Int;
BeginPg
{
  output(a);  <!- Outputs: 0 -!>
  output(b);  <!- Outputs: 1 -!>
  
  for i from 2 to n step 1 {
    temp := a + b;
    a := b;
    b := temp;
    output(b);
  }
}
EndPg;`,
  'hello_world.ms': `MainPrgm HelloWorld;
BeginPg
{
  output("Hello, World!");
}
EndPg;`,
  'loops.ms': `MainPrgm Loops;
Var
  let i: Int;
  let sum: Int = 0;
BeginPg
{
  for i from 1 to 5 step 1 {
    sum := sum + i;
    output(sum);
  }
}
EndPg;`,
  'conditionals.ms': `MainPrgm Conditionals;
Var
  let x: Int = 10;
  let y: Int = 20;
BeginPg
{
  if (x > y) {
    output("x is greater than y");
  } else {
    output("y is greater than or equal to x");
  }
}
EndPg;`
};

// Fallback implementations for Tauri APIs
const fileSystem = {
  // Check if file exists - always returns true for example files
  exists: async (path: string) => {
    const fileName = path.split('/').pop() || path.split('\\').pop() || path;
    // For example files, return true
    if (exampleFilesMap[fileName]) return true;
    // For actual files, we can't check existence in browser
    return true;
  },
  
  // Read text file - returns content for example files or shows file picker
  readTextFile: async (path: string) => {
    const fileName = path.split('/').pop() || path.split('\\').pop() || path;
    // For example files, return the content
    if (exampleFilesMap[fileName]) return exampleFilesMap[fileName];
    
    // For other files, this would normally read from filesystem
    // Since we're in a browser, we'll return a placeholder
    return `// Content of ${fileName}\n// (File system access not available in web mode)`;
  }
};

// File dialog implementation using browser's file picker
const dialog = {
  open: async (options: { multiple?: boolean, filters?: Array<{ name: string, extensions: string[] }> }) => {
    return new Promise((resolve) => {
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = options.multiple || false;
      
      // Set accept attribute based on filters
      if (options.filters && options.filters.length > 0) {
        const extensions = options.filters.flatMap(filter => 
          filter.extensions.map(ext => `.${ext}`)
        );
        input.accept = extensions.join(',');
      }
      
      // Handle file selection
      input.onchange = () => {
        if (input.files && input.files.length > 0) {
          // Return the file name as the path
          resolve(input.files[0].name);
        } else {
          resolve(null);
        }
      };
      
      // Handle cancellation
      input.oncancel = () => resolve(null);
      
      // Trigger file dialog
      input.click();
    });
  }
};

interface TerminalProps {
  theme: 'dark' | 'light';
  isVisible: boolean;
  onClose: () => void;
  compileCode: (code: string, filePath?: string) => Promise<void>;
  setCurrentFileName?: (name: string) => void;
}

interface CommandEntry {
  id: number;
  command: string;
  output: string | JSX.Element;
  timestamp: Date;
  isLoading?: boolean;
}

interface FileOperation {
  status: 'pending' | 'success' | 'error';
  message?: string;
  filePath?: string;
}

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
  const [fileOperation, setFileOperation] = useState<FileOperation | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandCount = useRef<number>(1);

  // Function to generate help output with proper styling
  function generateHelpOutput(currentTheme: 'dark' | 'light') {
    const commandColor = currentTheme === 'dark' ? 'text-[#e86f42]' : 'text-[#e05d30]';
    
    return (
      <div className="pl-4">
        <p className="font-medium mb-1">Available commands:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
          <p><span className={commandColor}>help</span> - Show this help message</p>
          <p><span className={commandColor}>clear</span> - Clear terminal</p>
          <p><span className={commandColor}>msc [file-path]</span> - Compile a MiniSoft file</p>
          <p><span className={commandColor}>open</span> - Open file browser to select a .ms file</p>
          <p><span className={commandColor}>echo [text]</span> - Print text</p>
          <p><span className={commandColor}>date</span> - Show current date and time</p>
          <p><span className={commandColor}>version</span> - Show MiniSoft version</p>
          <p><span className={commandColor}>ls</span> - List example files</p>
          <p><span className={commandColor}>cat [file-name]</span> - View example file content</p>
          <p><span className={commandColor}>theme</span> - Show current theme</p>
        </div>
      </div>
    );
  }

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
  
  const generateFileListOutput = (currentTheme: 'dark' | 'light') => {
    const fileColor = currentTheme === 'dark' ? 'text-[#b4e9f2]' : 'text-[#0087a5]';
    const exampleFiles = [
      'factorial.ms',
      'fibonacci.ms',
      'hello_world.ms',
      'loops.ms',
      'conditionals.ms'
    ];
    
    return (
      <div className="pl-4">
        <p className="mb-1">Example MiniSoft files:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {exampleFiles.map(file => (
            <p key={file} className={fileColor}>
              {file}
            </p>
          ))}
        </div>
        <p className="mt-2 text-xs opacity-75">
          Use <span className={currentTheme === 'dark' ? 'text-[#e86f42]' : 'text-[#e05d30]'}>cat [filename]</span> to view file content
        </p>
      </div>
    );
  };
  
  // Example files content
  const exampleFilesMap: { [key: string]: string } = {
    'factorial.ms': `MainPrgm Factorial;
Var
  let n: Int;
  let result: Int;
  let i: Int;
BeginPg
{
  n := 5;
  result := 1;
  
  for i from 1 to n step 1 {
    result := result * i;
  }
  
  output(result);  <!- Outputs: 120 -!>
}
EndPg;`,
    'fibonacci.ms': `MainPrgm Fibonacci;
Var
  let n: Int = 10;
  let a: Int = 0;
  let b: Int = 1;
  let temp: Int;
  let i: Int;
BeginPg
{
  output(a);  <!- Outputs: 0 -!>
  output(b);  <!- Outputs: 1 -!>
  
  for i from 2 to n step 1 {
    temp := a + b;
    a := b;
    b := temp;
    output(b);
  }
}
EndPg;`,
    'hello_world.ms': `MainPrgm HelloWorld;
BeginPg
{
  output("Hello, World!");
}
EndPg;`,
    'loops.ms': `MainPrgm Loops;
Var
  let i: Int;
  let sum: Int = 0;
BeginPg
{
  for i from 1 to 5 step 1 {
    sum := sum + i;
    output(sum);
  }
}
EndPg;`,
    'conditionals.ms': `MainPrgm Conditionals;
Var
  let x: Int = 10;
  let y: Int = 20;
BeginPg
{
  if (x > y) {
    output("x is greater than y");
  } else {
    output("y is greater than or equal to x");
  }
}
EndPg;`
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
          theme === 'dark' ? 'bg-[#262220] border-[#3e3632]' : 'bg-white border-[#efe0d9]'
        }`}
      >
        {/* Terminal header */}
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
              onClick={() => processCommand('open')}
              className={`p-1.5 rounded hover:opacity-80 transition-opacity ${
                theme === 'dark' ? 'hover:bg-[#312c28]' : 'hover:bg-[#fff1ec]'
              }`}
              title="Open file"
            >
              <Folder size={14} />
            </button>
            <button 
              onClick={copyTerminalContent}
              className={`p-1.5 rounded hover:opacity-80 transition-opacity ${
                theme === 'dark' ? 'hover:bg-[#312c28]' : 'hover:bg-[#fff1ec]'
              }`}
              title="Copy terminal content"
            >
              <Copy size={14} />
            </button>
            <button 
              onClick={clearTerminal}
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
        
        {/* Terminal content */}
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
        
        {/* Terminal input */}
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
      </div>
      
      <style jsx>{`
        .flash-copy {
          background-color: ${theme === 'dark' ? '#3e3632' : '#efe0d9'};
          transition: background-color 0.2s;
        }
      `}</style>
    </div>
  );
};

export default Terminal;
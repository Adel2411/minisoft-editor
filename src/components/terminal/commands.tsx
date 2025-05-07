import React from 'react';
import { exampleFilesMap } from './ExampleFiles';

export function generateHelpOutput(currentTheme: 'dark' | 'light') {
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

export function generateFileListOutput(currentTheme: 'dark' | 'light') {
  const fileColor = currentTheme === 'dark' ? 'text-[#b4e9f2]' : 'text-[#0087a5]';
  const exampleFiles = Object.keys(exampleFilesMap);
  
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
}

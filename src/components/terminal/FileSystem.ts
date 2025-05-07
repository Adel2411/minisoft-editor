import { FileDialogOptions } from './types';
import { exampleFilesMap } from './ExampleFiles';

// Fallback implementations for Tauri APIs
export const fileSystem = {
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
export const dialog = {
  open: async (options: FileDialogOptions) => {
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

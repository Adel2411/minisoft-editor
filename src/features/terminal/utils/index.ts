import { exampleFilesMap } from "../constants";
import { FileDialogOptions } from "../types";

// Fallback implementations for Tauri APIs
export const fileSystem = {
  exists: async (path: string) => {
    const fileName = path.split("/").pop() || path.split("\\").pop() || path;
    if (exampleFilesMap[fileName]) return true;
    return true;
  },

  // Read text file - returns content for example files or shows file picker
  readTextFile: async (path: string) => {
    const fileName = path.split("/").pop() || path.split("\\").pop() || path;
    if (exampleFilesMap[fileName]) return exampleFilesMap[fileName];

    return `// Content of ${fileName}\n// (File system access not available in web mode)`;
  },
};

// File dialog implementation using browser's file picker
export const dialog = {
  open: async (options: FileDialogOptions) => {
    return new Promise((resolve) => {
      // Create a file input element
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = options.multiple || false;

      // Set accept attribute based on filters
      if (options.filters && options.filters.length > 0) {
        const extensions = options.filters.flatMap((filter) =>
          filter.extensions.map((ext) => `.${ext}`),
        );
        input.accept = extensions.join(",");
      }

      // Handle file selection
      input.onchange = () => {
        if (input.files && input.files.length > 0) {
          resolve(input.files[0].name);
        } else {
          resolve(null);
        }
      };

      input.oncancel = () => resolve(null);

      input.click();
    });
  },
};

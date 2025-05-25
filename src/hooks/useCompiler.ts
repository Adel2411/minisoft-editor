import { useEffect } from 'react';
import { invoke } from "@tauri-apps/api/core";
import type { CompilationErrors, CompilationResult } from "@/types";

interface UseCompilerProps {
  code: string;
  setCompilationResult: (result: CompilationResult | null) => void;
  setIsCompiling: (isCompiling: boolean) => void;
  setError: (error: CompilationErrors | null) => void;
  showNotification: (message: string, isError?: boolean) => void;
}

export function useCompiler({
  code,
  setCompilationResult,
  setIsCompiling,
  setError,
  showNotification,
}: UseCompilerProps) {
  
  const compileCode = async () => {
    setIsCompiling(true);
    try {
      const compilationResult = await invoke<CompilationResult>(
        "compile_minisoft",
        {
          code,
          verbose: false,
        },
      );
      setCompilationResult(compilationResult);

      if (compilationResult.errors) {
        setError(compilationResult.errors);
        showNotification("Compilation process failed with errors", true);
      } else {
        setError(null);
        showNotification("Compilation process completed successfully!");
      }
    } catch (err: unknown) {
      setError({
        lexical_errors: [],
        syntax_errors: [],
        semantic_errors: [],
      });
      showNotification("Compilation process failed unexpectedly", true);
    } finally {
      setIsCompiling(false);
    }
  };

  return { compileCode };
}

"use client";

import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { CompilationResult } from "@/types";
import CodeEditor from "@/components/CodeEditor";
import ErrorDisplay from "@/components/ErrorDisplay";
import ResultsDisplay from "@/components/ResultsDisplay";

export default function Page() {
  const [code, setCode] = useState<string>(
    "// Write your MiniSoft code here\n",
  );
  const [result, setResult] = useState<CompilationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCompile = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const compilationResult = await invoke<CompilationResult>(
        "compile_minisoft",
        {
          code,
          verbose: false,
        },
      );
      setResult(compilationResult);
    } catch (err: unknown) {
      console.error(err);
      setError(`Error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 space-y-6 bg-gradient-to-b from-gray-50 to-blue-50">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        MiniSoft Compiler
      </h1>

      <CodeEditor
        code={code}
        setCode={setCode}
        onCompile={handleCompile}
        loading={loading}
      />
      {error && <ErrorDisplay error={error} />}
      {result && <ResultsDisplay result={result} />}
    </div>
  );
}

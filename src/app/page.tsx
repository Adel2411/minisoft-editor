"use client";

import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function Page() {
  const [code, setCode] = useState<string>(
    "// Write your MiniSoft code here\n",
  );
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleCompile = async () => {
    setLoading(true);
    setOutput("");
    try {
      // note: we pass `code` (the textarea content), not a filePath
      const result = await invoke<string>("compile_minisoft", {
        code,
        verbose: false,
      });
      setOutput(result);
    } catch (err: unknown) {
      console.error(err);
      setOutput(`Error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 space-y-4">
      <h1 className="text-2xl font-bold">MiniSoft Compiler</h1>
      <textarea
        className="w-full max-w-2xl h-64 p-2 border rounded focus:outline-none"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button
        onClick={handleCompile}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Compiling..." : "Compile Code"}
      </button>
      <pre className="w-full max-w-2xl p-4 bg-gray-100 rounded whitespace-pre-wrap break-words">
        {output}
      </pre>
    </div>
  );
}

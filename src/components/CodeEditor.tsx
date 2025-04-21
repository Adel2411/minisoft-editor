import React from "react";

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  onCompile: () => void;
  loading: boolean;
}

export default function CodeEditor({
  code,
  setCode,
  onCompile,
  loading,
}: CodeEditorProps) {
  return (
    <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <h2 className="text-lg font-semibold">
          <span className="mr-2">📝</span> Source Code
        </h2>
        <button
          onClick={onCompile}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center"
        >
          {loading ? (
            <>
              <LoadingSpinner />
              Compiling...
            </>
          ) : (
            <>
              <span className="mr-2">⚙️</span> Compile Code
            </>
          )}
        </button>
      </div>
      <textarea
        className="w-full h-64 p-4 font-mono text-sm border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="// Write your MiniSoft code here"
        spellCheck="false"
      />
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}

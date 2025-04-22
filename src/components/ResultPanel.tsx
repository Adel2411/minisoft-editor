"use client";

import type { CompilationResult } from "@/types";
import { useState } from "react";
import { Search, Copy, Download } from "lucide-react";
import ASTViewer from "./results/ASTViewer";
import TokensViewer from "./results/TokensViewer";
import SymbolsViewer from "./results/SymbolsViewer";
import QuadruplesViewer from "./results/QuadruplesViewer";

interface ResultPanelProps {
  result: CompilationResult;
  activeTab: string;
  theme: "dark" | "light";
}

export default function ResultPanel({
  result,
  activeTab,
  theme,
}: ResultPanelProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  if (!result) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Show a temporary success message
        const notification = document.createElement("div");
        notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 transition-opacity duration-300 ${
          theme === "dark"
            ? "bg-[#312c28] text-[#f3ebe7] border border-[#3e3632]"
            : "bg-white text-[#212529] border border-[#efe0d9]"
        }`;
        notification.textContent = "Copied to clipboard!";
        document.body.appendChild(notification);

        setTimeout(() => {
          notification.style.opacity = "0";
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`h-full overflow-auto p-4 relative ${theme === "dark" ? "bg-[#262220]" : "bg-white"}`}
    >
      {/* Result toolbar */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {activeTab === "tokens" && "Tokens"}
          {activeTab === "ast" && "Abstract Syntax Tree"}
          {activeTab === "symbols" && "Symbol Table"}
          {activeTab === "quadruples" && "Quadruples"}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-1 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                : "hover:bg-[#fff1ec] text-[#495057] hover:text-[#212529]"
            }`}
            title="Search in results"
          >
            <Search size={16} />
          </button>
          <button
            onClick={() => {
              if (activeTab === "tokens") {
                copyToClipboard(JSON.stringify(result.tokens, null, 2));
              } else if (activeTab === "ast") {
                copyToClipboard(JSON.stringify(result.ast, null, 2));
              } else if (activeTab === "symbols") {
                copyToClipboard(JSON.stringify(result.symbol_table, null, 2));
              } else if (activeTab === "quadruples") {
                copyToClipboard(JSON.stringify(result.quadruples, null, 2));
              }
            }}
            className={`p-1 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                : "hover:bg-[#fff1ec] text-[#495057] hover:text-[#212529]"
            }`}
            title="Copy to clipboard"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={() => {
              if (activeTab === "tokens") {
                downloadAsFile(
                  JSON.stringify(result.tokens, null, 2),
                  "tokens.json",
                );
              } else if (activeTab === "ast") {
                downloadAsFile(JSON.stringify(result.ast, null, 2), "ast.json");
              } else if (activeTab === "symbols") {
                downloadAsFile(
                  JSON.stringify(result.symbol_table, null, 2),
                  "symbols.json",
                );
              } else if (activeTab === "quadruples") {
                downloadAsFile(
                  JSON.stringify(result.quadruples, null, 2),
                  "quadruples.json",
                );
              }
            }}
            className={`p-1 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-[#312c28] text-[#b5a9a2] hover:text-[#f3ebe7]"
                : "hover:bg-[#fff1ec] text-[#495057] hover:text-[#212529]"
            }`}
            title="Download as file"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      {isSearchOpen && (
        <div className="mb-4">
          <div
            className={`flex items-center px-3 py-2 rounded-md border ${
              theme === "dark"
                ? "bg-[#312c28] border-[#3e3632]"
                : "bg-[#fff1ec] border-[#efe0d9]"
            }`}
          >
            <Search
              size={16}
              className={theme === "dark" ? "text-[#b5a9a2]" : "text-[#495057]"}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in results..."
              className={`w-full px-2 py-1 text-sm bg-transparent border-none outline-none ${
                theme === "dark"
                  ? "text-[#f3ebe7] placeholder-[#b5a9a2]"
                  : "text-[#212529] placeholder-[#495057]"
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className={`text-sm ${
                  theme === "dark"
                    ? "text-[#b5a9a2] hover:text-[#f3ebe7]"
                    : "text-[#495057] hover:text-[#212529]"
                }`}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === "tokens" && (
        <TokensViewer
          tokens={result.tokens}
          theme={theme}
          searchTerm={searchTerm}
        />
      )}

      {activeTab === "ast" && <ASTViewer program={result.ast} theme={theme} />}

      {activeTab === "symbols" && (
        <SymbolsViewer
          symbolTable={result.symbol_table}
          theme={theme}
          searchTerm={searchTerm}
        />
      )}

      {activeTab === "quadruples" && (
        <QuadruplesViewer
          program={result.quadruples}
          theme={theme}
          searchTerm={searchTerm}
        />
      )}
    </div>
  );
}

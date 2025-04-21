"use client";

import type { CompilationResult, Token, Symbol } from "@/types";
import { useState } from "react";
import { Search, Copy, Download } from "lucide-react";

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
            ? "bg-gray-800 text-gray-200 border border-gray-700"
            : "bg-white text-gray-800 border border-gray-200"
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

  const filterTokens = (tokens: Token[]) => {
    if (!searchTerm) return tokens;
    return tokens.filter(
      (token) =>
        token.kind.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.value.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const filterSymbols = (symbols: Symbol[]) => {
    if (!searchTerm) return symbols;
    return symbols.filter(
      (symbol) =>
        symbol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        symbol.kind.toLowerCase().includes(searchTerm.toLowerCase()) ||
        symbol.symbol_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        symbol.value.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const filterQuadruples = (quadruples: string[]) => {
    if (!searchTerm) return quadruples;
    return quadruples.filter((quad) =>
      quad.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const getTokenColor = (kind: string, theme: "dark" | "light"): string => {
    const kindLower = kind.toLowerCase();

    if (kindLower.includes("keyword")) {
      return theme === "dark"
        ? "bg-purple-900 text-purple-200"
        : "bg-purple-100 text-purple-800";
    } else if (kindLower.includes("identifier")) {
      return theme === "dark"
        ? "bg-blue-900 text-blue-200"
        : "bg-blue-100 text-blue-800";
    } else if (kindLower.includes("number") || kindLower.includes("integer")) {
      return theme === "dark"
        ? "bg-green-900 text-green-200"
        : "bg-green-100 text-green-800";
    } else if (kindLower.includes("string")) {
      return theme === "dark"
        ? "bg-yellow-900 text-yellow-200"
        : "bg-yellow-100 text-yellow-800";
    } else if (kindLower.includes("operator")) {
      return theme === "dark"
        ? "bg-red-900 text-red-200"
        : "bg-red-100 text-red-800";
    } else if (
      kindLower.includes("punctuation") ||
      kindLower.includes("delimiter")
    ) {
      return theme === "dark"
        ? "bg-gray-700 text-gray-200"
        : "bg-gray-200 text-gray-800";
    } else {
      return theme === "dark"
        ? "bg-gray-700 text-gray-200"
        : "bg-gray-200 text-gray-800";
    }
  };

  const getSymbolKindColor = (
    kind: string,
    theme: "dark" | "light",
  ): string => {
    const kindLower = kind.toLowerCase();

    if (kindLower.includes("variable")) {
      return theme === "dark"
        ? "bg-blue-900 text-blue-200"
        : "bg-blue-100 text-blue-800";
    } else if (kindLower.includes("function")) {
      return theme === "dark"
        ? "bg-purple-900 text-purple-200"
        : "bg-purple-100 text-purple-800";
    } else if (kindLower.includes("constant")) {
      return theme === "dark"
        ? "bg-green-900 text-green-200"
        : "bg-green-100 text-green-800";
    } else if (kindLower.includes("class")) {
      return theme === "dark"
        ? "bg-yellow-900 text-yellow-200"
        : "bg-yellow-100 text-yellow-800";
    } else if (kindLower.includes("program")) {
      return theme === "dark"
        ? "bg-emerald-900 text-emerald-200"
        : "bg-emerald-100 text-emerald-800";
    } else {
      return theme === "dark"
        ? "bg-gray-700 text-gray-200"
        : "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div
      className={`h-full overflow-auto p-4 relative ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
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
                ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                : "hover:bg-gray-200 text-gray-600 hover:text-gray-800"
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
                copyToClipboard(result.ast);
              } else if (activeTab === "symbols") {
                copyToClipboard(JSON.stringify(result.symbol_table, null, 2));
              } else if (activeTab === "quadruples") {
                copyToClipboard(result.quadruples.join("\n"));
              }
            }}
            className={`p-1 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                : "hover:bg-gray-200 text-gray-600 hover:text-gray-800"
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
                downloadAsFile(result.ast, "ast.txt");
              } else if (activeTab === "symbols") {
                downloadAsFile(
                  JSON.stringify(result.symbol_table, null, 2),
                  "symbols.json",
                );
              } else if (activeTab === "quadruples") {
                downloadAsFile(result.quadruples.join("\n"), "quadruples.txt");
              }
            }}
            className={`p-1 rounded-md transition-colors ${
              theme === "dark"
                ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                : "hover:bg-gray-200 text-gray-600 hover:text-gray-800"
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
                ? "bg-gray-700 border-gray-600"
                : "bg-gray-50 border-gray-300"
            }`}
          >
            <Search
              size={16}
              className={theme === "dark" ? "text-gray-400" : "text-gray-500"}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in results..."
              className={`w-full px-2 py-1 text-sm bg-transparent border-none outline-none ${
                theme === "dark"
                  ? "text-gray-200 placeholder-gray-400"
                  : "text-gray-800 placeholder-gray-500"
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className={`text-sm ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === "tokens" && (
        <div className="animate-fadeIn">
          <div
            className={`overflow-auto rounded-lg border shadow-sm ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <table className="w-full">
              <thead
                className={`text-xs uppercase sticky top-0 z-10 ${
                  theme === "dark"
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <tr>
                  <th className="px-4 py-2 text-left">Kind</th>
                  <th className="px-4 py-2 text-left">Value</th>
                  <th className="px-4 py-2 text-left">Line</th>
                  <th className="px-4 py-2 text-left">Column</th>
                  <th className="px-4 py-2 text-left">Span</th>
                </tr>
              </thead>
              <tbody
                className={
                  theme === "dark"
                    ? "divide-y divide-gray-700"
                    : "divide-y divide-gray-200"
                }
              >
                {filterTokens(result.tokens).map(
                  (token: Token, index: number) => (
                    <tr
                      key={index}
                      className={`transition-colors hover:bg-opacity-50 ${
                        index % 2 === 0
                          ? theme === "dark"
                            ? "bg-gray-800 hover:bg-gray-700"
                            : "bg-white hover:bg-gray-50"
                          : theme === "dark"
                            ? "bg-gray-750 hover:bg-gray-700"
                            : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getTokenColor(token.kind, theme)}`}
                        >
                          {token.kind}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono">{token.value}</td>
                      <td className="px-4 py-2">{token.line}</td>
                      <td className="px-4 py-2">{token.column}</td>
                      <td className="px-4 py-2 font-mono">
                        [{token.span[0]}, {token.span[1]}]
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "ast" && (
        <div className="animate-fadeIn">
          <pre
            className={`p-4 rounded-lg overflow-auto font-mono text-sm whitespace-pre shadow-sm border ${
              theme === "dark"
                ? "bg-gray-900 text-gray-300 border-gray-700"
                : "bg-gray-100 text-gray-800 border-gray-200"
            }`}
          >
            {result.ast}
          </pre>
        </div>
      )}

      {activeTab === "symbols" && (
        <div className="animate-fadeIn">
          <div
            className={`overflow-auto rounded-lg border shadow-sm ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <table className="w-full">
              <thead
                className={`text-xs uppercase sticky top-0 z-10 ${
                  theme === "dark"
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Kind</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Value</th>
                  <th className="px-4 py-2 text-left">Line</th>
                  <th className="px-4 py-2 text-left">Column</th>
                </tr>
              </thead>
              <tbody
                className={
                  theme === "dark"
                    ? "divide-y divide-gray-700"
                    : "divide-y divide-gray-200"
                }
              >
                {filterSymbols(result.symbol_table).map(
                  (symbol: Symbol, index: number) => (
                    <tr
                      key={index}
                      className={`transition-colors hover:bg-opacity-50 ${
                        index % 2 === 0
                          ? theme === "dark"
                            ? "bg-gray-800 hover:bg-gray-700"
                            : "bg-white hover:bg-gray-50"
                          : theme === "dark"
                            ? "bg-gray-750 hover:bg-gray-700"
                            : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <td className="px-4 py-2 font-mono">{symbol.name}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getSymbolKindColor(symbol.kind, theme)}`}
                        >
                          {symbol.kind}
                        </span>
                      </td>
                      <td className="px-4 py-2">{symbol.symbol_type}</td>
                      <td className="px-4 py-2 font-mono">{symbol.value}</td>
                      <td className="px-4 py-2">{symbol.line}</td>
                      <td className="px-4 py-2">{symbol.column}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "quadruples" && (
        <div className="animate-fadeIn">
          <div
            className={`p-4 rounded-lg overflow-auto font-mono text-sm shadow-sm border ${
              theme === "dark"
                ? "bg-gray-900 text-gray-300 border-gray-700"
                : "bg-gray-100 text-gray-800 border-gray-200"
            }`}
          >
            <ol className="list-decimal pl-5 space-y-1">
              {filterQuadruples(result.quadruples).map(
                (quad: string, index: number) => (
                  <li
                    key={index}
                    className="break-all hover:bg-opacity-50 transition-colors px-2 py-1 rounded-sm"
                  >
                    {quad}
                  </li>
                ),
              )}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

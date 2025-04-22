import { useRef } from "react";
import type { Token } from "@/types";

interface TokensViewerProps {
  tokens: Token[];
  theme: "dark" | "light";
  searchTerm?: string;
}

export default function TokensViewer({
  tokens,
  theme,
  searchTerm = "",
}: TokensViewerProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  const filterTokens = (tokens: Token[]) => {
    if (!searchTerm) return tokens;
    return tokens.filter(
      (token) =>
        token.kind.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.value.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const filteredTokens = filterTokens(tokens);

  const getTokenColor = (kind: string, theme: "dark" | "light"): string => {
    const kindLower = kind.toLowerCase();

    // Rust-inspired colors with different shades of orange for different token types
    if (kindLower.includes("keyword")) {
      return theme === "dark"
        ? "bg-[#3d2b1f] text-[#f39c78]"
        : "bg-[#fff1ec] text-[#cb502a]";
    } else if (kindLower.includes("identifier")) {
      return theme === "dark"
        ? "bg-[#312c28] text-[#e86f42]"
        : "bg-[#fef5f1] text-[#e05d30]";
    } else if (kindLower.includes("number") || kindLower.includes("integer")) {
      return theme === "dark"
        ? "bg-[#3e3632] text-[#fb8f67]"
        : "bg-[#fdf8f6] text-[#a84424]";
    } else if (kindLower.includes("string")) {
      return theme === "dark"
        ? "bg-[#362e2a] text-[#ffb86c]"
        : "bg-[#fef6f2] text-[#ed7d39]";
    } else if (kindLower.includes("operator")) {
      return theme === "dark"
        ? "bg-[#402f27] text-[#f3ebe7]"
        : "bg-[#feece5] text-[#cb502a]";
    } else if (
      kindLower.includes("punctuation") ||
      kindLower.includes("delimiter")
    ) {
      return theme === "dark"
        ? "bg-[#312c28] text-[#d9cec9]"
        : "bg-[#fff1ec] text-[#495057]";
    } else {
      return theme === "dark"
        ? "bg-[#312c28] text-[#d9cec9]"
        : "bg-[#fff1ec] text-[#495057]";
    }
  };

  return (
    <div className="animate-fadeIn" ref={tableRef}>
      <div
        className={`overflow-auto rounded-lg border shadow-sm ${
          theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"
        }`}
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        <table className="w-full">
          <thead
            className={`text-xs uppercase sticky top-0 z-10 ${
              theme === "dark"
                ? "bg-[#312c28] text-[#d9cec9]"
                : "bg-[#fff1ec] text-[#495057]"
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
                ? "divide-y divide-[#3e3632]"
                : "divide-y divide-[#efe0d9]"
            }
          >
            {filteredTokens.map((token: Token, index: number) => (
              <tr
                key={index}
                className={`transition-colors hover:bg-opacity-50 ${
                  index % 2 === 0
                    ? theme === "dark"
                      ? "bg-[#262220] hover:bg-[#312c28]"
                      : "bg-white hover:bg-[#fff1ec]"
                    : theme === "dark"
                      ? "bg-[#1e1a17] hover:bg-[#312c28]"
                      : "bg-[#fefaf8] hover:bg-[#fff1ec]"
                }`}
              >
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getTokenColor(
                      token.kind,
                      theme,
                    )}`}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

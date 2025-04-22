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
  const filterTokens = (tokens: Token[]) => {
    if (!searchTerm) return tokens;
    return tokens.filter(
      (token) =>
        token.kind.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.value.toLowerCase().includes(searchTerm.toLowerCase()),
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

  return (
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
            {filterTokens(tokens).map((token: Token, index: number) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

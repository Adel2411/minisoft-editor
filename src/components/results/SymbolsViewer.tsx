import type { Symbol } from "@/types";

interface SymbolsViewerProps {
  symbolTable: Symbol[];
  theme: "dark" | "light";
  searchTerm?: string;
}

export default function SymbolsViewer({
  symbolTable,
  theme,
  searchTerm = "",
}: SymbolsViewerProps) {
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
            {filterSymbols(symbolTable).map((symbol: Symbol, index: number) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

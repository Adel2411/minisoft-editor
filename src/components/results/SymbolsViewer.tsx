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

    // Use orange-themed colors for all types to match the Rust theme
    if (kindLower.includes("variable")) {
      return theme === "dark"
        ? "bg-[#3d2b1f] text-[#f39c78]"
        : "bg-[#fff1ec] text-[#e05d30]";
    } else if (kindLower.includes("function")) {
      return theme === "dark"
        ? "bg-[#402f27] text-[#ffb86c]"
        : "bg-[#feece5] text-[#cb502a]";
    } else if (kindLower.includes("constant")) {
      return theme === "dark"
        ? "bg-[#362e2a] text-[#fb8f67]"
        : "bg-[#fef6f2] text-[#a84424]";
    } else if (kindLower.includes("class")) {
      return theme === "dark"
        ? "bg-[#3e3632] text-[#e86f42]"
        : "bg-[#fdf8f6] text-[#e05d30]";
    } else if (kindLower.includes("program")) {
      return theme === "dark"
        ? "bg-[#452d1d] text-[#f39c78]"
        : "bg-[#fff5f0] text-[#cb502a]";
    } else {
      return theme === "dark"
        ? "bg-[#312c28] text-[#d9cec9]"
        : "bg-[#fff1ec] text-[#495057]";
    }
  };

  const filteredSymbols = filterSymbols(symbolTable);

  return (
    <div className="animate-fadeIn">
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
                ? "divide-y divide-[#3e3632]"
                : "divide-y divide-[#efe0d9]"
            }
          >
            {filteredSymbols.map((symbol: Symbol, index: number) => (
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
            {filteredSymbols.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className={`px-4 py-8 text-center ${
                    theme === "dark" ? "text-[#b5a9a2]" : "text-[#868e96]"
                  }`}
                >
                  No symbols found{searchTerm ? " matching your search" : ""}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

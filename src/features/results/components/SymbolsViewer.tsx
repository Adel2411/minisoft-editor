import type { Symbol } from "@/types";
import { filterSymbols } from "../utils/filters";
import { getSymbolKindColor } from "../utils/theme";
import DataTable from "./DataTable";

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
  const filteredSymbols = filterSymbols(symbolTable, searchTerm);

  const columns = [
    { 
      key: "name", 
      header: "Name",
      render: (name: string) => <span className="font-mono">{name}</span>,
    },
    { 
      key: "kind", 
      header: "Kind",
      render: (kind: string) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${getSymbolKindColor(kind, theme)}`}
        >
          {kind}
        </span>
      ),
    },
    { key: "symbol_type", header: "Type" },
    { 
      key: "value", 
      header: "Value",
      render: (value: string) => <span className="font-mono">{value}</span>,
    },
    { key: "line", header: "Line" },
    { key: "column", header: "Column" },
  ];

  return (
    <div className="animate-fadeIn">
      <DataTable 
        columns={columns}
        data={filteredSymbols}
        theme={theme}
        emptyMessage={`No symbols found${searchTerm ? " matching your search" : ""}`}
      />
    </div>
  );
}

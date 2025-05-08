import type { Token } from "@/types";
import { filterTokens } from "../utils";
import { getTokenColor } from "../../../utils/theme";
import DataTable from "./DataTable";

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
  const filteredTokens = filterTokens(tokens, searchTerm);
  
  const columns = [
    {
      key: "kind",
      header: "Kind",
      render: (kind: string) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${getTokenColor(
            kind,
            theme,
          )}`}
        >
          {kind}
        </span>
      ),
    },
    {
      key: "value",
      header: "Value",
      render: (value: string) => <span className="font-mono">{value}</span>,
    },
    { key: "line", header: "Line" },
    { key: "column", header: "Column" },
    { 
      key: "span", 
      header: "Span",
      render: (span: number[]) => (
        <span className="font-mono">
          [{span[0]}, {span[1]}]
        </span>
      ),
    },
  ];

  return (
    <div className="animate-fadeIn">
      <DataTable 
        columns={columns}
        data={filteredTokens}
        theme={theme}
        emptyMessage={`No tokens found${searchTerm ? " matching your search" : ""}`}
      />
    </div>
  );
}

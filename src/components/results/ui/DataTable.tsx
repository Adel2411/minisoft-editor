import React from "react";

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  theme: "dark" | "light";
  emptyMessage?: string;
}

export default function DataTable({ 
  columns, 
  data, 
  theme, 
  emptyMessage = "No items found" 
}: DataTableProps) {
  return (
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
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-2 text-left">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className={
            theme === "dark"
              ? "divide-y divide-[#3e3632]"
              : "divide-y divide-[#efe0d9]"
          }
        >
          {data.length > 0 ? (
            data.map((row, index) => (
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
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-2">
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className={`px-4 py-8 text-center ${
                  theme === "dark" ? "text-[#b5a9a2]" : "text-[#868e96]"
                }`}
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

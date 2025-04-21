import { Symbol } from "@/types";
import React from "react";

interface SymbolTableProps {
  symbols: Symbol[];
}

export default function SymbolTable({ symbols }: SymbolTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kind
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {symbols.map((symbol, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="px-6 py-2 whitespace-nowrap font-mono text-sm text-blue-600">
                {symbol.name}
              </td>
              <td className="px-6 py-2 whitespace-nowrap font-mono text-sm">
                {symbol.kind}
              </td>
              <td className="px-6 py-2 whitespace-nowrap font-mono text-sm">
                {symbol.symbol_type}
              </td>
              <td className="px-6 py-2 whitespace-nowrap font-mono text-sm">
                {symbol.value}
              </td>
              <td className="px-6 py-2 whitespace-nowrap font-mono text-sm">
                Line {symbol.line}, Col {symbol.column}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

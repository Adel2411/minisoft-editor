import { Token } from "@/types";
import React from "react";

interface TokenTableProps {
  tokens: Token[];
}

export default function TokensTable({ tokens }: TokenTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kind
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Position
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Span
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tokens.map((token, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="px-6 py-2 whitespace-nowrap font-mono text-sm text-blue-600">
                {token.kind}
              </td>
              <td className="px-6 py-2 whitespace-nowrap font-mono text-sm">
                {token.value}
              </td>
              <td className="px-6 py-2 whitespace-nowrap font-mono text-sm">
                Line {token.line}, Col {token.column}
              </td>
              <td className="px-6 py-2 whitespace-nowrap font-mono text-sm">
                {token.span[0]}-{token.span[1]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

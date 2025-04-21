import React from "react";

interface QuadruplesTableProps {
  quadruples: string[];
}

export default function QuadruplesTable({ quadruples }: QuadruplesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quadruple
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {quadruples.map((quad, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="px-6 py-2 whitespace-nowrap font-mono text-sm text-gray-500">
                {index}
              </td>
              <td className="px-6 py-2 whitespace-nowrap font-mono text-sm">
                {quad}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import React from "react";

interface AstDisplayProps {
  ast: string;
}

export default function AstDisplay({ ast }: AstDisplayProps) {
  return (
    <pre className="whitespace-pre-wrap font-mono text-sm overflow-x-auto p-4 bg-gray-50 rounded-md">
      {ast}
    </pre>
  );
}

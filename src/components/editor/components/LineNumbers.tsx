import React from 'react';
import { ChevronRight, ChevronDown } from "lucide-react";

interface LineNumbersProps {
  theme: "dark" | "light";
  code: string;
  lineNumbers: number[];
  foldedLines: number[];
  toggleFold: (lineNumber: number) => void;
  lineNumbersRef: React.RefObject<HTMLDivElement | null>;
}

const LineNumbers: React.FC<LineNumbersProps> = ({
  theme,
  code,
  lineNumbers,
  foldedLines,
  toggleFold,
  lineNumbersRef
}) => {
  return (
    <div
      ref={lineNumbersRef}
      className={`sticky left-0 w-12 select-none flex-shrink-0 ${
        theme === "dark"
          ? "bg-[#1e1a17] text-[#b5a9a2]"
          : "bg-[#fefaf8] text-[#868e96]"
      }`}
      style={{
        paddingTop: "16px", // Match the textarea's padding-top
        lineHeight: "24px", // Consistent line height
      }}
    >
      {lineNumbers.map((lineNum) => (
        <div
          key={lineNum}
          className={`flex items-center justify-end pr-2 h-6 leading-6 group ${
            code.split("\n")[lineNum - 1]?.trim().endsWith("{") ||
            code.split("\n")[lineNum - 1]?.trim().endsWith("(") ||
            code.split("\n")[lineNum - 1]?.trim().endsWith("[")
              ? "cursor-pointer"
              : ""
          }`}
          onClick={() => {
            if (
              code.split("\n")[lineNum - 1]?.trim().endsWith("{") ||
              code.split("\n")[lineNum - 1]?.trim().endsWith("(") ||
              code.split("\n")[lineNum - 1]?.trim().endsWith("[")
            ) {
              toggleFold(lineNum);
            }
          }}
        >
          <span className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {(code.split("\n")[lineNum - 1]?.trim().endsWith("{") ||
              code.split("\n")[lineNum - 1]?.trim().endsWith("(") ||
              code.split("\n")[lineNum - 1]?.trim().endsWith("[")) &&
              (foldedLines.includes(lineNum) ? (
                <ChevronRight size={12} />
              ) : (
                <ChevronDown size={12} />
              ))}
          </span>
          <span>{lineNum}</span>
        </div>
      ))}
    </div>
  );
};

export default LineNumbers;

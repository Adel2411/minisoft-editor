import { Operand, Quadruple, QuadrupleProgram } from "@/types";
import React, { useState } from "react";

interface QuadruplesViewerProps {
  program: QuadrupleProgram;
  theme: "dark" | "light";
  searchTerm?: string;
}

export default function QuadruplesViewer({
  program,
  theme,
  searchTerm = "",
}: QuadruplesViewerProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { quadruples, next_temp, next_label } = program;

  const filterQuadruples = (quadruples: Quadruple[]) => {
    if (!searchTerm) return quadruples;
    return quadruples.filter((quad) =>
      JSON.stringify(quad).toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const renderOperand = (operand: Operand) => {
    switch (operand.type) {
      case "IntLiteral":
      case "FloatLiteral":
        return (
          <span
            className={theme === "dark" ? "text-green-300" : "text-green-700"}
          >
            {operand.data.value}
          </span>
        );
      case "StringLiteral":
        return (
          <span
            className={theme === "dark" ? "text-green-300" : "text-green-700"}
          >
            "{operand.data.value}"
          </span>
        );
      case "Variable":
        return (
          <span
            className={theme === "dark" ? "text-blue-300" : "text-blue-700"}
          >
            {operand.data.name}
          </span>
        );
      case "TempVariable":
        return (
          <span
            className={theme === "dark" ? "text-cyan-300" : "text-cyan-700"}
          >
            {operand.data.name}
          </span>
        );
      case "ArrayElement":
        return (
          <span
            className={theme === "dark" ? "text-purple-300" : "text-purple-700"}
          >
            {operand.data.name}[{renderOperand(operand.data.index)}]
          </span>
        );
      case "Empty":
        return <span className="text-gray-500">_</span>;
      default:
        return (
          <span className={theme === "dark" ? "text-red-300" : "text-red-700"}>
            Unknown
          </span>
        );
    }
  };

  const renderCompactQuadruple = (quad: Quadruple) => {
    if (quad.operation.type === "Label") {
      return (
        <div
          className={
            theme === "dark"
              ? "font-bold text-orange-300"
              : "font-bold text-orange-700"
          }
        >
          Label {(quad.operation as any).data.id}:
        </div>
      );
    }

    if (quad.operation.type === "Jump") {
      return (
        <div className="flex items-center gap-2">
          <span
            className={
              theme === "dark"
                ? "font-bold text-orange-300"
                : "font-bold text-orange-700"
            }
          >
            GOTO
          </span>
          <span>Label {(quad.operation as any).data.target}</span>
        </div>
      );
    }

    if (quad.operation.type === "JumpIfTrue") {
      return (
        <div className="flex items-center gap-2">
          <span className="font-bold">IF</span>
          {renderOperand(quad.operand1)}
          <span
            className={
              theme === "dark"
                ? "font-bold text-orange-300"
                : "font-bold text-orange-700"
            }
          >
            GOTO
          </span>
          <span>Label {(quad.operation as any).data.target}</span>
        </div>
      );
    }

    if (quad.operation.type === "JumpIfFalse") {
      return (
        <div className="flex items-center gap-2">
          <span className="font-bold">IF NOT</span>
          {renderOperand(quad.operand1)}
          <span
            className={
              theme === "dark"
                ? "font-bold text-orange-300"
                : "font-bold text-orange-700"
            }
          >
            GOTO
          </span>
          <span>Label {(quad.operation as any).data.target}</span>
        </div>
      );
    }

    if (quad.operation.type === "Input") {
      return (
        <div className="flex items-center gap-2">
          <span
            className={
              theme === "dark"
                ? "font-bold text-cyan-300"
                : "font-bold text-cyan-700"
            }
          >
            INPUT
          </span>
          {renderOperand(quad.result)}
        </div>
      );
    }

    if (quad.operation.type === "Output") {
      return (
        <div className="flex items-center gap-2">
          <span
            className={
              theme === "dark"
                ? "font-bold text-cyan-300"
                : "font-bold text-cyan-700"
            }
          >
            OUTPUT
          </span>
          {renderOperand(quad.operand1)}
        </div>
      );
    }

    // For binary operations
    const opSymbols: Record<string, string> = {
      Add: "+",
      Subtract: "-",
      Multiply: "*",
      Divide: "/",
      Equal: "==",
      NotEqual: "!=",
      LessThan: "<",
      GreaterThan: ">",
      LessEqual: "<=",
      GreaterEqual: ">=",
      And: "&&",
      Or: "||",
    };

    if (opSymbols[quad.operation.type]) {
      return (
        <div className="flex items-center gap-2">
          {renderOperand(quad.result)}
          <span className="px-1">=</span>
          {renderOperand(quad.operand1)}
          <span
            className={
              theme === "dark"
                ? "font-bold px-1 text-red-300"
                : "font-bold px-1 text-red-700"
            }
          >
            {opSymbols[quad.operation.type]}
          </span>
          {renderOperand(quad.operand2)}
        </div>
      );
    }

    if (quad.operation.type === "Not") {
      return (
        <div className="flex items-center gap-2">
          {renderOperand(quad.result)}
          <span className="px-1">=</span>
          <span
            className={
              theme === "dark"
                ? "font-bold px-1 text-red-300"
                : "font-bold px-1 text-red-700"
            }
          >
            !
          </span>
          {renderOperand(quad.operand1)}
        </div>
      );
    }

    if (quad.operation.type === "Assign") {
      return (
        <div className="flex items-center gap-2">
          {renderOperand(quad.result)}
          <span className="px-1">=</span>
          {renderOperand(quad.operand1)}
        </div>
      );
    }

    // Default case
    return (
      <div className="flex items-center gap-2">
        {quad.result.type !== "Empty" && (
          <>
            {renderOperand(quad.result)}
            <span className="px-1">=</span>
          </>
        )}
        <span
          className={
            theme === "dark"
              ? "font-bold text-red-300"
              : "font-bold text-red-700"
          }
        >
          {quad.operation.type}
        </span>
        {quad.operand1.type !== "Empty" && renderOperand(quad.operand1)}
        {quad.operand2.type !== "Empty" && renderOperand(quad.operand2)}
      </div>
    );
  };

  const filteredQuadruples = filterQuadruples(quadruples);

  return (
    <div className="animate-fadeIn">
      <div className="mb-4 flex justify-between items-center">
        <div
          className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          <span className="font-semibold mr-4">
            Next temporary:{" "}
            <span
              className={theme === "dark" ? "text-cyan-300" : "text-cyan-700"}
            >
              t{next_temp}
            </span>
          </span>
          <span className="font-semibold">
            Next label:{" "}
            <span
              className={
                theme === "dark" ? "text-orange-300" : "text-orange-700"
              }
            >
              L{next_label}
            </span>
          </span>
        </div>
        <div
          className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
        >
          {filteredQuadruples.length}{" "}
          {filteredQuadruples.length === 1 ? "quadruple" : "quadruples"}
        </div>
      </div>

      <div
        className={`p-4 rounded-lg overflow-auto font-mono text-sm shadow-sm border ${
          theme === "dark"
            ? "bg-gray-900 text-gray-300 border-gray-700"
            : "bg-gray-50 text-gray-800 border-gray-200"
        }`}
        style={{ maxHeight: "calc(100vh - 250px)" }}
      >
        <div className="space-y-1">
          {filteredQuadruples.map((quad, index) => (
            <div
              key={index}
              className={`group ${
                theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-200"
              } transition-colors px-3 py-2 rounded cursor-pointer`}
              onClick={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
            >
              <div className="flex items-center">
                <div
                  className={`w-10 text-right ${theme === "dark" ? "text-gray-500" : "text-gray-400"} mr-4`}
                >
                  {index}:
                </div>
                {expandedIndex === index ? (
                  <div className="w-full">
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                      <div className="font-bold">Operation:</div>
                      <div>{quad.operation.type}</div>
                      {quad.operation.type === "Label" && (
                        <>
                          <div className="font-bold">Label ID:</div>
                          <div
                            className={
                              theme === "dark"
                                ? "text-orange-300"
                                : "text-orange-700"
                            }
                          >
                            {(quad.operation as any).data.id}
                          </div>
                        </>
                      )}
                      {["Jump", "JumpIfTrue", "JumpIfFalse"].includes(
                        quad.operation.type,
                      ) && (
                        <>
                          <div className="font-bold">Target:</div>
                          <div
                            className={
                              theme === "dark"
                                ? "text-orange-300"
                                : "text-orange-700"
                            }
                          >
                            Label {(quad.operation as any).data.target}
                          </div>
                        </>
                      )}

                      <div className="font-bold">Operand 1:</div>
                      <div>{renderOperand(quad.operand1)}</div>

                      <div className="font-bold">Operand 2:</div>
                      <div>{renderOperand(quad.operand2)}</div>

                      <div className="font-bold">Result:</div>
                      <div>{renderOperand(quad.result)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">{renderCompactQuadruple(quad)}</div>
                )}
                <div
                  className={`${expandedIndex === index ? "transform rotate-180" : ""} transition-transform ml-2 text-gray-500`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}

          {filteredQuadruples.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No quadruples found{searchTerm ? " matching your search" : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

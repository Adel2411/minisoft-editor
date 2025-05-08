import { Operand, Quadruple, QuadrupleProgram } from "@/types";
import { useState } from "react";
import { filterQuadruples } from "../utils";
import { 
  getLabelColor, 
  getVariableColor, 
  getLiteralColor,
  getTempVarColor,
  getIOColor,
  getOperatorColor,
  getJumpColor,
  getASTTextColor,
  getPanelBackgroundColor,
  getPanelBorderColor,
  getHoverBackgroundColor,
  getErrorTextColor
} from "../../../utils/theme";

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
  const filteredQuadruples = filterQuadruples(quadruples, searchTerm);

  const renderOperand = (operand: Operand) => {
    switch (operand.type) {
      case "IntLiteral":
      case "FloatLiteral":
        return (
          <span className={getLiteralColor(theme)}>
            {operand.data.value}
          </span>
        );
      case "StringLiteral":
        return (
          <span className={getLiteralColor(theme)}>
            "{operand.data.value}"
          </span>
        );
      case "Variable":
        return (
          <span className={getVariableColor(theme)}>
            {operand.data.name}
          </span>
        );
      case "TempVariable":
        return (
          <span className={getTempVarColor(theme)}>
            {operand.data.name}
          </span>
        );
      case "ArrayElement":
        return (
          <span className={getVariableColor(theme)}>
            {operand.data.name}[{renderOperand(operand.data.index)}]
          </span>
        );
      case "Empty":
        return (
          <span className={getASTTextColor(theme)}>
            _
          </span>
        );
      default:
        return (
          <span className={getErrorTextColor(theme)}>
            Unknown
          </span>
        );
    }
  };

  const renderCompactQuadruple = (quad: Quadruple) => {
    if (quad.operation.type === "Label") {
      return (
        <div className={getLabelColor(theme) + " font-bold"}>
          Label {(quad.operation as any).data.id}:
        </div>
      );
    }

    if (quad.operation.type === "Jump") {
      return (
        <div className="flex items-center gap-2">
          <span className={getJumpColor(theme) + " font-bold"}>
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
          <span className={getJumpColor(theme) + " font-bold"}>
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
          <span className={getJumpColor(theme) + " font-bold"}>
            GOTO
          </span>
          <span>Label {(quad.operation as any).data.target}</span>
        </div>
      );
    }

    if (quad.operation.type === "Input") {
      return (
        <div className="flex items-center gap-2">
          <span className={getIOColor(theme) + " font-bold"}>
            INPUT
          </span>
          {renderOperand(quad.result)}
        </div>
      );
    }

    if (quad.operation.type === "Output") {
      return (
        <div className="flex items-center gap-2">
          <span className={getIOColor(theme) + " font-bold"}>
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
          <span className={getOperatorColor(theme) + " font-bold px-1"}>
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
          <span className={getOperatorColor(theme) + " font-bold px-1"}>
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
        <span className={getErrorTextColor(theme) + " font-bold"}>
          {quad.operation.type}
        </span>
        {quad.operand1.type !== "Empty" && renderOperand(quad.operand1)}
        {quad.operand2.type !== "Empty" && renderOperand(quad.operand2)}
      </div>
    );
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-4 flex justify-between items-center">
        <div
          className={`text-sm ${getASTTextColor(theme)}`}
        >
          <span className="font-semibold mr-4">
            Next temporary:{" "}
            <span className={getTempVarColor(theme)}>
              t{next_temp}
            </span>
          </span>
          <span className="font-semibold">
            Next label:{" "}
            <span className={getLabelColor(theme)}>
              L{next_label}
            </span>
          </span>
        </div>
        <div
          className={`text-sm ${getASTTextColor(theme)}`}
        >
          {filteredQuadruples.length}{" "}
          {filteredQuadruples.length === 1 ? "quadruple" : "quadruples"}
        </div>
      </div>

      <div
        className={`p-4 rounded-lg overflow-auto font-mono text-sm shadow-sm border ${
          getPanelBackgroundColor(theme) + " " + getPanelBorderColor(theme)
        }`}
        style={{ maxHeight: "calc(100vh - 250px)" }}
      >
        <div className="space-y-1">
          {filteredQuadruples.map((quad, index) => (
            <div
              key={index}
              className={`group ${getHoverBackgroundColor(theme)} transition-colors px-3 py-2 rounded cursor-pointer`}
              onClick={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
            >
              <div className="flex items-center">
                <div
                  className={`w-10 text-right ${getASTTextColor(theme)} mr-4`}
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
                          <div className={getLabelColor(theme)}>
                            {(quad.operation as any).data.id}
                          </div>
                        </>
                      )}
                      {["Jump", "JumpIfTrue", "JumpIfFalse"].includes(
                        quad.operation.type,
                      ) && (
                        <>
                          <div className="font-bold">Target:</div>
                          <div className={getLabelColor(theme)}>
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
                  className={`${expandedIndex === index ? "transform rotate-180" : ""} transition-transform ml-2 ${getASTTextColor(theme)}`}
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
            <div
              className={`text-center py-8 ${getASTTextColor(theme)}`}
            >
              No quadruples found{searchTerm ? " matching your search" : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

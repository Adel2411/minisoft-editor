import {
  CompilationErrors,
  SemanticError,
  LexicalError,
  SyntaxError,
} from "@/types";
import {
  X,
  AlertCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Lightbulb,
} from "lucide-react";
import { useState } from "react";

interface ErrorReporterProps {
  errors?: CompilationErrors;
  onDismiss: () => void;
  theme: "dark" | "light";
  sourceCode: string;
}

export default function ErrorReporter({
  errors,
  onDismiss,
  theme,
  sourceCode,
}: ErrorReporterProps) {
  // Determine which error type contains errors
  const lexicalCount = errors?.lexical_errors?.length || 0;
  const syntaxCount = errors?.syntax_errors?.length || 0;
  const semanticCount = errors?.semantic_errors?.length || 0;
  const totalErrors = lexicalCount + syntaxCount + semanticCount;

  // Get active error array and type with appropriate visual properties
  const getErrorInfo = () => {
    if (lexicalCount > 0) {
      return {
        type: "Lexical",
        errors: errors?.lexical_errors || [],
        color: "red",
        icon: <AlertTriangle size={16} className="text-[var(--error-color)]" />,
        bgColor:
          theme === "dark"
            ? "bg-[color:var(--bg-tertiary)]"
            : "bg-[color:var(--bg-tertiary)]",
      };
    } else if (syntaxCount > 0) {
      return {
        type: "Syntax",
        errors: errors?.syntax_errors || [],
        color: "red",
        icon: <AlertCircle size={16} className="text-[var(--error-color)]" />,
        bgColor:
          theme === "dark"
            ? "bg-[color:var(--bg-tertiary)]"
            : "bg-[color:var(--bg-tertiary)]",
      };
    } else {
      return {
        type: "Semantic",
        errors: errors?.semantic_errors || [],
        color: "orange", // Changed from purple to orange
        icon: <Info size={16} className="text-[var(--info-color)]" />,
        bgColor:
          theme === "dark"
            ? "bg-[color:var(--bg-tertiary)]"
            : "bg-[color:var(--bg-tertiary)]",
      };
    }
  };

  const errorInfo = getErrorInfo();
  const [expandedError, setExpandedError] = useState<number | null>(0); // Default to first error expanded

  // Get code context for the given line and column
  const getCodeContext = (
    line: number,
    column: number,
    contextLines: number = 1,
  ) => {
    if (!sourceCode || line <= 0) return { lines: [], errorLineIndex: -1 };

    // Split into lines and adjust for 1-based indexing
    const allLines = sourceCode.split("\n");
    const targetLineIndex = line - 1;

    // No line exists at this index
    if (targetLineIndex >= allLines.length) {
      return { lines: [], errorLineIndex: -1 };
    }

    // Calculate start and end lines with context
    const startLine = Math.max(0, targetLineIndex - contextLines);
    const endLine = Math.min(
      allLines.length - 1,
      targetLineIndex + contextLines,
    );

    // Extract the relevant lines
    const lines = allLines.slice(startLine, endLine + 1).map((text, i) => ({
      number: startLine + i + 1,
      text: text,
      isErrorLine: startLine + i === targetLineIndex,
      column: startLine + i === targetLineIndex ? column : -1,
    }));

    return {
      lines,
      errorLineIndex: targetLineIndex - startLine,
    };
  };

  // Function to render an error message in terminal style
  const renderTerminalError = (
    error: any,
    index: number,
    errorType: string,
  ) => {
    // Generate error details based on type
    let errorDetails = {
      title: "",
      message: "",
      line: 0,
      column: 0,
      suggestion: "",
    };

    if (errorType === "Lexical") {
      const lexError = error as LexicalError;
      errorDetails = {
        title: lexError.error_type.type,
        message:
          lexError.message || `Invalid token '${lexError.invalid_token}'`,
        line: lexError.position.line,
        column: lexError.position.column,
        suggestion:
          lexError.suggestion ||
          "Check for unrecognized symbols or incorrect syntax",
      };
    } else if (errorType === "Syntax") {
      const syntaxError = error as SyntaxError;
      switch (syntaxError.type) {
        case "InvalidToken":
          errorDetails = {
            title: "Invalid Token",
            message: syntaxError.data.message,
            line: syntaxError.data.line,
            column: syntaxError.data.column,
            suggestion:
              "Check that all tokens are valid in the current context",
          };
          break;
        case "UnexpectedToken":
          errorDetails = {
            title: "Unexpected Token",
            message: `Found "${syntaxError.data.token}" but expected one of: ${syntaxError.data.expected.join(", ")}`,
            line: syntaxError.data.line,
            column: syntaxError.data.column,
            suggestion: "Make sure the syntax follows the language grammar",
          };
          break;
        case "UnexpectedEOF":
          errorDetails = {
            title: "Unexpected End of File",
            message: `Expected one of: ${syntaxError.data.expected.join(", ")}`,
            line: syntaxError.data.line,
            column: syntaxError.data.column,
            suggestion: "The file ends abruptly. Complete your code structure.",
          };
          break;
        case "ExtraToken":
          errorDetails = {
            title: "Extra Token",
            message: `Unexpected token "${syntaxError.data.token}"`,
            line: syntaxError.data.line,
            column: syntaxError.data.column,
            suggestion: `Remove the extra token "${syntaxError.data.token}"`,
          };
          break;
        default:
          errorDetails = {
            title: "Syntax Error",
            message:
              typeof syntaxError.data === "string"
                ? syntaxError.data
                : "Unknown syntax error",
            line: 0,
            column: 0,
            suggestion: "Check your syntax",
          };
      }
    } else {
      // Semantic Error
      const semanticError = error as SemanticError;
      switch (semanticError.type) {
        case "AssignmentToArray":
          errorDetails = {
            title: "Assignment to Array",
            message: `Assignment to array ${semanticError.data.name} without index`,
            line: semanticError.data.position.line,
            column: semanticError.data.position.column,
            suggestion: `Use an index to assign value to array ${semanticError.data.name}`,
          };
          break;
        case "EmptyProgram":
          errorDetails = {
            title: "Empty Program",
            message: "Program is empty or has no meaningful code",
            line: 0,
            column: 0,
            suggestion: "Add some code to your program",
          };
          break;
        case "UndeclaredIdentifier":
          errorDetails = {
            title: "Undeclared Identifier",
            message: `Variable "${semanticError.data.name}" is not declared`,
            line: semanticError.data.position.line,
            column: semanticError.data.position.column,
            suggestion: `Declare the variable "${semanticError.data.name}" before using it`,
          };
          break;
        case "DuplicateDeclaration":
          errorDetails = {
            title: "Duplicate Declaration",
            message: `"${semanticError.data.name}" is already declared at line ${semanticError.data.original_position.line}, column ${semanticError.data.original_position.column}`,
            line: semanticError.data.position.line,
            column: semanticError.data.position.column,
            suggestion: `Use a different name for this variable, or remove this duplicate declaration`,
          };
          break;
        case "TypeMismatch":
          errorDetails = {
            title: "Type Mismatch",
            message: `Expected ${semanticError.data.expected} but found ${semanticError.data.found}${
              semanticError.data.context
                ? " in " + semanticError.data.context
                : ""
            }`,
            line: semanticError.data.position.line,
            column: semanticError.data.position.column,
            suggestion: `Make sure the types match. Try converting from '${semanticError.data.found}' to '${semanticError.data.expected}'`,
          };
          break;
        case "ArraySizeMismatch":
          errorDetails = {
            title: "Array Size Mismatch",
            message: `Array "${semanticError.data.name}" has size ${semanticError.data.expected} but was initialized with ${semanticError.data.actual} elements`,
            line: semanticError.data.position.line,
            column: semanticError.data.position.column,
            suggestion: `Adjust the number of elements to match the array size`,
          };
          break;
        case "ConstantModification":
          errorDetails = {
            title: "Constant Modification",
            message: `Cannot modify constant "${semanticError.data.name}"`,
            line: semanticError.data.position.line,
            column: semanticError.data.position.column,
            suggestion: `Constants cannot be modified after declaration. Use a variable instead.`,
          };
          break;
        case "ArrayIndexOutOfBounds":
          errorDetails = {
            title: "Array Index Out of Bounds",
            message: `Index ${semanticError.data.index} is out of bounds for array "${semanticError.data.name}" of size ${semanticError.data.size}`,
            line: semanticError.data.position.line,
            column: semanticError.data.position.column,
            suggestion: `Use indices from 0 to ${semanticError.data.size - 1}`,
          };
          break;
        default:
          if (semanticError.data?.position) {
            errorDetails = {
              title: semanticError.type,
              message: `Error in ${semanticError.type}`,
              line: semanticError.data.position.line,
              column: semanticError.data.position.column,
              suggestion: "Check your code for logical errors",
            };
          } else {
            errorDetails = {
              title: semanticError.type,
              message: `Error in ${semanticError.type}`,
              line: 0,
              column: 0,
              suggestion: "Check your code for logical errors",
            };
          }
      }
    }

    // Get code context with 2 lines of context (before and after)
    const codeContext = getCodeContext(
      errorDetails.line,
      errorDetails.column,
      2,
    );
    const isExpanded = expandedError === index;

    // Error type color classes
    const errorColor = errorType === "Semantic" ? "purple" : "red";

    return (
      <div
        key={index}
        className={`my-4 rounded-md border ${
          theme === "dark"
            ? `border-[var(--border-color)] ${errorInfo.bgColor}`
            : `border-[var(--border-color)] ${errorInfo.bgColor}`
        } ${isExpanded ? "" : "cursor-pointer hover:bg-opacity-80"}`}
        onClick={() => !isExpanded && setExpandedError(index)}
      >
        <div className="p-3">
          {/* Error Header */}
          <div className="flex items-start gap-2">
            <div
              className={`font-mono text-${errorColor}-500 font-bold mt-0.5`}
            >
              {errorInfo.icon}
            </div>
            <div className="font-mono w-full">
              <div className="flex justify-between">
                <div className={`font-bold text-${errorColor}-600`}>
                  {errorType} Error: {errorDetails.title}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedError(isExpanded ? null : index);
                  }}
                  className={`p-1 rounded-full hover:bg-opacity-20 ${
                    theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-200"
                  }`}
                >
                  {isExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              </div>

              {/* Error Description */}
              <div
                className={`bg-[color:var(--bg-tertiary)] bg-opacity-${theme === "dark" ? "30" : "60"} px-3 py-2 mt-2 rounded-md text-${
                  errorColor === "red"
                    ? "[var(--error-color)]"
                    : "[var(--info-color)]"
                }`}
              >
                {errorDetails.message}
              </div>

              {/* Location info */}
              <div
                className={`mt-2 text-${theme === "dark" ? "gray-400" : "gray-600"} text-sm`}
              >
                {errorDetails.line > 0 && errorDetails.column > 0 && (
                  <div className="flex items-center">
                    <span className="font-mono">--&gt;</span>
                    <span className="ml-2">
                      line {errorDetails.line}, column {errorDetails.column}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Code snippet section - Updated colors */}
          <div
            className={`mt-3 p-2 rounded-md font-mono ${
              theme === "dark" ? "bg-[#1e1a17]" : "bg-[#fefaf8]"
            } border ${
              theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"
            }`}
          >
            {errorDetails.line > 0 && codeContext.lines.length > 0 ? (
              <div className="text-sm">
                {codeContext.lines.map((line, i) => (
                  <div key={i} className="flex">
                    {/* Line number */}
                    <div
                      className={`select-none mr-4 text-right w-8 ${
                        line.isErrorLine
                          ? `text-[var(--${errorColor === "red" ? "error" : "info"}-color)] font-bold`
                          : theme === "dark"
                            ? "text-[var(--text-tertiary)]"
                            : "text-[var(--text-tertiary)]"
                      }`}
                    >
                      {line.number}
                    </div>

                    {/* Line content */}
                    <div className="flex-1 overflow-x-auto">
                      <div className="whitespace-pre">{line.text}</div>

                      {/* Error position indicator - more elegant and precise */}
                      {line.isErrorLine && (
                        <div className="relative">
                          {/* Precise arrow pointing to the error */}
                          <div
                            className={`whitespace-pre text-[var(--${errorColor === "red" ? "error" : "info"}-color)]`}
                          >
                            {" ".repeat(Math.max(0, line.column - 1))}
                            <span className="font-bold">
                              {errorType === "Lexical"
                                ? "^".repeat(
                                    Math.min(
                                      (error as LexicalError).invalid_token
                                        .length || 1,
                                      line.text.length - line.column + 1,
                                    ),
                                  )
                                : "^"}
                            </span>
                          </div>

                          {/* Error message under the arrow - more compact */}
                          <div
                            className={`absolute left-0 whitespace-pre mt-px text-xs text-[var(--${errorColor === "red" ? "error" : "info"}-color)]`}
                            style={{}}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`italic ${theme === "dark" ? "text-[#b5a9a2]" : "text-[#868e96]"}`}
              >
                {errorType === "Semantic" &&
                errorDetails.title === "Empty Program"
                  ? "<empty file>"
                  : "Unable to display code context"}
              </div>
            )}
          </div>

          {/* Suggestion */}
          {isExpanded && (
            <div
              className={`mt-3 p-3 rounded-md flex items-start gap-2 ${
                theme === "dark"
                  ? "bg-[color:var(--bg-tertiary)] bg-opacity-20 text-[var(--accent-color)] border border-[var(--border-color)]"
                  : "bg-[color:var(--bg-tertiary)] text-[var(--accent-color)] border border-[var(--border-color)]"
              }`}
            >
              <Lightbulb
                size={18}
                className={
                  theme === "dark"
                    ? "text-[var(--accent-color)]"
                    : "text-[var(--accent-color)]"
                }
              />
              <div>
                <span className="font-medium">Suggestion: </span>
                {errorDetails.suggestion}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
      <div
        className={`rounded-lg shadow-xl max-w-3xl w-full my-8 transform transition-all duration-300 ${
          theme === "dark"
            ? "bg-[#262220] text-[#f3ebe7]"
            : "bg-white text-[#212529]"
        }`}
      >
        <div
          className={`flex justify-between items-center p-4 border-b ${theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"}`}
        >
          <h3 className="text-xl font-bold flex items-center gap-2">
            <AlertCircle
              className={
                theme === "dark"
                  ? "text-[var(--error-color)]"
                  : "text-[var(--error-color)]"
              }
              size={24}
            />
            <span>{errorInfo.type} Errors Detected</span>
          </h3>
          <button
            onClick={onDismiss}
            className={`p-1 rounded-full hover:bg-opacity-20 ${
              theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-200"
            }`}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Count Banner */}
        <div
          className={`px-4 py-2 ${
            errorInfo.color === "red"
              ? theme === "dark"
                ? "bg-red-900/30"
                : "bg-red-100"
              : theme === "dark"
                ? "bg-purple-900/30"
                : "bg-purple-100"
          }`}
        >
          <div className="font-mono font-bold flex items-center">
            <span
              className={`text-${errorInfo.color}-${theme === "dark" ? "400" : "600"}`}
            >
              Error: {totalErrors} error{totalErrors !== 1 ? "s" : ""} found
            </span>
          </div>
        </div>

        {/* Error List section - Updated colors */}
        <div
          className={`p-4 rounded-b-lg overflow-auto max-h-[calc(80vh-180px)] ${
            theme === "dark" ? "bg-[#1e1a17]" : "bg-[#fefaf8]"
          }`}
        >
          {totalErrors === 0 ? (
            <div className="text-center py-8 font-mono">
              <div
                className={`text-lg font-medium ${theme === "dark" ? "text-green-400" : "text-green-600"}`}
              >
                No errors found!
              </div>
              <p
                className={`mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Your code compiled successfully.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {errorInfo.errors.map((error, index) =>
                renderTerminalError(error, index, errorInfo.type),
              )}
            </div>
          )}
        </div>

        {/* Footer buttons section - Updated colors */}
        <div className={`p-4 flex justify-end border-t ${theme === "dark" ? "border-[#3e3632]" : "border-[#efe0d9]"}`}>
          <button
            onClick={() => {
              // Copy all errors to clipboard in a useful format
              const errorText = errorInfo.errors
                .map((error, index) => {
                  let errorMessage = "";
                  const errorType = errorInfo.type;

                  if (errorType === "Lexical") {
                    const lexError = error as LexicalError;
                    errorMessage = `${errorType} Error: ${lexError.error_type.type} - Invalid token '${lexError.invalid_token}' at line ${lexError.position.line}, column ${lexError.position.column}`;
                  } else if (errorType === "Syntax") {
                    const syntaxError = error as SyntaxError;
                    if (syntaxError.type === "UnexpectedToken") {
                      errorMessage = `${errorType} Error: ${syntaxError.type} - Found "${syntaxError.data.token}" but expected one of: ${syntaxError.data.expected.join(", ")} at line ${syntaxError.data.line}, column ${syntaxError.data.column}`;
                    } else {
                      if (
                        typeof syntaxError.data === "object" &&
                        syntaxError.data !== null &&
                        "line" in syntaxError.data &&
                        "column" in syntaxError.data
                      ) {
                        errorMessage = `${errorType} Error: ${syntaxError.type} at line ${syntaxError.data.line}, column ${syntaxError.data.column}`;
                      } else {
                        errorMessage = `${errorType} Error: ${syntaxError.type} - ${typeof syntaxError.data === "string" ? syntaxError.data : "Unknown error"}`;
                      }
                    }
                  } else {
                    const semanticError = error as SemanticError;
                    let position = "";
                    if (
                      semanticError.type !== "EmptyProgram" &&
                      "data" in semanticError &&
                      semanticError.data?.position
                    ) {
                      position = ` at line ${semanticError.data.position.line}, column ${semanticError.data.position.column}`;
                    }
                    errorMessage = `${errorType} Error: ${semanticError.type}${position}`;
                  }

                  return `Error ${index + 1}: ${errorMessage}`;
                })
                .join("\n");

              navigator.clipboard.writeText(errorText);
            }}
            className={`px-4 py-2 rounded-md transition-colors mr-2 flex items-center gap-2 ${
              theme === "dark"
                ? "bg-[#312c28] hover:bg-[#3e3632] text-[#f3ebe7]"
                : "bg-[#efe0d9] hover:bg-[#e6d5ce] text-[#495057]"
            }`}
          >
            <Copy size={16} />
            <span>Copy All</span>
          </button>

          <button
            onClick={onDismiss}
            className={`px-4 py-2 rounded-md transition-colors ${
              theme === "dark"
                ? "bg-[#312c28] hover:bg-[#3e3632] text-[#f3ebe7]"
                : "bg-[#efe0d9] hover:bg-[#e6d5ce] text-[#495057]"
            }`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

import {
  CompilationErrors,
  SemanticError,
  LexicalError,
  SyntaxError,
} from "@/types";
import { X, AlertCircle, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";

interface ErrorReporterProps {
  errors?: CompilationErrors;
  onDismiss: () => void;
  theme: "dark" | "light";
  sourceCode: string; // Add source code prop
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

  // Get active error array and type
  const getErrorInfo = () => {
    if (lexicalCount > 0) {
      return {
        type: "Lexical",
        errors: errors?.lexical_errors || [],
        color: "amber"
      };
    } else if (syntaxCount > 0) {
      return {
        type: "Syntax",
        errors: errors?.syntax_errors || [],
        color: "red"
      };
    } else {
      return {
        type: "Semantic",
        errors: errors?.semantic_errors || [],
        color: "purple"
      };
    }
  };

  const errorInfo = getErrorInfo();
  const [expandedError, setExpandedError] = useState<number | null>(0); // Default to first error expanded

  // Get code context for the given line and column
  const getCodeContext = (line: number, column: number, contextLines: number = 1) => {
    if (!sourceCode || line <= 0) return { lines: [], errorLineIndex: -1 };
    
    // Split into lines and adjust for 1-based indexing
    const allLines = sourceCode.split('\n');
    const targetLineIndex = line - 1;
    
    // No line exists at this index
    if (targetLineIndex >= allLines.length) {
      return { lines: [], errorLineIndex: -1 };
    }
    
    // Calculate start and end lines with context
    const startLine = Math.max(0, targetLineIndex - contextLines);
    const endLine = Math.min(allLines.length - 1, targetLineIndex + contextLines);
    
    // Extract the relevant lines
    const lines = allLines.slice(startLine, endLine + 1).map((text, i) => ({
      number: startLine + i + 1,
      text: text,
      isErrorLine: startLine + i === targetLineIndex,
      column: startLine + i === targetLineIndex ? column : -1
    }));
    
    return {
      lines,
      errorLineIndex: targetLineIndex - startLine
    };
  };

  // Function to render an error message in terminal style
  const renderTerminalError = (error: any, index: number, errorType: string) => {
    // Generate error details based on type
    let errorDetails = {
      title: "",
      message: "",
      line: 0,
      column: 0,
      suggestion: ""
    };

    if (errorType === "Lexical") {
      const lexError = error as LexicalError;
      errorDetails = {
        title: lexError.error_type.type,
        message: `Invalid token '${lexError.invalid_token}'`,
        line: lexError.position.line,
        column: lexError.position.column,
        suggestion: lexError.suggestion || "Check for unrecognized symbols or incorrect syntax"
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
            suggestion: "Check that all tokens are valid in the current context"
          };
          break;
        case "UnexpectedToken":
          errorDetails = {
            title: "Unexpected Token",
            message: `Found "${syntaxError.data.token}" but expected one of: ${syntaxError.data.expected.join(", ")}`,
            line: syntaxError.data.line,
            column: syntaxError.data.column,
            suggestion: "Make sure the syntax follows the language grammar"
          };
          break;
        // Other syntax error types...
        default:
          errorDetails = {
            title: "Syntax Error",
            message: "Unknown syntax error",
            line: 0,
            column: 0,
            suggestion: "Check your syntax"
          };
      }
    } else {
      // Semantic Error
      const semanticError = error as SemanticError;
      switch (semanticError.type) {
        case "EmptyProgram":
          errorDetails = {
            title: "Empty Program",
            message: "Program is empty or has no meaningful code",
            line: 0,
            column: 0,
            suggestion: "Add some code to your program"
          };
          break;
        case "UndeclaredIdentifier":
          errorDetails = {
            title: "Undeclared Identifier",
            message: `Variable "${semanticError.data.name}" is not declared`,
            line: semanticError.data.position.line,
            column: semanticError.data.position.column,
            suggestion: `Declare the variable "${semanticError.data.name}" before using it`
          };
          break;
        case "DuplicateDeclaration":
          errorDetails = {
            title: "Duplicate Declaration",
            message: `"${semanticError.data.name}" is already declared at line ${semanticError.data.original_position.line}`,
            line: semanticError.data.position.line,
            column: semanticError.data.position.column,
            suggestion: `Use a different name for this variable, or remove this duplicate declaration`
          };
          break;
        // Other semantic error types...
        default:
          errorDetails = {
            title: semanticError.type,
            message: `Unknown semantic error type: ${semanticError.type}`,
            line: semanticError.data?.position?.line || 0,
            column: semanticError.data?.position?.column || 0,
            suggestion: "Check your code for logical errors"
          };
      }
    }

    // Get code context with 2 lines of context (before and after)
    const codeContext = getCodeContext(errorDetails.line, errorDetails.column - 1, 2);
    const isExpanded = expandedError === index;

    return (
      <div 
        key={index}
        className={`my-4 ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        } ${isExpanded ? "" : "cursor-pointer hover:bg-opacity-10 hover:bg-gray-500"}`}
        onClick={() => !isExpanded && setExpandedError(index)}
      >
        <div className="flex items-start gap-2">
          <div className={`font-mono text-${errorInfo.color}-500 font-bold`}>
            {index + 1}.
          </div>
          <div className="font-mono w-full">
            <div className={`font-bold text-${errorInfo.color}-500`}>
              {errorType} Error: {errorDetails.title}
            </div>
            <div className={`text-${theme === "dark" ? "gray-300" : "gray-700"} mt-1`}>
              {errorDetails.message}
            </div>
            <div className={`mt-1 text-${theme === "dark" ? "gray-400" : "gray-600"}`}>
              --&gt; line {errorDetails.line}, column {errorDetails.column}
            </div>
            {/* Code snippet section */}
            <div className={`mt-2 p-2 rounded-md ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-100"
            }`}>
              {errorDetails.line > 0 && codeContext.lines.length > 0 ? (
                <div className="font-mono text-sm">
                  {codeContext.lines.map((line, i) => (
                    <div key={i} className="flex">
                      {/* Line number */}
                      <div 
                        className={`select-none mr-4 text-right w-8 ${
                          line.isErrorLine
                            ? `text-${errorInfo.color}-500 font-bold`
                            : theme === "dark" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        {line.number}
                      </div>
                      
                      {/* Line content */}
                      <div className="flex-1 overflow-x-auto">
                        {line.isErrorLine ? (
                          <div>
                            <div className="whitespace-pre">
                              {line.text}
                            </div>
                            {/* Error position indicator */}
                            <div className={`whitespace-pre text-${errorInfo.color}-500 font-bold`}>
                              {" ".repeat(line.column)}{errorInfo.type === "Lexical" ? "^" : "^"}
                            </div>
                          </div>
                        ) : (
                          <div className={`whitespace-pre ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {line.text}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="italic text-gray-500">
                  {errorType === "Semantic" && errorDetails.title === "Empty Program" 
                    ? "<empty file>" 
                    : "Unable to display code context"}
                </div>
              )}
            </div>

            {isExpanded && (
              <div className={`mt-2 pl-4 border-l-2 border-${errorInfo.color}-500 ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}>
                <span className="font-medium">Suggestion:</span> {errorDetails.suggestion}
              </div>
            )}
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
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 overflow-y-auto p-4">
      <div
        className={`rounded-lg shadow-xl max-w-3xl w-full my-8 transform transition-all duration-300 ${
          theme === "dark"
            ? "bg-gray-800 text-gray-100"
            : "bg-white text-gray-900"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <AlertCircle className={`text-${errorInfo.color}-500`} size={24} />
            <span>
              {errorInfo.type} Errors Detected
            </span>
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
        <div className={`px-4 py-2 ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-100"
        } border-b border-${theme === "dark" ? "gray-600" : "gray-200"}`}>
          <div className="font-mono font-bold">
            Error: {totalErrors} error{totalErrors !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Error List */}
        <div
          className={`p-4 rounded-b-lg overflow-auto max-h-[calc(80vh-180px)] ${
            theme === "dark" ? "bg-gray-900" : "bg-gray-50"
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
            <div>
              {errorInfo.errors.map((error, index) => (
                renderTerminalError(error, index, errorInfo.type)
              ))}
            </div>
          )}
        </div>

        <div className="p-4 flex justify-end border-t">
          <button
            onClick={() => {
              // Copy all errors to clipboard in a useful format
              const errorText = errorInfo.errors.map((error, index) => {
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
                    if (typeof syntaxError.data === 'object' && syntaxError.data !== null && 'line' in syntaxError.data && 'column' in syntaxError.data) {
                      errorMessage = `${errorType} Error: ${syntaxError.type} at line ${syntaxError.data.line}, column ${syntaxError.data.column}`;
                    } else {
                      errorMessage = `${errorType} Error: ${syntaxError.type} - ${typeof syntaxError.data === 'string' ? syntaxError.data : 'Unknown error'}`;
                    }
                  }
                } else {
                  const semanticError = error as SemanticError;
                  let position = "";
                  if (semanticError.type !== "EmptyProgram" && 
                      "data" in semanticError && 
                      semanticError.data?.position) {
                    position = ` at line ${semanticError.data.position.line}, column ${semanticError.data.position.column}`;
                  }
                  errorMessage = `${errorType} Error: ${semanticError.type}${position}`;
                }
                
                return `Error ${index + 1}: ${errorMessage}`;
              }).join('\n');
              
              navigator.clipboard.writeText(errorText);
            }}
            className={`px-4 py-2 rounded-md transition-colors mr-2 ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Copy size={16} />
              <span>Copy All</span>
            </div>
          </button>
          
          <button
            onClick={onDismiss}
            className={`px-4 py-2 rounded-md transition-colors ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

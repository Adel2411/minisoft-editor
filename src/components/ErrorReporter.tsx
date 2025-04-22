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
}

// Helper component for error tabs
const ErrorTab = ({
  active,
  label,
  count,
  onClick,
  theme,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
  theme: "dark" | "light";
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium relative ${
      active
        ? theme === "dark"
          ? "bg-gray-700 text-white border-b-2 border-red-500"
          : "bg-white text-red-800 border-b-2 border-red-500"
        : theme === "dark"
          ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    {label}
    {count > 0 && (
      <span
        className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
          theme === "dark" ? "bg-red-500 text-white" : "bg-red-100 text-red-800"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

// Component for lexical errors
const LexicalErrorList = ({
  errors,
  theme,
}: {
  errors: LexicalError[];
  theme: "dark" | "light";
}) => {
  const [expandedError, setExpandedError] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {errors.map((error, index) => (
        <div
          key={index}
          className={`p-3 rounded-md ${
            theme === "dark" ? "bg-gray-700" : "bg-red-50"
          } border-l-4 border-red-500`}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium flex items-center gap-2">
                <AlertCircle className="text-red-500" size={16} />
                {error.error_type.type} at line {error.position.line}:
                {error.position.column}
              </div>
              <div
                className={`text-sm mt-1 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {error.message}
              </div>
            </div>
            <button
              onClick={() =>
                setExpandedError(expandedError === index ? null : index)
              }
              className={`p-1 rounded-full hover:bg-opacity-20 ${
                theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-200"
              }`}
            >
              {expandedError === index ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          </div>

          {expandedError === index && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <div
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Invalid token:{" "}
                  <code className="px-1 py-0.5 rounded bg-opacity-20 bg-red-500">
                    {error.invalid_token}
                  </code>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(error.message)}
                  className={`p-1 rounded-full text-xs flex items-center gap-1 ${
                    theme === "dark"
                      ? "text-gray-400 hover:text-white hover:bg-gray-600"
                      : "text-gray-600 hover:text-black hover:bg-gray-200"
                  }`}
                >
                  <Copy size={14} />
                  <span>Copy</span>
                </button>
              </div>

              {error.suggestion && (
                <div
                  className={`text-sm mt-1 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-800 text-green-400"
                      : "bg-green-50 text-green-800"
                  }`}
                >
                  <strong>Suggestion:</strong> {error.suggestion}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Component for syntax errors
const SyntaxErrorList = ({
  errors,
  theme,
}: {
  errors: SyntaxError[];
  theme: "dark" | "light";
}) => {
  const [expandedError, setExpandedError] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {errors.map((error, index) => {
        let title = "Syntax Error";
        let location = "";
        let message = "";
        let details = null;

        switch (error.type) {
          case "InvalidToken":
            title = "Invalid Token";
            location = `at line ${error.data.line}:${error.data.column}`;
            message = error.data.message;
            break;
          case "UnexpectedEOF":
            title = "Unexpected End of File";
            location = `at line ${error.data.line}:${error.data.column}`;
            message = `Expected one of: ${error.data.expected.join(", ")}`;
            details = { expected: error.data.expected };
            break;
          case "UnexpectedToken":
            title = "Unexpected Token";
            location = `at line ${error.data.line}:${error.data.column}`;
            message = `Found "${error.data.token}" but expected one of: ${error.data.expected.join(", ")}`;
            details = {
              token: error.data.token,
              expected: error.data.expected,
            };
            break;
          case "ExtraToken":
            title = "Extra Token";
            location = `at line ${error.data.line}:${error.data.column}`;
            message = `Unexpected token "${error.data.token}"`;
            details = { token: error.data.token };
            break;
          case "Custom":
            title = "Syntax Error";
            message = error.data;
            break;
        }

        return (
          <div
            key={index}
            className={`p-3 rounded-md ${
              theme === "dark" ? "bg-gray-700" : "bg-red-50"
            } border-l-4 border-red-500`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium flex items-center gap-2">
                  <AlertCircle className="text-red-500" size={16} />
                  {title} {location}
                </div>
                <div
                  className={`text-sm mt-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {message}
                </div>
              </div>
              <button
                onClick={() =>
                  setExpandedError(expandedError === index ? null : index)
                }
                className={`p-1 rounded-full hover:bg-opacity-20 ${
                  theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-200"
                }`}
              >
                {expandedError === index ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>

            {expandedError === index && details && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  {details.token && (
                    <div
                      className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Found:{" "}
                      <code className="px-1 py-0.5 rounded bg-opacity-20 bg-red-500">
                        {details.token}
                      </code>
                    </div>
                  )}
                  <button
                    onClick={() => navigator.clipboard.writeText(message)}
                    className={`p-1 rounded-full text-xs flex items-center gap-1 ${
                      theme === "dark"
                        ? "text-gray-400 hover:text-white hover:bg-gray-600"
                        : "text-gray-600 hover:text-black hover:bg-gray-200"
                    }`}
                  >
                    <Copy size={14} />
                    <span>Copy</span>
                  </button>
                </div>

                {details.expected && (
                  <div
                    className={`text-xs mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Expected:{" "}
                    {details.expected.map((exp, i) => (
                      <code
                        key={i}
                        className="px-1 py-0.5 rounded bg-opacity-20 bg-blue-500 mr-1"
                      >
                        {exp}
                      </code>
                    ))}
                  </div>
                )}

                <div
                  className={`text-sm mt-1 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-800 text-green-400"
                      : "bg-green-50 text-green-800"
                  }`}
                >
                  <strong>Suggestion:</strong> Check your syntax and ensure
                  you're using the correct syntax structure.
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Component for semantic errors
const SemanticErrorList = ({
  errors,
  theme,
}: {
  errors: SemanticError[];
  theme: "dark" | "light";
}) => {
  const [expandedError, setExpandedError] = useState<number | null>(null);

  const getErrorDetails = (error: SemanticError) => {
    switch (error.type) {
      case "ArraySizeMismatch":
        return {
          title: "Array Size Mismatch",
          location: `at line ${error.data.position.line}:${error.data.position.column}`,
          message: `Array "${error.data.name}" expects ${error.data.expected} elements but got ${error.data.actual}`,
          suggestion: `Make sure you provide exactly ${error.data.expected} elements for array "${error.data.name}"`,
        };
      case "UndeclaredIdentifier":
        return {
          title: "Undeclared Identifier",
          location: `at line ${error.data.position.line}:${error.data.position.column}`,
          message: `Variable "${error.data.name}" is not declared`,
          suggestion: `Declare the variable "${error.data.name}" before using it`,
        };
      case "DuplicateDeclaration":
        return {
          title: "Duplicate Declaration",
          location: `at line ${error.data.position.line}:${error.data.position.column}`,
          message: `"${error.data.name}" is already declared at line ${error.data.original_position.line}:${error.data.original_position.column}`,
          suggestion: `Use a different name for this variable, or remove this duplicate declaration`,
        };
      case "TypeMismatch":
        return {
          title: "Type Mismatch",
          location: `at line ${error.data.position.line}:${error.data.position.column}`,
          message: `Expected ${error.data.expected} but found ${error.data.found}${error.data.context ? ` in ${error.data.context}` : ""}`,
          suggestion: `Make sure you're using compatible types in your operations`,
        };
      case "DivisionByZero":
        return {
          title: "Division by Zero",
          location: `at line ${error.data.position.line}:${error.data.position.column}`,
          message: `Division by zero is not allowed`,
          suggestion: `Check your divisor to ensure it's never zero`,
        };
      case "ConstantModification":
        return {
          title: "Constant Modification",
          location: `at line ${error.data.position.line}:${error.data.position.column}`,
          message: `Cannot modify constant "${error.data.name}"`,
          suggestion: `Constants cannot be modified after declaration. Use a variable instead if you need to change its value.`,
        };
      case "ArrayIndexOutOfBounds":
        return {
          title: "Array Index Out of Bounds",
          location: `at line ${error.data.position.line}:${error.data.position.column}`,
          message: `Index ${error.data.index} is out of bounds for array "${error.data.name}" with size ${error.data.size}`,
          suggestion: `Array indices must be between 0 and ${error.data.size - 1}`,
        };
      case "InvalidConditionValue":
        return {
          title: "Invalid Condition Value",
          location: `at line ${error.data.position.line}:${error.data.position.column}`,
          message: `Invalid value "${error.data.found}" used in a condition`,
          suggestion: `Conditions must be boolean expressions`,
        };
      case "NonArrayIndexing":
        return {
          title: "Non-Array Indexing",
          location: `at line ${error.data.position.line}:${error.data.position.column}`,
          message: `Cannot use indexing on non-array variable "${error.data.var_name}"`,
          suggestion: `Only arrays can be accessed with an index`,
        };
      case "InvalidArraySize":
        return {
          title: "Invalid Array Size",
          location: `at line ${error.data.position.line}:${error.data.position.column}`,
          message: `Invalid size ${error.data.size} for array "${error.data.name}"`,
          suggestion: `Array size must be a positive integer`,
        };
      case "EmptyProgram":
        return {
          title: "Empty Program",
          location: "",
          message: "Program is empty",
          suggestion: "Add some code to your program",
        };
      default:
        return {
          title: "Semantic Error",
          location: "",
          message: "Unknown semantic error",
          suggestion: "Check your code for logical errors",
        };
    }
  };

  return (
    <div className="space-y-3">
      {errors.map((error, index) => {
        const details = getErrorDetails(error);

        return (
          <div
            key={index}
            className={`p-3 rounded-md ${
              theme === "dark" ? "bg-gray-700" : "bg-red-50"
            } border-l-4 border-red-500`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium flex items-center gap-2">
                  <AlertCircle className="text-red-500" size={16} />
                  {details.title} {details.location}
                </div>
                <div
                  className={`text-sm mt-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {details.message}
                </div>
              </div>
              <button
                onClick={() =>
                  setExpandedError(expandedError === index ? null : index)
                }
                className={`p-1 rounded-full hover:bg-opacity-20 ${
                  theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-200"
                }`}
              >
                {expandedError === index ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>

            {expandedError === index && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Error type: {error.type}
                  </div>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(details.message)
                    }
                    className={`p-1 rounded-full text-xs flex items-center gap-1 ${
                      theme === "dark"
                        ? "text-gray-400 hover:text-white hover:bg-gray-600"
                        : "text-gray-600 hover:text-black hover:bg-gray-200"
                    }`}
                  >
                    <Copy size={14} />
                    <span>Copy</span>
                  </button>
                </div>

                <div
                  className={`text-sm mt-1 p-2 rounded ${
                    theme === "dark"
                      ? "bg-gray-800 text-green-400"
                      : "bg-green-50 text-green-800"
                  }`}
                >
                  <strong>Suggestion:</strong> {details.suggestion}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function ErrorReporter({
  errors,
  onDismiss,
  theme,
}: ErrorReporterProps) {
  const [activeTab, setActiveTab] = useState<"lexical" | "syntax" | "semantic">(
    "lexical",
  );

  const lexicalCount = errors?.lexical_errors?.length || 0;
  const syntaxCount = errors?.syntax_errors?.length || 0;
  const semanticCount = errors?.semantic_errors?.length || 0;
  const totalErrors = lexicalCount + syntaxCount + semanticCount;

  // Switch to the first tab with errors
  useEffect(() => {
    if (!errors) return;

    if (lexicalCount > 0) {
      setActiveTab("lexical");
    } else if (syntaxCount > 0) {
      setActiveTab("syntax");
    } else if (semanticCount > 0) {
      setActiveTab("semantic");
    }
  }, [errors, lexicalCount, syntaxCount, semanticCount]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 overflow-y-auto p-4">
      <div
        className={`rounded-lg shadow-xl max-w-4xl w-full my-8 transform transition-all duration-300 ${
          theme === "dark"
            ? "bg-gray-800 text-gray-100"
            : "bg-white text-gray-900"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <AlertCircle className="text-red-500" size={24} />
            {totalErrors} Compilation {totalErrors === 1 ? "Error" : "Errors"}
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

        {/* Tabs */}
        <div className="flex border-b">
          <ErrorTab
            active={activeTab === "lexical"}
            label="Lexical"
            count={lexicalCount}
            onClick={() => setActiveTab("lexical")}
            theme={theme}
          />
          <ErrorTab
            active={activeTab === "syntax"}
            label="Syntax"
            count={syntaxCount}
            onClick={() => setActiveTab("syntax")}
            theme={theme}
          />
          <ErrorTab
            active={activeTab === "semantic"}
            label="Semantic"
            count={semanticCount}
            onClick={() => setActiveTab("semantic")}
            theme={theme}
          />
        </div>

        {/* Content */}
        <div
          className={`p-4 rounded-md overflow-auto max-h-[calc(80vh-180px)] ${
            theme === "dark" ? "bg-gray-900" : "bg-gray-50"
          }`}
        >
          {totalErrors === 0 ? (
            <div className="text-center py-8">
              <div
                className={`text-lg font-medium ${theme === "dark" ? "text-green-400" : "text-green-600"}`}
              >
                No errors found!
              </div>
              <p
                className={`mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Your code is free of compilation errors.
              </p>
            </div>
          ) : activeTab === "lexical" && errors?.lexical_errors ? (
            <LexicalErrorList errors={errors.lexical_errors} theme={theme} />
          ) : activeTab === "syntax" && errors?.syntax_errors ? (
            <SyntaxErrorList errors={errors.syntax_errors} theme={theme} />
          ) : activeTab === "semantic" && errors?.semantic_errors ? (
            <SemanticErrorList errors={errors.semantic_errors} theme={theme} />
          ) : (
            <div className="text-center py-6">
              <div
                className={`text-lg font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                No {activeTab} errors found
              </div>
            </div>
          )}
        </div>

        <div className="p-4 flex justify-end border-t">
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

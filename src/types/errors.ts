import { ErrorPosition } from './common';

// Lexical errors
export interface LexicalError {
  error_type: { type: string };
  invalid_token: string;
  position: ErrorPosition;
  message: string;
  suggestion?: string;
}

// Syntax errors
export type SyntaxError =
  | {
      type: "InvalidToken";
      data: {
        position: number;
        message: string;
        line: number;
        column: number;
      };
    }
  | {
      type: "UnexpectedEOF";
      data: {
        position: number;
        expected: string[];
        line: number;
        column: number;
      };
    }
  | {
      type: "UnexpectedToken";
      data: {
        token: string;
        expected: string[];
        line: number;
        column: number;
      };
    }
  | {
      type: "ExtraToken";
      data: {
        token: string;
        line: number;
        column: number;
      };
    }
  | { type: "Custom"; data: string };

// Semantic errors
export type SemanticError =
  | {
      type: "AssignmentToArray";
      data: {
        name: string;
        position: ErrorPosition;
      };
    }
  | {
      type: "ArraySizeMismatch";
      data: {
        name: string;
        expected: number;
        actual: number;
        position: ErrorPosition;
      };
    }
  | {
      type: "UndeclaredIdentifier";
      data: {
        name: string;
        position: ErrorPosition;
      };
    }
  | {
      type: "DuplicateDeclaration";
      data: {
        name: string;
        position: ErrorPosition;
        original_position: ErrorPosition;
      };
    }
  | {
      type: "TypeMismatch";
      data: {
        expected: string;
        found: string;
        position: ErrorPosition;
        context?: string;
      };
    }
  | {
      type: "DivisionByZero";
      data: {
        position: ErrorPosition;
      };
    }
  | {
      type: "ConstantModification";
      data: {
        name: string;
        position: ErrorPosition;
      };
    }
  | {
      type: "ArrayIndexOutOfBounds";
      data: {
        name: string;
        index: number;
        size: number;
        position: ErrorPosition;
      };
    }
  | {
      type: "InvalidConditionValue";
      data: {
        found: string;
        position: ErrorPosition;
      };
    }
  | {
      type: "NonArrayIndexing";
      data: {
        var_name: string;
        position: ErrorPosition;
      };
    }
  | {
      type: "InvalidArraySize";
      data: {
        name: string;
        size: number;
        position: ErrorPosition;
      };
    }
  | { type: "EmptyProgram" };

// Compilation errors container
export interface CompilationErrors {
  lexical_errors: LexicalError[];
  syntax_errors: SyntaxError[];
  semantic_errors: SemanticError[];
}
export interface Token {
  kind: string;
  value: string;
  line: number;
  column: number;
  span: [number, number];
}

export interface Symbol {
  name: string;
  kind: string;
  symbol_type: string;
  value: string;
  line: number;
  column: number;
}

export interface Located<T> {
  node: T;
  start: number;
  end: number;
}

export type Declaration = Located<DeclarationKind>;
export type Statement = Located<StatementKind>;
export type Expression = Located<ExpressionKind>;

export type DeclarationKind =
  | { kind: "Variable"; data: { names: string[]; type_name: string } }
  | {
      kind: "Array";
      data: { names: string[]; type_name: string; size: number };
    }
  | {
      kind: "VariableWithInit";
      data: { names: string[]; type_name: string; init_value: Expression };
    }
  | {
      kind: "ArrayWithInit";
      data: {
        names: string[];
        type_name: string;
        size: number;
        init_values: Expression[];
      };
    }
  | {
      kind: "Constant";
      data: { name: string; type_name: string; value: Literal };
    };

export type StatementKind =
  | { kind: "Assignment"; data: { target: Expression; value: Expression } }
  | { kind: "IfThen"; data: { condition: Expression; body: Statement[] } }
  | {
      kind: "IfThenElse";
      data: {
        condition: Expression;
        then_body: Statement[];
        else_body: Statement[];
      };
    }
  | { kind: "DoWhile"; data: { body: Statement[]; condition: Expression } }
  | {
      kind: "For";
      data: {
        var: Expression;
        from: Expression;
        to: Expression;
        step: Expression;
        body: Statement[];
      };
    }
  | { kind: "Input"; data: { target: Expression } }
  | { kind: "Output"; data: { values: Expression[] } }
  | { kind: "Scope"; data: { statements: Statement[] } }
  | { kind: "Empty" };

export type ExpressionKind =
  | { kind: "Identifier"; data: { name: string } }
  | { kind: "ArrayAccess"; data: { name: string; index: Expression } }
  | { kind: "Literal"; data: { value: Literal } }
  | {
      kind: "BinaryOp";
      data: { left: Expression; operator: string; right: Expression };
    }
  | { kind: "UnaryOp"; data: { operator: string; operand: Expression } };

export type Literal =
  | { kind: "Int"; data: { value: number } }
  | { kind: "Float"; data: { value: number } }
  | { kind: "String"; data: { value: string } };

export interface Program {
  name: string;
  declarations: Declaration[];
  statements: Statement[];
}

export type Operation =
  // Arithmetic operations
  | { type: "Add" }
  | { type: "Subtract" }
  | { type: "Multiply" }
  | { type: "Divide" }
  // Assignment and memory operations
  | { type: "Assign" }
  | { type: "ArrayStore" }
  | { type: "ArrayLoad" }
  // Control flow operations
  | { type: "Label"; data: { id: number } }
  | { type: "Jump"; data: { target: number } }
  | { type: "JumpIfTrue"; data: { target: number } }
  | { type: "JumpIfFalse"; data: { target: number } }
  // Comparison operations
  | { type: "Equal" }
  | { type: "NotEqual" }
  | { type: "LessThan" }
  | { type: "GreaterThan" }
  | { type: "LessEqual" }
  | { type: "GreaterEqual" }
  // Logical operations
  | { type: "And" }
  | { type: "Or" }
  | { type: "Not" }
  // I/O operations
  | { type: "Input" }
  | { type: "Output" }
  // Function operations
  | { type: "Call"; data: { name: string } }
  | { type: "Return" };

export type Operand =
  | { type: "IntLiteral"; data: { value: number } }
  | { type: "FloatLiteral"; data: { value: number } }
  | { type: "StringLiteral"; data: { value: string } }
  | { type: "Variable"; data: { name: string } }
  | { type: "TempVariable"; data: { name: string } }
  | { type: "ArrayElement"; data: { name: string; index: Operand } }
  | { type: "Empty" };

export interface Quadruple {
  operation: Operation;
  operand1: Operand;
  operand2: Operand;
  result: Operand;
}

export interface QuadrupleProgram {
  quadruples: Quadruple[];
  next_temp: number;
  next_label: number;
}

// Error position shared by all error types
export interface ErrorPosition {
  line: number;
  column: number;
}

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

export interface CompilationResult {
  tokens: Token[];
  ast: Program;
  symbol_table: Symbol[];
  quadruples: QuadrupleProgram;
  errors?: CompilationErrors;
}

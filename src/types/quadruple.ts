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
import { Located, Literal } from './common';

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

export interface Program {
  name: string;
  declarations: Declaration[];
  statements: Statement[];
}
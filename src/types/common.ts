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

export interface ErrorPosition {
  line: number;
  column: number;
}

export type Literal =
  | { kind: "Int"; data: { value: number } }
  | { kind: "Float"; data: { value: number } }
  | { kind: "String"; data: { value: string } };
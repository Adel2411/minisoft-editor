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

export interface CompilationResult {
  tokens: Token[];
  ast: string;
  symbol_table: Symbol[];
  quadruples: string[];
}

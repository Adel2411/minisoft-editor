import { Token, Symbol } from './common';
import { Program } from './ast';
import { QuadrupleProgram } from './quadruple';
import { CompilationErrors } from './errors';

export interface CompilationResult {
  tokens: Token[];
  ast: Program;
  symbol_table: Symbol[];
  quadruples: QuadrupleProgram;
  errors?: CompilationErrors;
}
mod declaration_analyzer;
mod expression_analyzer;
mod statement_analyzer;

use crate::parser::ast::{Expression, ExpressionKind, LiteralKind, Operator, Program, Type};
use crate::semantics::error::SemanticError;
use crate::semantics::source_map::SourceMap;
use crate::semantics::symbol_table::{SymbolKind, SymbolTable, SymbolValue};
use std::collections::HashSet;
use std::ops::Range;

pub struct SemanticAnalyzer {
    symbol_table: SymbolTable,
    errors: Vec<SemanticError>,
    reported_errors: HashSet<String>,
    source_map: SourceMap,
}

impl SemanticAnalyzer {
    pub fn new(source_code: &String) -> Self {
        SemanticAnalyzer {
            symbol_table: SymbolTable::new(),
            errors: Vec::new(),
            reported_errors: HashSet::new(),
            source_map: SourceMap::new(source_code),
        }
    }

    pub fn analyze(&mut self, program: &Program) {
        if program.statements.is_empty() && program.declarations.is_empty() {
            self.empty_program();
        }
        // First pass: analyze declarations
        for decl in &program.declarations {
            self.analyze_declaration(decl);
        }

        // Second pass: analyze statements
        for stmt in &program.statements {
            self.analyze_statement(stmt);
        }
    }

    // Error helper methods
    fn empty_program(&mut self) {
        self.add_error(SemanticError::EmptyProgram);
    }

    fn array_size_mismatch_error(
        &mut self,
        span: &Range<usize>,
        name: &str,
        expected: usize,
        actual: usize,
    ) {
        self.add_error(SemanticError::ArraySizeMismatch {
            name: name.to_string(),
            expected,
            actual,
            line: self.source_map.get_line(span),
            column: self.source_map.get_column(span),
        });
    }

    fn type_mismatch_error(
        &mut self,
        span: &Range<usize>,
        expected: &Type,
        found: &Type,
        context: Option<&str>,
    ) {
        self.add_error(SemanticError::TypeMismatch {
            expected: format!("{}", expected),
            found: format!("{}", found),
            line: self.source_map.get_line(span),
            column: self.source_map.get_column(span),
            context: context.map(|s| s.to_string()),
        });
    }

    fn undeclared_identifier_error(&mut self, span: &Range<usize>, name: &str) {
        self.add_error(SemanticError::UndeclaredIdentifier {
            name: name.to_string(),
            line: self.source_map.get_line(span),
            column: self.source_map.get_column(span),
        });
    }

    fn constant_modification_error(&mut self, span: &Range<usize>, name: &str) {
        self.add_error(SemanticError::ConstantModification {
            name: name.to_string(),
            line: self.source_map.get_line(span),
            column: self.source_map.get_column(span),
        });
    }

    fn array_index_out_of_bounds_error(
        &mut self,
        span: &Range<usize>,
        name: &str,
        index: usize,
        size: usize,
    ) {
        self.add_error(SemanticError::ArrayIndexOutOfBounds {
            name: name.to_string(),
            index,
            size,
            line: self.source_map.get_line(span),
            column: self.source_map.get_column(span),
        });
    }
    fn non_array_indexing(&mut self, span: &Range<usize>, name: &str) {
        self.add_error(SemanticError::NonArrayIndexing {
            var_name: name.to_string(),
            line: self.source_map.get_line(span),
            column: self.source_map.get_column(span),
        });
    }

    fn division_by_zero_error(&mut self, span: &Range<usize>) {
        self.add_error(SemanticError::DivisionByZero {
            line: self.source_map.get_line(span),
            column: self.source_map.get_column(span),
        });
    }

    fn duplicate_declaration_error(
        &mut self,
        span: &Range<usize>,
        name: &str,
        original_line: usize,
        original_column: usize,
    ) {
        self.add_error(SemanticError::DuplicateDeclaration {
            name: name.to_string(),
            line: self.source_map.get_line(span),
            column: self.source_map.get_column(span),
            original_line,
            original_column,
        });
    }

    fn condition_value_error(&mut self, span: &Range<usize>, found: String) {
        self.add_error(SemanticError::InvalidConditionValue {
            found,
            line: self.source_map.get_line(span),
            column: self.source_map.get_column(span),
        });
    }

    fn invalid_array_size_error(&mut self, span: &Range<usize>, name: &str, size: i32) {
        self.add_error(SemanticError::InvalidArraySize {
            name: name.to_string(),
            size,
            line: self.source_map.get_line(span),
            column: self.source_map.get_column(span),
        });
    }

    fn assignement_to_array_error(&mut self, span: &Range<usize>, name: &str) {
        self.add_error(SemanticError::AssignmentToArray {
            name: name.to_string(),
            line: self.source_map.get_line(span),
            column: self.source_map.get_column(span),
        });
    }

    pub fn add_error(&mut self, error: SemanticError) {
        // Only add the error if it hasn't been reported yet
        let error_key = format!("{:?}", error);
        if !self.reported_errors.contains(&error_key) {
            self.reported_errors.insert(error_key);
            self.errors.push(error);
        }
    }

    pub fn get_errors(&self) -> &Vec<SemanticError> {
        &self.errors
    }

    pub fn get_symbol_table(&self) -> &SymbolTable {
        &self.symbol_table
    }

    pub fn evaluate_constant_expression(&mut self, expr: &Expression) -> Option<LiteralKind> {
        match &expr.node {
            ExpressionKind::Literal(lit) => Some(lit.node.clone()),

            ExpressionKind::Identifier(name) => {
                if let Some(symbol) = self.symbol_table.get(name) {
                    if symbol.is_constant {
                        match &symbol.value {
                            SymbolValue::Single(lit) => return Some(lit.clone()),
                            SymbolValue::Array(_) => return None, // Array as a whole isn't a literal value
                            SymbolValue::Uninitialized => return None,
                        }
                    }
                }
                None
            }
            ExpressionKind::BinaryOp(left, op, right) => {
                let left_val = self.evaluate_constant_expression(left)?;
                let right_val = self.evaluate_constant_expression(right)?;

                match (left_val, right_val) {
                    (LiteralKind::Int(l), LiteralKind::Int(r)) => match op {
                        Operator::Add => Some(LiteralKind::Int(l + r)),
                        Operator::Subtract => Some(LiteralKind::Int(l - r)),
                        Operator::Multiply => Some(LiteralKind::Int(l * r)),
                        Operator::Divide => {
                            if r == 0 {
                                self.division_by_zero_error(&right.span);
                                None
                            } else {
                                Some(LiteralKind::Int(l / r))
                            }
                        }
                        _ => None,
                    },
                    (LiteralKind::Float(l), LiteralKind::Float(r)) => match op {
                        Operator::Add => Some(LiteralKind::Float(l + r)),
                        Operator::Subtract => Some(LiteralKind::Float(l - r)),
                        Operator::Multiply => Some(LiteralKind::Float(l * r)),
                        Operator::Divide => {
                            if r == 0.0 {
                                self.division_by_zero_error(&right.span);
                                None
                            } else {
                                Some(LiteralKind::Float(l / r))
                            }
                        }
                        _ => None,
                    },
                    _ => None,
                }
            }
            ExpressionKind::ArrayAccess(name, index_expr) => {
                // Handle array access for constant expressions
                // First evaluate the index expression to avoid borrowing conflicts
                let index_value = self.evaluate_constant_expression(index_expr);

                if let Some(symbol) = self.symbol_table.get(name) {
                    // Check if we're accessing an array
                    if let SymbolKind::Array(_) = symbol.kind {
                        // Use the previously evaluated index
                        if let Some(LiteralKind::Int(idx)) = index_value {
                            // If index is constant and array has values
                            if let SymbolValue::Array(values) = &symbol.value {
                                let idx = idx as usize;
                                if idx < values.len() {
                                    return Some(values[idx].clone());
                                }
                            }
                        }
                    }
                }
                None
            }
            _ => None,
        }
    }
}

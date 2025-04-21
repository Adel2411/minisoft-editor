use std::ops::Range;

use crate::parser::ast::{
    Declaration, DeclarationKind, Expression, Literal, LiteralKind, Type,
};
use crate::semantics::analyzer_core::SemanticAnalyzer;
use crate::semantics::symbol_table::{Symbol, SymbolKind, SymbolValue};

impl SemanticAnalyzer {
    pub fn analyze_declaration(&mut self, declaration: &Declaration) {
        match &declaration.node {
            DeclarationKind::Variable(items, typ) => {
                for item in items {
                    self.handle_variable_declaration(item, typ, &declaration.span);
                }
            }
            DeclarationKind::Array(items, typ, size) => {
                for item in items {
                    self.handle_array_declaration(item, typ, *size, &declaration.span);
                }
            }
            DeclarationKind::VariableWithInit(items, typ, expression) => {
                for item in items {
                    self.handle_variable_declaration_with_init(
                        item,
                        typ,
                        expression,
                        &declaration.span,
                    );
                }
            }
            DeclarationKind::ArrayWithInit(items, typ, size, expressions) => {
                for item in items {
                    self.handle_array_declaration_with_init(
                        item,
                        typ,
                        *size,
                        expressions,
                        &declaration.span,
                    );
                }
            }
            DeclarationKind::Constant(value, typ, literal) => {
                self.handle_constant_declaration(value, typ, literal, &declaration.span);
            }
        }
    }

    fn handle_constant_declaration(
        &mut self,
        value: &str,
        typ: &Type,
        literal: &Literal,
        span: &Range<usize>,
    ) {
        // Check for duplicate declaration
        if self.symbol_table.contains(value) {
            let existing = self.symbol_table.get(value).unwrap();
            self.duplicate_declaration_error(span, value, existing.line, existing.column);
            return;
        }
        
        match &literal.node {
            LiteralKind::Int(_) if !typ.is_compatible_with(&Type::Int) => {
                self.type_mismatch_error(span, typ, &Type::Int, Some("constant"));
            },
            LiteralKind::Float(_) if !typ.is_compatible_with(&Type::Float) => {
                self.type_mismatch_error(span, typ, &Type::Float, Some("constant"));
            },
            _ => {}
        }

        let line = self.source_map.get_line(span);
        let column = self.source_map.get_column(span);

        let symbol = Symbol {
            name: value.to_string(),
            kind: SymbolKind::Constant,
            symbol_type: typ.clone(),
            value: SymbolValue::Single(literal.node.clone()),
            line,
            column,
            is_constant: true,
        };

        self.symbol_table.add_symbol(symbol);
    }

    fn handle_variable_declaration(&mut self, name: &str, typ: &Type, span: &Range<usize>) {
        // Check for duplicate declaration
        if self.symbol_table.contains(name) {
            let existing = self.symbol_table.get(name).unwrap();
            self.duplicate_declaration_error(span, name, existing.line, existing.column);
            return;
        }

        let line = self.source_map.get_line(span);
        let column = self.source_map.get_column(span);

        let symbol = Symbol {
            name: name.to_string(),
            kind: SymbolKind::Variable,
            symbol_type: typ.clone(),
            value: SymbolValue::Uninitialized,
            line,
            column,
            is_constant: false, 
        };
        self.symbol_table.add_symbol(symbol);
    }

    fn handle_array_declaration(&mut self, name: &str, typ: &Type, size: usize, span: &Range<usize>) {
        // Check for valid array size
        if size == 0 || (size as i32) < 0 {
            self.invalid_array_size_error(span, name, size as i32);
            return;
        }
        
        // Check for duplicate declaration
        if self.symbol_table.contains(name) {
            let existing = self.symbol_table.get(name).unwrap();
            self.duplicate_declaration_error(span, name, existing.line, existing.column);
            return;
        }

        let line = self.source_map.get_line(span);
        let column = self.source_map.get_column(span);

        let symbol = Symbol {
            name: name.to_string(),
            kind: SymbolKind::Array(size),
            symbol_type: typ.clone(),
            value: SymbolValue::Uninitialized,
            line,
            column,
            is_constant: false,
        };

        self.symbol_table.add_symbol(symbol);
    }

    fn handle_variable_declaration_with_init(
        &mut self,
        name: &str,
        typ: &Type,
        expr: &Expression,
        span: &Range<usize>,
    ) {
        // First, check the expression
        let expr_type = self.analyze_expression(expr);

        // Try to evaluate the expression if it's a constant
        let value = self.evaluate_constant_expression(expr);
        
        if let Some(expr_type) = expr_type {
            if !expr_type.get_type().is_compatible_with(typ) {
                self.type_mismatch_error(span, typ, &expr_type.get_type(), Some("assignment"));
            }
        }

        // Check for duplicate declaration
        if self.symbol_table.contains(name) {
            let existing = self.symbol_table.get(name).unwrap();
            self.duplicate_declaration_error(span, name, existing.line, existing.column);
            return;
        }

        let line = self.source_map.get_line(span);
        let column = self.source_map.get_column(span);

        let symbol = Symbol {
            name: name.to_string(),
            kind: SymbolKind::Variable,
            symbol_type: typ.clone(),
            value: match value {
                Some(lit) => SymbolValue::Single(lit),
                None => SymbolValue::Uninitialized,
            },
            line,
            column,
            is_constant: false,
        };
        
        self.symbol_table.add_symbol(symbol);
    }

    fn handle_array_declaration_with_init(
        &mut self,
        name: &str,
        typ: &Type,
        size: usize,
        exprs: &[Expression],
        span: &Range<usize>,
    ) {
        // Check for valid array size
        if size == 0 || (size as i32) < 0 {
            self.invalid_array_size_error(span, name, size as i32);
            return;
        }
        
        // Check that array size matches number of initializers
        if exprs.len() != size {
            self.array_size_mismatch_error(span, name, size, exprs.len());
        }

        // Process each expression and collect values
        let mut array_values = Vec::new();
        let mut all_values_evaluated = true;

        // Check each value's type
        for expr in exprs {
            let value_type = self.analyze_expression(expr);
            if let Some(value_type) = value_type {
                if !value_type.get_type().is_compatible_with(typ) {
                    self.type_mismatch_error(span, typ, &value_type.get_type(), Some("array initializer"));
                }
            }
            
            // Try to evaluate as constant expression
            if let Some(value) = self.evaluate_constant_expression(expr) {
                array_values.push(value);
            } else {
                all_values_evaluated = false;
            }
        }

        // Check for duplicate declaration
        if self.symbol_table.contains(name) {
            let existing = self.symbol_table.get(name).unwrap();
            self.duplicate_declaration_error(span, name, existing.line, existing.column);
            return;
        }

        let line = self.source_map.get_line(span);
        let column = self.source_map.get_column(span);

        let symbol = Symbol {
            name: name.to_string(),
            kind: SymbolKind::Array(size),
            symbol_type: typ.clone(),
            value: if all_values_evaluated && array_values.len() == size {
                SymbolValue::Array(array_values)
            } else {
                SymbolValue::Uninitialized
            },
            line,
            column,
            is_constant: false,
        };

        self.symbol_table.add_symbol(symbol);
    }
}

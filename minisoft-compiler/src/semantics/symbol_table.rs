use crate::parser::ast::{LiteralKind, Type};
use std::{collections::HashMap, default};

#[derive(Debug, Clone, PartialEq)]
pub enum SymbolKind {
    Variable,
    Constant,
    Array(usize),
}

#[derive(Debug, Clone, PartialEq)]
pub enum SymbolValue {
    Single(LiteralKind),
    Array(Vec<LiteralKind>),
    Uninitialized,
}

#[derive(Debug, Clone)]
pub struct Symbol {
    pub name: String,
    pub kind: SymbolKind,
    pub symbol_type: Type,
    pub value: SymbolValue,
    pub is_constant: bool,
    pub line: usize,
    pub column: usize,
}

#[derive(Debug, Default, Clone)]
pub struct SymbolTable {
    symbols: HashMap<String, Symbol>,
}

impl SymbolTable {
    pub fn new() -> Self {
        SymbolTable {
            symbols: HashMap::new(),
        }
    }

    pub fn add_symbol(&mut self, symbol: Symbol) -> bool {
        if self.symbols.contains_key(&symbol.name) {
            return false;
        }
        self.symbols.insert(symbol.name.clone(), symbol);
        true
    }

    /// Checks if a symbol exists in the table
    pub fn contains(&self, name: &str) -> bool {
        self.symbols.contains_key(name)
    }

    /// Gets a symbol by name
    pub fn get(&self, name: &str) -> Option<&Symbol> {
        self.symbols.get(name)
    }

    /// Gets all symbols
    pub fn get_all(&self) -> Vec<&Symbol> {
        self.symbols.values().collect()
    }
}

impl default::Default for Symbol {
    fn default() -> Self {
        Symbol {
            name: String::new(),
            kind: SymbolKind::Variable,
            symbol_type: Type::default(),
            value: SymbolValue::Uninitialized,
            line: 0,
            column: 0,
            is_constant: false,
        }
    }
}

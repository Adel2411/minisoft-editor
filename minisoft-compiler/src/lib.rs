pub mod codegen;
pub mod compiler;
pub mod error_reporter;
pub mod lexer;
pub mod parser;
pub mod semantics;

use compiler::{CompilationResult, Compiler};
use parser::ast::{
    Declaration, DeclarationKind, Expression, ExpressionKind, Literal, LiteralKind, Program,
    Statement, StatementKind,
};
use serde::{Deserialize, Serialize};

// First, let's create a serializable version of CompilationResult
#[derive(Serialize, Deserialize)]
pub struct SerializableCompilationResult {
    pub tokens: Vec<SerializableToken>,
    pub ast: SerializableProgram, // Changed from string to structured data
    pub symbol_table: Vec<SerializableSymbol>,
    pub quadruples: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub struct SerializableToken {
    pub kind: String,
    pub value: String,
    pub line: usize,
    pub column: usize,
    pub span: (usize, usize),
}

#[derive(Serialize, Deserialize)]
pub struct SerializableSymbol {
    pub name: String,
    pub kind: String,
    pub symbol_type: String,
    pub value: String,
    pub line: usize,
    pub column: usize,
}

// New structures for serializing the AST
#[derive(Serialize, Deserialize)]
pub struct SerializableProgram {
    pub name: String,
    pub declarations: Vec<SerializableDeclaration>,
    pub statements: Vec<SerializableStatement>,
}

#[derive(Serialize, Deserialize)]
pub struct SerializableLocated<T> {
    pub node: T,
    pub start: usize,
    pub end: usize,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "kind", content = "data")]
pub enum SerializableDeclarationKind {
    Variable {
        names: Vec<String>,
        type_name: String,
    },
    Array {
        names: Vec<String>,
        type_name: String,
        size: usize,
    },
    VariableWithInit {
        names: Vec<String>,
        type_name: String,
        init_value: SerializableExpression,
    },
    ArrayWithInit {
        names: Vec<String>,
        type_name: String,
        size: usize,
        init_values: Vec<SerializableExpression>,
    },
    Constant {
        name: String,
        type_name: String,
        value: SerializableLiteral,
    },
}

pub type SerializableDeclaration = SerializableLocated<SerializableDeclarationKind>;

#[derive(Serialize, Deserialize)]
#[serde(tag = "kind", content = "data")]
pub enum SerializableStatementKind {
    Assignment {
        target: SerializableExpression,
        value: SerializableExpression,
    },
    IfThen {
        condition: SerializableExpression,
        body: Vec<SerializableStatement>,
    },
    IfThenElse {
        condition: SerializableExpression,
        then_body: Vec<SerializableStatement>,
        else_body: Vec<SerializableStatement>,
    },
    DoWhile {
        body: Vec<SerializableStatement>,
        condition: SerializableExpression,
    },
    For {
        init: SerializableExpression,
        condition: SerializableExpression,
        step: SerializableExpression,
        body: Vec<SerializableStatement>,
    },
    Input {
        target: SerializableExpression,
    },
    Output {
        values: Vec<SerializableExpression>,
    },
    Scope {
        statements: Vec<SerializableStatement>,
    },
    Empty,
}

pub type SerializableStatement = SerializableLocated<SerializableStatementKind>;

#[derive(Serialize, Deserialize)]
#[serde(tag = "kind", content = "data")]
pub enum SerializableExpressionKind {
    Identifier {
        name: String,
    },
    ArrayAccess {
        name: String,
        index: Box<SerializableExpression>,
    },
    Literal {
        value: SerializableLiteral,
    },
    BinaryOp {
        left: Box<SerializableExpression>,
        operator: String,
        right: Box<SerializableExpression>,
    },
    UnaryOp {
        operator: String,
        operand: Box<SerializableExpression>,
    },
}

pub type SerializableExpression = SerializableLocated<SerializableExpressionKind>;

#[derive(Serialize, Deserialize)]
#[serde(tag = "kind", content = "data")]
pub enum SerializableLiteral {
    Int { value: i32 },
    Float { value: f32 },
    String { value: String },
}

pub fn run_compiler(code: String, verbose: bool) -> Result<SerializableCompilationResult, String> {
    // 1. dump to a temp file
    let mut tmp = std::env::temp_dir();
    tmp.push("tauri_minisoft_input.ms");
    std::fs::write(&tmp, code.as_bytes())
        .map_err(|e| format!("failed writing temp file: {}", e))?;
    let path = tmp.to_string_lossy().to_string();

    // 2. invoke your Compiler
    match Compiler::new(&path) {
        Ok(mut compiler) => {
            if verbose {
                println!("Starting compilation in verbose mode");
            }

            // Run the compiler and convert the result to a serializable format
            compiler
                .run()
                .map(convert_to_serializable)
                .map_err(|code| format!("Compilation failed with code: {}", code))
        }
        Err(err) => Err(err),
    }
}

// Helper function to convert CompilationResult to SerializableCompilationResult
fn convert_to_serializable(result: CompilationResult) -> SerializableCompilationResult {
    SerializableCompilationResult {
        tokens: result
            .tokens
            .into_iter()
            .map(|t| SerializableToken {
                kind: format!("{:?}", t.kind),
                value: t.value,
                line: t.line,
                column: t.column,
                span: (t.span.start, t.span.end), // Convert Range<usize> to tuple (usize, usize)
            })
            .collect(),

        ast: result.ast.into(),

        symbol_table: result
            .symbol_table
            .into_iter()
            .map(|s| SerializableSymbol {
                name: s.name,
                kind: format!("{:?}", s.kind),
                symbol_type: s.symbol_type.to_string(),
                value: format!("{:?}", s.value),
                line: s.line,
                column: s.column,
            })
            .collect(),

        quadruples: result
            .quadruples
            .quadruples
            .into_iter()
            .map(|q| q.to_string())
            .collect(),
    }
}

// Implement From traits for AST types to convert them into serializable structures
impl From<Program> for SerializableProgram {
    fn from(program: Program) -> Self {
        SerializableProgram {
            name: program.name,
            declarations: program.declarations.into_iter().map(Into::into).collect(),
            statements: program.statements.into_iter().map(Into::into).collect(),
        }
    }
}

impl From<Declaration> for SerializableDeclaration {
    fn from(decl: Declaration) -> Self {
        SerializableLocated {
            node: match decl.node {
                DeclarationKind::Variable(names, type_name) => {
                    SerializableDeclarationKind::Variable {
                        names,
                        type_name: type_name.to_string(),
                    }
                }
                DeclarationKind::Array(names, type_name, size) => {
                    SerializableDeclarationKind::Array {
                        names,
                        type_name: type_name.to_string(),
                        size,
                    }
                }
                DeclarationKind::VariableWithInit(names, type_name, init_value) => {
                    SerializableDeclarationKind::VariableWithInit {
                        names,
                        type_name: type_name.to_string(),
                        init_value: init_value.into(),
                    }
                }
                DeclarationKind::ArrayWithInit(names, type_name, size, init_values) => {
                    SerializableDeclarationKind::ArrayWithInit {
                        names,
                        type_name: type_name.to_string(),
                        size,
                        init_values: init_values.into_iter().map(Into::into).collect(),
                    }
                }
                DeclarationKind::Constant(name, type_name, value) => {
                    SerializableDeclarationKind::Constant {
                        name,
                        type_name: type_name.to_string(),
                        value: value.into(),
                    }
                }
            },
            start: decl.span.start,
            end: decl.span.end,
        }
    }
}

// Implement similar From traits for Statement, Expression, and Literal
impl From<Statement> for SerializableStatement {
    fn from(stmt: Statement) -> Self {
        SerializableLocated {
            node: match stmt.node {
                StatementKind::Assignment(target, value) => SerializableStatementKind::Assignment {
                    target: target.into(),
                    value: value.into(),
                },
                StatementKind::IfThen(condition, body) => SerializableStatementKind::IfThen {
                    condition: condition.into(),
                    body: body.into_iter().map(Into::into).collect(),
                },
                StatementKind::IfThenElse(condition, then_body, else_body) => {
                    SerializableStatementKind::IfThenElse {
                        condition: condition.into(),
                        then_body: then_body.into_iter().map(Into::into).collect(),
                        else_body: else_body.into_iter().map(Into::into).collect(),
                    }
                }
                StatementKind::DoWhile(body, condition) => SerializableStatementKind::DoWhile {
                    body: body.into_iter().map(Into::into).collect(),
                    condition: condition.into(),
                },
                StatementKind::For(init, condition, step, _, body) => {
                    SerializableStatementKind::For {
                        init: init.into(),
                        condition: condition.into(),
                        step: step.into(),
                        body: body.into_iter().map(Into::into).collect(),
                    }
                }
                StatementKind::Input(target) => SerializableStatementKind::Input {
                    target: target.into(),
                },
                StatementKind::Output(values) => SerializableStatementKind::Output {
                    values: values.into_iter().map(Into::into).collect(),
                },
                StatementKind::Scope(statements) => SerializableStatementKind::Scope {
                    statements: statements.into_iter().map(Into::into).collect(),
                },
                StatementKind::Empty => SerializableStatementKind::Empty,
            },
            start: stmt.span.start,
            end: stmt.span.end,
        }
    }
}

impl From<Expression> for SerializableExpression {
    fn from(expr: Expression) -> Self {
        SerializableLocated {
            node: match expr.node {
                ExpressionKind::Identifier(name) => SerializableExpressionKind::Identifier { name },
                ExpressionKind::ArrayAccess(name, index) => {
                    SerializableExpressionKind::ArrayAccess {
                        name,
                        index: Box::new((*index).into()),
                    }
                }
                ExpressionKind::Literal(value) => SerializableExpressionKind::Literal {
                    value: value.into(),
                },
                ExpressionKind::BinaryOp(left, operator, right) => {
                    SerializableExpressionKind::BinaryOp {
                        left: Box::new((*left).into()),
                        operator: format!("{:?}", operator),
                        right: Box::new((*right).into()),
                    }
                }
                ExpressionKind::UnaryOp(operator, operand) => SerializableExpressionKind::UnaryOp {
                    operator: format!("{:?}", operator),
                    operand: Box::new((*operand).into()),
                },
            },
            start: expr.span.start,
            end: expr.span.end,
        }
    }
}

impl From<Literal> for SerializableLiteral {
    fn from(lit: Literal) -> Self {
        match lit.node {
            LiteralKind::Int(value) => SerializableLiteral::Int { value },
            LiteralKind::Float(value) => SerializableLiteral::Float { value },
            LiteralKind::String(value) => SerializableLiteral::String { value },
        }
    }
}

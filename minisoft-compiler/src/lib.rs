pub mod codegen;
pub mod compiler;
pub mod error_reporter;
pub mod lexer;
pub mod parser;
pub mod semantics;

use crate::compiler::Compiler;
use lexer::error::LexicalErrorType;
use parser::ast::{
    Declaration, DeclarationKind, Expression, ExpressionKind, Literal, LiteralKind, Program,
    Statement, StatementKind,
};
use serde::{Deserialize, Serialize};

// First, let's create a serializable version of CompilationResult
#[derive(Serialize, Deserialize)]
pub struct SerializableCompilationResult {
    pub tokens: Vec<SerializableToken>,
    pub ast: SerializableProgram,
    pub symbol_table: Vec<SerializableSymbol>,
    pub quadruples: SerializableQuadrupleProgram,
    pub errors: Option<SerializableCompilationErrors>,
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

// Serializable versions of quadruple types
#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum SerializableOperation {
    Add,
    Subtract,
    Multiply,
    Divide,
    Assign,
    ArrayStore,
    ArrayLoad,
    Label { id: usize },
    Jump { target: usize },
    JumpIfTrue { target: usize },
    JumpIfFalse { target: usize },
    Equal,
    NotEqual,
    LessThan,
    GreaterThan,
    LessEqual,
    GreaterEqual,
    And,
    Or,
    Not,
    Input,
    Output,
    Call { name: String },
    Return,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum SerializableOperand {
    IntLiteral {
        value: i32,
    },
    FloatLiteral {
        value: f32,
    },
    StringLiteral {
        value: String,
    },
    Variable {
        name: String,
    },
    TempVariable {
        name: String,
    },
    ArrayElement {
        name: String,
        index: Box<SerializableOperand>,
    },
    Empty,
}

#[derive(Serialize, Deserialize)]
pub struct SerializableQuadruple {
    pub operation: SerializableOperation,
    pub operand1: SerializableOperand,
    pub operand2: SerializableOperand,
    pub result: SerializableOperand,
}

#[derive(Serialize, Deserialize)]
pub struct SerializableQuadrupleProgram {
    pub quadruples: Vec<SerializableQuadruple>,
    pub next_temp: usize,
    pub next_label: usize,
}

// Serializable error types
#[derive(Serialize, Deserialize)]
pub struct SerializableErrorPosition {
    pub line: usize,
    pub column: usize,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum SerializableLexicalErrorType {
    UnterminatedString,
    NonAsciiCharacters,
    IdentifierTooLong,
    InvalidIdentifier,
    ConsecutiveUnderscores,
    TrailingUnderscore,
    IdentifierStartsWithNumber,
    IntegerOutOfRange,
    SignedNumberNotParenthesized,
    InvalidToken,
}

#[derive(Serialize, Deserialize)]
pub struct SerializableLexicalError {
    pub error_type: SerializableLexicalErrorType,
    pub invalid_token: String,
    pub position: SerializableErrorPosition,
    pub message: String,
    pub suggestion: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum SerializableSyntaxError {
    InvalidToken {
        position: usize,
        message: String,
        line: usize,
        column: usize,
    },
    UnexpectedEOF {
        position: usize,
        expected: Vec<String>,
        line: usize,
        column: usize,
    },
    UnexpectedToken {
        token: String,
        expected: Vec<String>,
        line: usize,
        column: usize,
    },
    ExtraToken {
        token: String,
        line: usize,
        column: usize,
    },
    Custom(String),
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum SerializableSemanticError {
    ArraySizeMismatch {
        name: String,
        expected: usize,
        actual: usize,
        position: SerializableErrorPosition,
    },
    UndeclaredIdentifier {
        name: String,
        position: SerializableErrorPosition,
    },
    DuplicateDeclaration {
        name: String,
        position: SerializableErrorPosition,
        original_position: SerializableErrorPosition,
    },
    TypeMismatch {
        expected: String,
        found: String,
        position: SerializableErrorPosition,
        context: Option<String>,
    },
    DivisionByZero {
        position: SerializableErrorPosition,
    },
    ConstantModification {
        name: String,
        position: SerializableErrorPosition,
    },
    ArrayIndexOutOfBounds {
        name: String,
        index: usize,
        size: usize,
        position: SerializableErrorPosition,
    },
    InvalidConditionValue {
        found: String,
        position: SerializableErrorPosition,
    },
    NonArrayIndexing {
        var_name: String,
        position: SerializableErrorPosition,
    },
    InvalidArraySize {
        name: String,
        size: i32,
        position: SerializableErrorPosition,
    },
    EmptyProgram,
}

#[derive(Serialize, Deserialize)]
pub struct SerializableCompilationErrors {
    pub lexical_errors: Vec<SerializableLexicalError>,
    pub syntax_errors: Vec<SerializableSyntaxError>,
    pub semantic_errors: Vec<SerializableSemanticError>,
}

pub fn run_compiler(code: String, verbose: bool) -> Result<SerializableCompilationResult, String> {
    let mut tmp = std::env::temp_dir();
    tmp.push("tauri_minisoft_input.ms");
    std::fs::write(&tmp, code.as_bytes())
        .map_err(|e| format!("failed writing temp file: {}", e))?;
    let path = tmp.to_string_lossy().to_string();

    if verbose {
        println!("Starting compilation in verbose mode");
    }

    match Compiler::new(&path) {
        Ok(mut compiler) => {
            match compiler.run() {
                Ok(result) => {
                    // Successful compilation
                    Ok(SerializableCompilationResult {
                        tokens: result
                            .tokens
                            .into_iter()
                            .map(|t| SerializableToken {
                                kind: format!("{:?}", t.kind),
                                value: t.value,
                                line: t.line,
                                column: t.column,
                                span: (t.span.start, t.span.end),
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
                        quadruples: result.quadruples.into(),
                        errors: None, // No errors on success
                    })
                }
                Err(_) => {
                    // Handle error case by re-running the individual steps to collect errors

                    // Collect lexical errors first
                    let (tokens, lexical_errors) = crate::lexer::lexer_core::tokenize(&code);

                    let lexical_errors_serialized = lexical_errors
                        .iter()
                        .map(|e| SerializableLexicalError {
                            error_type: match e.error_type {
                                LexicalErrorType::UnterminatedString => SerializableLexicalErrorType::UnterminatedString,
                                LexicalErrorType::NonAsciiCharacters => SerializableLexicalErrorType::NonAsciiCharacters,
                                LexicalErrorType::IdentifierTooLong => SerializableLexicalErrorType::IdentifierTooLong,
                                LexicalErrorType::InvalidIdentifier => SerializableLexicalErrorType::InvalidIdentifier,
                                LexicalErrorType::ConsecutiveUnderscores => SerializableLexicalErrorType::ConsecutiveUnderscores,
                                LexicalErrorType::TrailingUnderscore => SerializableLexicalErrorType::TrailingUnderscore,
                                LexicalErrorType::IdentifierStartsWithNumber => SerializableLexicalErrorType::IdentifierStartsWithNumber,
                                LexicalErrorType::IntegerOutOfRange => SerializableLexicalErrorType::IntegerOutOfRange,
                                LexicalErrorType::SignedNumberNotParenthesized => SerializableLexicalErrorType::SignedNumberNotParenthesized,
                                LexicalErrorType::InvalidToken => SerializableLexicalErrorType::InvalidToken,
                            },
                            invalid_token: e.invalid_token.clone(),
                            position: SerializableErrorPosition {
                                line: e.line,
                                column: e.column,
                            },
                            message: format!("Lexical error: {:?}", e.error_type),
                            suggestion: None,
                        })
                        .collect();

                    // If we have lexical errors, return those
                    if !lexical_errors.is_empty() {
                        return Ok(SerializableCompilationResult {
                            tokens: vec![],
                            ast: SerializableProgram {
                                name: "".to_string(),
                                declarations: vec![],
                                statements: vec![],
                            },
                            symbol_table: vec![],
                            quadruples: SerializableQuadrupleProgram {
                                quadruples: vec![],
                                next_temp: 0,
                                next_label: 0,
                            },
                            errors: Some(SerializableCompilationErrors {
                                lexical_errors: lexical_errors_serialized,
                                syntax_errors: vec![],
                                semantic_errors: vec![],
                            }),
                        });
                    }

                    // If no lexical errors, try parsing to collect syntax errors
                    let syntax_errors =
                        match crate::parser::parser_core::parse(tokens.clone(), &code) {
                            Ok(_) => vec![],
                            Err(e) => vec![SerializableSyntaxError::Custom(e.to_string())],
                        };

                    // If we have syntax errors, return those
                    if !syntax_errors.is_empty() {
                        return Ok(SerializableCompilationResult {
                            tokens: tokens
                                .into_iter()
                                .map(|t| SerializableToken {
                                    kind: format!("{:?}", t.kind),
                                    value: t.value,
                                    line: t.line,
                                    column: t.column,
                                    span: (t.span.start, t.span.end),
                                })
                                .collect(),
                            ast: SerializableProgram {
                                name: "".to_string(),
                                declarations: vec![],
                                statements: vec![],
                            },
                            symbol_table: vec![],
                            quadruples: SerializableQuadrupleProgram {
                                quadruples: vec![],
                                next_temp: 0,
                                next_label: 0,
                            },
                            errors: Some(SerializableCompilationErrors {
                                lexical_errors: vec![],
                                syntax_errors,
                                semantic_errors: vec![],
                            }),
                        });
                    }

                    // If no syntax errors, try semantic analysis
                    let ast = crate::parser::parser_core::parse(tokens.clone(), &code).unwrap();
                    let mut analyzer = crate::semantics::SemanticAnalyzer::new(&code);
                    analyzer.analyze(&ast);

                    let semantic_errors = analyzer.get_errors();
                    let semantic_errors_serialized = semantic_errors
                        .iter()
                        .map(|_| SerializableSemanticError::EmptyProgram) // Simplification
                        .collect();

                    // Return with semantic errors
                    Ok(SerializableCompilationResult {
                        tokens: tokens
                            .into_iter()
                            .map(|t| SerializableToken {
                                kind: format!("{:?}", t.kind),
                                value: t.value,
                                line: t.line,
                                column: t.column,
                                span: (t.span.start, t.span.end),
                            })
                            .collect(),
                        ast: ast.into(),
                        symbol_table: vec![],
                        quadruples: SerializableQuadrupleProgram {
                            quadruples: vec![],
                            next_temp: 0,
                            next_label: 0,
                        },
                        errors: Some(SerializableCompilationErrors {
                            lexical_errors: vec![],
                            syntax_errors: vec![],
                            semantic_errors: semantic_errors_serialized,
                        }),
                    })
                }
            }
        }
        Err(_) => {
            // Compiler initialization failed
            Ok(SerializableCompilationResult {
                tokens: vec![],
                ast: SerializableProgram {
                    name: "".to_string(),
                    declarations: vec![],
                    statements: vec![],
                },
                symbol_table: vec![],
                quadruples: SerializableQuadrupleProgram {
                    quadruples: vec![],
                    next_temp: 0,
                    next_label: 0,
                },
                errors: Some(SerializableCompilationErrors {
                    lexical_errors: vec![],
                    syntax_errors: vec![],
                    semantic_errors: vec![SerializableSemanticError::EmptyProgram],
                }),
            })
        }
    }
}

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

impl From<codegen::Operation> for SerializableOperation {
    fn from(op: codegen::Operation) -> Self {
        match op {
            codegen::Operation::Add => SerializableOperation::Add,
            codegen::Operation::Subtract => SerializableOperation::Subtract,
            codegen::Operation::Multiply => SerializableOperation::Multiply,
            codegen::Operation::Divide => SerializableOperation::Divide,
            codegen::Operation::Assign => SerializableOperation::Assign,
            codegen::Operation::ArrayStore => SerializableOperation::ArrayStore,
            codegen::Operation::ArrayLoad => SerializableOperation::ArrayLoad,
            codegen::Operation::Label(id) => SerializableOperation::Label { id },
            codegen::Operation::Jump(target) => SerializableOperation::Jump { target },
            codegen::Operation::JumpIfTrue(target) => SerializableOperation::JumpIfTrue { target },
            codegen::Operation::JumpIfFalse(target) => {
                SerializableOperation::JumpIfFalse { target }
            }
            codegen::Operation::Equal => SerializableOperation::Equal,
            codegen::Operation::NotEqual => SerializableOperation::NotEqual,
            codegen::Operation::LessThan => SerializableOperation::LessThan,
            codegen::Operation::GreaterThan => SerializableOperation::GreaterThan,
            codegen::Operation::LessEqual => SerializableOperation::LessEqual,
            codegen::Operation::GreaterEqual => SerializableOperation::GreaterEqual,
            codegen::Operation::And => SerializableOperation::And,
            codegen::Operation::Or => SerializableOperation::Or,
            codegen::Operation::Not => SerializableOperation::Not,
            codegen::Operation::Input => SerializableOperation::Input,
            codegen::Operation::Output => SerializableOperation::Output,
            codegen::Operation::Call(name) => SerializableOperation::Call { name },
            codegen::Operation::Return => SerializableOperation::Return,
        }
    }
}

impl From<codegen::Operand> for SerializableOperand {
    fn from(op: codegen::Operand) -> Self {
        match op {
            codegen::Operand::IntLiteral(value) => SerializableOperand::IntLiteral { value },
            codegen::Operand::FloatLiteral(value) => SerializableOperand::FloatLiteral { value },
            codegen::Operand::StringLiteral(value) => SerializableOperand::StringLiteral { value },
            codegen::Operand::Variable(name) => SerializableOperand::Variable { name },
            codegen::Operand::TempVariable(name) => SerializableOperand::TempVariable { name },
            codegen::Operand::ArrayElement(name, index) => SerializableOperand::ArrayElement {
                name,
                index: Box::new((*index).into()),
            },
            codegen::Operand::Empty => SerializableOperand::Empty,
        }
    }
}

impl From<codegen::Quadruple> for SerializableQuadruple {
    fn from(q: codegen::Quadruple) -> Self {
        SerializableQuadruple {
            operation: q.operation.into(),
            operand1: q.operand1.into(),
            operand2: q.operand2.into(),
            result: q.result.into(),
        }
    }
}

impl From<codegen::QuadrupleProgram> for SerializableQuadrupleProgram {
    fn from(program: codegen::QuadrupleProgram) -> Self {
        SerializableQuadrupleProgram {
            quadruples: program.quadruples.into_iter().map(Into::into).collect(),
            next_temp: program.next_temp,
            next_label: program.next_label,
        }
    }
}

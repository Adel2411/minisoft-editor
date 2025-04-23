pub mod codegen;
pub mod compiler;
pub mod error_reporter;
pub mod lexer;
pub mod parser;
pub mod semantics;

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
        var: SerializableExpression,
        from: SerializableExpression,
        to: SerializableExpression,
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
    // Simply delegate to the compiler module's compile_code function
    crate::compiler::compile_code(code, verbose)
}

// Helper function to convert lexical error types
fn convert_lexical_error_type(
    err_type: &crate::lexer::error::LexicalErrorType,
) -> SerializableLexicalErrorType {
    match err_type {
        crate::lexer::error::LexicalErrorType::UnterminatedString => {
            SerializableLexicalErrorType::UnterminatedString
        }
        crate::lexer::error::LexicalErrorType::NonAsciiCharacters => {
            SerializableLexicalErrorType::NonAsciiCharacters
        }
        crate::lexer::error::LexicalErrorType::IdentifierTooLong => {
            SerializableLexicalErrorType::IdentifierTooLong
        }
        crate::lexer::error::LexicalErrorType::InvalidIdentifier => {
            SerializableLexicalErrorType::InvalidIdentifier
        }
        crate::lexer::error::LexicalErrorType::ConsecutiveUnderscores => {
            SerializableLexicalErrorType::ConsecutiveUnderscores
        }
        crate::lexer::error::LexicalErrorType::TrailingUnderscore => {
            SerializableLexicalErrorType::TrailingUnderscore
        }
        crate::lexer::error::LexicalErrorType::IdentifierStartsWithNumber => {
            SerializableLexicalErrorType::IdentifierStartsWithNumber
        }
        crate::lexer::error::LexicalErrorType::IntegerOutOfRange => {
            SerializableLexicalErrorType::IntegerOutOfRange
        }
        crate::lexer::error::LexicalErrorType::SignedNumberNotParenthesized => {
            SerializableLexicalErrorType::SignedNumberNotParenthesized
        }
        crate::lexer::error::LexicalErrorType::InvalidToken => {
            SerializableLexicalErrorType::InvalidToken
        }
    }
}

// Helper function to convert syntax errors
fn convert_syntax_error(err: &crate::parser::error::SyntaxError) -> SerializableSyntaxError {
    match err {
        crate::parser::error::SyntaxError::InvalidToken {
            position,
            message,
            line,
            column,
            ..
        } => SerializableSyntaxError::InvalidToken {
            position: *position,
            message: message.clone(),
            line: *line,
            column: *column,
        },
        crate::parser::error::SyntaxError::UnexpectedEOF {
            position,
            expected,
            line,
            column,
        } => SerializableSyntaxError::UnexpectedEOF {
            position: *position,
            expected: expected.clone(),
            line: *line,
            column: *column,
        },
        crate::parser::error::SyntaxError::UnexpectedToken {
            token,
            line,
            column,
            expected,
            ..
        } => SerializableSyntaxError::UnexpectedToken {
            token: token.clone(),
            expected: expected.clone(),
            line: *line,
            column: *column,
        },
        crate::parser::error::SyntaxError::ExtraToken {
            token,
            line,
            column,
            ..
        } => SerializableSyntaxError::ExtraToken {
            token: token.clone(),
            line: *line,
            column: *column,
        },
        crate::parser::error::SyntaxError::Custom(msg) => {
            SerializableSyntaxError::Custom(msg.clone())
        }
    }
}

// Helper function to convert semantic errors
fn convert_semantic_error(
    err: &crate::semantics::error::SemanticError,
) -> SerializableSemanticError {
    match err {
        crate::semantics::error::SemanticError::ArraySizeMismatch {
            name,
            expected,
            actual,
            line,
            column,
        } => SerializableSemanticError::ArraySizeMismatch {
            name: name.clone(),
            expected: *expected,
            actual: *actual,
            position: SerializableErrorPosition {
                line: *line,
                column: *column,
            },
        },
        crate::semantics::error::SemanticError::UndeclaredIdentifier { name, line, column } => {
            SerializableSemanticError::UndeclaredIdentifier {
                name: name.clone(),
                position: SerializableErrorPosition {
                    line: *line,
                    column: *column,
                },
            }
        }
        crate::semantics::error::SemanticError::DuplicateDeclaration {
            name,
            line,
            column,
            original_line,
            original_column,
        } => SerializableSemanticError::DuplicateDeclaration {
            name: name.clone(),
            position: SerializableErrorPosition {
                line: *line,
                column: *column,
            },
            original_position: SerializableErrorPosition {
                line: *original_line,
                column: *original_column,
            },
        },
        crate::semantics::error::SemanticError::TypeMismatch {
            expected,
            found,
            line,
            column,
            context,
        } => SerializableSemanticError::TypeMismatch {
            expected: expected.clone(),
            found: found.clone(),
            position: SerializableErrorPosition {
                line: *line,
                column: *column,
            },
            context: context.clone(),
        },
        crate::semantics::error::SemanticError::DivisionByZero { line, column } => {
            SerializableSemanticError::DivisionByZero {
                position: SerializableErrorPosition {
                    line: *line,
                    column: *column,
                },
            }
        }
        crate::semantics::error::SemanticError::ConstantModification { name, line, column } => {
            SerializableSemanticError::ConstantModification {
                name: name.clone(),
                position: SerializableErrorPosition {
                    line: *line,
                    column: *column,
                },
            }
        }
        crate::semantics::error::SemanticError::ArrayIndexOutOfBounds {
            name,
            index,
            size,
            line,
            column,
        } => SerializableSemanticError::ArrayIndexOutOfBounds {
            name: name.clone(),
            index: *index,
            size: *size,
            position: SerializableErrorPosition {
                line: *line,
                column: *column,
            },
        },
        crate::semantics::error::SemanticError::InvalidConditionValue {
            found,
            line,
            column,
        } => SerializableSemanticError::InvalidConditionValue {
            found: found.clone(),
            position: SerializableErrorPosition {
                line: *line,
                column: *column,
            },
        },
        crate::semantics::error::SemanticError::NonArrayIndexing {
            var_name,
            line,
            column,
        } => SerializableSemanticError::NonArrayIndexing {
            var_name: var_name.clone(),
            position: SerializableErrorPosition {
                line: *line,
                column: *column,
            },
        },
        crate::semantics::error::SemanticError::InvalidArraySize {
            name,
            size,
            line,
            column,
        } => SerializableSemanticError::InvalidArraySize {
            name: name.clone(),
            size: *size,
            position: SerializableErrorPosition {
                line: *line,
                column: *column,
            },
        },
        crate::semantics::error::SemanticError::EmptyProgram => {
            SerializableSemanticError::EmptyProgram
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
                StatementKind::For(var, from, to, step, body) => SerializableStatementKind::For {
                    var: var.into(),
                    from: from.into(),
                    to: to.into(),
                    step: step.into(),
                    body: body.into_iter().map(Into::into).collect(),
                },
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

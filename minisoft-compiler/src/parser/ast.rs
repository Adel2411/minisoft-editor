use std::ops::Range;

#[derive(Debug, Clone, PartialEq)]
pub struct Located<T> {
    pub node: T,
    pub span: Range<usize>,
}

impl<T> Located<T> {
    pub fn into_inner(self) -> T {
        self.node
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct Program {
    pub name: String,
    pub declarations: Vec<Declaration>,
    pub statements: Vec<Statement>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum DeclarationKind {
    Variable(Vec<String>, Type),
    Array(Vec<String>, Type, usize),
    VariableWithInit(Vec<String>, Type, Expression),
    ArrayWithInit(Vec<String>, Type, usize, Vec<Expression>),
    Constant(String, Type, Literal),
}

pub type Declaration = Located<DeclarationKind>;

/// Data types in MiniSoft
#[derive(Debug, Clone, PartialEq)]
pub enum Type {
    Int,
    Float,
    String,
}

impl Default for Type {
    fn default() -> Self {
        Type::Int
    }
}

impl Type {
    /// Determines if `self` can be implicitly converted to `target`.
    /// Returns true if the types are compatible for assignment or operation.
    pub fn is_compatible_with(&self, target: &Type) -> bool {
        match (self, target) {
            // Same types are always compatible
            (Type::Int, Type::Int) => true,
            (Type::Float, Type::Float) => true,
            (Type::String, Type::String) => true,
            
            // Int can be converted to Float
            // (Type::Int, Type::Float) => true,
            
            // All other combinations are incompatible
            _ => false,
        }
    }
}

impl std::fmt::Display for Type {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Type::Int => write!(f, "Int"),
            Type::Float => write!(f, "Float"),
            Type::String => write!(f, "String"),
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum StatementKind {
    Assignment(Expression, Expression),
    IfThen(Expression, Vec<Statement>),
    IfThenElse(Expression, Vec<Statement>, Vec<Statement>),
    DoWhile(Vec<Statement>, Expression),
    For(Expression, Expression, Expression, Expression, Vec<Statement>),
    Input(Expression),
    Output(Vec<Expression>),
    Scope(Vec<Statement>),
    Empty,
}

pub type Statement = Located<StatementKind>;

#[derive(Debug, Clone, PartialEq)]
pub enum ExpressionKind {
    Identifier(String),
    ArrayAccess(String, Box<Expression>),
    Literal(Literal),
    BinaryOp(Box<Expression>, Operator, Box<Expression>),
    UnaryOp(UnaryOperator, Box<Expression>),
}

pub type Expression = Located<ExpressionKind>;

#[derive(Debug, Clone, PartialEq)]
pub enum LiteralKind {
    Int(i32),
    Float(f32),
    String(String),
}

impl LiteralKind {
    pub fn literal_kind_to_type(&self) -> Type {
        match self {
            LiteralKind::Int(_) => Type::Int,
            LiteralKind::Float(_) => Type::Float,
            LiteralKind::String(_) => Type::String,
        }
    }

    pub fn format_literal(lit: &LiteralKind) -> String {
        match lit {
            LiteralKind::Int(i) => i.to_string(),
            LiteralKind::Float(f) => f.to_string(),
            LiteralKind::String(s) => format!("\"{}\"", s),
        }
    }
}

pub type Literal = Located<LiteralKind>;

/// Binary operators
#[derive(Debug, Clone, PartialEq)]
pub enum Operator {
    // Arithmetic
    Add,
    Subtract,
    Multiply,
    Divide,

    // Comparison
    GreaterThan,
    LessThan,
    GreaterEqual,
    LessEqual,
    Equal,
    NotEqual,

    // Logical
    And,
    Or,
}

#[derive(Debug, Clone, PartialEq)]
pub enum UnaryOperator {
    Not,
}

impl LiteralKind {
    /// Get the type of this literal
    pub fn get_type(&self) -> Type {
        match self {
            LiteralKind::Int(_) => Type::Int,
            LiteralKind::Float(_) => Type::Float,
            LiteralKind::String(_) => Type::String,
        }
    }
}
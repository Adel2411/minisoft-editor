use std::fmt;

/// Represents the type of operation in a quadruple
#[derive(Debug, Clone, PartialEq)]
pub enum Operation {
    // Arithmetic operations
    Add,
    Subtract,
    Multiply,
    Divide,
    
    // Assignment and memory operations
    Assign,
    ArrayStore,
    ArrayLoad,
    
    // Control flow operations
    Label(usize),
    Jump(usize),
    JumpIfTrue(usize),
    JumpIfFalse(usize),
    
    // Comparison operations
    Equal,
    NotEqual,
    LessThan,
    GreaterThan,
    LessEqual,
    GreaterEqual,
    
    // Logical operations
    And,
    Or,
    Not,
    
    // I/O operations
    Input,
    Output,
    
    // Function operations
    Call(String),
    Return,
}

/// Represents an operand in a quadruple
#[derive(Debug, Clone, PartialEq)]
pub enum Operand {
    IntLiteral(i32),
    FloatLiteral(f32),
    StringLiteral(String),
    Variable(String),            // Simple variable
    TempVariable(String),        // Compiler-generated temporary
    ArrayElement(String, Box<Operand>), // Array with index
    Empty,
}

/// A single quadruple with operation and operands
#[derive(Debug, Clone, PartialEq)]
pub struct Quadruple {
    pub operation: Operation,
    pub operand1: Operand,
    pub operand2: Operand,
    pub result: Operand,
}

/// Collection of quadruples representing a program
#[derive(Debug, Clone)]
pub struct QuadrupleProgram {
    pub quadruples: Vec<Quadruple>,
    pub next_temp: usize,
    pub next_label: usize,
}

impl QuadrupleProgram {
    /// Create a new empty quadruple program
    pub fn new() -> Self {
        QuadrupleProgram {
            quadruples: Vec::new(),
            next_temp: 1,
            next_label: 1,
        }
    }
    
    /// Add a quadruple to the program
    pub fn add(&mut self, quad: Quadruple) {
        self.quadruples.push(quad);
    }
    
    /// Generate a new temporary variable name
    pub fn new_temp(&mut self) -> Operand {
        let temp = format!("t{}", self.next_temp);
        self.next_temp += 1;
        Operand::TempVariable(temp)
    }
    
    /// Generate a new label identifier
    pub fn new_label(&mut self) -> usize {
        let label = self.next_label;
        self.next_label += 1;
        label
    }
}

impl fmt::Display for Operation {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Operation::Add => write!(f, "ADD"),
            Operation::Subtract => write!(f, "SUB"),
            Operation::Multiply => write!(f, "MUL"),
            Operation::Divide => write!(f, "DIV"),
            Operation::Assign => write!(f, "ASSIGN"),
            Operation::ArrayStore => write!(f, "ASTORE"),
            Operation::ArrayLoad => write!(f, "ALOAD"),
            Operation::Label(id) => write!(f, "LABEL_{}", id),
            Operation::Jump(id) => write!(f, "JUMP_{}", id),
            Operation::JumpIfTrue(id) => write!(f, "JMPT_{}", id),
            Operation::JumpIfFalse(id) => write!(f, "JMPF_{}", id),
            Operation::Equal => write!(f, "EQ"),
            Operation::NotEqual => write!(f, "NEQ"),
            Operation::LessThan => write!(f, "LT"),
            Operation::GreaterThan => write!(f, "GT"),
            Operation::LessEqual => write!(f, "LE"),
            Operation::GreaterEqual => write!(f, "GE"),
            Operation::And => write!(f, "AND"),
            Operation::Or => write!(f, "OR"),
            Operation::Not => write!(f, "NOT"),
            Operation::Input => write!(f, "INPUT"),
            Operation::Output => write!(f, "OUTPUT"),
            Operation::Call(name) => write!(f, "CALL_{}", name),
            Operation::Return => write!(f, "RETURN"),
        }
    }
}

impl fmt::Display for Operand {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Operand::IntLiteral(val) => write!(f, "{}", val),
            Operand::FloatLiteral(val) => write!(f, "{}", val),
            Operand::StringLiteral(val) => write!(f, "\"{}\"", val),
            Operand::Variable(name) => write!(f, "{}", name),
            Operand::TempVariable(name) => write!(f, "{}", name),
            Operand::ArrayElement(name, idx) => write!(f, "{}[{}]", name, idx),
            Operand::Empty => write!(f, "_"),
        }
    }
}

impl fmt::Display for Quadruple {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "({}, {}, {}, {})", 
               self.operation, self.operand1, self.operand2, self.result)
    }
}
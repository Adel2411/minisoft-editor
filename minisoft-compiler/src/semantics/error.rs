use crate::error_reporter::format_code_context;
use crate::error_reporter::ErrorReporter;
use colored::Colorize;
use std::fmt;

#[derive(Debug)]
pub enum SemanticError {
    /// Array size and declaration mismatch
    ArraySizeMismatch {
        name: String,
        expected: usize,
        actual: usize,
        line: usize,
        column: usize,
    },

    /// Variable not declared before use
    UndeclaredIdentifier {
        name: String,
        line: usize,
        column: usize,
    },

    /// Variable declared multiple times
    DuplicateDeclaration {
        name: String,
        line: usize,
        column: usize,
        original_line: usize,
        original_column: usize,
    },

    /// Type mismatch in operations or assignments
    TypeMismatch {
        expected: String,
        found: String,
        line: usize,
        column: usize,
        context: Option<String>,
    },

    /// Division by zero
    DivisionByZero {
        line: usize,
        column: usize,
    },

    /// Attempt to modify a constant
    ConstantModification {
        name: String,
        line: usize,
        column: usize,
    },
    ArrayIndexOutOfBounds {
        name: String,
        index: usize,
        size: usize,
        line: usize,
        column: usize,
    },
    InvalidConditionValue {
        found: String,
        line: usize,
        column: usize,
    },
    NonArrayIndexing {
        var_name: String,
        line: usize,
        column: usize,
    },
    InvalidArraySize {
        name: String,
        size: i32,
        line: usize,
        column: usize,
    },
    EmptyProgram,
}

impl ErrorReporter for SemanticError {
    fn report(&self, source_code: Option<&str>) -> String {
        let mut result = String::new();

        result.push_str(&format!(
            "{}: {}\n",
            "Semantic Error".red().bold(),
            self.get_detailed_message()
        ));

        let (line, column) = self.get_location_info();
        result.push_str(&format!(
            "{} line {}, column {}\n",
            "-->".blue(),
            line,
            column
        ));

        if let Some(source) = source_code {
            let lines: Vec<&str> = source.lines().collect();
            if line <= lines.len() && line > 0 {
                let line_content = lines[line - 1];

                if let SemanticError::DuplicateDeclaration { original_line, .. } = self {
                    result.push_str(&format_code_context(
                        line_content,
                        column,
                        self.get_token_length(),
                    ));

                    if *original_line <= lines.len() {
                        let original_content = lines[original_line - 1];
                        result.push_str(&format!(
                            "\n{} {}\n",
                            "First declared at line:".yellow(),
                            original_line
                        ));
                        result.push_str(&format!("{}{}\n", " | ".blue(), original_content));
                    }
                } else {
                    result.push_str(&format_code_context(
                        line_content,
                        column,
                        self.get_token_length(),
                    ));
                }
            }
        }

        if let Some(suggestion) = self.get_suggestion() {
            result.push_str(&format!("{}: {}\n", "Suggestion".cyan().bold(), suggestion));
        }

        result
    }

    fn get_suggestion(&self) -> Option<String> {
        match self {
            SemanticError::ArraySizeMismatch {
                name,
                expected,
                actual,
                ..
            } => Some(format!(
                "Consider adjusting '{}' from size {} to {}.",
                expected, actual, name
            )),
            SemanticError::UndeclaredIdentifier { name, .. } => {
                Some(format!("Declare variable '{}' before using it", name))
            }
            SemanticError::DuplicateDeclaration { name, .. } => Some(format!(
                "Use a different name for the second declaration of '{}'",
                name
            )),
            SemanticError::TypeMismatch {
                expected,
                found,
                context,
                ..
            } => match context {
                Some(ctx) if ctx == "assignment" => Some(format!(
                    "Make sure the types match. Try converting from '{}' to '{}'",
                    found, expected
                )),
                Some(ctx) if ctx == "condition" => Some(format!(
                    "Conditions must be of boolean type, found '{}' instead",
                    found
                )),
                Some(ctx) if ctx == "arithmetic" => Some(format!(
                    "Cannot perform arithmetic operation between '{}' and '{}'",
                    expected, found
                )),
                _ => Some(format!(
                    "Expected type '{}', but found '{}'. Consider adding a type conversion",
                    expected, found
                )),
            },
            SemanticError::DivisionByZero { .. } => {
                Some("Check for division by zero or ensure denominators are non-zero".to_string())
            }
            SemanticError::ConstantModification { name, .. } => Some(format!(
                "'{}' is a constant and cannot be modified. Consider using a variable instead",
                name
            )),
            SemanticError::ArrayIndexOutOfBounds { name, size, .. } => Some(format!(
                "Array '{}' has size {}. Use indices from 0 to {}",
                name,
                size,
                size - 1
            )),
            SemanticError::NonArrayIndexing { var_name, .. } => Some(format!(
                "'{}' is not an array. Use a valid array variable",
                var_name
            )),
            SemanticError::InvalidConditionValue { found, .. } => {
                Some(format!("Condition must return 1 or 0, found '{}'", found))
            }
            SemanticError::InvalidArraySize { name, .. } => {
                Some(format!("Declare array '{}' with a positive size", name))
            }
            SemanticError::EmptyProgram => Some("Program is empty. Add some code.".to_string()),
        }
    }

    fn get_error_name(&self) -> String {
        "Semantic Error".to_string()
    }

    fn get_location_info(&self) -> (usize, usize) {
        match self {
            SemanticError::ArraySizeMismatch { line, column, .. } => (*line, *column),
            SemanticError::UndeclaredIdentifier { line, column, .. } => (*line, *column),
            SemanticError::DuplicateDeclaration { line, column, .. } => (*line, *column),
            SemanticError::TypeMismatch { line, column, .. } => (*line, *column),
            SemanticError::DivisionByZero { line, column } => (*line, *column),
            SemanticError::ConstantModification { line, column, .. } => (*line, *column),
            SemanticError::ArrayIndexOutOfBounds { line, column, .. } => (*line, *column),
            SemanticError::InvalidConditionValue { line, column, .. } => (*line, *column),
            SemanticError::NonArrayIndexing { line, column, .. } => (*line, *column),
            SemanticError::InvalidArraySize { line, column, .. } => (*line, *column),
            SemanticError::EmptyProgram => (0, 0),
        }
    }
}

impl SemanticError {
    fn get_detailed_message(&self) -> String {
        match self {
            SemanticError::ArraySizeMismatch {
                name,
                expected,
                actual,
                ..
            } => format!(
                "Array size mismatch for '{}': expected {}, found {}",
                name, expected, actual
            ),
            SemanticError::UndeclaredIdentifier { name, .. } => {
                format!("Undeclared identifier '{}'", name)
            }
            SemanticError::DuplicateDeclaration {
                name,
                original_line,
                original_column,
                ..
            } => {
                format!(
                    "Duplicate declaration of '{}' (originally declared at line {}, column {})",
                    name, original_line, original_column
                )
            }
            SemanticError::TypeMismatch {
                expected,
                found,
                context,
                ..
            } => match context {
                Some(ctx) => format!(
                    "Type mismatch in {}: expected {}, found {}",
                    ctx, expected, found
                ),
                None => format!("Type mismatch: expected {}, found {}", expected, found),
            },
            SemanticError::DivisionByZero { .. } => "Division by zero detected".to_string(),
            SemanticError::ConstantModification { name, .. } => {
                format!("Attempt to modify constant '{}'", name)
            }
            SemanticError::ArrayIndexOutOfBounds {
                name, index, size, ..
            } => {
                format!(
                    "Array index out of bounds: index {} exceeds size {} for array '{}'",
                    index, size, name
                )
            }
            SemanticError::InvalidConditionValue { found, .. } => {
                format!(
                    "Invalid condition value: expected 1 or 0, found '{}'",
                    found
                )
            }
            SemanticError::NonArrayIndexing { var_name, .. } => {
                format!("Attempt to index non-array variable '{}'", var_name)
            }
            SemanticError::InvalidArraySize { name, size, .. } => {
                format!(
                    "Invalid array size: {} for array '{}'. Array size must be positive",
                    size, name
                )
            }
            SemanticError::EmptyProgram => "Program is empty. Add some code.".to_string(),
        }
    }

    fn get_token_length(&self) -> usize {
        match self {
            SemanticError::ArraySizeMismatch { name, .. } => name.len(),
            SemanticError::UndeclaredIdentifier { name, .. } => name.len(),
            SemanticError::DuplicateDeclaration { name, .. } => name.len(),
            SemanticError::TypeMismatch { .. } => 1, // Default token length
            SemanticError::DivisionByZero { .. } => 1,
            SemanticError::ConstantModification { name, .. } => name.len(),
            SemanticError::ArrayIndexOutOfBounds { name, .. } => name.len(),
            SemanticError::InvalidConditionValue { found, .. } => found.len(),
            SemanticError::NonArrayIndexing { var_name, .. } => var_name.len(),
            SemanticError::InvalidArraySize { name, .. } => name.len(),
            SemanticError::EmptyProgram => 0,
        }
    }
}

impl fmt::Display for SemanticError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.report(None))
    }
}

impl std::error::Error for SemanticError {}

use crate::error_reporter::{ErrorReporter, format_code_context};
use colored::Colorize;
use lalrpop_util::ParseError;
use std::fmt;

#[derive(Debug)]
pub enum SyntaxError {
    InvalidToken {
        position: usize,
        message: String,
        source_line: Option<String>,
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
        position: (usize, usize),
        expected: Vec<String>,
        source_line: Option<String>,
        line: usize,
        column: usize,
    },
    ExtraToken {
        token: String,
        position: (usize, usize),
        source_line: Option<String>,
        line: usize,
        column: usize,
    },
    Custom(String),
}

impl ErrorReporter for SyntaxError {
    fn report(&self, source_code: Option<&str>) -> String {
        let mut result = String::new();

        match self {
            SyntaxError::InvalidToken {
                message,
                line,
                column,
                source_line,
                ..
            } => {
                result.push_str(&format!("{}: {}\n", "Syntax Error".red().bold(), message));

                result.push_str(&format!(
                    "{} line {}, column {}\n",
                    "-->".blue(),
                    line,
                    column
                ));

                // Source context if available
                if let Some(source) = source_line.clone().or_else(|| {
                    source_code.map(|s| {
                        let lines: Vec<&str> = s.lines().collect();
                        if *line <= lines.len() {
                            lines[line - 1].to_owned()
                        } else {
                            String::new()
                        }
                    })
                }) {
                    result.push_str(&format_code_context(&source, *column, 1));
                }
            }
            SyntaxError::UnexpectedEOF {
                expected,
                line,
                column,
                ..
            } => {
                result.push_str(&format!(
                    "{}: {}\n",
                    "Syntax Error".red().bold(),
                    "Unexpected end of file"
                ));

                result.push_str(&format!(
                    "{} line {}, column {}\n",
                    "-->".blue(),
                    line,
                    column
                ));

                if let Some(source) = source_code {
                    let lines: Vec<&str> = source.lines().collect();
                    if *line <= lines.len() {
                        let line_content = lines[line - 1];
                        result.push_str(&format_code_context(line_content, *column, 1));
                    }
                }

                if !expected.is_empty() {
                    result.push_str(&format!(
                        "Expected one of: {}\n",
                        expected.join(", ").yellow()
                    ));
                }
            }
            SyntaxError::UnexpectedToken {
                token,
                expected,
                line,
                column,
                source_line,
                ..
            } => {
                result.push_str(&format!(
                    "{}: {}\n",
                    "Syntax Error".red().bold(),
                    format!("Unexpected token '{}'", token)
                ));

                result.push_str(&format!(
                    "{} line {}, column {}\n",
                    "-->".blue(),
                    line,
                    column
                ));

                if let Some(source) = source_line.clone().or_else(|| {
                    source_code.map(|s| {
                        let lines: Vec<&str> = s.lines().collect();
                        if *line <= lines.len() {
                            lines[line - 1].to_owned()
                        } else {
                            String::new()
                        }
                    })
                }) {
                    result.push_str(&format_code_context(&source, *column, 1));
                }

                if !expected.is_empty() {
                    result.push_str(&format!(
                        "Expected one of: {}\n",
                        expected.join(", ").yellow()
                    ));
                }
            }
            SyntaxError::ExtraToken {
                token,
                line,
                column,
                source_line,
                ..
            } => {
                result.push_str(&format!(
                    "{}: {}\n",
                    "Syntax Error".red().bold(),
                    format!("Extra token '{}' found", token)
                ));

                result.push_str(&format!(
                    "{} line {}, column {}\n",
                    "-->".blue(),
                    line,
                    column
                ));
                if let Some(source) = source_line.clone().or_else(|| {
                    source_code.map(|s| {
                        let lines: Vec<&str> = s.lines().collect();
                        if *line <= lines.len() {
                            lines[line - 1].to_owned()
                        } else {
                            String::new()
                        }
                    })
                }) {
                    result.push_str(&format_code_context(&source, *column, 1));
                }
            }
            SyntaxError::Custom(message) => {
                result.push_str(&format!("{}: {}\n", "Syntax Error".red().bold(), message));
            }
        }

        // Add suggestion if available
        if let Some(suggestion) = self.get_suggestion() {
            result.push_str(&format!("{}: {}\n", "Suggestion".cyan().bold(), suggestion));
        }

        result
    }

    fn get_suggestion(&self) -> Option<String> {
        match self {
            SyntaxError::InvalidToken { message, .. } => {
                if message.contains("invalid character") {
                    Some("Check for invalid characters or symbols in your code".to_string())
                } else {
                    Some("Review the syntax at this location".to_string())
                }
            }
            SyntaxError::UnexpectedEOF { expected, .. } => {
                if expected.len() == 1 {
                    Some(format!("Add a '{}' to complete the statement", expected[0]))
                } else if !expected.is_empty() {
                    Some(format!(
                        "File ends abruptly. Complete the code with one of: {}",
                        expected.join(", ")
                    ))
                } else {
                    Some(
                        "Code ends unexpectedly. Check for unclosed blocks or missing tokens"
                            .to_string(),
                    )
                }
            }
            SyntaxError::UnexpectedToken {
                token, expected, ..
            } => {
                // Check for common syntax mistakes
                if token == ";" && expected.contains(&"')'".to_string()) {
                    Some("You may have an unbalanced parenthesis before this semicolon".to_string())
                } else if token == "}" && expected.contains(&"';'".to_string()) {
                    Some(
                        "Missing semicolon at the end of statement before this closing brace"
                            .to_string(),
                    )
                } else if expected.len() == 1 {
                    Some(format!(
                        "Replace '{}' with '{}'",
                        token,
                        expected[0].trim_matches('\'')
                    ))
                } else {
                    Some(format!(
                        "Expected one of [{}] instead of '{}'",
                        expected
                            .iter()
                            .map(|s| s.trim_matches('\''))
                            .collect::<Vec<_>>()
                            .join(", "),
                        token
                    ))
                }
            }
            SyntaxError::ExtraToken { token, .. } => {
                Some(format!("Remove the extra token '{}'", token))
            }
            SyntaxError::Custom(_) => None,
        }
    }

    fn get_error_name(&self) -> String {
        "Syntax Error".to_string()
    }

    fn get_location_info(&self) -> (usize, usize) {
        match self {
            SyntaxError::InvalidToken { line, column, .. } => (*line, *column),
            SyntaxError::UnexpectedEOF { line, column, .. } => (*line, *column),
            SyntaxError::UnexpectedToken { line, column, .. } => (*line, *column),
            SyntaxError::ExtraToken { line, column, .. } => (*line, *column),
            SyntaxError::Custom(_) => (0, 0),
        }
    }
}

impl fmt::Display for SyntaxError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.report(None))
    }
}

impl std::error::Error for SyntaxError {}

// Function to convert LALRPOP errors to your custom error type
pub fn convert_lalrpop_error<T>(
    error: ParseError<usize, T, String>,
    source_code: Option<&str>,
) -> SyntaxError
where
    T: ToString,
{
    let get_position_info = |pos: usize| -> (usize, usize, Option<String>) {
        if let Some(code) = source_code {
            let mut line = 1;
            let mut line_start = 0;

            for (i, c) in code.char_indices() {
                if i >= pos {
                    break;
                }
                if c == '\n' {
                    line += 1;
                    line_start = i + 1;
                }
            }

            let column = pos - line_start + 1;

            // Get the source line
            let source_line = code.lines().nth(line - 1).map(String::from);

            (line, column, source_line)
        } else {
            (1, pos + 1, None)
        }
    };

    match error {
        ParseError::InvalidToken { location } => {
            let (line, column, source_line) = get_position_info(location);
            SyntaxError::InvalidToken {
                position: location,
                message: "Invalid token found".to_string(),
                source_line,
                line,
                column,
            }
        }
        ParseError::UnrecognizedEof { location, expected } => {
            let (line, column, _) = get_position_info(location);
            SyntaxError::UnexpectedEOF {
                position: location,
                expected,
                line,
                column,
            }
        }
        ParseError::UnrecognizedToken {
            token: (start, token, end),
            expected,
        } => {
            let (line, column, source_line) = get_position_info(start);
            if expected.is_empty() {
                SyntaxError::ExtraToken {
                    token: token.to_string(),
                    position: (start, end),
                    source_line,
                    line,
                    column,
                }
            } else {
                SyntaxError::UnexpectedToken {
                    token: token.to_string(),
                    position: (start, end),
                    expected,
                    source_line,
                    line,
                    column,
                }
            }
        }
        ParseError::ExtraToken {
            token: (start, token, end),
        } => {
            let (line, column, source_line) = get_position_info(start);
            SyntaxError::ExtraToken {
                token: token.to_string(),
                position: (start, end),
                source_line,
                line,
                column,
            }
        }
        ParseError::User { error } => SyntaxError::Custom(error),
    }
}


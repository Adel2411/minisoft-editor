use colored::Colorize;

pub fn format_code_context(source_line: &str, column: usize, token_length: usize) -> String {
    let mut result: String = String::new();
    
    // Source code line
    result.push_str(&format!("{}{}\n", " | ".blue(), source_line));
    
    // Error indicator pointing to the exact column
    let mut pointer = String::new();
    for _ in 0..column.saturating_sub(1) {
        pointer.push(' ');
    }
    
    // Create underline of appropriate length for the token
    let length = token_length.max(1);
    let mut underline = "^".to_string();
    for _ in 1..length {
        underline.push('~');
    }
    
    result.push_str(&format!(" | {}{}\n", " ".repeat(column.saturating_sub(1)), 
                            underline.bright_red().bold()));
    
    result
}

pub trait ErrorReporter {
    fn report(&self, source_code: Option<&str>) -> String;
    fn get_suggestion(&self) -> Option<String>;
    fn get_error_name(&self) -> String;
    fn get_location_info(&self) -> (usize, usize);
}

pub struct ErrorReportFormatter;

impl ErrorReportFormatter {

    pub fn print_errors<E: ErrorReporter>(errors: &[E], source_code: Option<&str>) {
        println!("{} {} error(s) found\n", 
            "Error:".red().bold(), 
            errors.len());
        
        for (_i, error) in errors.iter().enumerate() {
            
            let report = error.report(source_code);
            for line in report.lines() {
                println!("      {}", line);
            }
            
            println!(); // Add spacing between errors
        }
    }
}
use crate::codegen::generator::CodeGenerator;
use crate::codegen::quadruple::QuadrupleProgram;
use crate::error_reporter::ErrorReportFormatter;
use crate::lexer::lexer_core::{tokenize, TokenWithMetaData};
use crate::parser::ast::{LiteralKind, Program};
use crate::parser::parser_core::parse;
use crate::semantics::symbol_table::SymbolValue;
use crate::semantics::{symbol_table::SymbolKind, SemanticAnalyzer};
use colored::*;
use std::fs;

pub struct Compiler {
    source_code: String,
    file_path: String,
    quadruples: Option<QuadrupleProgram>,
}

// First, add a new struct to hold all compilation artifacts
pub struct CompilationResult {
    pub tokens: Vec<TokenWithMetaData>,
    pub ast: Program,
    pub symbol_table: Vec<crate::semantics::symbol_table::Symbol>,
    pub quadruples: QuadrupleProgram,
}

impl Compiler {
    pub fn new(file_path: &str) -> Result<Self, String> {
        match fs::read_to_string(file_path) {
            Ok(content) => Ok(Self {
                source_code: content,
                file_path: file_path.to_string(),
                quadruples: None,
            }),
            Err(e) => Err(format!("Error reading file '{}': {}", file_path, e)),
        }
    }

    // Update the run method to return compilation artifacts
    pub fn run(&mut self) -> Result<CompilationResult, i32> {
        println!("Compiling file: {}", self.file_path);
        self.print_source_code();

        // Step 1: Lexical Analysis
        let tokens = self.lexical_analysis()?;

        // Step 2: Syntax Analysis
        let ast = self.syntax_analysis(tokens.clone())?;

        // Step 3: Semantic Analysis
        let mut analyzer = SemanticAnalyzer::new(&self.source_code);
        analyzer.analyze(&ast);

        // Check for semantic errors
        let semantic_errors = analyzer.get_errors();
        if !semantic_errors.is_empty() {
            println!("{}", "Semantic Errors Detected:".red().bold());
            ErrorReportFormatter::print_errors(semantic_errors, Some(&self.source_code));
            return Err(1);
        }

        println!("{}", "Semantic analysis completed successfully.".green());
        self.print_symbol_table(&analyzer);

        // Step 4: Code Generation
        println!("\n{}", "Code Generation:".bold().underline());
        let mut code_generator = CodeGenerator::new();
        let quadruples = code_generator.generate_code(&ast).unwrap();

        // Print the generated quadruples
        self.print_quadruples_from(&quadruples);
        println!("{}", "Code generation completed successfully.".green());

        // Create owned symbols by cloning each symbol from the references
        let symbols = analyzer
            .get_symbol_table()
            .get_all()
            .iter()
            .map(|symbol| (*symbol).clone())
            .collect();

        // Return all compiled artifacts
        Ok(CompilationResult {
            tokens,
            ast,
            symbol_table: symbols,
            quadruples,
        })
    }

    // Add a new helper method to print quadruples from a parameter
    fn print_quadruples_from(&self, quadruples: &QuadrupleProgram) {
        println!("{}", "Generated Quadruples:".bold().underline());
        for (i, quad) in quadruples.quadruples.iter().enumerate() {
            let index_str = format!(" {:<4}", i);
            let index = if i % 2 == 0 {
                index_str.blue()
            } else {
                index_str.green()
            };
            println!("{}│ {}", index, quad);
        }
    }

    // Use this method to print quadruples from self.quadruples
    fn print_quadruples(&self) {
        if let Some(quadruples) = &self.quadruples {
            self.print_quadruples_from(quadruples);
        }
    }

    fn lexical_analysis(&mut self) -> Result<Vec<TokenWithMetaData>, i32> {
        println!("{}: ", "Lexical Analysis".bold().underline());
        // Tokenize the source code and capture lexical errors
        let (valid_tokens, errors) = tokenize(&self.source_code);

        // Check for lexical errors
        if !errors.is_empty() {
            println!("{}", "Lexical Errors Detected:".red().bold());
            ErrorReportFormatter::print_errors(&errors, Some(&self.source_code));
            return Err(1);
        }

        self.print_tokens(&valid_tokens);
        println!(
            "{}",
            "Lexical analysis completed successfully.".green().bold()
        );
        Ok(valid_tokens)
    }

    fn syntax_analysis(
        &mut self,
        tokens: Vec<TokenWithMetaData>,
    ) -> Result<crate::parser::ast::Program, i32> {
        println!("\n{} :", "Syntax Analysis".bold().underline());
        println!("{} :", "Parsing".bold().underline());

        // Parse tokens into an AST
        match parse(tokens, &self.source_code) {
            Ok(program) => {
                self.print_ast(&program);
                println!("{}", "Parsing completed successfully.".green().bold());
                Ok(program)
            }
            Err(parse_error) => {
                println!("{}", "Parser Error Detected:".red().bold());
                ErrorReportFormatter::print_errors(&[parse_error], Some(&self.source_code));
                return Err(1);
            }
        }
    }

    fn semantic_analysis(&mut self, program: &crate::parser::ast::Program) -> Result<(), i32> {
        println!("\n{}", "Semantic Analysis:".bold().underline());

        // Create analyzer with source code for span-to-line/column conversion
        let mut analyzer = SemanticAnalyzer::new(&self.source_code);
        analyzer.analyze(program);

        // Check for semantic errors
        let semantic_errors = analyzer.get_errors();
        if !semantic_errors.is_empty() {
            println!("{}", "Semantic Errors Detected:".red().bold());
            ErrorReportFormatter::print_errors(&semantic_errors, Some(&self.source_code));
            Err(1)
        } else {
            println!("{}", "analysis completed successfully.".green());
            self.print_symbol_table(&analyzer);
            Ok(())
        }
    }

    fn code_generation(&mut self, program: &Program) -> Result<(), i32> {
        println!("\n{}", "Code Generation:".bold().underline());

        let mut code_generator = CodeGenerator::new();

        // Store the generated quadruples
        self.quadruples = code_generator.generate_code(program);

        // Print the generated quadruples
        self.print_quadruples();

        println!("{}", "Code generation completed successfully.".green());
        Ok(())
    }

    fn print_source_code(&self) {
        println!("{}", "Source code:".bold().underline());
        println!("{}\n", self.source_code);
    }

    fn print_tokens(&self, tokens: &[TokenWithMetaData]) {
        println!("{}", "Tokens:".bold().underline());
        for token_with_pos in tokens {
            let token_name = format!("{:?}", token_with_pos.kind).green();
            let token_value = token_with_pos.value.yellow();
            let position = format!(
                "Line {}, Col {}",
                token_with_pos.line, token_with_pos.column
            )
            .blue();
            let span = format!("{:?}", token_with_pos.span).magenta();

            println!(
                "{}  →  {}  {}  [span: {}]",
                token_name, token_value, position, span
            );
        }
    }

    fn print_ast(&self, ast: &Program) {
        println!("{}", "AST:".green());
        ast.pretty_print();
    }

    fn print_symbol_table(&self, analyzer: &SemanticAnalyzer) {
        println!("\n{}", "Symbol Table:".bold().underline());
        let symbol_table = analyzer.get_symbol_table();
        for symbol in symbol_table.get_all() {
            let kind = match &symbol.kind {
                SymbolKind::Variable => "Variable".cyan(),
                SymbolKind::Constant => "Constant".yellow(),
                SymbolKind::Array(size) => format!("Array[{}]", size).magenta(),
            };

            let value = match &symbol.value {
                SymbolValue::Single(lit) => format!("{}", LiteralKind::format_literal(lit))
                    .green()
                    .to_string(),
                SymbolValue::Array(values) => {
                    if values.is_empty() {
                        "[]".dimmed().to_string()
                    } else {
                        let elements: Vec<String> = values
                            .iter()
                            .map(|v| LiteralKind::format_literal(v))
                            .collect();
                        format!("[{}]", elements.join(", ")).green().to_string()
                    }
                }
                SymbolValue::Uninitialized => "<uninitialized>".dimmed().to_string(),
            };

            println!(
                "{} {} {} = {} (line {}, col {})",
                kind,
                symbol.name.white(),
                format!("({})", symbol.symbol_type).blue(),
                value,
                symbol.line,
                symbol.column
            );
        }
    }
}

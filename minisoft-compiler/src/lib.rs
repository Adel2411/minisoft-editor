pub mod codegen;
pub mod compiler;
pub mod error_reporter;
pub mod lexer;
pub mod parser;
pub mod semantics;

use compiler::{CompilationResult, Compiler};
use serde::{Deserialize, Serialize};

// First, let's create a serializable version of CompilationResult
#[derive(Serialize, Deserialize)]
pub struct SerializableCompilationResult {
    pub tokens: Vec<SerializableToken>,
    pub ast: String, // AST serialized as string
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
                .map(|result| convert_to_serializable(result))
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

        // Format AST as string
        ast: format!("{:#?}", result.ast),

        // Convert symbols
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

        // Convert quadruples to strings
        quadruples: result
            .quadruples
            .quadruples
            .into_iter()
            .map(|q| q.to_string())
            .collect(),
    }
}

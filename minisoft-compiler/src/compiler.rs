use crate::error_reporter::ErrorReporter;
use crate::{SerializableCompilationResult, SerializableToken, SerializableProgram, 
           SerializableCompilationErrors, SerializableLexicalError, SerializableErrorPosition,
           SerializableSymbol, SerializableQuadrupleProgram};




pub fn compile_code(code: String, verbose: bool) -> Result<SerializableCompilationResult, String> {
    if verbose {
        println!("Starting compilation in verbose mode");
    }

    // Step 1: Lexical Analysis
    let (tokens, lexical_errors) = crate::lexer::lexer_core::tokenize(&code);
    
    if !lexical_errors.is_empty() {
        // Return lexical errors
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
                lexical_errors: lexical_errors
                    .iter()
                    .map(|e| SerializableLexicalError {
                        error_type: crate::convert_lexical_error_type(&e.error_type),
                        invalid_token: e.invalid_token.clone(),
                        position: SerializableErrorPosition {
                            line: e.line,
                            column: e.column,
                        },
                        message: e.get_error_description(),
                        suggestion: e.get_suggestion(),
                    })
                    .collect(),
                syntax_errors: vec![],
                semantic_errors: vec![],
            }),
        });
    }

    // Step 2: Syntax Analysis
    let ast_result = crate::parser::parser_core::parse(tokens.clone(), &code);
    
    if let Err(syntax_error) = &ast_result {
        // Return syntax error
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
                syntax_errors: vec![crate::convert_syntax_error(syntax_error)],
                semantic_errors: vec![],
            }),
        });
    }

    // Step 3: Semantic Analysis
    let ast = ast_result.unwrap();
    let mut analyzer = crate::semantics::SemanticAnalyzer::new(&code);
    analyzer.analyze(&ast);
    let semantic_errors = analyzer.get_errors();

    if !semantic_errors.is_empty() {
        // Return semantic errors
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
            ast: ast.into(),
            symbol_table: analyzer
                .get_symbol_table()
                .get_all()
                .iter()
                .map(|s| SerializableSymbol {
                    name: s.name.clone(),
                    kind: format!("{:?}", s.kind),
                    symbol_type: s.symbol_type.to_string(),
                    value: format!("{:?}", s.value),
                    line: s.line,
                    column: s.column,
                })
                .collect(),
            quadruples: SerializableQuadrupleProgram {
                quadruples: vec![],
                next_temp: 0,
                next_label: 0,
            },
            errors: Some(SerializableCompilationErrors {
                lexical_errors: vec![],
                syntax_errors: vec![],
                semantic_errors: semantic_errors
                    .iter()
                    .map(|e| crate::convert_semantic_error(e))
                    .collect(),
            }),
        });
    }

    // If we reach here, no errors were found - proceed with code generation
    let mut code_generator = crate::codegen::generator::CodeGenerator::new();
    let quadruples = match code_generator.generate_code(&ast) {
        Some(quads) => quads,
        None => return Err("Code generation failed".to_string()),
    };

    // All successful - return the complete compilation result
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
        symbol_table: analyzer
            .get_symbol_table()
            .get_all()
            .iter()
            .map(|s| SerializableSymbol {
                name: s.name.clone(),
                kind: format!("{:?}", s.kind),
                symbol_type: s.symbol_type.to_string(),
                value: format!("{:?}", s.value),
                line: s.line,
                column: s.column,
            })
            .collect(),
        quadruples: quadruples.into(),
        errors: None, // No errors on success
    })
}

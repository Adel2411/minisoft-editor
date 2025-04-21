#[cfg(test)]
mod integration_test {
    use rust_compiler::lexer::lexer_core::tokenize;
    use rust_compiler::parser::parser_core::parse;
    use rust_compiler::semantics::analyzer_core::SemanticAnalyzer;
    use std::fs;

    #[test]
    fn test_valid_sample_program() {
        let test_file_path = "examples/valid/sample_program.ms";
        let input = fs::read_to_string(test_file_path).expect("Failed to read test file");
        let tokens = tokenize(&input);
        let program = parse(tokens.0, &input).expect("Parse error");
        let mut analyzer = SemanticAnalyzer::new(&input);
        analyzer.analyze(&program);
        let errors = analyzer.get_errors();
        assert!(errors.is_empty(), "Expected no errors, found: {:?}", errors);
    }

    #[test]
    fn test_invalid_sample_program() {
        let test_file_path = "examples/invalid/errors_sample.ms";
        let input = fs::read_to_string(test_file_path).expect("Failed to read test file");
        let tokens = tokenize(&input);
        let program = parse(tokens.0, &input).expect("Parse error");
        let mut analyzer = SemanticAnalyzer::new(&input);
        analyzer.analyze(&program);
        let errors = analyzer.get_errors();
        assert!(!errors.is_empty(), "Expected errors, found none");
    }

    #[test]
    fn test_all_valid_examples() {
        let paths = fs::read_dir("examples/valid").unwrap();
        for entry in paths {
            let path = entry.unwrap().path();
            if path.extension().map(|s| s == "ms").unwrap_or(false) {
                let input = fs::read_to_string(&path).unwrap();
                let tokens = tokenize(&input);
                let program = parse(tokens.0, &input).expect("Parse error");
                let mut analyzer = SemanticAnalyzer::new(&input);
                analyzer.analyze(&program);
                let errors = analyzer.get_errors();
                assert!(errors.is_empty(), "File {:?} failed: {:?}", path, errors);
            }
        }
    }

    #[test]
    fn test_all_invalid_examples() {
        let paths = fs::read_dir("examples/invalid").unwrap();
        for entry in paths {
            let path = entry.unwrap().path();
            if path.extension().map(|s| s == "ms").unwrap_or(false) {
                let input = fs::read_to_string(&path).unwrap();
                let tokens = tokenize(&input);
                let program = parse(tokens.0, &input).expect("Parse error");
                let mut analyzer = SemanticAnalyzer::new(&input);
                analyzer.analyze(&program);
                let errors = analyzer.get_errors();
                assert!(!errors.is_empty(), "File {:?} should have errors", path);
            }
        }
    }
}

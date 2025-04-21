#[cfg(test)]
mod semantic_tests {
    use rust_compiler::lexer::lexer_core::tokenize;
    use rust_compiler::parser::parser_core::parse;
    use rust_compiler::semantics::analyzer_core::SemanticAnalyzer;

    /// Helper function to analyze code semantically and return error messages as strings
    fn analyze_test(source: &str) -> Vec<String> {
        // First parse the code to get an AST
        let tokens = tokenize(source);
        let program = match parse(tokens.0, source) {
            Ok(program) => program,
            Err(e) => panic!("Parse error: {}", e),
        };

        // Create a semantic analyzer with the actual source code
        let mut analyzer = SemanticAnalyzer::new(&source.to_string());

        // Analyze the program
        analyzer.analyze(&program);

        // Instead of cloning SemanticError (which is not Clone), collect their Debug strings.
        analyzer
            .get_errors()
            .iter()
            .map(|e| format!("{:?}", e))
            .collect()
    }

    /// Helper to check if errors match expected patterns (now operating on error messages)
    fn contains_error_of_type(errors: &[String], error_type: &str) -> bool {
        errors
            .iter()
            .any(|error_str| error_str.contains(error_type))
    }

    #[test]
    fn test_valid_program() {
        let source = r#"
            MainPrgm test;
            Var
            let x, y: Int;
            let z: Float;
            
            BeginPg
            {
                x := (+10);
                y := x + (+5);
                z := 3.14;
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(
            errors.is_empty(),
            "Expected no errors, but found: {:?}",
            errors
        );
    }

    #[test]
    fn test_undeclared_identifier() {
        let source = r#"
            MainPrgm test;
            Var
            let x: Int;
            
            BeginPg
            {
                y := (+10); <!- y is not declared -!>
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(!errors.is_empty(), "Expected errors, but found none");
        assert!(
            contains_error_of_type(&errors, "UndeclaredIdentifier"),
            "Expected undeclared identifier error, but found: {:?}",
            errors
        );
    }

    #[test]
    fn test_duplicate_declaration() {
        let source = r#"
            MainPrgm test;
            Var
            let x: Int;
            let x: Float; <!- Duplicate declaration -!>
            
            BeginPg
            {
                x := (+10);
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(!errors.is_empty(), "Expected errors, but found none");
        assert!(
            contains_error_of_type(&errors, "DuplicateDeclaration"),
            "Expected duplicate declaration error, but found: {:?}",
            errors
        );
    }

    #[test]
    fn test_type_mismatch() {
        let source = r#"
            MainPrgm test;
            Var
            let x: Int;
            let y: Float;
            
            BeginPg
            {
                x := y; <!- Type mismatch: Int := Float -!>
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(!errors.is_empty(), "Expected errors, but found none");
        assert!(
            contains_error_of_type(&errors, "TypeMismatch"),
            "Expected type mismatch error, but found: {:?}",
            errors
        );
    }

    #[test]
    fn test_constant_modification() {
        let source = r#"
            MainPrgm test;
            Var
            @define Const Pi: Float = 3.14;
            
            BeginPg
            {
                Pi := 3.14159; <!- Cannot modify constant -!>
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(!errors.is_empty(), "Expected errors, but found none");
        assert!(
            contains_error_of_type(&errors, "ConstantModification"),
            "Expected constant modification error, but found: {:?}",
            errors
        );
    }

    #[test]
    fn test_array_index_out_of_bounds() {
        let source = r#"
            MainPrgm test;
            Var
            let arr: [Int; 5];
            
            BeginPg
            {
                arr[5] := (+10); <!- Index out of bounds (valid indices are 0-4) -!>
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(!errors.is_empty(), "Expected errors, but found none");
        assert!(
            contains_error_of_type(&errors, "ArrayIndexOutOfBounds"),
            "Expected array index out of bounds error, but found: {:?}",
            errors
        );
    }

    #[test]
    fn test_division_by_zero() {
        let source = r#"
            MainPrgm test;
            Var
            let x: Int;
            
            BeginPg
            {
                x := (+10) / 0; <!- Division by zero -!>
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(!errors.is_empty(), "Expected errors, but found none");
        assert!(
            contains_error_of_type(&errors, "DivisionByZero"),
            "Expected division by zero error, but found: {:?}",
            errors
        );
    }

    #[test]
    fn test_non_array_indexing() {
        let source = r#"
            MainPrgm test;
            Var
            let x: Int;
            
            BeginPg
            {
                x[0] := (+10); <!- x is not an array -!>
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(!errors.is_empty(), "Expected errors, but found none");
        assert!(
            contains_error_of_type(&errors, "NonArrayIndexing"),
            "Expected non-array indexing error, but found: {:?}",
            errors
        );
    }

    #[test]
    fn test_invalid_array_index_type() {
        let source = r#"
            MainPrgm test;
            Var
            let arr: [Int; 5];
            let idx: Float;
            
            BeginPg
            {
                idx := 1.5;
                arr[idx] := (+10); <!- Array index must be an integer -!>
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(!errors.is_empty(), "Expected errors, but found none");
        assert!(
            contains_error_of_type(&errors, "TypeMismatch"),
            "Expected type mismatch error for array index, but found: {:?}",
            errors
        );
    }

    #[test]
    fn test_invalid_if_condition() {
        let source = r#"
            MainPrgm test;
            Var
            let x: Float;
            
            BeginPg
            {
                x := 3.14;
                if (x) then { <!- x is not a boolean expression -!>
                    x := 2.71;
                }
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(!errors.is_empty(), "Expected errors, but found none");
        // This should cause a type error since Float is not valid as a boolean condition
    }

    #[test]
    fn test_invalid_for_loop_variable() {
        let source = r#"
            MainPrgm test;
            Var
            let i: Float; <!- Loop variable should be Int -!>
            
            BeginPg
            {
                for i from 1 to 10 step 1 {
                    i := i + 0.5; <!- Invalid: modifying loop variable with wrong type -!>
                }
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(!errors.is_empty(), "Expected errors, but found none");
        assert!(
            contains_error_of_type(&errors, "TypeMismatch"),
            "Expected type mismatch error for for-loop variable, but found: {:?}",
            errors
        );
    }

    #[test]
    fn test_mixed_type_operation() {
        let source = r#"
            MainPrgm test;
            Var
            let x: Int;
            let y: Float;
            let z: Int;
            
            BeginPg
            {
                {-- This should be allowed with implicit conversion --}
                z := x + y; <!- Int + Float should result in Float, can't assign to Int -!>
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(!errors.is_empty(), "Expected errors, but found none");
        assert!(
            contains_error_of_type(&errors, "TypeMismatch"),
            "Expected type mismatch error for mixed type operation, but found: {:?}",
            errors
        );
    }

    #[test]
    fn test_valid_array_initialization() {
        let source = r#"
            MainPrgm test;
            Var
            let arr: [Int; 3] = {1, 2, 3};
            
            BeginPg
            {
                arr[1] := (+42);
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(
            errors.is_empty(),
            "Expected no errors, but found: {:?}",
            errors
        );
    }

    #[test]
    fn test_incompatible_array_initialization() {
        let source = r#"
            MainPrgm test;
            Var
            let arr: [Int; 3] = {1.1, 2.2, 3.3}; <!- Float values for Int array -!>
            
            BeginPg
            {
                arr[1] := (+42);
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(!errors.is_empty(), "Expected errors, but found none");
        assert!(
            contains_error_of_type(&errors, "TypeMismatch"),
            "Expected type mismatch error for array initialization, but found: {:?}",
            errors
        );
    }

    #[test]
    fn test_multiple_errors() {
        let source = r#"
            MainPrgm test;
            Var
            let x: Int;
            let x: Float; <!- Error 1: Duplicate declaration -!>
            
            BeginPg
            {
                y := (+10); <!- Error 2: Undeclared identifier -!>
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(
            errors.len() >= 2,
            "Expected at least 2 errors, but found: {:?}",
            errors
        );
    }

    #[test]
    fn test_valid_complex_expressions() {
        let source = r#"
            MainPrgm test;
            Var
            let a, b, c: Int;
            let d, e: Float;
            
            BeginPg
            {
                a := (+5);
                b := (+10);
                c := (a + b) * (+2);
                d := 3.14;
                e := d * d + 2.0;
                
                if (a < b AND b > 0) then {
                    c := c + (+1);
                } else {
                    c := c - (+1);
                }
                
                for a from 1 to 10 step 2 {
                    b := b + a;
                }
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(
            errors.is_empty(),
            "Expected no errors, but found: {:?}",
            errors
        );
    }

    #[test]
    fn test_do_while_condition_error() {
        let source = r#"
            MainPrgm test;
            Var
            let x: Float;
            
            BeginPg
            {
                do {
                    x := x + 1.0;
                } while (x); <!- x should be in a boolean expression -!>
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(!errors.is_empty(), "Expected errors, but found none");
        // This should cause a type error for the condition
    }

    #[test]
    fn test_empty_source() {
        let source = r#"
            MainPrgm test;
            Var
            BeginPg
            {
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(!errors.is_empty());
    }

    #[test]
    fn test_only_comments() {
        let source = r#"
            MainPrgm test;
            Var
            BeginPg
            {
                {-- comment --} <!- another -!>
            }
            EndPg;
        "#;

        let errors = analyze_test(source);
        assert!(!errors.is_empty());
    }

    #[test]
    fn test_assign_to_undeclared_array_element() {
        let source = r#"
            MainPrgm test;
            Var
            let x: Int;
            BeginPg
            {
                arr[0] := 1; <!- arr not declared -!>
            }
            EndPg;
        "#;
        let errors = analyze_test(source);
        assert!(contains_error_of_type(&errors, "UndeclaredIdentifier"));
    }

    #[test]
    fn test_array_size_negative_zero_invalid() {
        let source = r#"
            MainPrgm test;
            Var
            let tab_neg : [Int; (-1)];
            let tab_zero : [Float; 0];
            BeginPg { } EndPg;
        "#;
        let errors = analyze_test(source);
        assert!(!errors.is_empty());
        assert!(contains_error_of_type(&errors, "InvalidArraySize"));
    }

    #[test]
    fn test_assignment_to_constant_invalid() {
        let source = r#"
            MainPrgm test;
            Var
            @define Const Valeur : Int = 50;
            BeginPg { Valeur := 100; } EndPg;
        "#;
        let errors = analyze_test(source);
        assert!(!errors.is_empty());
        assert!(contains_error_of_type(&errors, "ConstantModification"));
    }

    #[test]
    fn test_assignment_to_undeclared_identifier_invalid() {
        let source = r#"
            MainPrgm test;
            Var
            BeginPg { y := 5; } EndPg;
        "#;
        let errors = analyze_test(source);
        assert!(!errors.is_empty());
        assert!(contains_error_of_type(&errors, "UndeclaredIdentifier"));
    }

    #[test]
    fn test_assignment_type_mismatch_invalid() {
        let source = r#"
            MainPrgm test;
            Var
            let entier : Int;
            BeginPg { entier := 3.14; } EndPg;
        "#;
        let errors = analyze_test(source);
        assert!(!errors.is_empty());
        assert!(contains_error_of_type(&errors, "TypeMismatch"));
    }

    #[test]
    fn test_assignment_array_index_out_of_bounds_invalid() {
        let source = r#"
            MainPrgm test;
            Var
            let data : [Int; 3];
            BeginPg { data[3] := 7; } EndPg;
        "#;
        let errors = analyze_test(source);
        assert!(!errors.is_empty());
        assert!(contains_error_of_type(&errors, "ArrayIndexOutOfBounds"));
    }

    #[test]
    fn test_for_loop_undeclared_variable_invalid() {
        let source = r#"
            MainPrgm test;
            Var
            BeginPg { for m from 1 to 5 step 1 { } } EndPg;
        "#;
        let errors = analyze_test(source);
        assert!(!errors.is_empty());
        assert!(contains_error_of_type(&errors, "UndeclaredIdentifier"));
    }

    #[test]
    fn test_division_by_zero_semantic_invalid() {
        let source = r#"
            MainPrgm test;
            Var
            let err : Float;
            BeginPg { err := 10 / 0; } EndPg;
        "#;
        let errors = analyze_test(source);
        assert!(!errors.is_empty());
        assert!(contains_error_of_type(&errors, "DivisionByZero"));
    }

    #[test]
    fn test_operation_type_mismatch_invalid() {
        let source = r#"
            MainPrgm test;
            Var
            let nbr : Int;
            let flottant : Float;
            let resultat : Int;
            BeginPg { resultat := nbr + flottant; } EndPg;
        "#;
        let errors = analyze_test(source);
        assert!(!errors.is_empty());
        assert!(contains_error_of_type(&errors, "TypeMismatch"));
    }
}

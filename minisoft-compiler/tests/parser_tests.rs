#[cfg(test)]
mod parser_tests {
    use rust_compiler::parser::ast::{
        DeclarationKind, ExpressionKind, Operator, Program, StatementKind, Type,
    };
    use rust_compiler::lexer::lexer_core::tokenize;
    use rust_compiler::parser::parser_core::parse;

    /// Helper function to parse a source string and return the AST
    fn parse_test(source: &str) -> Program {
        // Tokenize the source code
        let (tokens, _) = tokenize(source);
        match parse(tokens, source) {
            Ok(program) => program,
            Err(e) => panic!("Parse error: {}", e),
        }
    }

    // Helper function to test if parsing fails as expected
    fn expect_parse_error(source: &str) -> bool {
        let (tokens, _) = tokenize(source);
        parse(tokens, source).is_err()
    }

    #[test]
    fn test_minimal_program() {
        let source = "MainPrgm test ; Var BeginPg { } EndPg ;";
        let program = parse_test(source);

        assert_eq!(program.name, "test");
        assert!(program.declarations.is_empty());
        assert!(program.statements.is_empty());
    }

    #[test]
    fn test_mixed_declaration_types() {
        let source = "
            MainPrgm mixed ;
            Var
            let a : Int ;
            let b : [Int; 5] ;
            let c : Int = 10 ;
            let d : [Float; 3] = {1.1, 2.2, 3.3} ;
            @define Const Pi : Float = 3.14 ;
            BeginPg { } EndPg ;
        ";
        let program = parse_test(source);
        assert_eq!(program.declarations.len(), 5);
        
        // Check each declaration is of the expected type
        assert!(matches!(&program.declarations[0].node, DeclarationKind::Variable(_, _)));
        assert!(matches!(&program.declarations[1].node, DeclarationKind::Array(_, _, _)));
        assert!(matches!(&program.declarations[2].node, DeclarationKind::VariableWithInit(_, _, _)));
        assert!(matches!(&program.declarations[3].node, DeclarationKind::ArrayWithInit(_, _, _, _)));
        assert!(matches!(&program.declarations[4].node, DeclarationKind::Constant(_, _, _)));
    }

    #[test]
    fn test_control_flow_statements() {
        let source = "
            MainPrgm test ;
            Var
            let x, max, i, sum : Int ;
            BeginPg {
                <!- If-else -!>
                if (x > 10) then {
                    max := x ;
                } else {
                    max := 10 ;
                }
                
                <!- Do-while -!>
                do {
                    i := i + 1 ;
                } while (i < 10) ;
                
                <!- For -!>
                for i from 1 to 100 step 1 {
                    sum := sum + i ;
                }
            } EndPg ;
        ";

        let program = parse_test(source);
        assert_eq!(program.statements.len(), 3);
        
        // Validate we have the expected statement types
        assert!(matches!(&program.statements[0].node, StatementKind::IfThenElse(_, _, _)));
        assert!(matches!(&program.statements[1].node, StatementKind::DoWhile(_, _)));
        assert!(matches!(&program.statements[2].node, StatementKind::For(_, _, _, _, _)));
    }

    #[test]
    fn test_input_output() {
        let source = "
            MainPrgm test ;
            Var
            let name : Int ;
            BeginPg {
                input(name) ;
                output(\"Value is: \", name) ;
            } EndPg ;
        ";

        let program = parse_test(source);
        assert_eq!(program.statements.len(), 2);
        assert!(matches!(&program.statements[0].node, StatementKind::Input(_)));
        assert!(matches!(&program.statements[1].node, StatementKind::Output(_)));
    }

    #[test]
    fn test_complex_expressions() {
        let source = "
            MainPrgm test ;
            Var
            let result : Int ;
            BeginPg {
                result := 2 + 3 * 4 ;  <!- Should be 14, not 20 -!>
                result := (2 + 3) * 4 ;  <!- Should be 20 -!>
                result := ((2 + 3) * 4) / (1 + 1) ;  <!- Should be 10 -!>
                result := x > y AND y < 10 ;
                result := (x > y) OR (y != 5) ;
            } EndPg ;
        ";

        let program = parse_test(source);
        assert_eq!(program.statements.len(), 5);
        
        // Check operator precedence in the first expression (2 + (3 * 4))
        if let StatementKind::Assignment(_, expr) = &program.statements[0].node {
            if let ExpressionKind::BinaryOp(_, op, right) = &expr.node {
                assert!(matches!(op, Operator::Add));
                
                // Right side should be a multiplication
                if let ExpressionKind::BinaryOp(_, inner_op, _) = &right.node {
                    assert!(matches!(inner_op, Operator::Multiply));
                } else {
                    panic!("Right operand should be binary operation");
                }
            }
        }
    }

    #[test]
    #[should_panic(expected = "Parse error")]
    fn test_syntax_errors() {
        let sources = [
            // Missing semicolon
            "MainPrgm test ; Var let x : Int BeginPg { } EndPg ;",
            
            // Missing then keyword
            "MainPrgm test ; Var BeginPg { if (x > 10) { x := 20 ; } } EndPg ;",
            
            // Wrong program structure
            "BeginPg let x : Int ; MainPrgm test ; { } EndPg ;",
            
            // Missing assignment operator
            "MainPrgm test ; Var let x : Int ; BeginPg { x 10 ; } EndPg ;",
        ];
        
        for src in sources {
            parse_test(src); // Should panic
            break; // We only need to test one to verify error handling
        }
    }

    #[test]
    fn test_large_program() {
        use std::fs;

        let test_file_path = "examples/valid/sample_program.ms";
        let input = fs::read_to_string(test_file_path).expect("Failed to read test file");

        // Just check if parsing succeeds
        let program = parse_test(&input);
        assert_eq!(program.name, "L3_software");
    }

    #[test]
    fn test_variable_declaration_variations() {
        let source = "
            MainPrgm vars ;
            Var
            let single : Int ;                    <!- Simple variable -!>
            let a, b, c : Int ;                   <!- Multiple variables -!>
            let initialized : Int = 42 ;          <!- Initialization -!>
            let x, y, z : Float = 3.14 ;          <!- Multiple with init -!>
            BeginPg { } EndPg ;
        ";
        
        let program = parse_test(source);
        assert_eq!(program.declarations.len(), 4);
        
        // Check multiple variables in one declaration
        if let DeclarationKind::Variable(names, ty) = &program.declarations[1].node {
            assert_eq!(names.len(), 3);
            assert!(matches!(ty, Type::Int));
        } else {
            panic!("Expected multiple variable declaration");
        }
        
        // Check initialization
        if let DeclarationKind::VariableWithInit(names, ty, _) = &program.declarations[2].node {
            assert_eq!(names.len(), 1);
            assert!(matches!(ty, Type::Int));
        } else {
            panic!("Expected variable with initialization");
        }
    }

    #[test]
    fn test_array_declarations_and_access() {
        let source = "
            MainPrgm arrays ;
            Var
            let arr : [Int; 10] ;                      <!- Array declaration -!>
            let matrix : [Float; 25] ;                 <!- Another array -!>
            let initialized : [Int; 3] = {1, 2, 3} ;   <!- Init array -!>
            BeginPg {
                arr[0] := 100 ;                        <!- Array assignment -!>
                arr[1+1] := arr[0] * 2 ;               <!- Expression as index -!>
                matrix[5] := 3.14 ;                    <!- Different type -!>
            } EndPg ;
        ";
        
        let program = parse_test(source);
        assert_eq!(program.declarations.len(), 3);
        assert_eq!(program.statements.len(), 3);
        
        // Check array declaration
        if let DeclarationKind::Array(names, ty, size) = &program.declarations[0].node {
            assert_eq!(names[0], "arr");
            assert!(matches!(ty, Type::Int));
            assert_eq!(*size, 10);
        } else {
            panic!("Expected array declaration");
        }
        
        // Check initialized array
        if let DeclarationKind::ArrayWithInit(names, _, _, values) = &program.declarations[2].node {
            assert_eq!(names[0], "initialized");
            assert_eq!(values.len(), 3);
        } else {
            panic!("Expected array with initialization");
        }
        
        // Check array access in statements
        if let StatementKind::Assignment(target, _) = &program.statements[0].node {
            if let ExpressionKind::ArrayAccess(name, _) = &target.node {
                assert_eq!(name, "arr");
            } else {
                panic!("Expected array access");
            }
        }
    }
    
    #[test]
    fn test_constants() {
        let source = "
            MainPrgm constants ;
            Var
            @define Const Pi : Float = 3.14159 ;
            @define Const Max : Int = 100 ;
            @define Const Min : Int = (-100) ;
            BeginPg {
                output(Pi) ;
            } EndPg ;
        ";
        
        let program = parse_test(source);
        assert_eq!(program.declarations.len(), 3);
        
        // Check constant declarations
        for (i, const_name) in ["Pi", "Max", "Min"].iter().enumerate() {
            if let DeclarationKind::Constant(name, _, _) = &program.declarations[i].node {
                assert_eq!(name, const_name);
            } else {
                panic!("Expected constant declaration");
            }
        }
    }

    #[test]
    fn test_expression_precedence() {
        let source = "
            MainPrgm expressions ;
            Var
            let result : Int ;
            BeginPg {
                <!- Basic arithmetic precedence -!>
                result := 1 + 2 * 3 ;            <!- Should be 7 -!>
                result := (1 + 2) * 3 ;          <!- Should be 9 -!>
                
                <!- Complex expressions -!>
                result := 10 - 2 * 3 + 5 / 5 ;   <!- Should be 5 -!>
                result := 2 * (3 + 4) - 1 ;      <!- Should be 13 -!>
                
                <!- Boolean operations -!>
                result := 5 > 3 AND 2 < 4 ;      <!- True AND True -!>
                result := 5 > 3 OR 2 > 4 ;       <!- True OR False -!>
                result := (5 > 3) OR (2 > 4) ;   <!- With parentheses -!>
                result := !(5 < 3) ;             <!- Negation -!>
            } EndPg ;
        ";
        
        let program = parse_test(source);
        assert_eq!(program.statements.len(), 8);
        
        // Check first expression for precedence (1 + (2 * 3))
        if let StatementKind::Assignment(_, expr) = &program.statements[0].node {
            if let ExpressionKind::BinaryOp(_, op, right) = &expr.node {
                assert!(matches!(op, Operator::Add));
                
                // Right side should be multiplication
                if let ExpressionKind::BinaryOp(_, inner_op, _) = &right.node {
                    assert!(matches!(inner_op, Operator::Multiply));
                } else {
                    panic!("Expected multiplication on right side");
                }
            }
        }
    }

    #[test]
    fn test_nested_control_flow() {
        let source = "
            MainPrgm nested ;
            Var
            let i, j, sum : Int ;
            BeginPg {
                <!- Nested if-else -!>
                if (i > 0) then {
                    if (j > 0) then {
                        sum := i + j ;
                    } else {
                        sum := i ;
                    }
                } else {
                    sum := 0 ;
                }
                
                <!- Nested loops -!>
                i := 0 ;
                do {
                    j := 0 ;
                    do {
                        sum := sum + i * j ;
                        j := j + 1 ;
                    } while (j < 5) ;
                    i := i + 1 ;
                } while (i < 5) ;
                
                <!- For loop with if condition -!>
                for i from 1 to 10 step 1 {
                    if (i / 2 == 0) then {
                        sum := sum + i ;
                    }
                }
            } EndPg ;
        ";
        
        let program = parse_test(source);
        assert_eq!(program.statements.len(), 4);
        
        // Check first nested if-else
        if let StatementKind::IfThenElse(_, then_block, _) = &program.statements[0].node {
            // Then block should contain another if statement
            assert_eq!(then_block.len(), 1);
            assert!(matches!(then_block[0].node, StatementKind::IfThenElse(_, _, _)));
        } else {
            panic!("Expected nested if-else");
        }
        
        // Check nested loops
        if let StatementKind::DoWhile(body, _) = &program.statements[2].node {
            // Body should contain variable assignment and another do-while
            assert_eq!(body.len(), 3);
            assert!(matches!(body[1].node, StatementKind::DoWhile(_, _)));
        } else {
            panic!("Expected nested do-while loops");
        }
    }
    
    #[test]
    fn test_complex_input_output() {
        let source = "
            MainPrgm io ;
            Var
            let x, y : Int ;
            let name : Int ;
            BeginPg {
                input(name) ;
                input(x) ;
                input(y) ;
                
                output(\"Hello, \", name) ;
                output(\"Sum: \", x + y) ;
                output(\"Product: \", x * y, \" is the result\") ;
            } EndPg ;
        ";
        
        let program = parse_test(source);
        assert_eq!(program.statements.len(), 6);
        
        // Check input statements
        assert!(matches!(&program.statements[0].node, StatementKind::Input(_)));
        assert!(matches!(&program.statements[1].node, StatementKind::Input(_)));
        
        // Check complex output
        if let StatementKind::Output(exprs) = &program.statements[5].node {
            assert_eq!(exprs.len(), 3);
            
            // Check that the middle expression is a binary operation
            if let ExpressionKind::BinaryOp(_, op, _) = &exprs[1].node {
                assert!(matches!(op, Operator::Multiply));
            } else {
                panic!("Expected binary operation in output");
            }
        }
    }
    
    #[test]
    fn test_comprehensive_error_cases() {
        let errors = [
            // Program structure errors
            "Var let x : Int ; BeginPg { } EndPg ;",  // Missing MainPrgm
            "MainPrgm test ; BeginPg { } EndPg ;",    // Missing Var section
            "MainPrgm test ; Var let x : Int ;",      // Missing BeginPg/EndPg
            
            // Declaration errors
            "MainPrgm test ; Var let : Int ; BeginPg { } EndPg ;",        // Missing identifier
            "MainPrgm test ; Var let x Int ; BeginPg { } EndPg ;",        // Missing colon
            "MainPrgm test ; Var let x : ; BeginPg { } EndPg ;",          // Missing type
            "MainPrgm test ; Var let x : [Int] ; BeginPg { } EndPg ;",    // Invalid array syntax
            
            // Statement errors
            "MainPrgm test ; Var BeginPg { x := ; } EndPg ;",             // Missing expression
            "MainPrgm test ; Var BeginPg { := 5 ; } EndPg ;",             // Missing lvalue
            "MainPrgm test ; Var BeginPg { if x > 5 { } } EndPg ;",       // Missing then
            "MainPrgm test ; Var BeginPg { do } while (x > 5) ; EndPg ;", // Empty do-while block
            
            // Expression errors
            "MainPrgm test ; Var BeginPg { x := 5 + ; } EndPg ;",         // Incomplete expression
            "MainPrgm test ; Var BeginPg { x := (5 + 3 ; } EndPg ;",      // Unbalanced parentheses
            "MainPrgm test ; Var BeginPg { x := 5 + * 3 ; } EndPg ;",     // Adjacent operators
        ];

        for (i, src) in errors.iter().enumerate() {
            assert!(expect_parse_error(src), "Test case #{} should fail: {}", i, src);
        }
    }

    #[test]
    fn test_edge_cases() {
        let sources = [
            // Minimal valid program
            "MainPrgm x ; Var BeginPg { } EndPg ;",
            
            // Deeply nested expressions
            "MainPrgm nested ; Var let x : Int ; BeginPg { x := 1 + (2 * (3 + (4 * (5 + 6)))) ; } EndPg ;",
            
            // Large expression
            "MainPrgm large ; Var let x : Int ; BeginPg { x := 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 ; } EndPg ;",
            
            // Many declarations
            "MainPrgm many ; Var let a : Int ; let b : Int ; let c : Int ; let d : Int ; let e : Int ; BeginPg { } EndPg ;",
            
            // Many statements
            "MainPrgm statements ; Var let x : Int ; BeginPg { x := 1 ; x := 2 ; x := 3 ; x := 4 ; x := 5 ; } EndPg ;",
        ];

        for src in sources {
            let program = parse_test(src);
            assert!(program.name.len() > 0); // Basic validation that parsing succeeded
        }
    }

    #[test]
    fn test_type_compatibility() {
        let source = "
            MainPrgm types ;
            Var
            let i : Int ;
            let f : Float ;
            BeginPg {
                i := 42 ;        <!- Int to Int -!>
                f := 3.14 ;      <!- Float to Float -!>
                
                {--
                 Below would be type errors if type checking were implemented.
                 These tests just verify they parse correctly
                --}
                i := 3.14 ;      <!- Float to Int -!>
                f := 42 ;        <!- Int to Float -!>
            } EndPg ;
        ";
        
        let program = parse_test(source);
        assert_eq!(program.statements.len(), 4);
        
        // Note: The parser should accept these assignments since it doesn't do type checking,
        // but the semantic analyzer would catch the type errors later
    }
}

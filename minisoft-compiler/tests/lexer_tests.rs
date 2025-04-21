#[cfg(test)]
mod lexer_tests {
    use logos::Logos;
    use rust_compiler::lexer::token::Token;
    use rust_compiler::lexer::lexer_core::tokenize;
    use rust_compiler::lexer::error::LexicalErrorType;

    #[test]
    fn test_keywords() {
        let mut lexer = Token::lexer("MainPrgm Var BeginPg EndPg let Int Float if then else while for do from to step input output @define Const");
        assert_eq!(lexer.next(), Some(Ok(Token::MainPrgm)));
        assert_eq!(lexer.next(), Some(Ok(Token::Var)));
        assert_eq!(lexer.next(), Some(Ok(Token::BeginPg)));
        assert_eq!(lexer.next(), Some(Ok(Token::EndPg)));
        assert_eq!(lexer.next(), Some(Ok(Token::Let)));
        assert_eq!(lexer.next(), Some(Ok(Token::Int)));
        assert_eq!(lexer.next(), Some(Ok(Token::Float)));
        assert_eq!(lexer.next(), Some(Ok(Token::If)));
        assert_eq!(lexer.next(), Some(Ok(Token::Then)));
        assert_eq!(lexer.next(), Some(Ok(Token::Else)));
        assert_eq!(lexer.next(), Some(Ok(Token::While)));
        assert_eq!(lexer.next(), Some(Ok(Token::For)));
        assert_eq!(lexer.next(), Some(Ok(Token::Do)));
        assert_eq!(lexer.next(), Some(Ok(Token::From)));
        assert_eq!(lexer.next(), Some(Ok(Token::To)));
        assert_eq!(lexer.next(), Some(Ok(Token::Step)));
        assert_eq!(lexer.next(), Some(Ok(Token::Input)));
        assert_eq!(lexer.next(), Some(Ok(Token::Output)));
        assert_eq!(lexer.next(), Some(Ok(Token::Define)));
        assert_eq!(lexer.next(), Some(Ok(Token::Const)));
        assert_eq!(lexer.next(), None);
    }

    #[test]
    fn test_punctuation() {
        let mut lexer = Token::lexer("; , : [ ] { } ( )");
        assert_eq!(lexer.next(), Some(Ok(Token::Semicolon)));
        assert_eq!(lexer.next(), Some(Ok(Token::Comma)));
        assert_eq!(lexer.next(), Some(Ok(Token::Colon)));
        assert_eq!(lexer.next(), Some(Ok(Token::OpenBracket)));
        assert_eq!(lexer.next(), Some(Ok(Token::CloseBracket)));
        assert_eq!(lexer.next(), Some(Ok(Token::OpenBrace)));
        assert_eq!(lexer.next(), Some(Ok(Token::CloseBrace)));
        assert_eq!(lexer.next(), Some(Ok(Token::OpenParen)));
        assert_eq!(lexer.next(), Some(Ok(Token::CloseParen)));
        assert_eq!(lexer.next(), None);
    }

    #[test]
    fn test_operators() {
        let mut lexer = Token::lexer("+ - * / > < >= <= == != := = AND OR !");
        assert_eq!(lexer.next(), Some(Ok(Token::Plus)));
        assert_eq!(lexer.next(), Some(Ok(Token::Minus)));
        assert_eq!(lexer.next(), Some(Ok(Token::Multiply)));
        assert_eq!(lexer.next(), Some(Ok(Token::Divide)));
        assert_eq!(lexer.next(), Some(Ok(Token::GreaterThan)));
        assert_eq!(lexer.next(), Some(Ok(Token::LessThan)));
        assert_eq!(lexer.next(), Some(Ok(Token::GreaterEqual)));
        assert_eq!(lexer.next(), Some(Ok(Token::LessEqual)));
        assert_eq!(lexer.next(), Some(Ok(Token::Equal)));
        assert_eq!(lexer.next(), Some(Ok(Token::NotEqual)));
        assert_eq!(lexer.next(), Some(Ok(Token::Assign)));
        assert_eq!(lexer.next(), Some(Ok(Token::Equals)));
        assert_eq!(lexer.next(), Some(Ok(Token::And)));
        assert_eq!(lexer.next(), Some(Ok(Token::Or)));
        assert_eq!(lexer.next(), Some(Ok(Token::Not)));
        assert_eq!(lexer.next(), None);
    }

    #[test]
    fn test_integer_literals() {
        let mut lexer = Token::lexer("0 123 32767 (-32768) (+123)");
        assert_eq!(lexer.next(), Some(Ok(Token::IntLiteral(0))));
        assert_eq!(lexer.next(), Some(Ok(Token::IntLiteral(123))));
        assert_eq!(lexer.next(), Some(Ok(Token::IntLiteral(32767)))); // max i16
        assert_eq!(lexer.next(), Some(Ok(Token::IntLiteral(-32768)))); // min i16
        assert_eq!(lexer.next(), Some(Ok(Token::IntLiteral(123))));
        assert_eq!(lexer.next(), None);
    }

    #[test]
    fn test_float_literals() {
        let mut lexer = Token::lexer("0.0 45.67 456.789 (+12.34) (-56.78)");
        assert_eq!(lexer.next(), Some(Ok(Token::FloatLiteral(0.0))));
        assert_eq!(lexer.next(), Some(Ok(Token::FloatLiteral(45.67))));
        assert_eq!(lexer.next(), Some(Ok(Token::FloatLiteral(456.789))));
        assert_eq!(lexer.next(), Some(Ok(Token::FloatLiteral(12.34))));
        assert_eq!(lexer.next(), Some(Ok(Token::FloatLiteral(-56.78))));
        assert_eq!(lexer.next(), None);
    }

    #[test]
    fn test_string_literals() {
        let mut lexer = Token::lexer("\"hello\" \"hello world\" \"123\" \"\"");
        assert_eq!(lexer.next(), Some(Ok(Token::StringLiteral("hello".to_string()))));
        assert_eq!(lexer.next(), Some(Ok(Token::StringLiteral("hello world".to_string()))));
        assert_eq!(lexer.next(), Some(Ok(Token::StringLiteral("123".to_string()))));
        assert_eq!(lexer.next(), Some(Ok(Token::StringLiteral("".to_string()))));
        assert_eq!(lexer.next(), None);
    }

    #[test]
    fn test_valid_identifiers() {
        let mut lexer = Token::lexer("x Variable x123 test_var a_b_c Some123thing");
        assert_eq!(lexer.next(), Some(Ok(Token::Identifier("x".to_string()))));
        assert_eq!(lexer.next(), Some(Ok(Token::Identifier("Variable".to_string()))));
        assert_eq!(lexer.next(), Some(Ok(Token::Identifier("x123".to_string()))));
        assert_eq!(lexer.next(), Some(Ok(Token::Identifier("test_var".to_string()))));
        assert_eq!(lexer.next(), Some(Ok(Token::Identifier("a_b_c".to_string()))));
        assert_eq!(lexer.next(), Some(Ok(Token::Identifier("Some123thing".to_string()))));
        assert_eq!(lexer.next(), None);
    }

    #[test]
    fn test_comments() {
        let mut lexer = Token::lexer("a <!- commented text -!> b {-- another comment --} c");
        assert_eq!(lexer.next(), Some(Ok(Token::Identifier("a".to_string()))));
        assert_eq!(lexer.next(), Some(Ok(Token::Identifier("b".to_string()))));
        assert_eq!(lexer.next(), Some(Ok(Token::Identifier("c".to_string()))));
    }
    
    #[test]
    fn test_multiline_comments() {
        let mut lexer = Token::lexer("start\n{-- line1\nline2\nline3 --}\nend");
        assert_eq!(lexer.next(), Some(Ok(Token::Identifier("start".to_string()))));
        assert_eq!(lexer.next(), Some(Ok(Token::Identifier("end".to_string()))));
        assert_eq!(lexer.next(), None);
    }

    #[test]
    fn test_invalid_identifiers() {
        // Test identifiers exceeding 14 chars
        let mut lexer = Token::lexer("thisidentifieristoolong");
        assert_eq!(lexer.next(), Some(Err(())));

        // Test consecutive underscores
        let mut lexer = Token::lexer("invalid__id");
        assert_eq!(lexer.next(), Some(Err(())));

        // Test finishing with an underscore
        let mut lexer = Token::lexer("invalid_");
        assert_eq!(lexer.next(), Some(Err(())));

        // Test uppercase after first character
        let mut lexer = Token::lexer("invalidIdentifier");
        assert_eq!(lexer.next(), Some(Err(())));
    }

    #[test]
    fn test_integer_out_of_range() {
        // Test integer literal above max i16
        let mut lexer = Token::lexer("32768");
        assert_eq!(lexer.next(), Some(Err(())));
        
        // Test integer literal below min i16
        let mut lexer = Token::lexer("(-32769)");
        assert_eq!(lexer.next(), Some(Err(())));
    }

    #[test]
    fn test_signed_number_errors() {
        // Test un-parenthesized signed integers
        let mut lexer = Token::lexer("+123");
        assert_eq!(lexer.next(), Some(Ok(Token::Plus)));
        assert_eq!(lexer.next(), Some(Ok(Token::IntLiteral(123))));
        
        let mut lexer = Token::lexer("-456");
        assert_eq!(lexer.next(), Some(Ok(Token::Minus)));
        assert_eq!(lexer.next(), Some(Ok(Token::IntLiteral(456))));
        
        // Test un-parenthesized signed floats
        let mut lexer = Token::lexer("+123.45");
        assert_eq!(lexer.next(), Some(Ok(Token::Plus)));
        assert_eq!(lexer.next(), Some(Ok(Token::FloatLiteral(123.45))));
        
        let mut lexer = Token::lexer("-456.78");
        assert_eq!(lexer.next(), Some(Ok(Token::Minus)));
        assert_eq!(lexer.next(), Some(Ok(Token::FloatLiteral(456.78))));
    }

    #[test]
    fn test_unterminated_string() {
        let source = "\"unterminated string";
        let (_, errors) = tokenize(source);
        assert_eq!(errors.len(), 1);
        assert_eq!(errors[0].error_type, LexicalErrorType::UnterminatedString);
    }

    #[test]
    fn test_non_ascii_characters() {
        let source = "variableñ";
        let (_, errors) = tokenize(source);
        assert_eq!(errors.len(), 1);
        assert_eq!(errors[0].error_type, LexicalErrorType::NonAsciiCharacters);
    }

    #[test]
    fn test_whitespace_handling() {
        let mut lexer = Token::lexer("a \t\r\u{000C} b\nc"); // \n increments line counter
        assert_eq!(lexer.next(), Some(Ok(Token::Identifier("a".to_string()))));
        assert_eq!(lexer.next(), Some(Ok(Token::Identifier("b".to_string()))));
        assert_eq!(lexer.next(), Some(Ok(Token::Identifier("c".to_string()))));
        assert_eq!(lexer.next(), None);
    }

    #[test]
    fn test_mixed_valid_and_invalid() {
        let mut lexer = Token::lexer("valid1 invalid__id 12345");
        assert_eq!(lexer.next(), Some(Ok(Token::Identifier("valid1".to_string()))));
        assert_eq!(lexer.next(), Some(Err(()))); // invalid__id
        assert_eq!(lexer.next(), Some(Ok(Token::IntLiteral(12345))));
        assert_eq!(lexer.next(), None);
    }

    #[test]
    fn test_tokenize_function() {
        let source = "let x := 10;";
        let (tokens, errors) = tokenize(source);
        
        assert_eq!(errors.len(), 0);
        assert_eq!(tokens.len(), 5);
        assert_eq!(tokens[0].kind, Token::Let);
        assert_eq!(tokens[1].kind, Token::Identifier("x".to_string()));
        assert_eq!(tokens[2].kind, Token::Assign);
        assert_eq!(tokens[3].kind, Token::IntLiteral(10));
        assert_eq!(tokens[4].kind, Token::Semicolon);
    }

    #[test]
    fn test_tokenize_with_errors() {
        let source = "let x := (+10); # This is not a valid comment";
        let (tokens, errors) = tokenize(source);
        
        assert_eq!(tokens.len(), 11);
        assert_eq!(tokens[0].kind, Token::Let);
        assert_eq!(tokens[1].kind, Token::Identifier("x".to_string()));
        assert_eq!(tokens[2].kind, Token::Assign);
        assert_eq!(tokens[3].kind, Token::IntLiteral(10));
        assert_eq!(tokens[4].kind, Token::Semicolon);
        
        assert_eq!(errors.len(), 1);
        assert_eq!(errors[0].error_type, LexicalErrorType::InvalidToken);
    }

    #[test]
    fn test_complete_program() {
        use std::fs;

        let test_file_path = "examples/valid/sample_program.ms";
        let input = fs::read_to_string(test_file_path).expect("Failed to read test file");

        let lexer = Token::lexer(&input);
        let tokens: Vec<_> = lexer.collect();

        assert!(tokens.iter().all(|t| t.is_ok()));
    }

    #[test]
    fn test_empty_input() {
        let mut lexer = Token::lexer("");
        assert_eq!(lexer.next(), None);
    }

    #[test]
    fn test_only_comments() {
        let mut lexer = Token::lexer("{-- comment --} <!- another -!>");
        assert_eq!(lexer.next(), None);
    }
    
    #[test]
    fn test_position_information() {
        let source = "let\nx := 10";
        let (tokens, _) = tokenize(source);
        
        assert_eq!(tokens[0].line, 1);
        assert_eq!(tokens[0].column, 0);
        
        assert_eq!(tokens[1].line, 2);
        assert_eq!(tokens[1].column, 0);
        
        assert_eq!(tokens[2].line, 2);
        assert_eq!(tokens[2].column, 2);
    }

    #[test]
    fn test_complex_example() {
        let source = r#"
MainPrgm
    Var
        x, y: Int;
        pi: Float;
    BeginPg
        x := 10;
        y := 20;
        pi := 3.14159;
        
        if x > y then
            output "x is greater";
        else
            output "y is greater or equal";
        
        <!- This is a comment -!>
        
        for i from 1 to 10 step 1 do
            output i;
        
        {-- Another comment style --}
    EndPg
"#;
        let (tokens, errors) = tokenize(source);
        assert_eq!(errors.len(), 0);
        assert!(tokens.len() > 0);
        
        // Verify first few tokens
        assert_eq!(tokens[0].kind, Token::MainPrgm);
        assert_eq!(tokens[1].kind, Token::Var);
    }
}

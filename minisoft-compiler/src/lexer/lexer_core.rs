use crate::lexer::error::LexicalError;
use crate::lexer::token::Token;
use logos::{Lexer, Logos};
use std::ops::Range;

// Token with its source position information
#[derive(Debug, Clone, PartialEq)]
pub struct TokenWithMetaData {
    pub kind: Token,
    pub value: String,
    pub line: usize,
    pub column: usize,
    pub span: Range<usize>,
}

pub fn tokenize(source: &str) -> (Vec<TokenWithMetaData>, Vec<LexicalError>) {
    let mut lexer = Token::lexer(source);
    let mut valid_tokens = Vec::new();
    let mut errors = Vec::new();

    while let Some(valid_result) = lexer.next() {
        let span = lexer.span();
        let value = lexer.slice().to_string();
        let (line, column) = get_position(&lexer, span.start);

        match valid_result {
            Ok(kind) => {
                valid_tokens.push(TokenWithMetaData {
                    kind,
                    value,
                    line,
                    column,
                    span,
                });
            }
            Err(_) => {
                let invalid_token = TokenWithMetaData {
                    kind: Token::Error,
                    value: value.clone(),
                    line,
                    column,
                    span,
                };
                errors.push(LexicalError::new(invalid_token));
            }
        };
    }

    (valid_tokens, errors)
}

fn get_position<'a>(lexer: &Lexer<'a, Token>, byte_offset: usize) -> (usize, usize) {
    let line = lexer.extras.line_number;
    let col = byte_offset - lexer.extras.line_start;
    (line, col)
}
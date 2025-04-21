# MiniSoft Compiler Project

> A robust compiler implementation for the MiniSoft language using [Lalrpop](https://github.com/lalrpop/lalrpop), [Logos](https://github.com/maciejhirsz/logos), and [Cranelift](https://github.com/bytecodealliance/wasmtime/tree/main/cranelift) in Rust.

## Overview

This project implements a complete compiler for the MiniSoft language, including lexical analysis, syntax analysis, semantic analysis, and native code generation using Cranelift. The compiler also includes robust error handling and a symbol table management system.

## MiniSoft Language Features

MiniSoft is a simple programming language with the following features:

| Feature               | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| Variables & Constants | Support for variable declarations and constant definitions |
| Data Types            | Integer and float primitive types                          |
| Arrays                | Support for array data structures                          |
| Control Structures    | Conditionals (if/else) and loops for program flow control  |
| I/O Operations        | Input and output functionality                             |
| Operators             | Arithmetic, logical, and comparison operators              |

## Project Structure

```
rust-compiler/
├── Cargo.toml
├── build.rs             # Build script for LALRPOP
├── README.md
├── docs/
│   ├── report.tex       # LaTeX source for compiler documentation
│   └── out/
│       └── report.pdf   # Compiled technical documentation
├── examples/
│   ├── valid/
│   │   └── sample_program.ms
│   └── invalid/
│       └── errors_sample.ms
├── src/
│   ├── lib.rs              # Library exports
│   ├── main.rs             # Entry point
│   ├── compiler.rs         # Compiler orchestration
│   ├── error_reporter/
│   │   ├── mod.rs          # Module exports
│   │   └── reporter.rs     # Error reporter implementation
│   ├── lexer/
│   │   ├── mod.rs          # Lexer module exports
│   │   ├── token.rs        # Token definitions
│   │   └── lexer.rs        # Logos lexer implementation
│   ├── parser/
│   │   ├── mod.rs          # Parser module exports
│   │   ├── ast.rs          # Abstract Syntax Tree definitions
│   │   ├── grammar.lalrpop # LALRPOP grammar definition
│   │   └── error.rs        # Parser error handling
│   ├── semantics/
│   │   ├── mod.rs          # Semantics module exports
│   │   ├── analyzer.rs     # Semantic analyzer main implementation
│   │   ├── analyzer/       # Semantic analyzer components
│   │   │   ├── decl_analyzer.rs    # Declaration analysis
│   │   │   ├── expr_analyzer.rs    # Expression analysis
│   │   │   ├── stmt_analyzer.rs    # Statement analysis
│   │   │   └── type_utils.rs       # Type utilities
│   │   ├── symbol_table.rs # Symbol table implementation
│   │   └── error.rs        # Semantic error handling
│   └── codegen/
│       ├── mod.rs          # Code generation module exports
│       ├── quadruple.rs    # Quadruple intermediate representation
│       └── generator.rs    # Cranelift code generator
└── tests/
    ├── lexer_tests.rs
    ├── parser_tests.rs
    ├── semantic_tests.rs
    └── integration_tests.rs
```

## Compiler Components

#### 1. Lexical Analysis

- Tokenizes MiniSoft source code using the Logos lexer generator
- Identifies keywords, operators, identifiers, and literals

#### 2. Syntax Analysis

- Parses tokens into an Abstract Syntax Tree (AST) using LALRPOP
- Validates program structure according to MiniSoft grammar

#### 3. Semantic Analysis

- Performs comprehensive type checking and validation
- Builds and manages symbol tables for scoped declarations

#### 4. Error Handling

- Reports precise errors with line and column information
- Provides meaningful diagnostic messages

#### 5. Code Generation

- Transforms AST into quadruple intermediate representation
- Generates native machine code using the Cranelift code generator
- Produces efficient executable code from the quadruple representation

## Semantic Error Detection

The compiler detects the following semantic errors:

- Undeclared identifiers
- Double-declared identifiers
- Type incompatibilities
- Division by zero (for constant expressions)
- Attempts to modify constant values
- Array index out of bounds

## Building and Running

```bash
# Build the project
cargo build

# Run on a sample file
cargo run -- examples/valid/sample_program.ms

# Run tests
cargo test
```

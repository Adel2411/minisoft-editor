use crate::codegen::quadruple::{Operand, Operation, Quadruple, QuadrupleProgram};
use crate::parser::ast::{
    Expression, ExpressionKind, LiteralKind, Operator, Program, Statement, StatementKind,
    UnaryOperator,
};

pub struct CodeGenerator {
    pub program: QuadrupleProgram,
}

impl CodeGenerator {
    pub fn new() -> Self {
        CodeGenerator {
            program: QuadrupleProgram::new(),
        }
    }

    pub fn generate_code(&mut self, ast: &Program) -> Option<QuadrupleProgram> {
        // Process each statement in the program
        for statement in &ast.statements {
            self.generate_statement(statement);
        }
        Some(self.program.clone())
    }

    fn generate_statement(&mut self, statement: &Statement) {
        match &statement.node {
            StatementKind::Assignment(lhs, rhs) => {
                // Generate RHS expression first
                let rhs_result = self.generate_expression(rhs);

                // Generate LHS differently depending on what it is (simple variable or array element)
                match &lhs.node {
                    ExpressionKind::Identifier(name) => {
                        // Simple variable assignment
                        self.program.add(Quadruple {
                            operation: Operation::Assign,
                            operand1: rhs_result,
                            operand2: Operand::Empty,
                            result: Operand::Variable(name.clone()),
                        });
                    }
                    ExpressionKind::ArrayAccess(name, index_expr) => {
                        // Array element assignment
                        let index = self.generate_expression(index_expr);
                        self.program.add(Quadruple {
                            operation: Operation::ArrayStore,
                            operand1: rhs_result,
                            operand2: index,
                            result: Operand::Variable(name.clone()),
                        });
                    }
                    _ => {
                        // Invalid LHS, can't handle other expression types in assignment
                        // This should be caught by semantic analysis
                    }
                }
            }
            StatementKind::IfThen(condition, then_block) => {
                let else_label = self.program.new_label();
                let cond_result = self.generate_expression(condition);

                // Jump to else label if condition is false
                self.program.add(Quadruple {
                    operation: Operation::JumpIfFalse(else_label),
                    operand1: cond_result,
                    operand2: Operand::Empty,
                    result: Operand::Empty,
                });

                // Generate code for then block
                for stmt in then_block {
                    self.generate_statement(stmt);
                }

                // Add else label
                self.program.add(Quadruple {
                    operation: Operation::Label(else_label),
                    operand1: Operand::Empty,
                    operand2: Operand::Empty,
                    result: Operand::Empty,
                });
            }
            StatementKind::IfThenElse(condition, then_block, else_block) => {
                let else_label = self.program.new_label();
                let cond_result = self.generate_expression(condition);

                // Jump to else label if condition is false
                self.program.add(Quadruple {
                    operation: Operation::JumpIfFalse(else_label),
                    operand1: cond_result,
                    operand2: Operand::Empty,
                    result: Operand::Empty,
                });

                // Generate code for then block
                for stmt in then_block {
                    self.generate_statement(stmt);
                }

                // Add else label
                self.program.add(Quadruple {
                    operation: Operation::Label(else_label),
                    operand1: Operand::Empty,
                    operand2: Operand::Empty,
                    result: Operand::Empty,
                });

                // Generate code for else block
                for stmt in else_block {
                    self.generate_statement(stmt);
                }
            }
            StatementKind::DoWhile(body, condition) => {
                let start_label = self.program.new_label();

                // Add start label
                self.program.add(Quadruple {
                    operation: Operation::Label(start_label),
                    operand1: Operand::Empty,
                    operand2: Operand::Empty,
                    result: Operand::Empty,
                });

                // Generate code for body
                for stmt in body {
                    self.generate_statement(stmt);
                }

                // Generate condition
                let cond_result = self.generate_expression(condition);

                // Jump to start if condition is true
                self.program.add(Quadruple {
                    operation: Operation::JumpIfTrue(start_label),
                    operand1: cond_result,
                    operand2: Operand::Empty,
                    result: Operand::Empty,
                });
            }
            StatementKind::For(var_name, init, end, step, body) => {
                // Extract variable name from expression
                let var_str = match &var_name.node {
                    ExpressionKind::Identifier(name) => name.clone(),
                    _ => "unknown".to_string(), // Fallback, ideally handled by semantic analysis
                };

                // Generate initialization
                let init_val = self.generate_expression(init);
                self.program.add(Quadruple {
                    operation: Operation::Assign,
                    operand1: init_val,
                    operand2: Operand::Empty,
                    result: Operand::Variable(var_str.clone()),
                });

                let loop_start = self.program.new_label();
                let loop_end = self.program.new_label();

                // Add loop start label
                self.program.add(Quadruple {
                    operation: Operation::Label(loop_start),
                    operand1: Operand::Empty,
                    operand2: Operand::Empty,
                    result: Operand::Empty,
                });

                // Generate end condition
                let end_val = self.generate_expression(end);
                let var_operand = Operand::Variable(var_str.clone());
                let temp = self.program.new_temp();

                // Compare var with end value
                self.program.add(Quadruple {
                    operation: Operation::LessThan,
                    operand1: var_operand.clone(),
                    operand2: end_val,
                    result: temp.clone(),
                });

                // If var >= end, exit loop
                self.program.add(Quadruple {
                    operation: Operation::JumpIfFalse(loop_end),
                    operand1: temp,
                    operand2: Operand::Empty,
                    result: Operand::Empty,
                });

                // Generate loop body
                for stmt in body {
                    self.generate_statement(stmt);
                }

                // Step increment
                let step_val = self.generate_expression(step);
                let new_val = self.program.new_temp();

                self.program.add(Quadruple {
                    operation: Operation::Add,
                    operand1: var_operand.clone(),
                    operand2: step_val,
                    result: new_val.clone(),
                });

                self.program.add(Quadruple {
                    operation: Operation::Assign,
                    operand1: new_val,
                    operand2: Operand::Empty,
                    result: var_operand,
                });

                // Jump back to condition
                self.program.add(Quadruple {
                    operation: Operation::Jump(loop_start),
                    operand1: Operand::Empty,
                    operand2: Operand::Empty,
                    result: Operand::Empty,
                });

                // Loop end label
                self.program.add(Quadruple {
                    operation: Operation::Label(loop_end),
                    operand1: Operand::Empty,
                    operand2: Operand::Empty,
                    result: Operand::Empty,
                });
            }
            StatementKind::Input(expr) => {
                // Handle input for a variable
                match &expr.node {
                    ExpressionKind::Identifier(name) => {
                        self.program.add(Quadruple {
                            operation: Operation::Input,
                            operand1: Operand::Empty,
                            operand2: Operand::Empty,
                            result: Operand::Variable(name.clone()),
                        });
                    }
                    ExpressionKind::ArrayAccess(name, index_expr) => {
                        let index = self.generate_expression(index_expr);
                        let temp = self.program.new_temp();

                        self.program.add(Quadruple {
                            operation: Operation::Input,
                            operand1: Operand::Empty,
                            operand2: Operand::Empty,
                            result: temp.clone(),
                        });

                        self.program.add(Quadruple {
                            operation: Operation::ArrayStore,
                            operand1: temp,
                            operand2: index,
                            result: Operand::Variable(name.clone()),
                        });
                    }
                    _ => {
                        // Invalid input target
                    }
                }
            }
            StatementKind::Output(exprs) => {
                for expr in exprs {
                    let result = self.generate_expression(expr);
                    self.program.add(Quadruple {
                        operation: Operation::Output,
                        operand1: result,
                        operand2: Operand::Empty,
                        result: Operand::Empty,
                    });
                }
            }
            StatementKind::Scope(statements) => {
                // Generate code for all statements in the scope
                for stmt in statements {
                    self.generate_statement(stmt);
                }
            }
            StatementKind::Empty => {
                // Do nothing for empty statements
            }
        }
    }

    fn generate_expression(&mut self, expr: &Expression) -> Operand {
        match &expr.node {
            ExpressionKind::Identifier(name) => Operand::Variable(name.clone()),
            ExpressionKind::ArrayAccess(name, index_expr) => {
                let index = self.generate_expression(index_expr);
                let temp = self.program.new_temp();

                self.program.add(Quadruple {
                    operation: Operation::ArrayLoad,
                    operand1: Operand::Variable(name.clone()),
                    operand2: index,
                    result: temp.clone(),
                });

                temp
            }
            ExpressionKind::Literal(lit) => match &lit.node {
                LiteralKind::Int(value) => Operand::IntLiteral(*value),
                LiteralKind::Float(value) => Operand::FloatLiteral(*value),
                LiteralKind::String(value) => Operand::StringLiteral(value.clone()),
            },
            ExpressionKind::BinaryOp(left, op, right) => {
                let left_result = self.generate_expression(left);
                let right_result = self.generate_expression(right);
                let result = self.program.new_temp();

                // Map AST operator to quadruple operation
                let operation = match op {
                    Operator::Add => Operation::Add,
                    Operator::Subtract => Operation::Subtract,
                    Operator::Multiply => Operation::Multiply,
                    Operator::Divide => Operation::Divide,
                    Operator::Equal => Operation::Equal,
                    Operator::NotEqual => Operation::NotEqual,
                    Operator::LessThan => Operation::LessThan,
                    Operator::GreaterThan => Operation::GreaterThan,
                    Operator::LessEqual => Operation::LessEqual,
                    Operator::GreaterEqual => Operation::GreaterEqual,
                    Operator::And => Operation::And,
                    Operator::Or => Operation::Or,
                };

                self.program.add(Quadruple {
                    operation,
                    operand1: left_result,
                    operand2: right_result,
                    result: result.clone(),
                });

                result
            }
            ExpressionKind::UnaryOp(op, expr) => {
                let expr_result = self.generate_expression(expr);
                let result = self.program.new_temp();

                let operation = match op {
                    UnaryOperator::Not => Operation::Not,
                };

                self.program.add(Quadruple {
                    operation,
                    operand1: expr_result,
                    operand2: Operand::Empty,
                    result: result.clone(),
                });

                result
            }
        }
    }
}

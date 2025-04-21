use crate::parser::ast::{Expression, ExpressionKind, Statement, StatementKind, Type};
use crate::semantics::analyzer_core::SemanticAnalyzer;

impl SemanticAnalyzer {
    pub fn analyze_statement(&mut self, stmt: &Statement) {
        match &stmt.node {
            StatementKind::Assignment(left, right) => {
                // Handle assignment
                self.handle_assignment(left, right);
            }

            StatementKind::IfThen(condition, then_block) => {
                // Analyze condition
                self.handle_condition(condition, Some("if condition"));
                // Analyze then block
                self.handle_scope(then_block);
            }

            StatementKind::IfThenElse(condition, then_block, else_block) => {
                // Analyze condition
                self.handle_condition(condition, Some("if-else condition"));
                // Analyze then block
                self.handle_scope(then_block);
                // Analyze else block
                self.handle_scope(else_block);
            }

            StatementKind::DoWhile(body, condition) => {
                // Analyze loop body
                self.handle_scope(body);
                // Analyze condition
                self.analyze_expression(condition);

                self.handle_condition(condition, Some("do-while condition"));
            }

            StatementKind::For(iterator, init, end, step, body) => {
                // Analyze for loop
                self.handle_forloop(iterator, init, end, step, body);
            }

            StatementKind::Input(target) => {
                self.handle_input(target);
            }

            StatementKind::Output(expressions) => {
                self.handle_output(expressions);
            }

            StatementKind::Scope(statements) => {
                // Analyze all statements in the block
                self.handle_scope(statements);
            }

            StatementKind::Empty => {
                // No-op for empty statements
            }
        }
    }

    fn handle_assignment(&mut self, left_expression: &Expression, right_expression: &Expression) {
        if let ExpressionKind::Identifier(_) | ExpressionKind::ArrayAccess(_, _) =
            &left_expression.node
        {
            // Check if left side is assignable
            if let ExpressionKind::Identifier(name) = &left_expression.node {
                if let Some(symbol) = self.symbol_table.get(name) {
                    if symbol.is_constant {
                        self.constant_modification_error(&left_expression.span, name);
                    }
                }
            }

            // Analyze both sides of the assignment
            let left_type = self.analyze_expression(left_expression);
            let right_type = self.analyze_expression(right_expression);

            if let (Some(left_type), Some(right_type)) = (left_type, right_type) {
                if !right_type.get_type().is_compatible_with(&left_type.get_type()) {
                    self.type_mismatch_error(
                        &left_expression.span,
                        &left_type.get_type(),
                        &right_type.get_type(),
                        Some("assignment"),
                    );
                }
            }
        }
    }

    fn handle_condition(&mut self, condition: &Expression, context: Option<&str>) {
        // Analyze the condition expression
        let condition_type = self.analyze_expression(condition);

        // Ensure the condition is boolean
        if let Some(cond_type) = condition_type {
            if cond_type != Type::Int {
                self.type_mismatch_error(&condition.span, &Type::Int, &cond_type.get_type(), context);
            }
        }
    }

    fn handle_scope(&mut self, then_block: &Vec<Statement>) {
        for stmt in then_block {
            self.analyze_statement(stmt);
        }
    }

    fn handle_forloop(
        &mut self,
        iterator: &Expression,
        init: &Expression,
        end: &Expression,
        step: &Expression,
        body: &Vec<Statement>,
    ) {
        // Check for duplicate iterator declaration
        let iterator_type = self.analyze_expression(iterator);
        if let Some(iterator_type) = iterator_type {
            if iterator_type != Type::Int {
                self.type_mismatch_error(
                    &iterator.span,
                    &Type::Int,
                    &iterator_type.get_type(),
                    Some("for loop iterator"),
                );
            }
        }

        // Analyze initialization
        let init_type = self.analyze_expression(init);
        if let Some(init_type) = init_type {
            if init_type != Type::Int {
                self.type_mismatch_error(
                    &init.span,
                    &Type::Int,
                    &init_type.get_type(),
                    Some("for loop initialization"),
                );
            }
        }

        let end_type = self.analyze_expression(end);
        if let Some(end_type) = end_type {
            if end_type != Type::Int {
                self.type_mismatch_error(
                    &end.span,
                    &Type::Int,
                    &end_type.get_type(),
                    Some("for loop end condition"),
                );
            }
        }

        let step_type = self.analyze_expression(step);
        if let Some(step_type) = step_type {
            if step_type != Type::Int {
                self.type_mismatch_error(
                    &step.span,
                    &Type::Int,
                    &step_type.get_type(),
                    Some("for loop step"),
                );
            }
        }

        // Analyze loop body
        self.handle_scope(body);
    }

    fn handle_input(&mut self, target: &Expression) {
        // Analyze the target expression
        let _target_type = self.analyze_expression(target);

        // Check if the target is a valid identifier
        if let ExpressionKind::Identifier(name) | ExpressionKind::ArrayAccess(name, _) =
            &target.node
        {
            if let Some(symbol) = self.symbol_table.get(name) {
                if symbol.is_constant {
                    self.constant_modification_error(&target.span, name);
                }
            }
        }
    }

    fn handle_output(&mut self, expressions: &Vec<Expression>) {
        for expr in expressions {
            // Analyze the expression
            let _expr_type = self.analyze_expression(expr);
        }
    }
}

use super::ast::{Declaration, DeclarationKind, Expression, ExpressionKind, Program, Statement, StatementKind};

impl Program {
    pub fn pretty_print(&self) {
        println!("Program: {}", self.name);
        println!("├── Declarations:");
        for (i, decl) in self.declarations.iter().enumerate() {
            let is_last = i == self.declarations.len() - 1 && self.statements.is_empty();
            decl.pretty_print("│   ", is_last);
        }
        println!("└── Statements:");
        for (i, stmt) in self.statements.iter().enumerate() {
            let is_last = i == self.statements.len() - 1;
            stmt.pretty_print("    ", is_last);
        }
    }
}

impl Declaration {
    fn pretty_print(&self, prefix: &str, is_last: bool) {
        let branch = if is_last { "└──" } else { "├──" };
        let new_prefix = if is_last { format!("{}    ", prefix) } else { format!("{}│   ", prefix) };
        match &self.node {
            DeclarationKind::Variable(names, ty) => {
                println!("{}{} Variable: {:?} : {}", prefix, branch, names, ty);
            }
            DeclarationKind::Array(names, ty, size) => {
                println!("{}{} Array: {:?} : {} [{}]", prefix, branch, names, ty, size);
            }
            DeclarationKind::VariableWithInit(names, ty, expr) => {
                println!("{}{} VariableWithInit: {:?} : {}", prefix, branch, names, ty);
                expr.pretty_print(&new_prefix, true);
            }
            DeclarationKind::ArrayWithInit(names, ty, size, exprs) => {
                println!("{}{} ArrayWithInit: {:?} : {} [{}]", prefix, branch, names, ty, size);
                for (i, expr) in exprs.iter().enumerate() {
                    expr.pretty_print(&new_prefix, i == exprs.len() - 1);
                }
            }
            DeclarationKind::Constant(name, ty, lit) => {
                println!("{}{} Constant: {} : {} = {:?}", prefix, branch, name, ty, lit.node);
            }
        }
    }
}

impl Statement {
    fn pretty_print(&self, prefix: &str, is_last: bool) {
        let branch = if is_last { "└──" } else { "├──" };
        let new_prefix = if is_last { format!("{}    ", prefix) } else { format!("{}│   ", prefix) };
        match &self.node {
            StatementKind::Assignment(lhs, rhs) => {
                println!("{}{} Assignment:", prefix, branch);
                lhs.pretty_print(&new_prefix, false);
                rhs.pretty_print(&new_prefix, true);
            }
            StatementKind::IfThen(cond, stmts) => {
                println!("{}{} IfThen:", prefix, branch);
                cond.pretty_print(&new_prefix, false);
                for (i, stmt) in stmts.iter().enumerate() {
                    stmt.pretty_print(&new_prefix, i == stmts.len() - 1);
                }
            }
            StatementKind::IfThenElse(cond, then_stmts, else_stmts) => {
                println!("{}{} IfThenElse:", prefix, branch);
                cond.pretty_print(&new_prefix, false);

                // Then branch
                let then_prefix = format!("{}{}", new_prefix, "├── Then:");
                println!("{}", then_prefix);
                let then_child_prefix = if else_stmts.is_empty() && then_stmts.len() > 0 {
                    format!("{}    ", new_prefix)
                } else {
                    format!("{}│   ", new_prefix)
                };
                for (i, stmt) in then_stmts.iter().enumerate() {
                    stmt.pretty_print(&then_child_prefix, i == then_stmts.len() - 1);
                }

                // Else branch
                let else_prefix = format!("{}{}", new_prefix, "└── Else:");
                println!("{}", else_prefix);
                let else_child_prefix = format!("{}    ", new_prefix);
                for (i, stmt) in else_stmts.iter().enumerate() {
                    stmt.pretty_print(&else_child_prefix, i == else_stmts.len() - 1);
                }
            }
            StatementKind::DoWhile(stmts, cond) => {
                println!("{}{} DoWhile:", prefix, branch);
                for (_i, stmt) in stmts.iter().enumerate() {
                    stmt.pretty_print(&new_prefix, false);
                }
                cond.pretty_print(&new_prefix, true);
            }
            StatementKind::For(init, cond, step, end, stmts) => {
                println!("{}{} For:", prefix, branch);
                init.pretty_print(&new_prefix, false);
                cond.pretty_print(&new_prefix, false);
                step.pretty_print(&new_prefix, false);
                end.pretty_print(&new_prefix, false);
                for (i, stmt) in stmts.iter().enumerate() {
                    stmt.pretty_print(&new_prefix, i == stmts.len() - 1);
                }
            }
            StatementKind::Input(expr) => {
                println!("{}{} Input:", prefix, branch);
                expr.pretty_print(&new_prefix, true);
            }
            StatementKind::Output(exprs) => {
                println!("{}{} Output:", prefix, branch);
                for (i, expr) in exprs.iter().enumerate() {
                    expr.pretty_print(&new_prefix, i == exprs.len() - 1);
                }
            }
            StatementKind::Scope(stmts) => {
                println!("{}{} Scope:", prefix, branch);
                for (i, stmt) in stmts.iter().enumerate() {
                    stmt.pretty_print(&new_prefix, i == stmts.len() - 1);
                }
            }
            StatementKind::Empty => {
                println!("{}{} Empty", prefix, branch);
            }
        }
    }
}

impl Expression {
    fn pretty_print(&self, prefix: &str, is_last: bool) {
        let branch = if is_last { "└──" } else { "├──" };
        let new_prefix = if is_last { format!("{}    ", prefix) } else { format!("{}│   ", prefix) };
        match &self.node {
            ExpressionKind::Identifier(name) => {
                println!("{}{} Identifier: {}", prefix, branch, name);
            }
            ExpressionKind::ArrayAccess(name, idx) => {
                println!("{}{} ArrayAccess: {}", prefix, branch, name);
                idx.pretty_print(&new_prefix, true);
            }
            ExpressionKind::Literal(lit) => {
                println!("{}{} Literal: {:?}", prefix, branch, lit.node);
            }
            ExpressionKind::BinaryOp(lhs, op, rhs) => {
                println!("{}{} BinaryOp: {:?}", prefix, branch, op);
                lhs.pretty_print(&new_prefix, false);
                rhs.pretty_print(&new_prefix, true);
            }
            ExpressionKind::UnaryOp(op, expr) => {
                println!("{}{} UnaryOp: {:?}", prefix, branch, op);
                expr.pretty_print(&new_prefix, true);
            }
        }
    }
}
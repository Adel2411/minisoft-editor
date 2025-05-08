export const getTokenColor = (kind: string, theme: "dark" | "light"): string => {
  const kindLower = kind.toLowerCase();

  // Rust-inspired colors with different shades of orange for different token types
  if (kindLower.includes("keyword")) {
    return `bg-[var(--token-bg-keyword)] text-[var(--syntax-keyword)]`;
  } else if (kindLower.includes("identifier")) {
    return `bg-[var(--token-bg-identifier)] text-[var(--syntax-identifier)]`;
  } else if (kindLower.includes("number") || kindLower.includes("integer")) {
    return `bg-[var(--token-bg-number)] text-[var(--syntax-number)]`;
  } else if (kindLower.includes("string")) {
    return `bg-[var(--token-bg-string)] text-[var(--syntax-string)]`;
  } else if (kindLower.includes("operator")) {
    return `bg-[var(--token-bg-operator)] text-[var(--syntax-operator)]`;
  } else if (
    kindLower.includes("punctuation") ||
    kindLower.includes("delimiter")
  ) {
    return `bg-[var(--token-bg-default)] text-[var(--syntax-punctuation)]`;
  } else {
    return `bg-[var(--token-bg-default)] text-[var(--text-secondary)]`;
  }
};

export const getSymbolKindColor = (
  kind: string,
  theme: "dark" | "light"
): string => {
  const kindLower = kind.toLowerCase();

  // Use orange-themed colors for all types to match the Rust theme
  if (kindLower.includes("variable")) {
    return `bg-[var(--token-bg-identifier)] text-[var(--accent-color)]`;
  } else if (kindLower.includes("function")) {
    return `bg-[var(--token-bg-string)] text-[var(--accent-hover)]`;
  } else if (kindLower.includes("constant")) {
    return `bg-[var(--token-bg-number)] text-[var(--info-color)]`;
  } else if (kindLower.includes("class")) {
    return `bg-[var(--token-bg-string)] text-[var(--warning-color)]`;
  } else if (kindLower.includes("operator")) {
    return `bg-[var(--token-bg-operator)] text-[var(--text-primary)]`;
  } else if (
    kindLower.includes("punctuation") ||
    kindLower.includes("delimiter")
  ) {
    return `bg-[var(--token-bg-default)] text-[var(--text-secondary)]`;
  } else {
    return `bg-[var(--token-bg-default)] text-[var(--text-secondary)]`;
  }
};

export const getNodeColor = (kind: string, theme: "dark" | "light"): string => {
  switch (kind) {
    case "Variable":
    case "VariableWithInit":
    case "Identifier":
      return `text-[var(--info-color)]`;
    case "Array":
    case "ArrayWithInit":
    case "ArrayAccess":
      return `text-[var(--accent-color)]`;
    case "Function":
    case "FunctionDecl":
    case "FunctionCall":
    case "Return":
      return `text-[var(--warning-color)]`;
    case "Constant":
      return `text-[var(--accent-hover)]`;
    case "Assignment":
      return `text-[var(--accent-color)]`;
    case "IfThen":
    case "IfThenElse":
    case "DoWhile":
    case "For":
      return `text-[var(--accent-color)]`;
    case "Input":
    case "Output":
      return `text-[var(--warning-color)]`;
    case "BinaryOp":
    case "UnaryOp":
      return `text-[var(--error-color)]`;
    case "Literal":
      return `text-[var(--accent-hover)]`;
    default:
      return `text-[var(--text-secondary)]`;
  }
};

// New utility functions for consistent theming

// Terminal-specific theming
export const getTerminalBackgroundColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "bg-[var(--bg-secondary)]" : "bg-white";
};

export const getTerminalBorderColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "border-[var(--border-color)]" : "border-[var(--border-color)]";
};

export const getTerminalHeaderColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "bg-[var(--bg-secondary)]" : "bg-white";
};

export const getTerminalTextColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]";
};

export const getTerminalSecondaryTextColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "text-[var(--text-tertiary)]" : "text-[var(--text-tertiary)]";
};

export const getTerminalCommandColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "text-[var(--accent-color)]" : "text-[var(--accent-color)]";
};

// Content panel theming
export const getPanelBackgroundColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "bg-[var(--bg-secondary)]" : "bg-white";
};

export const getPanelBorderColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "border-[var(--border-color)]" : "border-[var(--border-color)]";
};

export const getHoverBackgroundColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "hover:bg-[var(--bg-tertiary)]" : "hover:bg-[var(--bg-tertiary)]";
};

export const getActiveTabColor = (theme: "dark" | "light"): string => {
  return theme === "dark" 
    ? "border-[var(--accent-color)] text-[var(--accent-color)]" 
    : "border-[var(--accent-color)] text-[var(--accent-color)]";
};

// Button theming
export const getPrimaryButtonColors = (theme: "dark" | "light"): string => {
  return theme === "dark"
    ? "bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white"
    : "bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white";
};

export const getSecondaryButtonColors = (theme: "dark" | "light"): string => {
  return theme === "dark"
    ? "bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)]"
    : "bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)]";
};

// Input and form theming
export const getInputBackgroundColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "bg-[var(--bg-primary)]" : "bg-[var(--bg-tertiary)]";
};

export const getInputBorderColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "border-[var(--border-color)]" : "border-[var(--border-color)]";
};

// QuadrupleViewer specific colors
export const getLabelColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "text-[var(--accent-hover)]" : "text-[var(--accent-hover)]";
};

export const getOperatorColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "text-[var(--error-color)]" : "text-[var(--error-color)]";
};

export const getVariableColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "text-[var(--accent-color)]" : "text-[var(--accent-color)]";
};

export const getTempVarColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "text-[var(--info-color)]" : "text-[var(--info-color)]";
};

export const getLiteralColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "text-[var(--accent-hover)]" : "text-[var(--accent-hover)]";
};

export const getIOColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "text-[var(--info-color)]" : "text-[var(--info-color)]";
};

export const getJumpColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "text-[var(--accent-hover)]" : "text-[var(--accent-hover)]";
};

// AST Viewer specific colors
export const getObjectNameColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "text-[var(--accent-color)]" : "text-[var(--accent-color)]";
};

export const getASTTextColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "text-[var(--text-secondary)]" : "text-[var(--text-secondary)]";
};

export const getASTBorderColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "border-[var(--border-color)]" : "border-[var(--border-color)]";
};

// Editor component theming
export const getEditorBackgroundColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "bg-[var(--bg-primary)]" : "bg-[var(--bg-primary)]";
};

export const getEditorButtonColor = (theme: "dark" | "light"): string => {
  return theme === "dark" 
    ? "text-[var(--text-secondary)] hover:text-[var(--text-primary)]" 
    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]";
};

// Error reporter specific colors
export const getErrorTextColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "text-[var(--error-color)]" : "text-[var(--error-color)]";
};

export const getWarningTextColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "text-[var(--warning-color)]" : "text-[var(--warning-color)]";
};

export const getInfoTextColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "text-[var(--info-color)]" : "text-[var(--info-color)]";
};

export const getSuccessTextColor = (theme: "dark" | "light"): string => {
  return theme === "dark" ? "text-[var(--success-color)]" : "text-[var(--success-color)]";
};
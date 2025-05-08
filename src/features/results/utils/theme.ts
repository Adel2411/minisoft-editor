export const getTokenColor = (kind: string, theme: "dark" | "light"): string => {
  const kindLower = kind.toLowerCase();

  // Rust-inspired colors with different shades of orange for different token types
  if (kindLower.includes("keyword")) {
    return theme === "dark"
      ? "bg-[#3d2b1f] text-[#f39c78]"
      : "bg-[#fff1ec] text-[#cb502a]";
  } else if (kindLower.includes("identifier")) {
    return theme === "dark"
      ? "bg-[#312c28] text-[#e86f42]"
      : "bg-[#fef5f1] text-[#e05d30]";
  } else if (kindLower.includes("number") || kindLower.includes("integer")) {
    return theme === "dark"
      ? "bg-[#3e3632] text-[#fb8f67]"
      : "bg-[#fdf8f6] text-[#a84424]";
  } else if (kindLower.includes("string")) {
    return theme === "dark"
      ? "bg-[#362e2a] text-[#ffb86c]"
      : "bg-[#fef6f2] text-[#ed7d39]";
  } else if (kindLower.includes("operator")) {
    return theme === "dark"
      ? "bg-[#402f27] text-[#f3ebe7]"
      : "bg-[#feece5] text-[#cb502a]";
  } else if (
    kindLower.includes("punctuation") ||
    kindLower.includes("delimiter")
  ) {
    return theme === "dark"
      ? "bg-[#312c28] text-[#d9cec9]"
      : "bg-[#fff1ec] text-[#495057]";
  } else {
    return theme === "dark"
      ? "bg-[#312c28] text-[#d9cec9]"
      : "bg-[#fff1ec] text-[#495057]";
  }
};

export const getSymbolKindColor = (
  kind: string,
  theme: "dark" | "light"
): string => {
  const kindLower = kind.toLowerCase();

  // Use orange-themed colors for all types to match the Rust theme
  if (kindLower.includes("variable")) {
    return theme === "dark"
      ? "bg-[#3d2b1f] text-[#f39c78]"
      : "bg-[#fff1ec] text-[#e05d30]";
  } else if (kindLower.includes("function")) {
    return theme === "dark"
      ? "bg-[#402f27] text-[#ffb86c]"
      : "bg-[#feece5] text-[#cb502a]";
  } else if (kindLower.includes("constant")) {
    return theme === "dark"
      ? "bg-[#362e2a] text-[#fb8f67]"
      : "bg-[#fef6f2] text-[#a84424]";
  } else if (kindLower.includes("class")) {
    return theme === "dark"
      ? "bg-[#3e3632] text-[#e86f42]"
      : "bg-[#fdf8f6] text-[#e05d30]";
  } else if (kindLower.includes("program")) {
    return theme === "dark"
      ? "bg-[#452d1d] text-[#f39c78]"
      : "bg-[#fff5f0] text-[#cb502a]";
  } else {
    return theme === "dark"
      ? "bg-[#312c28] text-[#d9cec9]"
      : "bg-[#fff1ec] text-[#495057]";
  }
};

export const getNodeColor = (kind: string, theme: "dark" | "light"): string => {
  switch (kind) {
    case "Variable":
    case "VariableWithInit":
    case "Identifier":
      return theme === "dark" ? "text-[#fb8f67]" : "text-[#a84424]";
    case "Array":
    case "ArrayWithInit":
    case "ArrayAccess":
      return theme === "dark" ? "text-[#ffb86c]" : "text-[#ed7d39]";
    case "Constant":
      return theme === "dark" ? "text-[#f39c78]" : "text-[#cb502a]";
    case "Assignment":
      return theme === "dark" ? "text-[#f39c78]" : "text-[#e05d30]";
    case "IfThen":
    case "IfThenElse":
    case "DoWhile":
    case "For":
      return theme === "dark" ? "text-[#e86f42]" : "text-[#e05d30]";
    case "Input":
    case "Output":
      return theme === "dark" ? "text-[#ffb86c]" : "text-[#ed7d39]";
    case "BinaryOp":
    case "UnaryOp":
      return theme === "dark" ? "text-[#fa5252]" : "text-[#e03131]";
    case "Literal":
      return theme === "dark" ? "text-[#f39c78]" : "text-[#cb502a]";
    default:
      return theme === "dark" ? "text-[#d9cec9]" : "text-[#495057]";
  }
};

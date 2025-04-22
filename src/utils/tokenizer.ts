interface Token {
  type: string;
  value: string;
}

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;

  // Order matters - check more specific patterns before general ones
  const patterns: [string, RegExp][] = [
    // Whitespace gets special handling
    ["whitespace", /^[ \t\f\r]+/],
    ["newline", /^\n/],

    // Comments - Fix the regex patterns
    ["comment", /^<!- .+? -!>/], // Correct pattern for <!- Comment -!>
    ["comment", /^\{--[\s\S]*?--\}/], // Simplified pattern for {-- --}

    // Keywords
    ["keyword", /^(MainPrgm|Var|BeginPg|EndPg|let|Int|Float)\b/],

    // Control flow
    ["control", /^(if|then|else|while|for|do|from|to|step)\b/],

    // I/O operations
    ["io", /^(input|output)\b/],
    ["preprocessor", /^@define\b/],
    ["constant", /^Const\b/],

    // Literals (moved above punctuation and operators)
    ["number", /^(\([+-]?\d+\.\d+\)|\d+\.\d+)/], // FloatLiteral
    ["number", /^(\([+-]?\d+\)|\d+)/], // IntLiteral
    ["string", /^"[^"]*"/], // StringLiteral

    // Punctuation and symbols
    ["punctuation", /^[;,:]/],
    ["bracket", /^[\[\](){}]/],

    // Assignment
    ["operator", /^:=/],

    // Operators
    ["operator", /^(=|\+|-|\*|\/|>|<|>=|<=|==|!=|!)/],

    // Logic operators
    ["logical", /^(AND|OR)\b/],

    // Identifiers (check after keywords)
    ["identifier", /^[a-zA-Z][a-zA-Z0-9_]*/],
  ];

  while (pos < code.length) {
    let matched = false;

    // Try each pattern
    for (const [type, regex] of patterns) {
      const match = code.slice(pos).match(regex);
      if (match) {
        // We found a match
        const value = match[0];

        // Only add non-whitespace tokens or significant whitespace
        if (type !== "whitespace" && type !== "newline") {
          tokens.push({ type, value });
        } else {
          // Still add whitespace to preserve formatting but mark it specially
          tokens.push({ type: "whitespace", value });
        }

        pos += value.length;
        matched = true;
        break;
      }
    }

    // If no match found, add as an error token and move forward
    if (!matched) {
      tokens.push({ type: "error", value: code[pos] });
      pos++;
    }
  }

  return tokens;
}

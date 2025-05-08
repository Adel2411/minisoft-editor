import { Token, Symbol } from "@/types";

export const filterTokens = (tokens: Token[], searchTerm: string = ""): Token[] => {
  if (!searchTerm) return tokens;
  return tokens.filter(
    (token) =>
      token.kind.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.value.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const filterSymbols = (symbols: Symbol[], searchTerm: string = ""): Symbol[] => {
  if (!searchTerm) return symbols;
  return symbols.filter(
    (symbol) =>
      symbol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      symbol.kind.toLowerCase().includes(searchTerm.toLowerCase()) ||
      symbol.symbol_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      symbol.value.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const filterQuadruples = (quadruples: any[], searchTerm: string = ""): any[] => {
  if (!searchTerm) return quadruples;
  return quadruples.filter((quad) =>
    JSON.stringify(quad).toLowerCase().includes(searchTerm.toLowerCase())
  );
};

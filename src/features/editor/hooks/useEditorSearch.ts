import { useState, useRef, RefObject } from 'react';

interface UseEditorSearchProps {
  code: string;
  setCursorPosition: (position: { line: number; column: number }) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

interface SearchState {
  isSearchOpen: boolean;
  searchTerm: string;
  isReplaceOpen: boolean;
  replaceTerm: string;
  isRegexSearch: boolean;
  isCaseSensitive: boolean;
  currentMatchIndex: number;
  matches: number[];
}

export function useEditorSearch({ 
  code, 
  setCursorPosition, 
  textareaRef 
}: UseEditorSearchProps) {
  const [searchState, setSearchState] = useState<SearchState>({
    isSearchOpen: false,
    searchTerm: "",
    isReplaceOpen: false,
    replaceTerm: "",
    isRegexSearch: false,
    isCaseSensitive: false,
    currentMatchIndex: 0,
    matches: [],
  });

  const getSearchMatches = () => {
    if (!searchState.searchTerm) {
      return { 
        matches: [], 
        currentMatch: 0, 
        totalMatches: 0 
      };
    }

    const indices: number[] = [];
    let startIndex = 0;
    let index;

    if (searchState.isRegexSearch) {
      try {
        const flags = searchState.isCaseSensitive ? 'g' : 'gi';
        const regex = new RegExp(searchState.searchTerm, flags);
        let match;
        while ((match = regex.exec(code)) !== null) {
          indices.push(match.index);
          // Prevent infinite loops for zero-length matches
          if (match.index === regex.lastIndex) regex.lastIndex++;
        }
      } catch (e) {
        console.error("Invalid regex:", e);
      }
    } else {
      const searchText = searchState.isCaseSensitive ? searchState.searchTerm : searchState.searchTerm.toLowerCase();
      const codeText = searchState.isCaseSensitive ? code : code.toLowerCase();
      
      while ((index = codeText.indexOf(searchText, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchText.length;
      }
    }

    return {
      matches: indices,
      currentMatch: indices.length > 0 ? searchState.currentMatchIndex + 1 : 0,
      totalMatches: indices.length,
    };
  };

  const executeSearch = () => {
    if (!searchState.searchTerm) return;

    const { matches: searchMatches } = getSearchMatches();
    setSearchState(prev => ({
      ...prev,
      matches: searchMatches,
      currentMatchIndex: 0
    }));

    if (searchMatches.length > 0) {
      highlightMatch(searchMatches[0]);
    }
  };

  const findNext = () => {
    const { matches } = getSearchMatches();
    if (matches.length === 0) return;

    const nextIndex = (searchState.currentMatchIndex + 1) % matches.length;
    setSearchState(prev => ({
      ...prev,
      currentMatchIndex: nextIndex
    }));
    highlightMatch(matches[nextIndex]);
  };

  const findPrevious = () => {
    const { matches } = getSearchMatches();
    if (matches.length === 0) return;

    const prevIndex = (searchState.currentMatchIndex - 1 + matches.length) % matches.length;
    setSearchState(prev => ({
      ...prev,
      currentMatchIndex: prevIndex
    }));
    highlightMatch(matches[prevIndex]);
  };

  const highlightMatch = (position: number) => {
    if (!textareaRef.current) return;

    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(
      position,
      position + searchState.searchTerm.length,
    );

    // Update cursor position
    const textBeforeCursor = code.substring(0, position);
    const line = (textBeforeCursor.match(/\n/g) || []).length + 1;
    const lastNewLine = textBeforeCursor.lastIndexOf("\n");
    const column = lastNewLine === -1 ? position + 1 : position - lastNewLine;
    setCursorPosition({ line, column });
  };

  const replaceMatch = () => {
    if (!textareaRef.current || searchState.matches.length === 0) return;

    const currentMatchPos = searchState.matches[searchState.currentMatchIndex];
    
    return {
      newCode: code.substring(0, currentMatchPos) +
        searchState.replaceTerm +
        code.substring(currentMatchPos + searchState.searchTerm.length)
    };
  };

  const replaceAll = () => {
    if (!searchState.searchTerm) return { newCode: code };

    let result = code;

    try {
      if (searchState.isRegexSearch) {
        const flags = searchState.isCaseSensitive ? 'g' : 'gi';
        const regex = new RegExp(searchState.searchTerm, flags);
        result = result.replace(regex, searchState.replaceTerm);
      } else {
        const flags = searchState.isCaseSensitive ? 'g' : 'gi';
        const escapedSearchTerm = searchState.searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedSearchTerm, flags);
        result = result.replace(regex, searchState.replaceTerm);
      }
    } catch (e) {
      console.error("Error during replace all:", e);
    }

    return { newCode: result };
  };

  return {
    searchState,
    setSearchState,
    getSearchMatches,
    executeSearch,
    findNext,
    findPrevious,
    replaceMatch,
    replaceAll,
    toggleSearchPanel: (open: boolean) => {
      setSearchState(prev => ({ ...prev, isSearchOpen: open }));
    },
    toggleReplacePanel: (open: boolean) => {
      setSearchState(prev => ({ ...prev, isReplaceOpen: open }));
    }
  };
}

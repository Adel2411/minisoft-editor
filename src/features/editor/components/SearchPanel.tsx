import React from "react";
import { Search as SearchIcon, Replace as ReplaceIcon } from "lucide-react";
import { SearchState } from "../types";
import { 
  getInputBackgroundColor, 
  getInputBorderColor,
  getSecondaryButtonColors,
  getASTTextColor,
  getTerminalSecondaryTextColor,
  getEditorBackgroundColor,
  getEditorButtonColor
} from "@/utils/theme";

interface SearchPanelProps {
  theme: "dark" | "light";
  searchState: SearchState;
  setSearchTerm: (term: string) => void;
  setReplaceTerm: (term: string) => void;
  setIsRegexSearch: (isRegex: boolean) => void;
  setIsCaseSensitive: (isCaseSensitive: boolean) => void;
  executeSearch: () => void;
  findPrevious: () => void;
  findNext: () => void;
  closeSearch: () => void;
  replaceMatch: () => void;
  replaceAll: () => void;
  getSearchMatches: () => { currentMatch: number; totalMatches: number };
}

const SearchPanel: React.FC<SearchPanelProps> = ({
  theme,
  searchState,
  setSearchTerm,
  setReplaceTerm,
  setIsRegexSearch,
  setIsCaseSensitive,
  executeSearch,
  findPrevious,
  findNext,
  closeSearch,
  replaceMatch,
  replaceAll,
  getSearchMatches,
}) => {
  const { 
    searchTerm, 
    replaceTerm, 
    isRegexSearch, 
    isCaseSensitive, 
    isReplaceOpen 
  } = searchState;
  
  return (
    <div
      className={`p-2 flex flex-col gap-2 border-b ${
        getEditorBackgroundColor(theme) + " " + getInputBorderColor(theme)
      }`}
    >
      <div className="flex items-center gap-2">
        <SearchIcon
          size={14}
          className={getTerminalSecondaryTextColor(theme)}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (e.shiftKey) {
                findPrevious();
              } else {
                executeSearch();
              }
            }
          }}
          placeholder="Search"
          className={`flex-1 bg-transparent border outline-none px-2 py-1 rounded ${
            getInputBackgroundColor(theme) + " " + getInputBorderColor(theme)
          }`}
          autoFocus
        />
        <div className="flex items-center gap-1">
          <input
            type="checkbox"
            id="regex-search"
            checked={isRegexSearch}
            onChange={() => setIsRegexSearch(!isRegexSearch)}
            className="cursor-pointer"
          />
          <label
            htmlFor="regex-search"
            className={`text-xs cursor-pointer ${
              getTerminalSecondaryTextColor(theme)
            }`}
          >
            Regex
          </label>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="checkbox"
            id="case-sensitive"
            checked={isCaseSensitive}
            onChange={() => setIsCaseSensitive(!isCaseSensitive)}
            className="cursor-pointer"
          />
          <label
            htmlFor="case-sensitive"
            className={`text-xs cursor-pointer ${
              getTerminalSecondaryTextColor(theme)
            }`}
          >
            Case
          </label>
        </div>
        <button
          onClick={executeSearch}
          className={`px-2 py-1 rounded ${
            getEditorButtonColor(theme)
          }`}
        >
          Search
        </button>
        <div
          className={`text-xs ${
            getTerminalSecondaryTextColor(theme)
          }`}
        >
          {getSearchMatches().currentMatch}/{getSearchMatches().totalMatches}
        </div>
        <button
          onClick={findPrevious}
          className={`p-1 rounded ${
            getEditorButtonColor(theme)
          }`}
          title="Previous (Shift+Enter)"
        >
          ↑
        </button>
        <button
          onClick={findNext}
          className={`p-1 rounded ${
            getEditorButtonColor(theme)
          }`}
          title="Next (Enter)"
        >
          ↓
        </button>
        <button
          onClick={closeSearch}
          className={`p-1 rounded ${
            getEditorButtonColor(theme)
          }`}
          title="Close (Esc)"
        >
          ✕
        </button>
      </div>
      {isReplaceOpen && (
        <div className="flex items-center gap-2">
          <ReplaceIcon
            size={14}
            className={getTerminalSecondaryTextColor(theme)}
          />
          <input
            type="text"
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
            placeholder="Replace"
            className={`flex-1 bg-transparent border outline-none px-2 py-1 rounded ${
              getInputBackgroundColor(theme) + " " + getInputBorderColor(theme)
            }`}
          />
          <button
            onClick={replaceMatch}
            className={`px-2 py-1 rounded ${
              getEditorButtonColor(theme)
            }`}
          >
            Replace
          </button>
          <button
            onClick={replaceAll}
            className={`px-2 py-1 rounded ${
              getEditorButtonColor(theme)
            }`}
          >
            Replace All
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchPanel;

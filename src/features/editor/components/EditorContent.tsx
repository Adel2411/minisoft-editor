import React from 'react';

interface EditorContentProps {
  theme: "dark" | "light";
  highlightedCode: string;
  code: string;
  setCode: (code: string) => void;
  setSelectedText: (text: string) => void;
  handleTextareaKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  setIsFocused: (focused: boolean) => void;
  setCursorPosition: (position: { line: number; column: number }) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  fontSizeMultiplier: number;
  indentSize: number;
  showMinimap: boolean;
}

const EditorContent: React.FC<EditorContentProps> = ({
  theme,
  highlightedCode,
  code,
  setCode,
  setSelectedText,
  handleTextareaKeyDown,
  setIsFocused,
  setCursorPosition,
  textareaRef,
  fontSizeMultiplier,
  indentSize,
  showMinimap
}) => {
  return (
    <div className="relative flex-grow">
      {/* Highlighted code */}
      <div
        data-theme={theme}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
        className={`absolute top-0 left-0 w-full h-full p-4 pointer-events-none ${
          theme === "dark" ? "text-gray-100" : "text-gray-900"
        }`}
        style={{
          fontFamily: "inherit",
          fontSize: `${1 * fontSizeMultiplier}em`,
          lineHeight: "24px",
          tabSize: indentSize,
          whiteSpace: "pre",
          boxSizing: "border-box",
        }}
      />

      {/* Input textarea with enhanced keyboard handling */}
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setSelectedText(e.target.value.substring(
            e.target.selectionStart,
            e.target.selectionEnd
          ));
        }}
        onKeyDown={handleTextareaKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSelect={(e) => {
          const target = e.target as HTMLTextAreaElement;
          setSelectedText(code.substring(target.selectionStart, target.selectionEnd));
        }}
        onClick={(e) => {
          // Handle regular click for cursor position
          const cursorPos = textareaRef.current?.selectionStart || 0;
          const textBeforeCursor = code.substring(0, cursorPos);
          const line = (textBeforeCursor.match(/\n/g) || []).length + 1;
          const lastNewLine = textBeforeCursor.lastIndexOf("\n");
          const column =
            lastNewLine === -1 ? cursorPos + 1 : cursorPos - lastNewLine;
          setCursorPosition({ line, column });

          // Multiple cursor support with Alt+Click
          if (e.altKey) {
            e.preventDefault();
            console.log("Alt+Click detected for multiple cursors");
          }
        }}
        className="w-full h-full resize-none outline-none p-4 font-mono leading-6"
        spellCheck="false"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        style={{
          fontSize: `${1 * fontSizeMultiplier}em`,
          whiteSpace: "pre",
          tabSize: indentSize,
          color: "transparent",
          caretColor: theme === "dark" ? "#e86f42" : "#e05d30",
          lineHeight: "24px",
          background: "transparent",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 1,
        }}
      />

      {/* Optional minimap */}
      {showMinimap && (
        <div
          className={`absolute top-0 right-0 w-20 h-full border-l ${
            theme === "dark" ? "border-[#3e3632] bg-[#1e1a17]/50" : "border-[#efe0d9] bg-[#fff1ec]/50"
          }`}
          style={{ pointerEvents: "none" }}
        >
          <div
            className="w-full h-full opacity-30"
            style={{
              transform: "scale(0.2)",
              transformOrigin: "top right",
              overflow: "hidden",
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorContent;

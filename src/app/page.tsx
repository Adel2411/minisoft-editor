"use client";

import { useAppState } from "@/hooks/useAppState";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import { useTheme } from "@/hooks/useTheme";
import { useCompiler } from "@/hooks/useCompiler";
import { useFileOperations } from "@/hooks/useFileOperations";
import { useNotifications } from "@/hooks/useNotifications";

import WelcomeOverlay from "@/components/WelcomeOverlay";
import AppHeader from "@/components/AppHeader";
import MainContent from "@/components/MainContent";
import FileModal from "@/components/FileModal";
import ErrorReporter from "@/components/ErrorReporter";
import Terminal from "@/features/terminal/Terminal";
import SettingsModal from "@/features/settings/SettingsModal";

export default function Home() {
  const appState = useAppState();
  
  const {
    code,
    setCode,
    compilationResult,
    setCompilationResult,
    isCompiling,
    setIsCompiling,
    activeTab,
    setActiveTab,
    theme,
    setTheme,
    editorReady,
    setEditorReady,
    showWelcome,
    setShowWelcome,
    isFileModalOpen,
    setIsFileModalOpen,
    currentFileName,
    setCurrentFileName,
    error,
    setError,
    isTerminalOpen,
    setIsTerminalOpen,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    fontSizeMultiplier,
    setFontSizeMultiplier,
    indentSize,
    setIndentSize,
    showMinimap,
    setShowMinimap,
  } = appState;

  useAppInitialization({ setEditorReady, setShowWelcome });
  const { toggleTheme } = useTheme({ theme, setTheme });
  
  const { showNotification } = useNotifications(theme);
  
  const { compileCode } = useCompiler({
    code,
    setCompilationResult,
    setIsCompiling,
    setError,
    showNotification,
  });
  
  const { handleFileUpload, downloadFile } = useFileOperations({
    code,
    currentFileName,
    setCode,
    setCurrentFileName,
    showNotification,
  });

  return (
    <main
      className={`flex min-h-screen flex-col transition-colors duration-300 ${
        theme === "dark"
          ? "bg-[#1e1a17] text-[#f3ebe7]"
          : "bg-[#fefaf8] text-gray-900"
      }`}
    >
      <WelcomeOverlay 
        showWelcome={showWelcome}
        setShowWelcome={setShowWelcome}
        theme={theme}
      />

      <FileModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onFileUpload={handleFileUpload}
        theme={theme}
      />

      <AppHeader
        theme={theme}
        currentFileName={currentFileName}
        isCompiling={isCompiling}
        isTerminalOpen={isTerminalOpen}
        setIsFileModalOpen={setIsFileModalOpen}
        downloadFile={downloadFile}
        compileCode={compileCode}
        setIsTerminalOpen={setIsTerminalOpen}
        toggleTheme={toggleTheme}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
      />

      <MainContent
        theme={theme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        editorReady={editorReady}
        code={code}
        setCode={setCode}
        compileCode={compileCode}
        fontSizeMultiplier={fontSizeMultiplier}
        indentSize={indentSize}
        showMinimap={showMinimap}
        compilationResult={compilationResult}
      />

      {error && (
        <ErrorReporter
          sourceCode={code}
          errors={error}
          onDismiss={() => setError(null)}
          theme={theme}
        />
      )}

      <Terminal
        theme={theme}
        isVisible={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        compileCode={async (code, filePath) => {
          setCode(code);
          if (filePath) {
            setCurrentFileName(filePath);
          }
          await compileCode();
        }}
        setCurrentFileName={setCurrentFileName}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        theme={theme}
        setTheme={setTheme}
        setFontSizeMultiplier={setFontSizeMultiplier}
        setIndentSize={setIndentSize}
        setShowMinimap={setShowMinimap}
      />
    </main>
  );
}

interface UseFileOperationsProps {
  code: string;
  currentFileName: string | null;
  setCode: (code: string) => void;
  setCurrentFileName: (fileName: string | null) => void;
  showNotification: (message: string, isError?: boolean) => void;
}

export function useFileOperations({
  code,
  currentFileName,
  setCode,
  setCurrentFileName,
  showNotification,
}: UseFileOperationsProps) {
  
  const handleFileUpload = (content: string, fileName: string) => {
    setCode(content);
    setCurrentFileName(fileName);
  };

  const downloadFile = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFileName || "minisoft-code.ms";
    a.click();
    URL.revokeObjectURL(url);

    // Show success notification
    showNotification(
      `File "${currentFileName || "minisoft-code.ms"}" downloaded!`,
    );
  };

  return { handleFileUpload, downloadFile };
}

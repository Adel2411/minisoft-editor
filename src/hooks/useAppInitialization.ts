import { useEffect } from 'react';

interface UseAppInitializationProps {
  setEditorReady: (ready: boolean) => void;
  setShowWelcome: (show: boolean) => void;
}

export function useAppInitialization({
  setEditorReady,
  setShowWelcome,
}: UseAppInitializationProps) {
  
  // Set editor as ready after initial render and manage welcome screen
  useEffect(() => {
    setEditorReady(true);

    // Hide welcome message after 5 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [setEditorReady, setShowWelcome]);
}

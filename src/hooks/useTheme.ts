import { useEffect } from 'react';

interface UseThemeProps {
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
}

export function useTheme({ theme, setTheme }: UseThemeProps) {
  
  // Apply theme class to body
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getThemeClass = (darkClass: string, lightClass: string) => {
    return theme === "dark" ? darkClass : lightClass;
  };

  return { toggleTheme, getThemeClass };
}

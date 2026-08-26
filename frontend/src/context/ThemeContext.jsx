import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const THEME_KEY = "aetherai_theme";

const ThemeContext = createContext(null);

function getInitialTheme() {
  const storedTheme = localStorage.getItem(THEME_KEY);

  if (
    storedTheme === "light" ||
    storedTheme === "dark"
  ) {
    return storedTheme;
  }

  return window.matchMedia?.(
    "(prefers-color-scheme: light)"
  ).matches
    ? "light"
    : "dark";
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute("data-theme", theme);
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");

    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    );
  }, []);

  const setAppTheme = useCallback((nextTheme) => {
    if (
      nextTheme !== "light" &&
      nextTheme !== "dark"
    ) {
      return;
    }

    setTheme(nextTheme);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      isLight: theme === "light",
      toggleTheme,
      setTheme: setAppTheme,
    }),
    [theme, toggleTheme, setAppTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used within a ThemeProvider"
    );
  }

  return context;
}

export default ThemeProvider;

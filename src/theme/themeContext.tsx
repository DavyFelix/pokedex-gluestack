import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from "react";
import { LightTheme, DarkTheme } from "./theme";

export type AppTheme = {
  mode: "light" | "dark";
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  shadow: string;

  // adicionados
  errorBg: string;
  errorText: string;
  subtext: string;
  header: string;
  accent: string;
  lightCard: string;
};
interface ThemeContextProps {
  theme: AppTheme;
  mode: "light" | "dark";
  toggleTheme: () => void;
}

interface ProviderProps {
  children: ReactNode; // << CORREÇÃO
}

const ThemeContext = createContext<ThemeContextProps | null>(null);

export function ThemeProvider({ children }: ProviderProps) {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const theme = mode === "light" ? LightTheme : DarkTheme;

  const value: ThemeContextProps = useMemo(
    () => ({ theme, mode, toggleTheme }),
    [theme, mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);

  if (!ctx) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }

  return ctx;
}

// src/theme/themes.ts
import type { AppTheme } from "./themeContext";

export const LightTheme: AppTheme = {
  mode: "light",

  // Backgrounds
  background: "#FFFFFF",
  card: "#FFFFFF",
  lightCard: "#F3F4F6",
  header: "#FFFFFF",

  // Texto
  text: "#111827",
  textSecondary: "#6B7280",
  subtext: "#6B7280",

  // Cores de ação e destaque
  primary: "#3B82F6",
  accent: "#3B82F6",

  // Bordas e sombras
  border: "#E5E7EB",
  shadow: "#000",

  // Erro
  errorBg: "#FEE2E2",
  errorText: "#B91C1C",
};

export const DarkTheme: AppTheme = {
  mode: "dark",

  // Backgrounds
  background: "#000000",
  card: "#1C1C1E",
  lightCard: "#2C2C2E",
  header: "#000000",

  // Texto
  text: "#FFFFFF",
  textSecondary: "#A1A1AA",
  subtext: "#A1A1AA",

  // Cores de ação e destaque
  primary: "#60A5FA",
  accent: "#60A5FA",

  // Bordas e sombras
  border: "#3A3A3C",
  shadow: "#000",

  // Erro
  errorBg: "#422828",
  errorText: "#FFB4B4",
};

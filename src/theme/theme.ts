import type { AppTheme } from "./themeContext";

export const LightTheme: AppTheme = {
  mode: "light",
  background: "#FFFFFF",
  card: "#FFFFFF",
  text: "#111827",
  textSecondary: "#6B7280",
  subtext: "#6B7280",
  lightCard: "#F3F4F6", 

  border: "#E5E7EB",
  primary: "#3B82F6",
  shadow: "#000",

  header: "#FFFFFF",
  accent: "#3B82F6",

  errorBg: "#FEE2E2",
  errorText: "#B91C1C",
};

export const DarkTheme: AppTheme = {
  mode: "dark",
  background: "#000000",
  lightCard: "#2C2C2E",
  card: "#1C1C1E",
  text: "#FFFFFF",
  textSecondary: "#A1A1AA",
  subtext: "#A1A1AA",

  border: "#3A3A3C",
  primary: "#60A5FA",
  shadow: "#000",

  header: "#000000",
  accent: "#60A5FA",

  errorBg: "#422828",
  errorText: "#FFB4B4",
};
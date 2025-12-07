import { Stack } from "expo-router";
import { useTheme } from "./theme/themeContext";
import { Pressable, Text } from "react-native";

export default function RootLayout() {
  const { toggleTheme, mode } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerRight: () => (
          <Pressable onPress={toggleTheme} style={{ marginRight: 12 }}>
            <Text>{mode === "light" ? "🌙" : "☀️"}</Text>
          </Pressable>
        ),
      }}
    />
  );
}

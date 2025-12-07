import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ApolloProvider } from "@apollo/client";
import { StatusBar } from "react-native";

import { client } from "./src/apolloClient";

// Screens
import Home from "./src/screens/Home";
import PokemonDetails from "./src/screens/PokemonDetails";

// Theme Provider
import { ThemeProvider, useTheme } from "./src/theme/themeContext";

const Stack = createNativeStackNavigator();

// ------------------------------------------
// Navigation container com tema global
// ------------------------------------------
function AppNavigation() {
  const { mode, theme } = useTheme();

  const navTheme = mode === "dark" ? DarkTheme : DefaultTheme;

  return (
    <>
      <StatusBar
        barStyle={mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />

      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
            contentStyle: { backgroundColor: theme.background },
          }}
        >
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: true }}
          />

          <Stack.Screen
            name="PokemonDetails"
            component={PokemonDetails}
            options={{
              title: "Detalhes do Pokémon",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

// ------------------------------------------
// App principal com ThemeProvider global
// ------------------------------------------
export default function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        <AppNavigation />
      </ThemeProvider>
    </ApolloProvider>
  );
}

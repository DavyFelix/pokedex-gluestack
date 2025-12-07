import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ApolloProvider } from "@apollo/client";
import { client } from "./src/apolloClient"; // seu client
import Home from "./src/screens/Home";
import PokemonDetails from "./src/screens/PokemonDetails";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ApolloProvider client={client}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
          <Stack.Screen name="PokemonDetails" component={PokemonDetails} options={{ title: "Detalhes do Pokémon" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
}

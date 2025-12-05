
// App.tsx
import React from "react";
import { ApolloProvider } from "@apollo/client";
import { client } from "./src/apolloClient";
import { GluestackUIProvider } from "./gluestack-ui-provider";
import "./global.css"; // Tailwind/NativeWind

// ✅ ajuste o caminho conforme sua estrutura
import Home from "./src/screens/Home";

export default function App() {
  return (
    <ApolloProvider client={client}>
      <GluestackUIProvider>
        <Home />
      </GluestackUIProvider>
    </ApolloProvider>
  );
}

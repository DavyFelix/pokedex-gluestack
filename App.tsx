import React, { useEffect, useRef } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ApolloProvider } from "@apollo/client";
import { StatusBar, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

import { client } from "./src/apolloClient";

// Screens
import Home from "./src/screens/Home";
import PokemonDetails from "./src/screens/PokemonDetails";

// Theme Provider
import { ThemeProvider, useTheme } from "./src/theme/themeContext";

const Stack = createNativeStackNavigator();

// Configurar como as notificações aparecem quando o app está em primeiro plano
Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldShowAlert: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true, // força a compatibilidade com o tipo
    } as Notifications.NotificationBehavior),
});

function AppNavigation() {
  const { mode, theme, toggleTheme } = useTheme();
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
            headerRight: () => (
              <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 10 }}>
                <Ionicons
                  name={mode === "dark" ? "sunny" : "moon"}
                  size={24}
                  color={theme.text}
                />
              </TouchableOpacity>
            ),
          }}
        >
          <Stack.Screen name="Home" component={Home} options={{ headerShown: true }} />
          <Stack.Screen
            name="PokemonDetails"
            component={PokemonDetails}
            options={{ title: "Detalhes do Pokémon" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
  // Registrar para receber notificações push
  registerForPushNotificationsAsync().then(token => console.log("Push Token:", token));

  // Recebe notificações enquanto o app está em primeiro plano
  const notificationSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log("Notificação recebida:", notification);
  });

  // Detecta quando o usuário interage com a notificação
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log("Resposta à notificação:", response);
  });

  return () => {
    // Remove os listeners corretamente
    notificationSubscription.remove();
    responseSubscription.remove();
  };
}, []);

  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        <AppNavigation />
      </ThemeProvider>
    </ApolloProvider>
  );
}

// Função para registrar e obter o token de push
async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Falha ao obter permissão para notificações!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert("Você precisa de um dispositivo físico para receber notificações push");
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
  

  return token;
}

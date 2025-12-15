import React, { useEffect, useRef } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ApolloProvider } from "@apollo/client";
import { StatusBar, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./src/store";

import { client } from "./src/apolloClient";

// Screens
import Home from "./src/screens/Home";
import PokemonDetails from "./src/screens/PokemonDetails";


// Theme Provider
import { ThemeProvider, useTheme } from "./src/theme/themeContext";


const Stack = createNativeStackNavigator();

/* ================= NOTIFICATIONS ================= */


Notifications.setNotificationHandler({
  handleNotification: async () =>
    Platform.select({
      web: {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      },
      default: {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      },
    }) as Notifications.NotificationBehavior,
});
/* ================= NAVIGATION ================= */

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
          <Stack.Screen name="Home" component={Home} />
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

/* ================= APP ================= */

export default function App() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token =>
      console.log("Push Token:", token)
    );

    const notificationSubscription =
      Notifications.addNotificationReceivedListener(notification => {
        console.log("Notificação recebida:", notification);
      });

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log("Resposta à notificação:", response);
      });

    return () => {
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ApolloProvider client={client}>
          <ThemeProvider>
            <AppNavigation />
          </ThemeProvider>
        </ApolloProvider>
      </PersistGate>
    </Provider>
  );
}

/* ================= PUSH TOKEN ================= */

async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

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

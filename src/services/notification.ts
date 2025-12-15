import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

export async function initNotifications() {
  if (!Device.isDevice) return;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    await Notifications.requestPermissionsAsync();
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }
}

export function sendFavoriteNotification(pokemonName: string) {
  Notifications.scheduleNotificationAsync({
    content: {
      title: "⭐ Novo favorito!",
      body: `${pokemonName} foi adicionado aos seus favoritos`,
      sound: true,
    },
    trigger: null, // imediata
  });
}

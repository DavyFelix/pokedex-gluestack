import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

export async function initNotifications() {
  if (Device.isDevice) {
    const { status } = await Notifications.getPermissionsAsync();
    let final = status;

    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      final = req.status;
    }

    if (final !== "granted") {
      console.log("Permissão negada");
      return false;
    }

    return true;
  }
}

export async function sendLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: null, // dispara imediatamente
  });
}

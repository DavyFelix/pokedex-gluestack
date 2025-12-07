import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

type Stats = {
  favorites: number;
};

type StatsContextType = {
  stats: Stats;
  addFavorite: () => void;
};

const DEFAULT_STATS: Stats = { favorites: 0 };
const STORAGE_KEY = "app:stats";

const StatsContext = createContext<StatsContextType>({
  stats: DEFAULT_STATS,
  addFavorite: () => {},
});

// Função para disparar notificação local
async function sendFavoriteNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "⭐ Favorito adicionado!",
      body: "Você acabou de favoritar este Pokémon.",
      sound: true,
    },
    trigger: null, // dispara imediatamente
  });
}

export const StatsProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);

  // Carregar stats do AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setStats(JSON.parse(stored));
      } catch (e) {
        console.warn("Erro ao carregar stats:", e);
      }
    })();
  }, []);

  const addFavorite = async () => {
    try {
      const newStats = { ...stats, favorites: stats.favorites + 1 };
      setStats(newStats);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));

      // Dispara a notificação
      await sendFavoriteNotification();
    } catch (e) {
      console.warn("Erro ao salvar stats:", e);
    }
  };

  return (
    <StatsContext.Provider value={{ stats, addFavorite }}>
      {children}
    </StatsContext.Provider>
  );
};

// Hook para usar stats
export const useStats = () => useContext(StatsContext);

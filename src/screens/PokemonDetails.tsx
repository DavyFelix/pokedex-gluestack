import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Image,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery } from "@apollo/client";
import { GET_POKEMON } from "../graphql/queries";
import { RootStackParamList } from "../types/navigation";
import type { NavigationProp, RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../theme/themeContext";
import { useStats } from "../services/StatisticsContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";

type Route = RouteProp<RootStackParamList, "PokemonDetails">;

const TYPE_COLORS: Record<string, string> = {
  Fire: "#FBAE46",
  Water: "#4F90D5",
  Grass: "#7BCB5C",
  Electric: "#F4D23B",
  Psychic: "#F95587",
  Ice: "#74CEC0",
  Dragon: "#096DC4",
  Dark: "#5A5465",
  Fairy: "#EC90E7",
  Steel: "#5A8CA3",
  Rock: "#C5B889",
  Ground: "#D6B55A",
  Bug: "#A7B723",
  Ghost: "#6667B0",
  Fighting: "#C12239",
  Normal: "#A8A77A",
  Poison: "#B567CE",
  Flying: "#A1BBEC",
};
const styles = StyleSheet.create({ center: { flex: 1, justifyContent: "center", alignItems: "center" }, headerTitle: { fontSize: 20, fontWeight: "700" }, headerSubtitle: { fontSize: 13, marginTop: 4 }, pokemonImage: { width: 220, height: 220 }, name: { fontSize: 30, fontWeight: "800", marginTop: 10 }, number: { fontSize: 15, marginTop: 4 }, card: { marginTop: 20, padding: 18, borderRadius: 18, borderWidth: 1 }, sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 }, regularText: { fontSize: 15, lineHeight: 20 }, typesRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }, typePill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 50, marginRight: 8, marginBottom: 8 }, typeText: { color: "#fff", fontSize: 14, fontWeight: "600" }, row: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, gap: 12 }, statBox: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 14 }, statLabel: { fontSize: 13, marginBottom: 2 }, statValue: { fontSize: 20, fontWeight: "700" }, evoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)" }, evoImage: { width: 60, height: 60 }, evoName: { fontSize: 16, fontWeight: "600" }, evoNumber: { fontSize: 12, marginTop: 2 }, });


const FAVORITE_KEY = (name: string) => `fav:${name}`;

export default function PokemonDetails() {
  const route = useRoute<Route>();
  type PokemonDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PokemonDetails"
>;
 const navigation = useNavigation<PokemonDetailsNavigationProp>();

  const { name } = route.params;
  const { theme, mode } = useTheme();
  const { addFavorite } = useStats();
  const { data, loading, error } = useQuery(GET_POKEMON, { variables: { name } });

  const scrollY = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const favScale = useRef(new Animated.Value(1)).current;

  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const v = await AsyncStorage.getItem(FAVORITE_KEY(name));
        if (mounted) setIsFav(v === "1");
      } catch {}
    })();
    return () => { mounted = false; };
  }, [name]);

const toggleFavorite = useCallback(async () => {
  Animated.sequence([
    Animated.timing(favScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
    Animated.timing(favScale, { toValue: 1, duration: 130, useNativeDriver: true }),
  ]).start();

  const next = !isFav;
  setIsFav(next);
  await AsyncStorage.setItem(FAVORITE_KEY(name), next ? "1" : "0");

  if (next) {
    addFavorite(); // atualiza estatística global

    // Dispara notificação local
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Novo favorito!",
        body: `${name} foi adicionado aos seus favoritos ⭐`,
        sound: true,
      },
      trigger: null, // dispara imediatamente
    });
  }
}, [isFav, addFavorite, name]);
  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );

  if (error || !data?.pokemon)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Erro ao carregar dados</Text>
      </View>
    );

  const p = data.pokemon;
  const baseColor = TYPE_COLORS[p.types?.[0]] ?? theme.card;

  // animações de scroll
  const headerOpacity = scrollY.interpolate({ inputRange: [0, 140], outputRange: [1, 0], extrapolate: "clamp" });
  const headerHeight = scrollY.interpolate({ inputRange: [0, 180], outputRange: [220, Platform.OS === "ios" ? 84 : 100], extrapolate: "clamp" });
  const imageScaleOnScroll = scrollY.interpolate({ inputRange: [-120, 0, 120], outputRange: [1.6, 1, 0.9], extrapolate: "clamp" });

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient colors={[theme.background, mode === "light" ? "#F6F7FB" : "#111"]} style={StyleSheet.absoluteFill} />

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: Platform.OS === "ios" ? 220 : 200, paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* IMAGEM E FAVORITO */}
        <View style={styles.center}>
          <Animated.View style={{ transform: [{ scale: Animated.multiply(imageScaleOnScroll, pressScale) }], backgroundColor: theme.card, borderRadius: 20, padding: 14, shadowColor: theme.shadow, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 }}>
            <TouchableOpacity activeOpacity={0.9}>
              <Animated.Image source={{ uri: p.image }} style={styles.pokemonImage} resizeMode="contain" />
            </TouchableOpacity>
          </Animated.View>

          <Text style={[styles.name, { color: theme.text }]}>{p.name}</Text>
          <Text style={[styles.number, { color: theme.subtext }]}>{`#${p.number}`}</Text>

          <Animated.View style={{ transform: [{ scale: favScale }] }}>
            <TouchableOpacity onPress={toggleFavorite} style={{ marginTop: 12 }}>
              <View style={{ width: 52, height: 52, borderRadius: 14, justifyContent: "center", alignItems: "center", backgroundColor: isFav ? baseColor : theme.card, borderWidth: 1, borderColor: theme.border }}>
                <Text style={{ fontSize: 26, color: isFav ? "#fff" : baseColor }}>{isFav ? "★" : "☆"}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* CARD PRINCIPAL */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Tipos, Resistências, Classificação, Peso/Altura */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tipos</Text>
          <View style={styles.typesRow}>
            {p.types.map((t: string) => (
              <View key={t} style={[styles.typePill, { backgroundColor: TYPE_COLORS[t] ?? "#999" }]}>
                <Text style={styles.typeText}>{t}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Classificação</Text>
          <Text style={[styles.regularText, { color: theme.subtext }]}>{p.classification}</Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Resistências</Text>
              <Text style={[styles.regularText, { color: theme.subtext }]}>{p.resistant.join(", ")}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Fraquezas</Text>
              <Text style={[styles.regularText, { color: theme.subtext }]}>{p.weaknesses.join(", ")}</Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Informações Físicas</Text>
          <Text style={[styles.regularText, { color: theme.subtext }]}>Altura: {p.height.minimum} – {p.height.maximum}</Text>
          <Text style={[styles.regularText, { marginTop: 6, color: theme.subtext }]}>Peso: {p.weight.minimum} – {p.weight.maximum}</Text>
        </View>

        {/* SEÇÃO DE EVOLUÇÕES */}
        {p.evolutions?.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 20 }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Evoluções</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {p.evolutions.map((evo: any) => (
                <TouchableOpacity
                  key={evo.name}
                  style={{ alignItems: "center" }}
                  onPress={() => navigation.push("PokemonDetails", { name: evo.name })}
                >
                  <Image source={{ uri: evo.image }} style={{ width: 60, height: 60, borderRadius: 12 }} />
                  <Text style={{ color: theme.text, marginTop: 4, fontSize: 12 }}>{evo.name}</Text>
                  <Text style={{ color: theme.subtext, fontSize: 10 }}>{`#${evo.number}`}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      </Animated.ScrollView>
    </View>
  );
}

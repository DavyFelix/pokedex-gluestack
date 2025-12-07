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
import { useRoute } from "@react-navigation/native";
import { useQuery } from "@apollo/client";
import { GET_POKEMON } from "../graphql/queries";
import { RootStackParamList } from "../types/navigation";
import type { RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../theme/themeContext";

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
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  pokemonImage: {
    width: 220,
    height: 220,
  },

  name: {
    fontSize: 30,
    fontWeight: "800",
    marginTop: 10,
  },

  number: {
    fontSize: 15,
    marginTop: 4,
  },

  /* 📌 Card Genérico */
  card: {
    marginTop: 20,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },

  /* 📌 Títulos de Seção */
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  regularText: {
    fontSize: 15,
    lineHeight: 20,
  },

  /* 📌 Tipos */
  typesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },

  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
    marginRight: 8,
    marginBottom: 8,
  },

  typeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  /* 📌 Linhas em colunas */
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },

  /* 📌 Stat Cards */
  statBox: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
  },

  statLabel: {
    fontSize: 13,
    marginBottom: 2,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },

  /* 📌 Evoluções */
  evoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  evoImage: {
    width: 60,
    height: 60,
  },

  evoName: {
    fontSize: 16,
    fontWeight: "600",
  },

  evoNumber: {
    fontSize: 12,
    marginTop: 2,
  },
});


const FAVORITE_KEY = (name: string) => `fav:${name}`;

export default function PokemonDetails() {
  const route = useRoute<Route>();
  const { name } = route.params;

  // tema
  const { theme, mode } = useTheme();

  const { data, loading, error } = useQuery(GET_POKEMON, {
    variables: { name },
  });

  const scrollY = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const favScale = useRef(new Animated.Value(1)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [220, Platform.OS === "ios" ? 84 : 100],
    extrapolate: "clamp",
  });

  const imageScaleOnScroll = scrollY.interpolate({
    inputRange: [-120, 0, 120],
    outputRange: [1.6, 1, 0.9],
    extrapolate: "clamp",
  });

  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
  let mounted = true;

  (async () => {
    try {
      const v = await AsyncStorage.getItem(FAVORITE_KEY(name));
      if (mounted) setIsFav(v === "1");
    } catch {}
  })();

  return () => {
    mounted = false; // sem return de boolean!
  };
}, [name]);


  const toggleFavorite = useCallback(async () => {
    Animated.sequence([
      Animated.timing(favScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(favScale, { toValue: 1, duration: 130, useNativeDriver: true }),
    ]).start();

    const next = !isFav;
    setIsFav(next);
    await AsyncStorage.setItem(FAVORITE_KEY(name), next ? "1" : "0");
  }, [isFav]);

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

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* GRADIENTE TEMÁTICO */}
      <LinearGradient
        colors={[
          theme.background,
          mode === "light" ? "#F6F7FB" : "#111"
        ]}
        style={StyleSheet.absoluteFill}
      />

      {/* HEADER */}
      <Animated.View
        style={{
          height: headerHeight,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            opacity: headerOpacity,
            marginTop: Platform.OS === "ios" ? 38 : StatusBar.currentHeight ?? 22,
            alignItems: "center",
          }}
        >
          <Text style={[styles.headerTitle, { color: theme.text }]}>{p.name}</Text>
          <Text style={[styles.headerSubtitle, { color: theme.subtext }]}>
            #{p.number} — {p.classification}
          </Text>
        </Animated.View>
      </Animated.View>

      {/* SCROLL */}
      <Animated.ScrollView
        contentContainerStyle={{
          paddingTop: Platform.OS === "ios" ? 220 : 200,
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.center}>
          <Animated.View
            style={{
              transform: [{ scale: Animated.multiply(imageScaleOnScroll, pressScale) }],
              backgroundColor: theme.card,
              borderRadius: 20,
              padding: 14,
              shadowColor: theme.shadow,
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <TouchableOpacity activeOpacity={0.9}>
              <Animated.Image
                source={{ uri: p.image }}
                style={styles.pokemonImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </Animated.View>

          <Text style={[styles.name, { color: theme.text }]}>{p.name}</Text>
          <Text style={[styles.number, { color: theme.subtext }]}>#{p.number}</Text>

          <Animated.View style={{ transform: [{ scale: favScale }] }}>
            <TouchableOpacity onPress={toggleFavorite} style={{ marginTop: 12 }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: isFav ? baseColor : theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text style={{ fontSize: 26, color: isFav ? "#fff" : baseColor }}>
                  {isFav ? "★" : "☆"}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* CARD PRINCIPAL */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tipos</Text>

          <View style={styles.typesRow}>
            {p.types.map((t: string) => (
              <View
                key={t}
                style={[styles.typePill, { backgroundColor: TYPE_COLORS[t] ?? "#999" }]}
              >
                <Text style={styles.typeText}>{t}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Classificação</Text>
          <Text style={[styles.regularText, { color: theme.subtext }]}>
            {p.classification}
          </Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Resistências
              </Text>
              <Text style={[styles.regularText, { color: theme.subtext }]}>
                {p.resistant.join(", ")}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Fraquezas
              </Text>
              <Text style={[styles.regularText, { color: theme.subtext }]}>
                {p.weaknesses.join(", ")}
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Informações Físicas</Text>
          <Text style={[styles.regularText, { color: theme.subtext }]}>
            Altura: {p.height.minimum} – {p.height.maximum}
          </Text>

          <Text style={[styles.regularText, { marginTop: 6, color: theme.subtext }]}>
            Peso: {p.weight.minimum} – {p.weight.maximum}
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Stats</Text>

          <View style={styles.row}>
            <View style={[styles.statBox, { backgroundColor: theme.lightCard }]}>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>Máx CP</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{p.maxCP}</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: theme.lightCard }]}>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>Máx HP</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{p.maxHP}</Text>
            </View>
          </View>
        </View>

        {/* EVOLUÇÕES */}
        {p.evolutions?.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Evoluções</Text>

            {p.evolutions.map((ev: any) => (
              <View key={ev.id} style={styles.evoRow}>
                <Image source={{ uri: ev.image }} style={styles.evoImage} />

                <View style={{ marginLeft: 10 }}>
                  <Text style={[styles.evoName, { color: theme.text }]}>{ev.name}</Text>
                  <Text style={[styles.evoNumber, { color: theme.subtext }]}>
                    #{ev.number}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}


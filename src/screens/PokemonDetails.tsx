import React, { useEffect, useRef, useCallback } from "react";
import {
  View,
  Image,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery } from "@apollo/client";
import { GET_POKEMON } from "../graphql/queries";
import { RootStackParamList } from "../types/navigation";
import type { RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme/themeContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { sendFavoriteNotification } from "../services/notification";
import { initNotifications } from "../services/notification";
import * as Device from "expo-device";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  addFavorite,
  removeFavorite,
} from "../store/slices/favoritesSlice";

/* ================= TYPES ================= */

type Route = RouteProp<RootStackParamList, "PokemonDetails">;

/* ================= CORES ================= */

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

/* ================= SKELETON ================= */

function Skeleton({ width, height, radius = 12, style }: any) {
  const shimmer = useRef(new Animated.Value(0)).current;
  const { theme } = useTheme();

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 150],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          overflow: "hidden",
          backgroundColor: theme.border,
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.5)", "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

/* ================= COMPONENT ================= */

export default function PokemonDetails() {
  const route = useRoute<Route>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  useEffect(() => {
    initNotifications();
}, []);

  const { name } = route.params;
  const { theme, mode } = useTheme();
  const dispatch = useDispatch();

  const favorites = useSelector(
    (state: RootState) => state.favorites.items
  );
  const isFav = favorites.includes(name);

  const { data, loading, error } = useQuery(GET_POKEMON, {
    variables: { name },
  });

  const scrollY = useRef(new Animated.Value(0)).current;
  const favScale = useRef(new Animated.Value(1)).current;

  /* ================= FAVORITO ================= */

  const toggleFavorite = useCallback(() => {
  Animated.sequence([
    Animated.timing(favScale, {
      toValue: 1.2,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(favScale, {
      toValue: 1,
      duration: 130,
      useNativeDriver: true,
    }),
  ]).start();

  if (isFav) {
    dispatch(removeFavorite(name));
  } else {
    dispatch(addFavorite(name));

    if (Device.isDevice) {
      sendFavoriteNotification(name);
    }
  }
}, [dispatch, isFav, name]);
  /* ================= LOADING / ERROR ================= */

  if (loading || !data?.pokemon) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, padding: 20 }}>
        <Skeleton
          width={220}
          height={220}
          radius={120}
          style={{ alignSelf: "center", marginBottom: 16 }}
        />
        <Skeleton width={"60%"} height={28} />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <Text style={{ color: theme.text }}>Erro ao carregar dados</Text>
      </View>
    );
  }

  const p = data.pokemon;
  const baseColor = TYPE_COLORS[p.types?.[0]] ?? theme.card;

  /* ================= UI ================= */

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient
        colors={[theme.background, mode === "light" ? "#F6F7FB" : "#111"]}
        style={StyleSheet.absoluteFill}
      />

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
        {/* IMAGEM + FAVORITO */}
        <View style={{ alignItems: "center" }}>
          <Animated.View
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              padding: 14,
              shadowColor: theme.shadow,
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Image
              source={{ uri: p.image }}
              style={{ width: 220, height: 220 }}
              resizeMode="contain"
            />
          </Animated.View>

          <Text
            style={{
              fontSize: 30,
              fontWeight: "800",
              marginTop: 10,
              color: theme.text,
            }}
          >
            {p.name}
          </Text>

          <Text style={{ fontSize: 15, color: theme.subtext }}>
            #{p.number}
          </Text>

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
        <View
          style={{
            marginTop: 20,
            padding: 18,
            borderRadius: 18,
            borderWidth: 1,
            backgroundColor: theme.card,
            borderColor: theme.border,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text }}>
            Tipos
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 12 }}>
            {p.types.map((t: string) => (
              <View
                key={t}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 50,
                  marginRight: 8,
                  marginBottom: 8,
                  backgroundColor: TYPE_COLORS[t] ?? "#999",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>{t}</Text>
              </View>
            ))}
          </View>

          <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text }}>
            Classificação
          </Text>
          <Text style={{ color: theme.subtext, marginTop: 6 }}>
            {p.classification}
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 16,
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text }}>
                Resistências
              </Text>
              <Text style={{ color: theme.subtext, marginTop: 6 }}>
                {p.resistant.join(", ")}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text }}>
                Fraquezas
              </Text>
              <Text style={{ color: theme.subtext, marginTop: 6 }}>
                {p.weaknesses.join(", ")}
              </Text>
            </View>
          </View>

          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              marginTop: 16,
              color: theme.text,
            }}
          >
            Informações Físicas
          </Text>
          <Text style={{ color: theme.subtext, marginTop: 6 }}>
            Altura: {p.height.minimum} – {p.height.maximum}
          </Text>
          <Text style={{ color: theme.subtext, marginTop: 4 }}>
            Peso: {p.weight.minimum} – {p.weight.maximum}
          </Text>
        </View>

        {/* EVOLUÇÕES */}
        {p.evolutions?.length > 0 && (
          <View
            style={{
              marginTop: 20,
              padding: 18,
              borderRadius: 18,
              borderWidth: 1,
              backgroundColor: theme.card,
              borderColor: theme.border,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "700", marginBottom: 12, color: theme.text }}
            >
              Evoluções
            </Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              {p.evolutions.map((evo: any) => (
                <TouchableOpacity
                  key={evo.name}
                  style={{ alignItems: "center" }}
                  onPress={() =>
                    navigation.push("PokemonDetails", { name: evo.name })
                  }
                >
                  <Image
                    source={{ uri: evo.image }}
                    style={{ width: 60, height: 60, borderRadius: 12 }}
                  />
                  <Text style={{ color: theme.text, fontSize: 12, marginTop: 4 }}>
                    {evo.name}
                  </Text>
                  <Text style={{ color: theme.subtext, fontSize: 10 }}>
                    #{evo.number}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

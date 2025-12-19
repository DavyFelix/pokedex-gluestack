import React, { useEffect, useRef, useCallback } from "react";
import {
  View,
  Image,
  Animated,
  StyleSheet,
  Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@apollo/client";
import { LinearGradient } from "expo-linear-gradient";
import * as Device from "expo-device";

import { Box, VStack, HStack, Text, Pressable } from "@gluestack-ui/themed";

import { GET_POKEMON } from "../graphql/queries";
import { RootStackParamList } from "../types/navigation";
import { useTheme } from "../theme/themeContext";

import PokemonDetailsSkeleton from "./PokemonDetailsSkeleton";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  addFavorite,
  removeFavorite,
} from "../store/slices/favoritesSlice";

import {
  initNotifications,
  sendFavoriteNotification,
} from "../services/notification";

/* ================= TYPES ================= */

type PokemonDetailsRouteProp = RouteProp<
  RootStackParamList,
  "PokemonDetails"
>;

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PokemonDetails"
>;

interface Pokemon {
  name: string;
  number: string;
  image: string;
  classification: string;
  types: string[];
  resistant: string[];
  weaknesses: string[];
  height: { minimum: string; maximum: string };
  weight: { minimum: string; maximum: string };
  evolutions?: Array<{
    name: string;
    number: string;
    image: string;
  }>;
}

/* ================= CORES POR TIPO ================= */

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

/* ================= COMPONENT ================= */

export default function PokemonDetails(): JSX.Element {
  const route = useRoute<PokemonDetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { theme, mode } = useTheme();
  const dispatch = useDispatch();

  const { name } = route.params;

  useEffect(() => {
    initNotifications();
  }, []);

  const favorites = useSelector(
    (state: RootState) => state.favorites.items
  );
  const isFav = favorites.includes(name);

  const { data, loading, error } = useQuery<{ pokemon: Pokemon }>(
    GET_POKEMON,
    { variables: { name } }
  );

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
        duration: 120,
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

  if (loading) return <PokemonDetailsSkeleton />;

  if (error || !data?.pokemon) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text color={theme.text}>Erro ao carregar Pokémon</Text>
      </Box>
    );
  }
  const p = data.pokemon;
  const baseColor =
    TYPE_COLORS[p.types?.[0]] ?? theme.card;

  /* ================= UI ================= */

  return (
    <Box style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient
        colors={[
          theme.background,
          mode === "light" ? "#F6F7FB" : "#111",
        ]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.ScrollView
        contentContainerStyle={{
          paddingTop: Platform.OS === "ios" ? 220 : 200,
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <VStack alignItems="center">
          <Box
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
          </Box>

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

          <Text style={{ color: theme.subtext }}>
            #{p.number}
          </Text>

          <Animated.View
            style={{ transform: [{ scale: favScale }] }}
          >
            <Pressable
              onPress={toggleFavorite}
              style={{ marginTop: 12 }}
            >
              <Box
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: isFav
                    ? baseColor
                    : theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 26,
                    color: isFav ? "#fff" : baseColor,
                  }}
                >
                  {isFav ? "★" : "☆"}
                </Text>
              </Box>
            </Pressable>
          </Animated.View>
        </VStack>

        {/* INFO CARD */}
        <VStack
          style={{
            marginTop: 20,
            padding: 18,
            borderRadius: 18,
            borderWidth: 1,
            backgroundColor: theme.card,
            borderColor: theme.border,
            gap: 12,
          }}
        >
          <Text
            style={{ fontSize: 18, fontWeight: "700", color: theme.text }}
          >
            Tipos
          </Text>

          <HStack style={{ flexWrap: "wrap" }}>
            {p.types.map((t) => (
              <Box
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
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  {t}
                </Text>
              </Box>
            ))}
          </HStack>

          <Text
            style={{ fontSize: 18, fontWeight: "700", color: theme.text }}
          >
            Classificação
          </Text>
          <Text style={{ color: theme.subtext }}>
            {p.classification}
          </Text>

          <HStack style={{ gap: 12 }}>
            <VStack style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: theme.text }}
              >
                Resistências
              </Text>
              <Text style={{ color: theme.subtext }}>
                {p.resistant.join(", ")}
              </Text>
            </VStack>

            <VStack style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: theme.text }}
              >
                Fraquezas
              </Text>
              <Text style={{ color: theme.subtext }}>
                {p.weaknesses.join(", ")}
              </Text>
            </VStack>
          </HStack>

          <Text
            style={{ fontSize: 18, fontWeight: "700", color: theme.text }}
          >
            Informações Físicas
          </Text>
          <Text style={{ color: theme.subtext }}>
            Altura: {p.height.minimum} – {p.height.maximum}
          </Text>
          <Text style={{ color: theme.subtext }}>
            Peso: {p.weight.minimum} – {p.weight.maximum}
          </Text>
        </VStack>

        {/* EVOLUÇÕES */}
        {p.evolutions && (
          <VStack
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
              style={{ fontSize: 18, fontWeight: "700", color: theme.text }}
            >
              Evoluções
            </Text>

            <HStack style={{ gap: 12 }}>
              {p.evolutions.map((evo) => (
                <Pressable
                  key={evo.name}
                  onPress={() =>
                    navigation.push("PokemonDetails", {
                      name: evo.name,
                    })
                  }
                  style={{ alignItems: "center" }}
                >
                  <Image
                    source={{ uri: evo.image }}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 12,
                    }}
                  />
                  <Text
                    style={{ fontSize: 12, marginTop: 4, color: theme.text }}
                  >
                    {evo.name}
                  </Text>
                  <Text
                    style={{ fontSize: 10, color: theme.subtext }}
                  >
                    #{evo.number}
                  </Text>
                </Pressable>
              ))}
            </HStack>
          </VStack>
        )}
      </Animated.ScrollView>
    </Box>
  );
}

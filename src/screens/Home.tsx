import React, { useMemo, useState, useEffect, useRef, useLayoutEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_POKEMONS } from "../graphql/queries";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Pressable,
  Image,
  FlatList,
  RefreshControl,
  SafeAreaView,
  View,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { useTheme } from "src/theme/themeContext";
import { RootStackParamList } from "../types/navigation";
import { FontAwesome } from "@expo/vector-icons";

type NavProp = NativeStackNavigationProp<RootStackParamList, "Home">;

// -------------------------------------------------------------
// Skeleton
// -------------------------------------------------------------
function Skeleton({ width, height, radius = 12, style }: any) {
  const shimmer = useRef(new Animated.Value(0)).current;
  const { theme } = useTheme();

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1300,
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

// -------------------------------------------------------------
// Header Search
// -------------------------------------------------------------
function SearchHeader({ search, setSearch, onRefresh, isRefreshing }: any) {
  const { theme } = useTheme();

  return (
    <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.headerTitle, { color: theme.text }]}>Pokédex</Text>

      <View style={styles.searchRow}>
        <Input
          placeholder="Buscar Pokémon"
          value={search}
          onChangeText={setSearch}
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
              borderWidth: 1,
            },
          ]}
          placeholderTextColor={theme.textSecondary}
        />
        <Button onPress={onRefresh} disabled={isRefreshing}>
          <Text>{isRefreshing ? "..." : "↻"}</Text>
        </Button>
      </View>
    </View>
  );
}

// -------------------------------------------------------------
// Card Pokémon
// -------------------------------------------------------------
function PokemonCard({ p }: { p: any }) {
  const navigation = useNavigation<NavProp>();
  const scale = useRef(new Animated.Value(1)).current;
  const { theme } = useTheme();

  return (
    <Pressable
      onPressIn={() =>
        Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()
      }
      onPress={() => navigation.navigate("PokemonDetails", { name: p.name })}
      style={{ width: "48%" }}
    >
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            shadowColor: theme.shadow,
            transform: [{ scale }],
            borderColor: theme.border,
            borderWidth: 1,
          },
        ]}
      >
        <Image
          source={{ uri: p.image }}
          style={[styles.cardImage, { backgroundColor: theme.background }]}
          resizeMode="contain"
        />
        <Text style={[styles.cardName, { color: theme.text }]}>{p.name}</Text>
        <Text style={[styles.cardNumber, { color: theme.textSecondary }]}>
          #{p.number}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

// -------------------------------------------------------------
// Loading Grid
// -------------------------------------------------------------
function LoadingGrid() {
  return (
    <View style={styles.grid}>
      {Array.from({ length: 10 }).map((_, i) => (
        <View key={i} style={{ width: "48%", marginBottom: 16 }}>
          <View style={styles.card}>
            <Skeleton width={110} height={110} style={{ marginBottom: 12 }} />
            <Skeleton width={"70%"} height={16} />
            <Skeleton width={"40%"} height={14} style={{ marginTop: 6 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

// -------------------------------------------------------------
// Home
// -------------------------------------------------------------
export default function Home() {
  const navigation = useNavigation<NavProp>();
  const { theme, toggleTheme, mode } = useTheme();

  const [first] = useState(151);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Configuração do header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "",
      headerStyle: { backgroundColor: theme.background },
      headerShadowVisible: false,
      headerRight: () => (
        <TouchableOpacity
          onPress={toggleTheme}
          style={{ marginRight: 16 }}
          activeOpacity={0.7}
        >
          <FontAwesome
            name={mode === "light" ? "moon-o" : "sun-o"}
            size={24}
            color={theme.text}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, toggleTheme, theme, mode]);

  // debounce para pesquisa
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 200);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, loading, error, refetch } = useQuery(GET_POKEMONS, {
    variables: { first },
  });

  const list = data?.pokemons ?? [];

  const filtered = useMemo(
    () =>
      list.filter((p: any) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [list, search]
  );

  return (
    <LinearGradient colors={[theme.background, theme.background]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <SearchHeader
          search={searchInput}
          setSearch={setSearchInput}
          onRefresh={() => refetch({ first })}
          isRefreshing={loading}
        />

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: theme.errorBg }]}>
            <Text style={[styles.errorTitle, { color: theme.errorText }]}>
              Erro ao carregar
            </Text>
            <Text style={[styles.errorMessage, { color: theme.errorText }]}>
              {error.message}
            </Text>
            <Button onPress={() => refetch({ first })}>
              <Text>Tentar novamente</Text>
            </Button>
          </View>
        ) : loading ? (
          <LoadingGrid />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(p) => p.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => <PokemonCard p={item} />}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={() => refetch({ first })}
                tintColor={theme.text}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={{ color: theme.textSecondary }}>
                  Nenhum Pokémon encontrado.
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

// -------------------------------------------------------------
// STYLES
// -------------------------------------------------------------
const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    paddingTop: 4,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    justifyContent: "space-between",
  },

  card: {
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
  },

cardImage: {
  width: 110,
  height: 110,
  borderRadius: 16,
  aspectRatio: 1, // mantém proporção quadrada
},
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
  },
  cardNumber: {
    fontSize: 14,
    marginTop: 2,
  },

  errorBox: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  errorTitle: {
    fontWeight: "700",
  },
  errorMessage: { marginVertical: 6 },

  emptyBox: {
    padding: 20,
    alignItems: "center",
  },
});

import React, { useMemo, useState, useEffect, useRef, useLayoutEffect } from "react";
import { Animated, FlatList, Image, RefreshControl, Pressable } from "react-native";
import { useQuery } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { Box, VStack, HStack, Text, Button, Input, InputField } from "@gluestack-ui/themed";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectBackdrop,
} from "@gluestack-ui/themed";
import { GET_POKEMONS } from "../graphql/queries";
import { useTheme } from "src/theme/themeContext";
import { RootStackParamList } from "../types/navigation";

type NavProp = NativeStackNavigationProp<RootStackParamList, "Home">;

const types = ["Grass", "Fire", "Water", "Poison", "Electric", "Rock", "Psychic", "Ice", "Dragon"];

// -------------------- SKELETON --------------------
function Skeleton({ width, height, radius = 12, style }: { width: number | string; height: number; radius?: number; style?: any }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(shimmer, { toValue: 1, duration: 1300, useNativeDriver: true })).start();
  }, []);

  const translateX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-150, 150] });
  const boxWidth = typeof width === "number" ? width : width;
  const boxHeight = height;

  return (
    <Box width={boxWidth as any} height={boxHeight as any} borderRadius={radius} overflow="hidden" style={style}>
      <Animated.View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, transform: [{ translateX }] }}>
        <LinearGradient colors={["transparent", "rgba(255,255,255,0.4)", "transparent"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ flex: 1 }} />
      </Animated.View>
    </Box>
  );
}

// -------------------- SEARCH HEADER --------------------
function SearchHeader({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  onRefresh,
  isRefreshing,
}: {
  search: string;
  setSearch: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const { theme } = useTheme();

  return (
    <VStack
      style={{
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: theme.background,
        gap: 16,
      }}
    >
      {/* Title */}
      <Text style={{ fontSize: 36, fontWeight: "800", color: theme.text }}>
        Pokédex
      </Text>

      {/* Search Input + Refresh */}
      <HStack style={{ alignItems: "center", gap: 12 }}>
        <Input
          style={{
            flex: 1,
            borderRadius: 16,
            backgroundColor: theme.card,
            height: 48,
          }}
        >
          <InputField
            placeholder="Buscar Pokémon"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={theme.textSecondary}
            color={theme.text}
          />
        </Input>

        <Button
          onPress={onRefresh}
          isDisabled={isRefreshing}
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>{isRefreshing ? "..." : "↻"}</Text>
        </Button>
      </HStack>

      {/* Type Filter Select */}
      <Select>
  <SelectTrigger
    style={{
      height: 48,
      borderRadius: 16,
      backgroundColor: theme.card,
      paddingHorizontal: 12,
      justifyContent: "center",
    }}
  >
    <Text style={{ color: theme.text }}>
      {typeFilter || "Filtrar por tipo"}
    </Text>
  </SelectTrigger>

  <SelectContent style={{ backgroundColor: theme.card }}>
    {types.map((type) => (
      <SelectItem
        key={type}
        label={type}          // obrigatório
        value={type}          // obrigatório
        onPress={() => setTypeFilter(type)} // atualiza o estado
      />
    ))}
  </SelectContent>
</Select>
    </VStack>
  );
}

// -------------------- POKEMON CARD --------------------
function PokemonCard({ p }: { p: any }) {
  const navigation = useNavigation<NavProp>();
  const scale = useRef(new Animated.Value(1)).current;
  const { theme } = useTheme();

  return (
    <Pressable
      style={{ width: "48%", marginBottom: 16 }}
      onPress={() => navigation.navigate("PokemonDetails", { name: p.name })}
      onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <VStack
          style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 14,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Image source={{ uri: p.image }} style={{ width: 110, height: 110 }} resizeMode="contain" />
          <Text style={{ marginTop: 10, fontWeight: "700", fontSize: 16, color: theme.text }}>{p.name}</Text>
          <Text style={{ fontSize: 14, color: theme.textSecondary }}>#{p.number}</Text>
        </VStack>
      </Animated.View>
    </Pressable>
  );
}

// -------------------- LOADING GRID --------------------
function LoadingGrid() {
  return (
    <HStack style={{ flexWrap: "wrap", justifyContent: "space-between", padding: 16 }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <Box key={i} style={{ width: "48%", marginBottom: 16 }}>
          <VStack
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 14,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Skeleton width={110} height={110} />
            <Skeleton width="70%" height={16} style={{ marginTop: 12 }} />
            <Skeleton width="40%" height={14} style={{ marginTop: 6 }} />
          </VStack>
        </Box>
      ))}
    </HStack>
  );
}

// -------------------- HOME --------------------
export default function Home() {
  const navigation = useNavigation<NavProp>();
  const { theme, toggleTheme, mode } = useTheme();

  const [first] = useState(151);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "",
      headerStyle: { backgroundColor: theme.background },
      headerShadowVisible: false,
      headerRight: () => (
        <Pressable onPress={toggleTheme} style={{ marginRight: 16 }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <FontAwesome name={mode === "light" ? "moon-o" : "sun-o"} size={24} color={theme.text} />
        </Pressable>
      ),
    });
  }, [navigation, toggleTheme, theme, mode]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 200);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, loading, error, refetch } = useQuery(GET_POKEMONS, { variables: { first } });
  const list = data?.pokemons ?? [];

  const filtered = useMemo(
    () =>
      list.filter(
        (p: any) =>
          p.name.toLowerCase().includes(search.toLowerCase()) &&
          (typeFilter ? p.types.includes(typeFilter) : true)
      ),
    [list, search, typeFilter]
  );

  return (
    <LinearGradient colors={[theme.background, theme.background]} style={{ flex: 1 }}>
      <Box style={{ flex: 1 }}>
        <SearchHeader search={searchInput} setSearch={setSearchInput} typeFilter={typeFilter} setTypeFilter={setTypeFilter} onRefresh={() => refetch({ first })} isRefreshing={loading} />

        {error ? (
          <VStack style={{ margin: 16, padding: 16, backgroundColor: theme.errorBg, borderRadius: 16 }}>
            <Text style={{ fontWeight: "700", color: theme.errorText }}>Erro ao carregar</Text>
            <Text style={{ color: theme.errorText }}>{error.message}</Text>
            <Button onPress={() => refetch({ first })}>
              <Text>Tentar novamente</Text>
            </Button>
          </VStack>
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
            refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch({ first })} />}
            ListEmptyComponent={
              <Box style={{ padding: 24, alignItems: "center" }}>
                <Text style={{ color: theme.textSecondary }}>Nenhum Pokémon encontrado.</Text>
              </Box>
            }
          />
        )}
      </Box>
    </LinearGradient>
  );
}

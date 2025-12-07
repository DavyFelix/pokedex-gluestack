
import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_POKEMONS } from "../graphql/queries";
import { Box } from "@/components/ui/box";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type NavProp = NativeStackNavigationProp<RootStackParamList, "Home">;

import {
  Pressable,
  Image,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Platform,
  View,
  StyleSheet,
  Animated,
} from "react-native";


import { LinearGradient } from "expo-linear-gradient";

/**
 * Skeleton genérico com shimmer (sem depender de libs).
 * Usa gradient simples com Animated para RN; no web, usa CSS animation.
 */

type SkeletonProps = {
  width: number | string;
  height: number;
  radius?: number;
  style?: any;
};
function Skeleton({ width, height, radius = 8, style }: SkeletonProps) {
  const shimmerTranslate = React.useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerTranslate, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerTranslate, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerTranslate]);

  const translateX = shimmerTranslate.interpolate({
    inputRange: [-1, 1],
    outputRange: [-widthToNumber(width), widthToNumber(width)],
  });

  return (
    <View
      style={[
        styles.skeletonContainer,
        {
          width,
          height,
          borderRadius: radius,
        },
        style,
      ]}
    >
      {/* Base cinza */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#e5e7eb" }]} />

      {/* Faixa shimmer */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={["rgba(229,231,235,0)", "rgba(255,255,255,0.7)", "rgba(229,231,235,0)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}
function widthToNumber(w: number | string) {
  if (typeof w === "number") return w;
  // Para valores em %, usamos um valor base para o range do shimmer.
  // Ajuste se quiser um efeito diferente.
  return 200;
}

const styles = StyleSheet.create({
  skeletonContainer: {
    overflow: "hidden",
    position: "relative",
  },
});


/** Header de busca com debounce */
function SearchHeader({
  search,
  setSearch,
  onRefresh,
  isRefreshing,
}: {
  search: string;
  setSearch: (v: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  return (
    <Box style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 24, fontWeight: "800" }}>Pokédex</Text>

      <Box style={{ marginTop: 12, flexDirection: "row", alignItems: "center", columnGap: 8 }}>
        <Input
          placeholder="Buscar por nome…"
          value={search}
          onChangeText={setSearch}
          style={{
            flex: 1,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderRadius: 10,
            backgroundColor: "#fafafa",
          }}
        />
        <Button onPress={onRefresh} disabled={isRefreshing}>
          <Text>{isRefreshing ? "Atualizando…" : "Atualizar"}</Text>
        </Button>
      </Box>
    </Box>
  );
}


function PokemonCard({ p }: { p: any }) {
  const navigation = useNavigation<NavProp>();

  return (
    <Pressable
      onPress={() => navigation.navigate("PokemonDetails", { name: p.name })}
      style={{ width: "48%" }}
    >
      <Box
        style={{
          borderWidth: 1,
          borderColor: "#e5e7eb",
          borderRadius: 16,
          padding: 12,
          alignItems: "center",
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
          elevation: 2,
        }}
      >
        <Image
          source={{ uri: p.image }}
          style={{
            width: 110,
            height: 110,
            borderRadius: 12,
            marginBottom: 8,
            backgroundColor: "#f3f4f6",
          }}
        />
        <Text style={{ fontWeight: "700", fontSize: 16 }}>{p.name}</Text>
        <Text style={{ color: "#6b7280", marginTop: 2 }}>#{p.number}</Text>
      </Box>
    </Pressable>
  );
}

/** Skeleton grid enquanto carrega */
function LoadingGrid() {
  const items = Array.from({ length: 10 });
  return (
    <Box style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 16, paddingTop: 8 }}>
      {items.map((_, i) => (
        <Box key={i} style={{ width: "48%" }}>
          <Box
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 16,
              padding: 12,
              alignItems: "center",
              backgroundColor: "#fff",
            }}
          >
            <Skeleton width={110} height={110} radius={12} style={{ marginBottom: 10 }} />
            <Skeleton width={"70%"} height={16} />
            <Skeleton width={"40%"} height={14} style={{ marginTop: 6 }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export default function Home() {
  const [first, setFirst] = useState(151);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Debounce: atualiza o termo de busca 250ms depois do usuário digitar
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, loading, error, refetch } = useQuery(GET_POKEMONS, { variables: { first } });
  const list = data?.pokemons ?? [];

  const filtered = useMemo(
    () => list.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase())),
    [list, search]
  );

  const isRefreshing = loading; // simples: você pode usar apollo's networkStatus para granularidade

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <Box style={{ flex: 1 }}>
        <SearchHeader
          search={searchInput}
          setSearch={setSearchInput}
          onRefresh={() => refetch({ first })}
          isRefreshing={isRefreshing}
        />

        {/* Estados: erro / loading / lista */}
        {error ? (
          <Box style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <Box
              style={{
                borderWidth: 1,
                borderColor: "#fecaca",
                backgroundColor: "#fee2e2",
                padding: 12,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "#b91c1c", fontWeight: "700" }}>Erro</Text>
              <Text style={{ color: "#7f1d1d", marginTop: 4 }}>{String(error.message)}</Text>
              <Box style={{ marginTop: 8 }}>
                <Button onPress={() => refetch({ first })}>
                  <Text>Tentar novamente</Text>
                </Button>
              </Box>
            </Box>
          </Box>
        ) : loading ? (
          <LoadingGrid />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(p: any) => p.id}
            numColumns={2}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
            columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
            renderItem={({ item }) => <PokemonCard p={item} />}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={() => refetch({ first })} />
            }
            ListEmptyComponent={
              <Box style={{ padding: 24, alignItems: "center" }}>
                <Text style={{ color: "#6b7280" }}>Nenhum Pokémon encontrado para “{search}”.</Text>
              </Box>
            }
          />
        )}
      </Box>

      {/* CSS keyframes para web shimmer (opcional) */}
      {Platform.OS === "web" && (
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      )}
    </SafeAreaView>
  );
}

import React, { useMemo, useRef, useEffect } from "react";
import {
  Animated,
  FlatList,
  Image,
  RefreshControl,
  Pressable,
  View,
  StyleSheet,
  DimensionValue,
} from "react-native";
import { useQuery } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  InputField,
} from "@gluestack-ui/themed";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectBackdrop,
} from "@gluestack-ui/themed";
import { GET_POKEMONS } from "../graphql/queries";
import { useTheme } from "src/theme/themeContext";
import { RootStackParamList } from "../types/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setSearch, setType } from "../store/slices/filtersSlice";

/* ==================== TYPES ==================== */
type NavProp = NativeStackNavigationProp<RootStackParamList, "Home">;

/* ==================== CONSTANTS ==================== */
const types = [
  "Grass",
  "Fire",
  "Water",
  "Poison",
  "Electric",
  "Rock",
  "Psychic",
  "Ice",
  "Dragon",
  "Normal",
  "Flying",
  "Fighting",
  "Ghost",
  "Bug",
  "Ground",
  "Dark",
];

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

/* ==================== SKELETON ==================== */
interface SkeletonProps {
  width: DimensionValue;
  height: number;
  radius?: number;
  style?: any;
}

function Skeleton({
  width,
  height,
  radius = 12,
  style,
}: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

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
          backgroundColor: "#E1E9EE",
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={[
            "transparent",
            "rgba(255,255,255,0.45)",
            "transparent",
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}
function SkeletonCard() {
  return (
    <View style={{ width: "48%", marginBottom: 16 }}>
      <View
        style={{
          backgroundColor: "#FFF",
          borderRadius: 20,
          padding: 14,
          alignItems: "center",
        }}
      >
        {/* Imagem */}
        <Skeleton width={110} height={110} radius={14} />

        {/* Nome */}
        <Skeleton
          width="70%"
          height={16}
          radius={8}
          style={{ marginTop: 12 }}
        />

        {/* Número */}
        <Skeleton
          width="40%"
          height={14}
          radius={7}
          style={{ marginTop: 6 }}
        />
      </View>
    </View>
  );
}
function LoadingGrid() {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        padding: 16,
      }}
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

/* ==================== SEARCH HEADER ==================== */
function SearchHeader({
  onRefresh,
  isRefreshing,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const { search, type } = useSelector(
    (state: RootState) => state.filters
  );

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
      <Text style={{ fontSize: 36, fontWeight: "800", color: theme.text }}>
        Pokédex
      </Text>

      {/* 🔍 SEARCH */}
      <HStack style={{ alignItems: "center", gap: 12 }}>
        <Input
          style={{
            flex: 1,
            height: 48,
            backgroundColor: theme.card,
            borderRadius: 16,
          }}
        >
          <InputField
            placeholder="Buscar Pokémon"
            value={search}
            onChangeText={(text) => dispatch(setSearch(text))}
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

      {/* 🧪 FILTER */}
      <Select
        selectedValue={type}
        onValueChange={(value) => dispatch(setType(value))}
      >
        <SelectTrigger
          style={{
            height: 52,
            borderRadius: 18,
            backgroundColor: theme.card,
            paddingHorizontal: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <HStack style={{ alignItems: "center", gap: 10 }}>
            <FontAwesome
              name="filter"
              size={16}
              color={theme.textSecondary}
            />

            {type ? (
              <HStack
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: TYPE_COLORS[type] + "22",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: TYPE_COLORS[type],
                  }}
                />
                <Text
                  style={{
                    fontWeight: "700",
                    color: TYPE_COLORS[type],
                  }}
                >
                  {type}
                </Text>
              </HStack>
            ) : (
              <SelectInput
                placeholder="Filtrar por tipo"
                style={{ color: theme.textSecondary }}
              />
            )}
          </HStack>

          <FontAwesome
            name="chevron-down"
            size={16}
            color={theme.textSecondary}
          />
        </SelectTrigger>

        <SelectPortal>
          <SelectBackdrop />
          <SelectContent
            style={{ backgroundColor: theme.card, borderRadius: 18 }}
          >
            <SelectItem label="Todos" value="" />
            {types.map((t) => (
              <SelectItem key={t} label={t} value={t} />
            ))}
          </SelectContent>
        </SelectPortal>
      </Select>
    </VStack>
  );
}

/* ==================== CARD ==================== */
function PokemonCard({ p }: { p: any }) {
  const navigation = useNavigation<NavProp>();
  const scale = useRef(new Animated.Value(1)).current;
  const { theme } = useTheme();

  return (
    <Pressable
      style={{ width: "48%", marginBottom: 16 }}
      onPress={() =>
        navigation.navigate("PokemonDetails", { name: p.name })
      }
      onPressIn={() =>
        Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()
      }
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <VStack
          style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 14,
            alignItems: "center",
            elevation: 4,
          }}
        >
          <Image
            source={{ uri: p.image }}
            style={{ width: 110, height: 110 }}
            resizeMode="contain"
          />
          <Text style={{ marginTop: 10, fontWeight: "700", color: theme.text }}>
            {p.name}
          </Text>
          <Text style={{ color: theme.textSecondary }}>#{p.number}</Text>
        </VStack>
      </Animated.View>
    </Pressable>
  );
}

/* ==================== HOME ==================== */
export default function Home() {
  const { theme } = useTheme();

  const { search, type } = useSelector(
    (state: RootState) => state.filters
  );

  const { data, loading, refetch } = useQuery(GET_POKEMONS, {
    variables: { first: 151 },
  });

  const list = data?.pokemons ?? [];

  const filtered = useMemo(
    () =>
      list.filter(
        (p: any) =>
          p.name.toLowerCase().includes(search.toLowerCase()) &&
          (type ? p.types.includes(type) : true)
      ),
    [list, search, type]
  );

return (
  <LinearGradient
    colors={[theme.background, theme.background]}
    style={{ flex: 1 }}
  >
    <Box style={{ flex: 1 }}>
      <SearchHeader
        onRefresh={() => refetch()}
        isRefreshing={loading}
      />

      {loading ? (
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
            <RefreshControl refreshing={loading} onRefresh={refetch} />
          }
        />
      )}
    </Box>
  </LinearGradient>
)
}
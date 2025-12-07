import React from "react";
import { View, Image, ScrollView, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { useQuery } from "@apollo/client";
import { GET_POKEMON } from "../graphql/queries";
import { RootStackParamList } from "../types/navigation";

type Route = RouteProp<RootStackParamList, "PokemonDetails">;

export default function PokemonDetails() {
  const route = useRoute<Route>();
  const { name } = route.params;

  // 🔥 Consulta Apollo
  const { data, loading, error } = useQuery(GET_POKEMON, {
    variables: { name },
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !data?.pokemon) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: "red" }}>Erro ao carregar o Pokémon</Text>
        <Text>{String(error?.message)}</Text>
      </View>
    );
  }

  const p = data.pokemon;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ alignItems: "center", padding: 20 }}>
        <Image
          source={{ uri: p.image }}
          style={{ width: 200, height: 200, borderRadius: 20 }}
        />

        <Text style={{ fontSize: 32, fontWeight: "800", marginTop: 16 }}>
          {p.name}
        </Text>

        <Text style={{ fontSize: 18, color: "#6b7280" }}>#{p.number}</Text>

        <Text style={{ marginTop: 20, fontSize: 16 }}>
          <Text style={{ fontWeight: "700" }}>Classificação: </Text>
          {p.classification}
        </Text>

        <Text style={{ marginTop: 10, fontSize: 16 }}>
          <Text style={{ fontWeight: "700" }}>Tipos: </Text>
          {p.types?.join(", ")}
        </Text>

        <Text style={{ marginTop: 10, fontSize: 16 }}>
          <Text style={{ fontWeight: "700" }}>Resistente a: </Text>
          {p.resistant?.join(", ")}
        </Text>

        <Text style={{ marginTop: 10, fontSize: 16 }}>
          <Text style={{ fontWeight: "700" }}>Fraquezas: </Text>
          {p.weaknesses?.join(", ")}
        </Text>

        {/* Altura e peso */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>Informações físicas</Text>
          <Text style={{ marginTop: 6 }}>Altura: {p.height.minimum} – {p.height.maximum}</Text>
          <Text>Peso: {p.weight.minimum} – {p.weight.maximum}</Text>
        </View>

        {/* Stats */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>Stats</Text>
          <Text style={{ marginTop: 6 }}>Máx. CP: {p.maxCP}</Text>
          <Text>Máx. HP: {p.maxHP}</Text>
        </View>

        {/* Evoluções */}
        {p.evolutions?.length > 0 && (
          <View style={{ marginTop: 30, width: "100%" }}>
            <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 10 }}>
              Evoluções
            </Text>

            {p.evolutions.map((ev: any) => (
              <View
                key={ev.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Image
                  source={{ uri: ev.image }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 12,
                    marginRight: 12,
                  }}
                />
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {ev.name} #{ev.number}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

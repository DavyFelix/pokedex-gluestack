import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_POKEMONS } from "../graphql/queries";
import { Box } from "@/components/ui/box";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Pressable, Image } from "react-native";

export default function Home() {
  const [first, setFirst] = useState(30);
  const [search, setSearch] = useState("");
  const { data, loading, error, refetch } = useQuery(GET_POKEMONS, { variables: { first } });
  const list = data?.pokemons ?? [];
  const filtered = list.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <Box style={{ flex: 1, backgroundColor: "#fff" }}>
      <Box style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>Pokédex</Text>
        <Box style={{ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Input placeholder="Buscar por nome…" onChangeText={setSearch} style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderRadius: 8 }} />
          <Button onPress={() => refetch({ first })}><Text>Atualizar</Text></Button>
        </Box>
      </Box>
      {loading && <Text style={{ paddingHorizontal: 16 }}>Carregando…</Text>}
      {error && <Text style={{ paddingHorizontal: 16, color: "red" }}>Erro: {String(error.message)}</Text>}
      <Box style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 16, padding: 16 }}>
        {filtered.map((p: any) => (
          <Pressable key={p.id} style={{ width: "45%" }}>
            <Box style={{ borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" }}>
              <Image source={{ uri: p.image }} style={{ width: 96, height: 96, borderRadius: 12, marginBottom: 8 }} />
              <Text style={{ fontWeight: "600" }}>{p.name}</Text>
              <Text style={{ color: "#555" }}>#{p.number}</Text>
            </Box>
          </Pressable>
        ))}
      </Box>
      <Box style={{ padding: 16, flexDirection: "row", justifyContent: "center", gap: 12 }}>
        <Button onPress={() => setFirst((n) => Math.max(10, n - 10))}><Text>-10</Text></Button>
        <Button onPress={() => setFirst((n) => n + 10)}><Text>+10</Text></Button>
      </Box>
    </Box>
  );
}

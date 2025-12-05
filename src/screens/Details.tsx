import React from "react";
import { useQuery } from "@apollo/client";
import { GET_POKEMON } from "../graphql/queries";

import { Box } from "../components/ui/box";
import { Text } from "../components/ui/text";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function Details({ name = "pikachu" }: { name?: string }) {
  const { data, loading, error } = useQuery(GET_POKEMON, { variables: { name } });
  const p = data?.pokemon;
  if (loading) return <Text style={{ padding: 16 }}>Carregando…</Text>;
  if (error) return <Text style={{ padding: 16, color: "red" }}>Erro: {String(error.message)}</Text>;
  if (!p) return <Text style={{ padding: 16 }}>Não encontrado.</Text>;
  return (<Box style={{ flex: 1, padding: 16 }}><Text style={{ fontSize: 22, fontWeight: "bold" }}>{p.name} #{p.number}</Text></Box>);
}

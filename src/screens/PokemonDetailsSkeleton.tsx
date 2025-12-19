import React from "react";
import { Box, VStack, HStack } from "@gluestack-ui/themed";
import { useTheme } from "../theme/themeContext";
import type { DimensionValue } from "react-native";

type SkeletonBlockProps = {
  height: number;
  width?: DimensionValue;
  radius?: number;
};

const SkeletonBlock = ({
  height,
  width = "100%",
  radius = 12,
}: SkeletonBlockProps): JSX.Element => {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        height,
        width,
        borderRadius: radius,
        backgroundColor: theme.border,
      }}
    />
  );
};

export default function PokemonDetailsSkeleton(): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box style={{ flex: 1, backgroundColor: theme.background }}>
      <VStack
        style={{
          paddingTop: 220,
          paddingHorizontal: 20,
          gap: 20,
          alignItems: "center",
        }}
      >
        {/* Imagem */}
        <SkeletonBlock height={220} width={220} radius={20} />

        {/* Nome */}
        <SkeletonBlock height={28} width={160} />

        {/* Número */}
        <SkeletonBlock height={16} width={80} />

        {/* Card */}
        <VStack
          style={{
            marginTop: 20,
            padding: 18,
            borderRadius: 18,
            backgroundColor: theme.card,
            gap: 14,
            width: "100%",
          }}
        >
          <SkeletonBlock height={18} />
          <SkeletonBlock height={18} width="90%" />
          <SkeletonBlock height={18} width="80%" />

          <HStack style={{ gap: 12 }}>
            <SkeletonBlock height={60} />
            <SkeletonBlock height={60} />
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
}

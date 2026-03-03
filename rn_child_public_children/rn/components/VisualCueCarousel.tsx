import React from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "../constants/theme";
import { useAccessibility } from "../context/AccessibilityContext";

type Cue = {
  key: string;
  title: string;
  icon?: string | null;
  imageUrl?: string | null;
};

export default function VisualCueCarousel({ cues }: { cues: Cue[] }) {
  const { lowStimulation } = useAccessibility();
  return (
    <FlatList
      data={cues}
      keyExtractor={(c) => c.key}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10 }}
      renderItem={({ item }) => (
        <View style={[styles.card, lowStimulation && styles.cardLow]}>
          <View style={styles.top}>
            {!!item.icon && <Text style={styles.icon}>{item.icon}</Text>}
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
          {!!item.imageUrl && (
            <View style={styles.imageWrap}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
            </View>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    width: 210,
    borderRadius: RADIUS.xl,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },
  cardLow: {
    backgroundColor: "rgba(255,255,255,0.98)",
  },
  top: { flexDirection: "row", gap: 10, alignItems: "center" },
  icon: { fontSize: 20 },
  title: { flex: 1, fontWeight: "900", color: COLORS.ink, lineHeight: 18 },
  imageWrap: {
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(28,53,87,0.06)",
    borderWidth: 1,
    borderColor: "rgba(28,53,87,0.10)",
  },
  image: { width: "100%", height: 110 },
});

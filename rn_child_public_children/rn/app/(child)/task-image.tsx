import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { clamp } from "../../constants/responsive";
import { COLORS, RADIUS } from "../../constants/theme";

const options = [
  { id: "mbwa", label: "Mbwa", img: require("../../assets/mbwa.png") },
  { id: "paka", label: "Paka", img: require("../../assets/paka.png") },
  { id: "mbuzi", label: "Mbuzi", img: require("../../assets/mbuzi.png") },
  { id: "ndege", label: "Ndege", img: require("../../assets/ndege.png") },
];

export default function TaskImage() {
  const { topic, step } = useLocalSearchParams<{ topic?: string; step?: string }>();
  const correct = "mbwa";
  const { width } = useWindowDimensions();

  const promptSize = clamp(width * 0.045, 16, 22);
  const labelSize = clamp(width * 0.04, 16, 20);

  const pick = (id: string) => {
    router.push({
      pathname: "/(child)/result",
      params: { ok: id === correct ? "1" : "0", topic: topic ?? "animals", step: step ?? "1" },
    });
  };

  return (
    <ResponsiveScreen>
      <TopBar
        title={`${topic ?? "animals"} - Task ${step ?? "1"}/8`}
        rightIcon="⚙️"
        onRight={() => router.push("/(child)/caregiver-pin")}
      />

      <Pressable style={styles.backRow} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={20} color={COLORS.ink} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <GlassCard>
        <Text style={[styles.prompt, { fontSize: promptSize }]}>Chagua picha ya mbwa.</Text>
      </GlassCard>

      {/* ✅ FIXED SIZE GRID */}
      <View style={styles.grid}>
        {options.map((o) => (
          <View key={o.id} style={styles.gridItem}>
            <Pressable style={styles.card} onPress={() => pick(o.id)}>
              <Image source={o.img} style={styles.img} />
              <View style={styles.labelWrap}>
                <Text style={[styles.label, { fontSize: labelSize }]}>{o.label}</Text>
              </View>
            </Pressable>
          </View>
        ))}
      </View>
    </ResponsiveScreen>
  );
}

const CARD_HEIGHT = 190;
const IMAGE_HEIGHT = 120;

const styles = StyleSheet.create({
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  backText: { fontSize: 14, fontWeight: "800", color: COLORS.ink },

  prompt: {
    fontWeight: "900",
    color: COLORS.ink,
    textAlign: "center",
  },

  grid: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },

  gridItem: {
    width: "50%",
    paddingHorizontal: 6,
    paddingBottom: 12,
  },

  // ✅ FIXED HEIGHT CARD
  card: {
    height: CARD_HEIGHT,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: RADIUS.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    justifyContent: "flex-start",
  },

  // ✅ FIXED IMAGE HEIGHT
  img: {
    width: "100%",
    height: IMAGE_HEIGHT,
    borderRadius: 14,
    resizeMode: "cover",
  },

  // ✅ LABEL AREA FIXED
  labelWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  label: {
    fontWeight: "900",
    color: COLORS.ink,
    textAlign: "center",
  },
});

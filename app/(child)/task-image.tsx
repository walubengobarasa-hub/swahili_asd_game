import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveGrid from "../../components/ResponsiveGrid";
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

      <View style={{ marginTop: 14 }}>
        <ResponsiveGrid gap={12}>
          {options.map((o) => (
            <Pressable key={o.id} style={styles.card} onPress={() => pick(o.id)}>
              <Image source={o.img} style={styles.img} />
              <Text style={[styles.label, { fontSize: labelSize }]}>{o.label}</Text>
            </Pressable>
          ))}
        </ResponsiveGrid>
      </View>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10, paddingHorizontal: 4 },
  backText: { fontSize: 14, fontWeight: "800", color: COLORS.ink },

  prompt: { fontWeight: "900", color: COLORS.ink, textAlign: "center" },

  card: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: RADIUS.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },
  img: { width: "100%", aspectRatio: 1.2, borderRadius: 14, resizeMode: "cover" },
  label: { marginTop: 8, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
});

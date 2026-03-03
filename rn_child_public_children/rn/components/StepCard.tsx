import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "../constants/theme";
import { useAccessibility } from "../context/AccessibilityContext";

type Props = {
  step: number;
  total: number;
  title?: string;
  text: string;
  icon?: string | null;
  imageUrl?: string | null;
  onRepeat?: () => void;
  onShowMe?: () => void;
};

export default function StepCard({
  step,
  total,
  title,
  text,
  icon,
  imageUrl,
  onRepeat,
  onShowMe,
}: Props) {
  const { lowStimulation } = useAccessibility();
  return (
    <View style={[styles.card, lowStimulation && styles.cardLow]}>
      <View style={styles.topRow}>
        <Text style={styles.stepText}>{`Step ${step} of ${total}`}</Text>
        {!!icon && <Text style={styles.icon}>{icon}</Text>}
      </View>

      {!!title && <Text style={styles.title}>{title}</Text>}

      {!!imageUrl && (
        <View style={styles.imageWrap}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        </View>
      )}

      <Text style={styles.body}>{text}</Text>

      <View style={styles.actions}>
        <Pressable onPress={onRepeat} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]}>
          <Text style={styles.btnText}>Repeat</Text>
        </Pressable>
        <Pressable onPress={onShowMe} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]}>
          <Text style={styles.btnText}>Show me</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },
  cardLow: {
    backgroundColor: "rgba(255,255,255,0.98)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepText: { fontWeight: "900", color: COLORS.ink },
  icon: { fontSize: 20 },
  title: { marginTop: 8, fontWeight: "900", fontSize: 16, color: COLORS.ink },
  body: { marginTop: 10, fontWeight: "800", color: "rgba(28,53,87,0.80)", lineHeight: 22 },
  imageWrap: {
    marginTop: 10,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(28,53,87,0.10)",
    backgroundColor: "rgba(28,53,87,0.06)",
  },
  image: { width: "100%", height: 160 },
  actions: { marginTop: 12, flexDirection: "row", gap: 10 },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cream,
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },
  btnText: { fontWeight: "900", color: COLORS.ink },
});

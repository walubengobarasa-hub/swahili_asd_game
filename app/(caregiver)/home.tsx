import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";

export default function CaregiverHome() {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;

  const [childId, setChildId] = useState("1");

  const safeChildId = useMemo(() => {
    const n = Number(childId);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [childId]);

  return (
    <ResponsiveScreen>
      <TopBar title="Caregiver" rightIcon="✕" onRight={() => router.back()} />

      <View style={{ gap: 14 }}>
        <GlassCard>
          <Text style={styles.h1}>Caregiver Dashboard</Text>
          <Text style={styles.p}>
            Track progress and manage session settings for your child. (MVP: enter a Child ID.)
          </Text>

          <View style={{ marginTop: 12, gap: 8 }}>
            <Text style={styles.label}>Child ID</Text>
            <TextInput
              value={childId}
              onChangeText={setChildId}
              keyboardType="number-pad"
              placeholder="e.g. 1"
              placeholderTextColor="rgba(28,53,87,0.45)"
              style={styles.input}
            />

            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(caregiver)/dashboard",
                  params: { child_id: String(safeChildId) },
                })
              }
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.92 }]}
            >
              <Text style={styles.primaryBtnText}>Open Dashboard</Text>
            </Pressable>
          </View>
        </GlassCard>

        <View style={[styles.grid, isWide && styles.gridWide]}>
          <Pressable
            onPress={() =>
              router.push({ pathname: "/(caregiver)/child-progress", params: { childId: String(safeChildId) } })
            }
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.92 }]}
          >
            <Text style={styles.actionTitle}>Child Progress</Text>
            <Text style={styles.actionDesc}>View attempts, accuracy, and summary stats.</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push({ pathname: "/(caregiver)/settings", params: { child_id: String(safeChildId) } })}
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.92 }]}
          >
            <Text style={styles.actionTitle}>Session Settings</Text>
            <Text style={styles.actionDesc}>Set session minutes and sound options.</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(caregiver)/activity-history")}
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.92 }]}
          >
            <Text style={styles.actionTitle}>Activity History</Text>
            <Text style={styles.actionDesc}>Recent tasks (placeholder until endpoint exists).</Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/(child)/topics")}
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.92 }]}
          >
            <Text style={styles.actionTitle}>Back to Child App</Text>
            <Text style={styles.actionDesc}>Return to topics and continue play.</Text>
          </Pressable>
        </View>
      </View>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 20, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  p: { marginTop: 8, fontWeight: "700", color: "rgba(28,53,87,0.75)", textAlign: "center", lineHeight: 20 },

  label: { fontWeight: "900", color: COLORS.ink },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    color: COLORS.ink,
    backgroundColor: "rgba(255,255,255,0.75)",
  },

  primaryBtn: {
    marginTop: 6,
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.green,
    borderWidth: 1,
    borderColor: COLORS.greenDark,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "white", fontWeight: "900", fontSize: 16 },

  grid: { gap: 12 },
  gridWide: { flexDirection: "row", flexWrap: "wrap" },

  actionCard: {
    borderRadius: RADIUS.xl,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },
  actionTitle: { fontWeight: "900", fontSize: 16, color: COLORS.ink },
  actionDesc: { marginTop: 6, fontWeight: "700", color: "rgba(28,53,87,0.72)" },
});

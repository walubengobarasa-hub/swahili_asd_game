import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import GlassCard from "../components/GlassCard";
import ResponsiveScreen from "../components/ResponsiveScreen";
import { COLORS, RADIUS } from "../constants/theme";

export default function Index() {
  return (
    <ResponsiveScreen>
      <GlassCard>
        <Text style={styles.h1}>Choose Role</Text>

        <Pressable style={styles.role} onPress={() => router.push("/(child)/start")}>
          <Text style={styles.roleTxt}>Child</Text>
        </Pressable>

        <Pressable style={styles.role} onPress={() => router.push("/(teacher)/home")}>
          <Text style={styles.roleTxt}>Teacher</Text>
        </Pressable>

        <Pressable style={styles.role} onPress={() => router.push("/(caregiver)/home")}>
          <Text style={styles.roleTxt}>Caregiver</Text>
        </Pressable>
      </GlassCard>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: "900", color: COLORS.ink, marginBottom: 12 },
  role: {
    backgroundColor: COLORS.cream,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },
  roleTxt: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
});

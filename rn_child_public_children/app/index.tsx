import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, ActivityIndicator } from "react-native";
import GlassCard from "../components/GlassCard";
import ResponsiveScreen from "../components/ResponsiveScreen";
import { COLORS, RADIUS } from "../constants/theme";
import { getSession } from "../lib/api";

export default function Index() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { token, role } = await getSession();
        if (token && role === "teacher") {
          router.replace("/(teacher)/home");
          return;
        }
        if (token && role === "caregiver") {
          router.replace("/(caregiver)/home");
          return;
        }
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) {
    return (
      <ResponsiveScreen>
        <GlassCard>
          <ActivityIndicator />
        </GlassCard>
      </ResponsiveScreen>
    );
  }

  return (
    <ResponsiveScreen>
      <GlassCard>
        <Text style={styles.h1}>Choose Role</Text>

        <Pressable style={styles.role} onPress={() => router.push("/(child)/start")}>
          <Text style={styles.roleTxt}>Child</Text>
        </Pressable>

        <Pressable style={styles.role} onPress={() => router.push("/login?role=teacher")}>
          <Text style={styles.roleTxt}>Teacher</Text>
        </Pressable>

        <Pressable style={styles.role} onPress={() => router.push("/login?role=caregiver")}>
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

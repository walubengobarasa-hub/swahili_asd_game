import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS } from "../../constants/theme";
import { clearSession } from "../../lib/api";

export default function TeacherSettings() {
  return (
    <ResponsiveScreen>
      <TopBar title="Settings" rightIcon="✕" onRight={() => router.back()} />

      <GlassCard>
        <Text style={styles.h1}>Account</Text>
        <Text style={styles.p}>You will stay logged in until you log out.</Text>

        <Pressable
          onPress={async () => {
            await clearSession();
            router.replace("/");
          }}
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.92 }]}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </GlassCard>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  p: { marginTop: 8, fontWeight: "700", color: "rgba(28,53,87,0.75)", textAlign: "center" },
  logoutBtn: {
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "#D64545",
    borderWidth: 1,
    borderColor: "#B42318",
    alignItems: "center",
  },
  logoutText: { color: "white", fontWeight: "900", fontSize: 16 },
});

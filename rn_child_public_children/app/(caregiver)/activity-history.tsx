import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";

export default function ActivityHistory() {
  return (
    <ResponsiveScreen>
      <TopBar title="Activity History" rightIcon="✕" onRight={() => router.back()} />
      
      
      <GlassCard>
        <Text style={styles.h1}>Recent Activity</Text>
        <Text style={styles.p}>
          This is a preview. It will use <Text style={styles.mono}>GET /caregiver/activity</Text> once the endpoint is ready.
        </Text>

        <View style={{ marginTop: 12, gap: 10 }}>
          {[
            { kind: "Match image", word: "mbwa", result: "correct", when: "2 mins ago" },
            { kind: "Match word", word: "paka", result: "wrong", when: "10 mins ago" },
            { kind: "Listen & choose", word: "mkate", result: "correct", when: "yesterday" },
          ].map((r, i) => (
            <View key={i} style={styles.fakeRow}>
              <Text style={styles.fakeTitle}>{r.kind} • “{r.word}” • {r.result}</Text>
              <Text style={styles.fakeMeta}>{r.when}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  p: { marginTop: 10, fontWeight: "700", color: "rgba(28,53,87,0.75)", textAlign: "center", lineHeight: 20 },
  mono: { fontWeight: "900", color: "#7C3AED" },

  fakeRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.stroke, backgroundColor: "rgba(255,255,255,0.65)" },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green },
  fakeText: { fontWeight: "800", color: "rgba(28,53,87,0.78)" },

  btn: { marginTop: 14, paddingVertical: 14, borderRadius: RADIUS.xl, backgroundColor: COLORS.green, borderWidth: 1, borderColor: COLORS.greenDark, alignItems: "center" },
  btnText: { color: "white", fontWeight: "900" },
});

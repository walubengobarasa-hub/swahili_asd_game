import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";
import { getJSON } from "../../lib/api";

type TopicRow = { key: string; label_sw?: string; label_en?: string };

export default function LessonFocus() {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;

  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const rows = await getJSON("/topics");
      setTopics(Array.isArray(rows) ? (rows as TopicRow[]) : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load topics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ResponsiveScreen>
      <TopBar title="Lesson Focus" rightIcon="✕" onRight={() => router.back()} />

      <GlassCard>
        <Text style={styles.h1}>Topics from API</Text>
        <Text style={styles.p}>
          These topics come from <Text style={styles.mono}>GET /topics</Text>.
        </Text>

        <Pressable onPress={load} style={({ pressed }) => [styles.refresh, pressed && { opacity: 0.92 }]}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </GlassCard>

      {loading ? (
        <GlassCard>
          <View style={{ alignItems: "center", paddingVertical: 12 }}>
            <ActivityIndicator />
            <Text style={styles.muted}>Loading…</Text>
          </View>
        </GlassCard>
      ) : err ? (
        <GlassCard>
          <Text style={styles.err}>{err}</Text>
        </GlassCard>
      ) : (
        <View style={[styles.grid, isWide && styles.gridWide]}>
          {topics.map((t) => {
            const label = t.label_en || t.label_sw || t.key;
            return (
              <View key={t.key} style={[styles.itemWrap, isWide && styles.itemWrapWide]}>
                <GlassCard>
                  <Text style={styles.itemTitle}>{label}</Text>
                  <Text style={styles.itemMeta}>Key: {t.key}</Text>

                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/(teacher)/generate",
                      })
                    }
                    style={({ pressed }) => [styles.btn, pressed && { opacity: 0.92 }]}
                  >
                    <Text style={styles.btnText}>Generate for this Topic</Text>
                  </Pressable>
                </GlassCard>
              </View>
            );
          })}
        </View>
      )}
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  p: { marginTop: 8, fontWeight: "700", color: "rgba(28,53,87,0.75)", textAlign: "center" },
  mono: { fontWeight: "900", color: "#7C3AED" },

  refresh: {
    marginTop: 12,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "rgba(124,58,237,0.10)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.35)",
  },
  refreshText: { fontWeight: "900", color: "#7C3AED" },

  muted: { marginTop: 10, fontWeight: "800", color: "rgba(28,53,87,0.7)" },
  err: { fontWeight: "800", color: "#B42318", textAlign: "center" },

  grid: { marginTop: 14, gap: 12 },
  gridWide: { flexDirection: "row", flexWrap: "wrap" },
  itemWrap: {},
  itemWrapWide: { width: "49%" },

  itemTitle: { fontWeight: "900", fontSize: 16, color: COLORS.ink, textAlign: "center" },
  itemMeta: { marginTop: 6, fontWeight: "800", color: "rgba(28,53,87,0.7)", textAlign: "center" },

  btn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.green,
    borderWidth: 1,
    borderColor: COLORS.greenDark,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "900" },
});

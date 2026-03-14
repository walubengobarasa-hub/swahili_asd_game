import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";
import { api } from "../../lib/api";

export default function TeacherRecentTasks() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);

    try {
      const res = await api.getTeacherChildrenReports();

      const items = Array.isArray(res?.items) ? res.items : [];

      const formatted = items.map((c: any) => ({
        when: `${c.total_attempts ?? 0} attempts`,
        label: `${c.child_name ?? "Child"} • Level ${c.current_level ?? 1} • Accuracy ${Math.round((c.accuracy ?? 0) * 100)}%`,
      }));

      setTasks(formatted);
    } catch (e: any) {
      setErr(e?.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ResponsiveScreen>
      <TopBar title="Recent Tasks" rightIcon="✕" onRight={() => router.back()} />

      <GlassCard>
        <Text style={styles.h1}>Recent Tasks</Text>
        <Text style={styles.p}>
          Real task activity from children sessions.
        </Text>

        {loading ? (
          <View style={{ marginTop: 14 }}>
            <ActivityIndicator />
          </View>
        ) : err ? (
          <Text style={styles.err}>{err}</Text>
        ) : tasks.length === 0 ? (
          <Text style={styles.empty}>No task activity yet.</Text>
        ) : (
          <View style={{ marginTop: 12, gap: 10 }}>
            {tasks.map((t, i) => (
              <View key={i} style={styles.item}>
                <Text style={styles.when}>{t.when}</Text>
                <Text style={styles.label}>{t.label}</Text>
              </View>
            ))}
          </View>
        )}

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.back, pressed && { opacity: 0.92 }]}
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </GlassCard>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },

  p: {
    marginTop: 8,
    fontWeight: "700",
    color: "rgba(28,53,87,0.75)",
    textAlign: "center",
  },

  err: {
    marginTop: 12,
    color: "#B42318",
    fontWeight: "800",
    textAlign: "center",
  },

  empty: {
    marginTop: 12,
    color: "rgba(28,53,87,0.7)",
    fontWeight: "700",
    textAlign: "center",
  },

  item: {
    padding: 12,
    borderRadius: RADIUS.xl,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },

  when: {
    fontWeight: "900",
    color: COLORS.ink,
  },

  label: {
    marginTop: 4,
    fontWeight: "700",
    color: "rgba(28,53,87,0.75)",
  },

  back: {
    marginTop: 14,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: COLORS.green,
    borderWidth: 1,
    borderColor: COLORS.greenDark,
  },

  backText: {
    color: "white",
    fontWeight: "900",
  },
});
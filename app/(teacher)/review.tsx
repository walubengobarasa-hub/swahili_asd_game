import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS } from "../../constants/theme";
import { getJSON, postJSON } from "../../lib/api";

export default function ReviewPending() {
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    const data = await getJSON("/teacher/ai/pending?limit=30");
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (task_id: number, approved: boolean) => {
    await postJSON("/teacher/ai/approve", { task_id, approved });
    await load();
  };

  return (
    <ResponsiveScreen>
      <TopBar title="Pending AI Tasks" rightIcon="✕" onRight={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {items.map((t) => (
          <View key={String(t.task_id)} style={{ marginTop: 12 }}>
            <GlassCard>
              <Text style={styles.h1}>{t.task_type} • diff {t.difficulty}</Text>
              <Text style={styles.p}>{t.payload?.prompt_sw ?? "—"}</Text>

              <View style={styles.row}>
                <Pressable style={[styles.btn, styles.approve]} onPress={() => approve(t.task_id, true)}>
                  <Text style={styles.btnText}>APPROVE</Text>
                </Pressable>
                <Pressable style={[styles.btn, styles.reject]} onPress={() => approve(t.task_id, false)}>
                  <Text style={styles.btnText}>REJECT</Text>
                </Pressable>
              </View>
            </GlassCard>
          </View>
        ))}

        <View style={{ marginTop: 12 }}>
          <Pressable onPress={load} style={{ alignSelf: "center" }}>
            <Text style={{ fontWeight: "900", color: "rgba(28,53,87,0.75)" }}>Refresh</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 16, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  p: { marginTop: 8, fontWeight: "700", color: "rgba(28,53,87,0.75)", textAlign: "center" },
  row: { marginTop: 12, flexDirection: "row", gap: 10, justifyContent: "center", flexWrap: "wrap" },
  btn: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 999 },
  approve: { backgroundColor: COLORS.green },
  reject: { backgroundColor: "#D64545" },
  btnText: { fontWeight: "900", color: "white" },
});

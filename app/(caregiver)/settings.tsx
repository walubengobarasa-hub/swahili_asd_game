import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS } from "../../constants/theme";
import { getJSON, postJSON } from "../../lib/api";

const MINUTES = [5, 10, 15, 20];

export default function CaregiverSettingsScreen() {
  const { child_id } = useLocalSearchParams<{ child_id?: string }>();
  const childId = useMemo(() => Number(child_id ?? "1") || 1, [child_id]);

  const [minutes, setMinutes] = useState<number>(10);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const s = await getJSON(`/caregiver/settings/${childId}`);
    setMinutes(Number(s.session_minutes ?? 10));
    setSoundOn(!!s.sound_on);
  };

  useEffect(() => {
    load();
  }, [childId]);

  const save = async () => {
    setSaving(true);
    try {
      await postJSON("/caregiver/settings", { child_id: childId, session_minutes: minutes, sound_on: soundOn });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveScreen>
      <TopBar title="Settings" rightIcon="✕" onRight={() => router.back()} />

      <GlassCard>
        <Text style={styles.h1}>Session Length</Text>
        <View style={styles.rowBtns}>
          {MINUTES.map((m) => (
            <Pressable key={m} style={[styles.pill, minutes === m && styles.pillActive]} onPress={() => setMinutes(m)}>
              <Text style={[styles.pillText, minutes === m && styles.pillTextActive]}>{m} min</Text>
            </Pressable>
          ))}
        </View>
      </GlassCard>

      <View style={{ marginTop: 14 }}>
        <GlassCard>
          <Text style={styles.h1}>Sound</Text>
          <View style={styles.rowBtns}>
            <Pressable style={[styles.pill, soundOn && styles.pillActive]} onPress={() => setSoundOn(true)}>
              <Text style={[styles.pillText, soundOn && styles.pillTextActive]}>On</Text>
            </Pressable>
            <Pressable style={[styles.pill, !soundOn && styles.pillActive]} onPress={() => setSoundOn(false)}>
              <Text style={[styles.pillText, !soundOn && styles.pillTextActive]}>Off</Text>
            </Pressable>
          </View>
        </GlassCard>
      </View>

      <Pressable disabled={saving} onPress={save} style={({ pressed }) => [styles.saveBtn, pressed && !saving && { opacity: 0.92 }, saving && { opacity: 0.6 }]}>
        <Text style={styles.saveText}>{saving ? "Saving…" : "Save"}</Text>
      </Pressable>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center", marginBottom: 10 },
  rowBtns: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },

  pill: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: "rgba(28,53,87,0.12)",
  },
  pillActive: { backgroundColor: COLORS.green, borderColor: COLORS.greenDark },
  pillText: { fontWeight: "900", color: COLORS.ink },
  pillTextActive: { color: "white" },

  saveBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: COLORS.green,
    borderWidth: 1,
    borderColor: COLORS.greenDark,
    alignItems: "center",
  },
  saveText: { color: "white", fontWeight: "900", fontSize: 16 },
});

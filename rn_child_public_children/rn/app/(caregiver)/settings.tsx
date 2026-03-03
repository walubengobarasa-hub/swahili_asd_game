import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS } from "../../constants/theme";
import { getJSON, postJSON } from "../../lib/api";

const MINUTES = [5, 10, 15, 20];
const SENSORY = [1, 2, 3, 4, 5];
const PACE = [1, 2, 3];

export default function CaregiverSettingsScreen() {
  const { child_id } = useLocalSearchParams<{ child_id?: string }>();
  const childId = useMemo(() => Number(child_id ?? "1") || 1, [child_id]);

  const [minutes, setMinutes] = useState<number>(10);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [lowStimAllowed, setLowStimAllowed] = useState<boolean>(true);

  const [sensory, setSensory] = useState<number>(2);
  const [pace, setPace] = useState<number>(2);
  const [prefersAudio, setPrefersAudio] = useState<boolean>(true);
  const [prefersImages, setPrefersImages] = useState<boolean>(true);
  const [lowStimDefault, setLowStimDefault] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const s = await getJSON(`/caregiver/settings/${childId}`);
    setMinutes(Number(s.session_minutes ?? 10));
    setSoundOn(!!s.sound_on);
    setLowStimAllowed(s.low_stimulation_allowed !== false);

    const p = await getJSON(`/profiles/${childId}`);
    setSensory(Number(p.sensory_sensitivity ?? 2));
    setPace(Number(p.preferred_pace ?? 2));
    setPrefersAudio(p.prefers_audio !== false);
    setPrefersImages(p.prefers_images !== false);
    setLowStimDefault(!!p.low_stimulation_default);
  };

  useEffect(() => {
    load();
  }, [childId]);

  const save = async () => {
    setSaving(true);
    try {
      await postJSON("/caregiver/settings", {
        child_id: childId,
        session_minutes: minutes,
        sound_on: soundOn,
        low_stimulation_allowed: lowStimAllowed,
      });

      await postJSON("/profiles", {
        child_id: childId,
        sensory_sensitivity: sensory,
        preferred_pace: pace,
        prefers_audio: prefersAudio,
        prefers_images: prefersImages,
        low_stimulation_default: lowStimDefault,
      });
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

      <View style={{ marginTop: 14 }}>
        <GlassCard>
          <Text style={styles.h1}>Low Stimulation</Text>
          <Text style={styles.help}>Allow the game to auto-enable calm mode when overload signals appear.</Text>
          <View style={styles.rowBtns}>
            <Pressable
              style={[styles.pill, lowStimAllowed && styles.pillActive]}
              onPress={() => setLowStimAllowed(true)}
            >
              <Text style={[styles.pillText, lowStimAllowed && styles.pillTextActive]}>Allowed</Text>
            </Pressable>
            <Pressable
              style={[styles.pill, !lowStimAllowed && styles.pillActive]}
              onPress={() => setLowStimAllowed(false)}
            >
              <Text style={[styles.pillText, !lowStimAllowed && styles.pillTextActive]}>Disabled</Text>
            </Pressable>
          </View>
        </GlassCard>
      </View>

      <View style={{ marginTop: 14 }}>
        <GlassCard>
          <Text style={styles.h1}>Child Profile</Text>
          <Text style={styles.help}>These preferences guide modality adaptation (performance-based).</Text>

          <Text style={styles.sub}>Sensory sensitivity</Text>
          <View style={styles.rowBtns}>
            {SENSORY.map((v) => (
              <Pressable key={v} style={[styles.pill, sensory === v && styles.pillActive]} onPress={() => setSensory(v)}>
                <Text style={[styles.pillText, sensory === v && styles.pillTextActive]}>{v}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sub}>Preferred pace</Text>
          <View style={styles.rowBtns}>
            {PACE.map((v) => (
              <Pressable key={v} style={[styles.pill, pace === v && styles.pillActive]} onPress={() => setPace(v)}>
                <Text style={[styles.pillText, pace === v && styles.pillTextActive]}>{v === 1 ? "Slow" : v === 2 ? "Normal" : "Fast"}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sub}>Preferred modalities</Text>
          <View style={styles.rowBtns}>
            <Pressable style={[styles.pill, prefersImages && styles.pillActive]} onPress={() => setPrefersImages(true)}>
              <Text style={[styles.pillText, prefersImages && styles.pillTextActive]}>Images</Text>
            </Pressable>
            <Pressable style={[styles.pill, !prefersImages && styles.pillActive]} onPress={() => setPrefersImages(false)}>
              <Text style={[styles.pillText, !prefersImages && styles.pillTextActive]}>No Images</Text>
            </Pressable>
            <Pressable style={[styles.pill, prefersAudio && styles.pillActive]} onPress={() => setPrefersAudio(true)}>
              <Text style={[styles.pillText, prefersAudio && styles.pillTextActive]}>Audio</Text>
            </Pressable>
            <Pressable style={[styles.pill, !prefersAudio && styles.pillActive]} onPress={() => setPrefersAudio(false)}>
              <Text style={[styles.pillText, !prefersAudio && styles.pillTextActive]}>No Audio</Text>
            </Pressable>
          </View>

          <Text style={styles.sub}>Default calm mode</Text>
          <View style={styles.rowBtns}>
            <Pressable style={[styles.pill, lowStimDefault && styles.pillActive]} onPress={() => setLowStimDefault(true)}>
              <Text style={[styles.pillText, lowStimDefault && styles.pillTextActive]}>On</Text>
            </Pressable>
            <Pressable style={[styles.pill, !lowStimDefault && styles.pillActive]} onPress={() => setLowStimDefault(false)}>
              <Text style={[styles.pillText, !lowStimDefault && styles.pillTextActive]}>Off</Text>
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
  help: { textAlign: "center", fontWeight: "700", opacity: 0.75, marginBottom: 10, lineHeight: 20 },
  sub: { marginTop: 10, marginBottom: 8, textAlign: "center", fontWeight: "900", color: COLORS.ink },
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

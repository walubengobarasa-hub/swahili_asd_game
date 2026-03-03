import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS } from "../../constants/theme";
import { postJSON, getJSON, clearSession } from "../../lib/api";

const MINUTES = [5, 10, 15, 20];
const PACE: Array<"slow" | "normal" | "fast"> = ["slow", "normal", "fast"];
const SENS = [1, 2, 3, 4, 5];

function Pill({
  label,
  active,
  onPress,
  disabled,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        active && styles.pillActive,
        pressed && !disabled && { opacity: 0.92 },
        disabled && { opacity: 0.6 },
      ]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function CaregiverSettingsScreen() {
  const { child_id } = useLocalSearchParams<{ child_id?: string }>();
  const childId = useMemo(() => Number(child_id ?? "1") || 1, [child_id]);

  const [minutes, setMinutes] = useState<number>(10);
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // ASD-friendly settings (server-backed)
  const [lowStimDefault, setLowStimDefault] = useState<boolean>(false);
  const [autoLowStim, setAutoLowStim] = useState<boolean>(true);
  const [prefersImages, setPrefersImages] = useState<boolean>(true);
  const [prefersAudio, setPrefersAudio] = useState<boolean>(false);
  const [pace, setPace] = useState<"slow" | "normal" | "fast">("normal");
  const [sensory, setSensory] = useState<number>(3);

  const [saving, setSaving] = useState(false);

  const load = async () => {
    const s = await getJSON(`/caregiver/settings/${childId}`);
    setMinutes(Number(s.session_minutes ?? 10));
    setSoundOn(!!s.sound_on);

    setLowStimDefault(!!s.low_stim_default);
    setAutoLowStim(s.auto_low_stim !== false); // default true
    setPrefersImages(s.prefers_images !== false); // default true
    setPrefersAudio(!!s.prefers_audio);
    setPace((s.pace as any) || "normal");
    setSensory(Number(s.sensory_sensitivity ?? 3));
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
        low_stim_default: lowStimDefault,
        auto_low_stim: autoLowStim,
        prefers_images: prefersImages,
        prefers_audio: prefersAudio,
        pace,
        sensory_sensitivity: sensory,
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
            <Pill key={m} label={`${m} min`} active={minutes === m} onPress={() => setMinutes(m)} disabled={saving} />
          ))}
        </View>
      </GlassCard>

      <View style={{ marginTop: 14 }}>
        <GlassCard>
          <Text style={styles.h1}>Sound</Text>
          <View style={styles.rowBtns}>
            <Pill label="On" active={soundOn} onPress={() => setSoundOn(true)} disabled={saving} />
            <Pill label="Off" active={!soundOn} onPress={() => setSoundOn(false)} disabled={saving} />
          </View>
        </GlassCard>
      </View>

      <View style={{ marginTop: 14 }}>
        <GlassCard>
          <Text style={styles.h1}>Low Stimulation Mode</Text>
          <Text style={styles.help}>
            Helps reduce sensory overload by keeping the experience calm and visual-first.
          </Text>
          <View style={styles.rowBtns}>
            <Pill label="Default: On" active={lowStimDefault} onPress={() => setLowStimDefault(true)} disabled={saving} />
            <Pill label="Default: Off" active={!lowStimDefault} onPress={() => setLowStimDefault(false)} disabled={saving} />
          </View>

          <View style={{ height: 10 }} />

          <Text style={styles.h2}>Auto-trigger</Text>
          <View style={styles.rowBtns}>
            <Pill label="Enabled" active={autoLowStim} onPress={() => setAutoLowStim(true)} disabled={saving} />
            <Pill label="Disabled" active={!autoLowStim} onPress={() => setAutoLowStim(false)} disabled={saving} />
          </View>
        </GlassCard>
      </View>

      <View style={{ marginTop: 14 }}>
        <GlassCard>
          <Text style={styles.h1}>Learning Preferences</Text>
          <Text style={styles.help}>Used only when the child is doing well (never assumed).</Text>

          <Text style={styles.h2}>Visual preference</Text>
          <View style={styles.rowBtns}>
            <Pill label="Images: On" active={prefersImages} onPress={() => setPrefersImages(true)} disabled={saving} />
            <Pill label="Images: Off" active={!prefersImages} onPress={() => setPrefersImages(false)} disabled={saving} />
          </View>

          <View style={{ height: 10 }} />

          <Text style={styles.h2}>Audio preference</Text>
          <View style={styles.rowBtns}>
            <Pill label="Audio: On" active={prefersAudio} onPress={() => setPrefersAudio(true)} disabled={saving} />
            <Pill label="Audio: Off" active={!prefersAudio} onPress={() => setPrefersAudio(false)} disabled={saving} />
          </View>
        </GlassCard>
      </View>

      <View style={{ marginTop: 14 }}>
        <GlassCard>
          <Text style={styles.h1}>Pace</Text>
          <View style={styles.rowBtns}>
            {PACE.map((p) => (
              <Pill key={p} label={p.toUpperCase()} active={pace === p} onPress={() => setPace(p)} disabled={saving} />
            ))}
          </View>

          <View style={{ height: 10 }} />

          <Text style={styles.h1}>Sensory Sensitivity</Text>
          <Text style={styles.help}>1 = low sensitivity, 5 = high sensitivity.</Text>
          <View style={styles.rowBtns}>
            {SENS.map((n) => (
              <Pill key={n} label={String(n)} active={sensory === n} onPress={() => setSensory(n)} disabled={saving} />
            ))}
          </View>
        </GlassCard>
      </View>

      <Pressable
        disabled={saving}
        onPress={save}
        style={({ pressed }) => [
          styles.saveBtn,
          pressed && !saving && { opacity: 0.92 },
          saving && { opacity: 0.6 },
        ]}
      >
        <Text style={styles.saveText}>{saving ? "Saving…" : "Save"}</Text>
      </Pressable>

      <Pressable
        disabled={saving}
        onPress={async () => {
          await clearSession();
          router.replace("/");
        }}
        style={({ pressed }) => [styles.logoutBtn, pressed && !saving && { opacity: 0.92 }, saving && { opacity: 0.6 }]}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center", marginBottom: 10 },
  h2: { fontSize: 14, fontWeight: "900", color: COLORS.ink, textAlign: "center", marginBottom: 8, marginTop: 2 },
  help: { color: "rgba(28,53,87,0.8)", textAlign: "center", marginBottom: 10, fontWeight: "700" },

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

  logoutBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "#D64545",
    borderWidth: 1,
    borderColor: "#B42318",
    alignItems: "center",
  },
  logoutText: { color: "white", fontWeight: "900", fontSize: 16 },
});

import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import VisualCueCarousel from "../../components/VisualCueCarousel";
import { COLORS } from "../../constants/theme";
import { api } from "../../lib/api";

export default function TeacherContentScreen() {
  const { child_id } = useLocalSearchParams<{ child_id?: string }>();
  const childId = useMemo(() => Number(child_id ?? "1") || 1, [child_id]);

  const [kind, setKind] = useState<"song" | "routine" | "task">("song");
  const [title, setTitle] = useState("Wimbo / Song");
  const [raw, setRaw] = useState("Twinkle twinkle little star\nHow I wonder what you are");

  const [busy, setBusy] = useState(false);
  const [cues, setCues] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  const build = async () => {
    setBusy(true);
    setErr(null);
    try {
      const content = await api.createTeacherContent({ kind, title, raw_text: raw, language: "sw" });
      const cueType = kind === "song" ? "song_cues" : "step_cards";
      const out = await api.generateCues({ content_id: content.id, cue_type: cueType as any });
      setCues(out.payload);
    } catch (e: any) {
      setErr(e?.message || "Failed to generate cues");
    } finally {
      setBusy(false);
    }
  };

  const carouselData = useMemo(() => {
    if (!cues) return [];
    if (cues.kind === "song_cues") {
      return (cues.cues ?? []).map((c: any, idx: number) => ({
        key: String(idx),
        title: c.line,
        icon: c.icon,
        imageUrl: c.image,
      }));
    }
    return (cues.steps ?? []).map((s: any) => ({
      key: String(s.step),
      title: s.text,
      icon: s.icon,
      imageUrl: s.image,
    }));
  }, [cues]);

  return (
    <ResponsiveScreen>
      <TopBar title="Teacher Content" rightIcon="←" onRight={() => router.back()} />

      <GlassCard>
        <Text style={styles.h1}>Visual-first cues</Text>
        <Text style={styles.help}>Paste a song or routine. The game will generate calm, chunked cue cards.</Text>

        <View style={styles.rowBtns}>
          {(["song", "routine", "task"] as const).map((k) => (
            <Pressable key={k} onPress={() => setKind(k)} style={[styles.pill, kind === k && styles.pillActive]}>
              <Text style={[styles.pillText, kind === k && styles.pillTextActive]}>{k}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor="rgba(28,53,87,0.45)"
          style={styles.input}
        />
        <TextInput
          value={raw}
          onChangeText={setRaw}
          placeholder="One line per step"
          placeholderTextColor="rgba(28,53,87,0.45)"
          multiline
          style={[styles.input, { height: 140, textAlignVertical: "top" }]}
        />

        {!!err && <Text style={{ color: "#ef4444", fontWeight: "800" }}>{err}</Text>}

        <Pressable disabled={busy} onPress={build} style={({ pressed }) => [styles.btn, pressed && !busy && { opacity: 0.92 }, busy && { opacity: 0.6 }]}>
          <Text style={styles.btnText}>{busy ? "Generating…" : "Generate cue cards"}</Text>
        </Pressable>
      </GlassCard>

      {!!cues && (
        <View style={{ marginTop: 14 }}>
          <GlassCard>
            <Text style={styles.h1}>{cues.title}</Text>
            <Text style={styles.help}>One chunk at a time. Use these in class or at home.</Text>
            <VisualCueCarousel cues={carouselData} />
          </GlassCard>
        </View>
      )}
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center", marginBottom: 10 },
  help: { textAlign: "center", fontWeight: "700", opacity: 0.75, marginBottom: 10, lineHeight: 20 },
  rowBtns: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 12 },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: "rgba(28,53,87,0.12)",
  },
  pillActive: { backgroundColor: COLORS.green, borderColor: COLORS.greenDark },
  pillText: { fontWeight: "900", color: COLORS.ink, textTransform: "capitalize" },
  pillTextActive: { color: "white" },
  input: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(28,53,87,0.15)",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.ink,
    fontWeight: "800",
  },
  btn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: COLORS.green,
    borderWidth: 1,
    borderColor: COLORS.greenDark,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "900", fontSize: 16 },
});

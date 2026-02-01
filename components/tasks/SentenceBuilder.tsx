import React, { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { clamp } from "../../constants/responsive";
import { COLORS, RADIUS } from "../../constants/theme";
import GlassCard from "../GlassCard";

type SubmitMeta = { rt: number; retries: number; skipped?: boolean; hint_used?: boolean };

type Tile = { text: string; slot: "SUBJECT" | "VERB" | "OBJECT" };

export default function SentenceBuilder({
  task,
  onSubmit,
}: {
  task: any;
  onSubmit: (answer: string, meta: SubmitMeta) => void;
}) {
  const startedAt = useRef<number>(Date.now());
  const [retries, setRetries] = useState(0);
  const { width } = useWindowDimensions();

  const promptSize = clamp(width * 0.05, 16, 24);
  const tileSize = clamp(width * 0.04, 14, 20);

  const slots: string[] = task?.slots ?? ["SUBJECT", "VERB", "OBJECT"];
  const tiles: Tile[] = task?.tiles ?? [];

  const [picked, setPicked] = useState<Record<string, string>>({
    SUBJECT: "",
    VERB: "",
    OBJECT: "",
  });

  const canSubmit = useMemo(() => slots.every((s) => (picked[s] ?? "").length > 0), [slots, picked]);

  const chooseTile = (tile: Tile) => {
    setPicked((p) => ({ ...p, [tile.slot]: tile.text }));
  };

  const clearAll = () => {
    setPicked({ SUBJECT: "", VERB: "", OBJECT: "" });
    startedAt.current = Date.now();
    setRetries((r) => r + 1);
  };

  const submit = () => {
    if (!canSubmit) return;
    const answerArr = [picked.SUBJECT, picked.VERB, picked.OBJECT];
    const rt = Date.now() - startedAt.current;
    onSubmit(JSON.stringify(answerArr), { rt, retries });
  };

  return (
    <View style={{ marginTop: 14 }}>
      <GlassCard>
        <Text style={[styles.prompt, { fontSize: promptSize }]}>{task?.prompt_sw ?? "Tengeneza sentensi."}</Text>
      </GlassCard>

      {/* Slots */}
      <View style={{ marginTop: 12 }}>
        <GlassCard>
          <Text style={styles.slotTitle}>Sentensi</Text>

          <View style={styles.slotRow}>
            <View style={styles.slotBox}>
              <Text style={styles.slotLabel}>SUBJECT</Text>
              <Text style={styles.slotValue}>{picked.SUBJECT || "—"}</Text>
            </View>
            <View style={styles.slotBox}>
              <Text style={styles.slotLabel}>VERB</Text>
              <Text style={styles.slotValue}>{picked.VERB || "—"}</Text>
            </View>
            <View style={styles.slotBox}>
              <Text style={styles.slotLabel}>OBJECT</Text>
              <Text style={styles.slotValue}>{picked.OBJECT || "—"}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable style={[styles.actionBtn, !canSubmit && { opacity: 0.6 }]} onPress={submit} disabled={!canSubmit}>
              <Text style={styles.actionText}>SUBMIT</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.secondary]} onPress={clearAll}>
              <Text style={[styles.actionText, { color: COLORS.ink }]}>RESET</Text>
            </Pressable>
          </View>
        </GlassCard>
      </View>

      {/* Tiles */}
      <View style={styles.grid}>
        {tiles.map((t, idx) => (
          <View key={`${t.slot}-${t.text}-${idx}`} style={styles.gridItem}>
            <Pressable style={styles.tile} onPress={() => chooseTile(t)}>
              <Text style={[styles.tileText, { fontSize: tileSize }]}>{t.text}</Text>
              <Text style={styles.tileTag}>{t.slot}</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  prompt: { fontWeight: "900", color: COLORS.ink, textAlign: "center" },

  slotTitle: { fontWeight: "900", color: COLORS.ink, marginBottom: 10, textAlign: "center" },

  slotRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  slotBox: {
    minWidth: 110,
    flexGrow: 1,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },
  slotLabel: { fontSize: 11, fontWeight: "900", color: "rgba(28,53,87,0.7)" },
  slotValue: { marginTop: 4, fontSize: 16, fontWeight: "900", color: COLORS.ink },

  actions: { flexDirection: "row", gap: 10, justifyContent: "center", marginTop: 12, flexWrap: "wrap" },
  actionBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  secondary: { backgroundColor: "rgba(255,255,255,0.75)", borderWidth: 1, borderColor: COLORS.stroke },
  actionText: { fontWeight: "900", color: "white" },

  grid: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 },
  gridItem: { width: "50%", paddingHorizontal: 6, paddingBottom: 12 },

  tile: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 76,
  },
  tileText: { fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  tileTag: { marginTop: 6, fontSize: 10, fontWeight: "900", color: "rgba(28,53,87,0.65)" },
});

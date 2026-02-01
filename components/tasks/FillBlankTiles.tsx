import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { clamp } from "../../constants/responsive";
import { COLORS, RADIUS } from "../../constants/theme";
import GlassCard from "../GlassCard";

type SubmitMeta = { rt: number; retries: number; skipped?: boolean; hint_used?: boolean };

export default function FillBlankTiles({
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
  const optSize = clamp(width * 0.045, 16, 22);

  const prompt = task?.prompt_sw ?? "Hii ni ___ .";
  const options: string[] = task?.options ?? [];

  const pick = (text: string) => {
    const rt = Date.now() - startedAt.current;
    onSubmit(text, { rt, retries });
  };

  return (
    <View style={{ marginTop: 14 }}>
      <GlassCard>
        <Text style={[styles.prompt, { fontSize: promptSize }]}>{prompt}</Text>
      </GlassCard>

      <View style={styles.grid}>
        {options.map((t) => (
          <View key={t} style={styles.gridItem}>
            <Pressable style={styles.tile} onPress={() => pick(t)}>
              <Text style={[styles.tileText, { fontSize: optSize }]}>{t}</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Pressable
        style={styles.tryAgain}
        onPress={() => {
          startedAt.current = Date.now();
          setRetries((r) => r + 1);
        }}
      >
        <Text style={styles.tryAgainText}>↻ Retry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  prompt: { fontWeight: "900", color: COLORS.ink, textAlign: "center" },

  grid: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 },
  gridItem: { width: "50%", paddingHorizontal: 6, paddingBottom: 12 },

  tile: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: RADIUS.lg,
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 66,
  },
  tileText: { fontWeight: "900", color: COLORS.ink, textAlign: "center" },

  tryAgain: { marginTop: 6, alignSelf: "center", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999 },
  tryAgainText: { fontWeight: "900", color: "rgba(28,53,87,0.75)" },
});

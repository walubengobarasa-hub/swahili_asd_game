import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = { task: any; onAnswer: (answer: string) => void; locked?: boolean };

export default function SentenceBuilderTask({ task, onAnswer, locked }: Props) {
  const tiles = useMemo(() => task?.tiles ?? [], [task]);
  const [picked, setPicked] = useState<string[]>([]);

  const prompt = task?.prompt_sw ?? "Tengeneza sentensi.";
  const slotsLen = (task?.slots?.length ?? 0) as number;

  const submit = (nextPicked: string[]) => onAnswer(JSON.stringify(nextPicked));

  const addTile = (t: string) => {
    const next = [...picked, t];
    setPicked(next);

    if (slotsLen > 0 && next.length === slotsLen) submit(next);
  };

  const reset = () => {
    setPicked([]);
    submit([]);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.prompt}>{prompt}</Text>

      <View style={styles.previewCard}>
        <Text style={styles.previewText}>{picked.length ? picked.join(" ") : "Chagua maneno hapo chini…"}</Text>
      </View>

      <View style={styles.tilesWrap}>
        {tiles.map((tile: any, idx: number) => {
          const text = String(tile?.text ?? "");
          const isUsed = picked.includes(text);

          return (
            <Pressable
              key={idx}
              disabled={locked || isUsed}
              onPress={() => addTile(text)}
              style={({ pressed }) => [
                styles.tile,
                isUsed && styles.tileUsed,
                pressed && !locked && !isUsed && { opacity: 0.9 },
                locked && { opacity: 0.6 },
              ]}
            >
              <Text style={[styles.tileText, isUsed && styles.tileTextUsed]}>{text}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        disabled={locked}
        onPress={reset}
        style={({ pressed }) => [
          styles.resetBtn,
          pressed && !locked && { opacity: 0.9 },
          locked && { opacity: 0.6 },
        ]}
      >
        <Text style={styles.resetText}>Reset</Text>
      </Pressable>
    </View>
  );
}

const ACCENT = "#7C3AED";
const INK = "#1C3557";

const styles = StyleSheet.create({
  wrap: { gap: 12 },

  prompt: {
    color: INK,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
  },

  previewCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(28,53,87,0.12)",
    minHeight: 62,
    justifyContent: "center",
  },
  previewText: {
    color: INK,
    fontWeight: "900",
    fontSize: 16,
  },

  tilesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  tile: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(28,53,87,0.12)",
    backgroundColor: "rgba(255,255,255,0.88)",
  },
  tileUsed: {
    borderColor: "rgba(28,53,87,0.10)",
    backgroundColor: "rgba(28,53,87,0.06)",
  },

  tileText: {
    color: INK,
    fontWeight: "900",
  },
  tileTextUsed: {
    color: "rgba(28,53,87,0.45)",
  },

  resetBtn: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(124,58,237,0.12)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.35)",
  },
  resetText: {
    color: ACCENT,
    fontWeight: "900",
  },
});

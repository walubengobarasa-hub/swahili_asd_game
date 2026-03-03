import React, { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type SubmitMeta = { retries?: number; skipped?: boolean; hint_used?: boolean };

type Props = {
  task: any;
  onAnswer: (answer: string, meta: SubmitMeta) => void;
  onTap?: () => void;
  onHint?: () => void;
  hintText?: string;
  hintImageUrl?: string | null;
  locked?: boolean;
};

export default function FillBlankTask({ task, onAnswer, locked, onTap, onHint, hintText, hintImageUrl }: Props) {
  const options = useMemo(() => task?.options ?? [], [task]);
  const [selected, setSelected] = useState<string | null>(null);

  const prompt = task?.prompt_sw ?? "Chagua jibu sahihi.";
  const hint = hintText ?? task?.hint_sw ?? "";
  const [showHint, setShowHint] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.prompt}>{prompt}</Text>
      {!!hint && <Text style={styles.hint}>{hint}</Text>}

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable
          disabled={locked}
          onPress={() => {
            onTap?.();
            setShowHint(false);
          }}
          style={({ pressed }) => [styles.smallBtn, pressed && !locked && { opacity: 0.9 }, locked && { opacity: 0.6 }]}
        >
          <Text style={styles.smallBtnText}>Repeat</Text>
        </Pressable>

        <Pressable
          disabled={locked}
          onPress={() => {
            onTap?.();
            setShowHint((v) => !v);
            onHint?.();
          }}
          style={({ pressed }) => [styles.smallBtn, pressed && !locked && { opacity: 0.9 }, locked && { opacity: 0.6 }]}
        >
          <Text style={styles.smallBtnText}>Show me</Text>
        </Pressable>
      </View>

      {showHint && !!hintImageUrl && (
        <View style={styles.hintImageWrap}>
          <Image source={{ uri: hintImageUrl }} style={styles.hintImage} resizeMode="cover" />
        </View>
      )}

      <View style={{ gap: 10 }}>
        {options.map((opt: string) => {
          const label = String(opt);
          const isSel = selected === label;

          return (
            <Pressable
              key={label}
              disabled={locked}
              onPress={() => {
                onTap?.();
                setSelected(label);
                onAnswer(label, { hint_used: showHint });
              }}
              style={({ pressed }) => [
                styles.option,
                isSel && styles.optionSelected,
                pressed && !locked && { opacity: 0.9 },
                locked && { opacity: 0.6 },
              ]}
            >
              <Text style={[styles.optionText, isSel && styles.optionTextSelected]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {!!locked && <Text style={styles.lockedText}>Submitting…</Text>}
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
  hint: {
    color: "rgba(28,53,87,0.65)",
    fontWeight: "700",
  },

  smallBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(28,53,87,0.12)",
    backgroundColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
  },
  smallBtnText: { color: INK, fontWeight: "900" },

  hintImageWrap: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(28,53,87,0.10)",
    backgroundColor: "rgba(28,53,87,0.06)",
  },
  hintImage: { width: "100%", height: 160 },

  option: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(28,53,87,0.12)",
    backgroundColor: "rgba(255,255,255,0.88)",
  },
  optionSelected: {
    borderColor: ACCENT,
    backgroundColor: "rgba(124,58,237,0.10)",
  },

  optionText: {
    color: INK,
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  optionTextSelected: {
    color: ACCENT,
  },

  lockedText: {
    marginTop: 4,
    color: "rgba(28,53,87,0.65)",
    fontWeight: "700",
  },
});

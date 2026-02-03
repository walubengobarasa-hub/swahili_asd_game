import { api } from "@/lib/api";
import React, { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = { task: any; onAnswer: (answer: string) => void; locked?: boolean };

function toAbsUrl(uri?: string) {
  if (!uri) return "";
  if (uri.startsWith("http://") || uri.startsWith("https://")) return uri;
  const base = (api.baseUrl || "").replace(/\/$/, "");
  const path = uri.startsWith("/") ? uri : `/${uri}`;
  return `${base}${path}`;
}

export default function MatchWordTask({ task, onAnswer, locked }: Props) {
  const options = useMemo(() => task?.options ?? [], [task]);
  const [selected, setSelected] = useState<number | null>(null);

  const prompt = task?.prompt_sw ?? "Chagua neno sahihi.";
  const imageUrl = toAbsUrl(task?.prompt_image_url);

  return (
    <View style={styles.wrap}>
      <Text style={styles.prompt}>{prompt}</Text>

      {!!imageUrl && (
        <View style={styles.imageCard}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        </View>
      )}

      <View style={{ gap: 10 }}>
        {options.map((opt: any) => {
          const id = Number(opt?.lexicon_id);
          const label = String(opt?.label_sw ?? "");
          const isSel = selected === id;

          return (
            <Pressable
              key={String(id)}
              disabled={locked}
              onPress={() => {
                setSelected(id);
                onAnswer(String(id));
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

  imageCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(28,53,87,0.12)",
    padding: 8,
  },
  image: {
    width: "100%",
    height: 190,
    borderRadius: 14,
    backgroundColor: "rgba(28,53,87,0.06)",
  },

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

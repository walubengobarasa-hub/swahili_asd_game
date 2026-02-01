import React, { useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { clamp } from "../../constants/responsive";
import { COLORS, RADIUS } from "../../constants/theme";
import GlassCard from "../GlassCard";

type SubmitMeta = { rt: number; retries: number; skipped?: boolean; hint_used?: boolean };

function toAbsUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const BASE = "http://127.0.0.1:8000";
  return `${BASE}${url}`;
}

export default function MatchWord({
  task,
  onSubmit,
}: {
  task: any;
  onSubmit: (answer: string, meta: SubmitMeta) => void;
}) {
  const startedAt = useRef<number>(Date.now());
  const [retries, setRetries] = useState(0);
  const { width } = useWindowDimensions();

  const promptSize = clamp(width * 0.045, 16, 22);
  const optSize = clamp(width * 0.045, 16, 22);

  const options = task?.options ?? [];
  const imageUrl = task?.prompt_image_url ?? "";

  const pick = (lexiconId: number) => {
    const rt = Date.now() - startedAt.current;
    onSubmit(String(lexiconId), { rt, retries });
  };

  return (
    <View style={{ marginTop: 14 }}>
      <GlassCard>
        <Text style={[styles.prompt, { fontSize: promptSize }]}>{task?.prompt_sw ?? "Chagua neno sahihi."}</Text>
      </GlassCard>

      <View style={{ marginTop: 12 }}>
        <GlassCard>
          <Image source={{ uri: toAbsUrl(imageUrl) }} style={styles.bigImg} />
        </GlassCard>
      </View>

      <View style={styles.grid}>
        {options.map((o: any) => (
          <View key={String(o.lexicon_id)} style={styles.gridItem}>
            <Pressable style={styles.tile} onPress={() => pick(o.lexicon_id)}>
              <Text style={[styles.tileText, { fontSize: optSize }]}>{o.label_sw}</Text>
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

  bigImg: { width: "100%", height: 220, borderRadius: 16, resizeMode: "cover" },

  grid: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 },
  gridItem: { width: "50%", paddingHorizontal: 6, paddingBottom: 12 },

  tile: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 64,
  },
  tileText: { fontWeight: "900", color: COLORS.ink, textAlign: "center" },

  tryAgain: { marginTop: 6, alignSelf: "center", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999 },
  tryAgainText: { fontWeight: "900", color: "rgba(28,53,87,0.75)" },
});

import React, { useMemo, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { clamp } from "../../constants/responsive";
import { COLORS, RADIUS } from "../../constants/theme";
import GlassCard from "../GlassCard";

type SubmitMeta = { rt: number; retries: number; skipped?: boolean; hint_used?: boolean };

function toAbsUrl(url: string) {
  // backend returns "/assets/images/xyz.png"
  if (!url) return "";
  if (url.startsWith("http")) return url;
  // IMPORTANT: match your BASE_URL host
  const BASE = "http://127.0.0.1:8000";
  return `${BASE}${url}`;
}

export default function MatchImage({
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
  const labelSize = clamp(width * 0.04, 14, 18);

  const options = task?.options ?? [];

  const pick = (lexiconId: number) => {
    const rt = Date.now() - startedAt.current;
    onSubmit(String(lexiconId), { rt, retries });
  };

  const cardHeight = useMemo(() => clamp(width * 0.50, 170, 210), [width]);
  const imgHeight = useMemo(() => clamp(width * 0.28, 110, 140), [width]);

  return (
    <View style={{ marginTop: 14 }}>
      <GlassCard>
        <Text style={[styles.prompt, { fontSize: promptSize }]}>{task?.prompt_sw ?? "Chagua picha sahihi."}</Text>
      </GlassCard>

      <View style={styles.grid}>
        {options.map((o: any) => (
          <View key={String(o.lexicon_id)} style={styles.gridItem}>
            <Pressable style={[styles.card, { height: cardHeight }]} onPress={() => pick(o.lexicon_id)}>
              <Image source={{ uri: toAbsUrl(o.image_url) }} style={[styles.img, { height: imgHeight }]} />
              <View style={styles.labelWrap}>
                <Text style={[styles.label, { fontSize: labelSize }]}>{o.label_sw}</Text>
              </View>
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

  card: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: RADIUS.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },

  img: { width: "100%", borderRadius: 14, resizeMode: "cover" },

  labelWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  label: { marginTop: 8, fontWeight: "900", color: COLORS.ink, textAlign: "center" },

  tryAgain: { marginTop: 6, alignSelf: "center", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999 },
  tryAgainText: { fontWeight: "900", color: "rgba(28,53,87,0.75)" },
});

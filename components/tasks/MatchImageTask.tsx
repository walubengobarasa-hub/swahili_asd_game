import { api } from "@/lib/api";
import React, { useMemo, useRef, useState } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import AudioPromptButton from "./AudioPromptButton";

type Props = { task: any; onAnswer: (answer: string, meta?: any) => void; locked?: boolean };

function toAbsUrl(uri?: string) {
  if (!uri) return "";
  if (uri.startsWith("http://") || uri.startsWith("https://")) return uri;
  const base = (api.baseUrl || "").replace(/\/$/, "");
  const path = uri.startsWith("/") ? uri : `/${uri}`;
  return `${base}${path}`;
}

function localAssetFor(uri?: string | null) {
  if (!uri) return null;
  const name = String(uri).split("/").pop() || "";
  switch (name) {
    case "img_dog.png":
      return require("../../assets/images/img_dog.png");
    case "img_cat.png":
      return require("../../assets/images/img_cat.png");
    case "img_bird.png":
      return require("../../assets/images/img_bird.png");
    case "img_goat.png":
      return require("../../assets/images/img_goat.png");
    case "img_cow.png":
      return require("../../assets/images/img_cow.png");
    case "paka.png":
      return require("../../assets/images/paka.png");
    default:
      return null;
  }
}

function imageSource(uri?: string | null) {
  const local = localAssetFor(uri);
  if (local) return local;
  const abs = toAbsUrl(uri || "");
  return abs ? { uri: abs } : null;
}

export default function MatchImageTask({ task, onAnswer, locked }: Props) {
  const options = useMemo(() => task?.options ?? [], [task]);
  const [selected, setSelected] = useState<number | null>(null);

  const prompt = task?.prompt_sw ?? "Chagua picha sahihi.";
  const scales = useRef<Record<number, Animated.Value>>({}).current;

  const scaleFor = (id: number) => {
    if (!scales[id]) scales[id] = new Animated.Value(1);
    return scales[id];
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.prompt}>{prompt}</Text>
        <AudioPromptButton
          text={task?.target?.label_sw ?? prompt}
          audioUrl={task?.prompt_audio_url ?? task?.target?.audio_url}
        />
      </View>

      <View style={styles.grid}>
        {options.map((opt: any) => {
          const id = Number(opt?.lexicon_id);
          const label = String(opt?.label_sw ?? "");
          const src = imageSource(opt?.image_url);
          const isSel = selected === id;

          return (
            <Animated.View
              key={String(id)}
              style={[styles.gridCell, { transform: [{ scale: scaleFor(id) }] }]}
            >
              <Pressable
                disabled={locked}
                onPress={() => {
                  setSelected(id);
                  Animated.sequence([
                    Animated.timing(scaleFor(id), { toValue: 1.04, duration: 120, useNativeDriver: true }),
                    Animated.timing(scaleFor(id), { toValue: 1, duration: 120, useNativeDriver: true }),
                  ]).start();
                  onAnswer(String(id), { taps: 1 });
                }}
                style={({ pressed }) => [
                  styles.card,
                  isSel && styles.cardSelected,
                  pressed && !locked && { opacity: 0.9 },
                  locked && { opacity: 0.6 },
                ]}
              >
                <View style={styles.imageWrap}>
                  {src ? (
                    <Image source={src as any} style={styles.image} resizeMode="cover" />
                  ) : (
                    <View style={styles.imageFallback}>
                      <Text style={styles.imageFallbackText}>🖼️</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.label, isSel && styles.labelSelected]} numberOfLines={1}>
                  {label}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
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

  headerRow: { gap: 10 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  gridCell: {
    width: "50%",
    paddingHorizontal: 6,
    paddingBottom: 12,
  },

  card: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(28,53,87,0.12)",
    backgroundColor: "rgba(255,255,255,0.92)",
    padding: 10,
  },
  cardSelected: {
    borderColor: ACCENT,
    backgroundColor: "rgba(124,58,237,0.10)",
  },

  imageWrap: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(28,53,87,0.06)",
    borderWidth: 1,
    borderColor: "rgba(28,53,87,0.10)",
  },
  image: {
    width: "100%",
    height: 130,
  },
  imageFallback: {
    width: "100%",
    height: 130,
    alignItems: "center",
    justifyContent: "center",
  },
  imageFallbackText: {
    fontSize: 28,
  },

  label: {
    marginTop: 10,
    color: INK,
    fontWeight: "900",
    fontSize: 15,
  },
  labelSelected: {
    color: ACCENT,
  },
});
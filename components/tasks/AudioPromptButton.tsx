import { api } from "@/lib/api";
import React, { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text } from "react-native";

type Props = {
  text?: string | null;
  audioUrl?: string | null;
  label?: string;
};

function toAbsUrl(uri?: string | null) {
  if (!uri) return "";
  if (uri.startsWith("http://") || uri.startsWith("https://")) return uri;
  const base = (api.baseUrl || "").replace(/\/$/, "");
  const path = uri.startsWith("/") ? uri : `/${uri}`;
  return `${base}${path}`;
}

export default function AudioPromptButton({ text, audioUrl, label = "Sikiliza" }: Props) {
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<any>(null);
  const resolvedUrl = useMemo(() => toAbsUrl(audioUrl), [audioUrl]);

  const speakWebText = () => {
    const phrase = String(text || "").trim();
    if (!phrase || typeof window === "undefined" || !("speechSynthesis" in window)) return false;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.rate = 0.85;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
    return true;
  };

  const playWebAudio = async () => {
    if (!resolvedUrl || typeof Audio === "undefined") return false;
    if (!audioRef.current) audioRef.current = new Audio(resolvedUrl);
    audioRef.current.pause?.();
    audioRef.current.currentTime = 0;
    await audioRef.current.play();
    return true;
  };

  const onPress = async () => {
    try {
      setLoading(true);

      if (Platform.OS === "web") {
        const playedAudio = await playWebAudio().catch(() => false);
        if (!playedAudio) speakWebText();
        return;
      }

      if (resolvedUrl) {
        const canOpen = await Linking.canOpenURL(resolvedUrl);
        if (canOpen) {
          await Linking.openURL(resolvedUrl);
          return;
        }
      }

      if (text) {
        await Linking.openURL(
          `https://translate.google.com/?sl=sw&tl=en&text=${encodeURIComponent(String(text))}&op=translate`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]}>
      {loading ? <ActivityIndicator size="small" /> : <Text style={styles.icon}>🔊</Text>}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(124,58,237,0.10)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.28)",
  },
  icon: { fontSize: 16 },
  label: {
    color: "#7C3AED",
    fontWeight: "900",
    fontSize: 14,
  },
});
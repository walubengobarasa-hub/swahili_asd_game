import { api } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";

function inferIcon(key: string) {
  const k = (key || "").toLowerCase();
  if (k.includes("animal")) return "paw" as const;
  if (k.includes("food") || k.includes("eat")) return "restaurant" as const;
  if (k.includes("greet")) return "hand-left" as const;
  if (k.includes("school")) return "school" as const;
  if (k.includes("song") || k.includes("nyimbo")) return "musical-notes" as const;
  return "grid" as const;
}

const TOPICS = [
  { key: "animals", label: "Animals", icon: "paw" as const },
  { key: "food", label: "Food", icon: "restaurant" as const },
  { key: "greetings", label: "Greetings", icon: "hand-left" as const },
  { key: "school", label: "School", icon: "school" as const },
];

const CHILD_ID_KEY = "child_selected_id";

async function storageGet(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") return window?.localStorage?.getItem(key) ?? null;
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

function withTimeout<T>(p: Promise<T>, ms = 12000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("Request timed out. Is FastAPI running?")), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

export default function Topics() {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [topics, setTopics] = useState<any[]>(TOPICS);
  const [childId, setChildId] = useState<number | null>(null);


  useEffect(() => {
    (async () => {
      const idStr = await storageGet(CHILD_ID_KEY);
      const idNum = idStr ? Number(idStr) : NaN;
      if (!Number.isFinite(idNum)) {
        router.replace("/(child)/select-profile");
        return;
      }
      setChildId(idNum);

      // Load topics dynamically so newly added teacher topics show up on child side
      try {
        const remote = await withTimeout(api.getTopics(), 8000);
        const list = Array.isArray(remote) ? remote : (remote?.topics ?? []);
        if (Array.isArray(list) && list.length > 0) {
          // map remote -> UI shape
          const mapped = list.map((t: any) => ({
            key: t.key,
            label: t.label_en || t.label || t.key,
            icon: inferIcon(t.key),
          }));
          setTopics(mapped);
        }
      } catch {
        // keep fallback TOPICS
      }
    })();
  }, []);

  return (
    <ResponsiveScreen>
      <TopBar title="Choose Topic" rightIcon="⚙️" onRight={() => router.push("/(child)/caregiver-pin")} />

      <GlassCard>
        <Text style={styles.title}>Select a topic to start</Text>
        {!!err && <Text style={styles.errorText}>{err}</Text>}
      </GlassCard>

      <View style={{ marginTop: 14, gap: 12 }}>
        {topics.map((t) => {
          const isBusy = busyKey === t.key;

          return (
            <Pressable
              key={t.key}
              style={[styles.topicCard, isBusy && styles.topicCardBusy]}
              disabled={!!busyKey}
              onPress={async () => {
                try {
                  setErr(null);
                  setBusyKey(t.key);

                  const child_id = childId ?? NaN;
                  if (!Number.isFinite(child_id)) throw new Error('Child not selected');
                  const data = await withTimeout(api.startSession({ child_id, lesson_focus: t.key }));

                  // ✅ log to confirm we got values
                  console.log("startSession ok:", data);

                  router.replace({
                    pathname: "/(child)/play",
                    params: { session_id: String(data.session_id), child_id: String(child_id) },
                  });
                } catch (e: any) {
                  console.error("startSession failed:", e);
                  const msg = e?.message || "Failed to start session.";
                  setErr(msg);
                  Alert.alert("Start failed", msg);
                } finally {
                  setBusyKey(null);
                }
              }}
            >
              <View style={styles.topicLeft}>
                <View style={styles.iconBubble}>
                  <Ionicons name={t.icon} size={20} color={COLORS.ink} />
                </View>
                <Text style={styles.topicText}>{isBusy ? "Starting…" : t.label}</Text>
              </View>

              <Ionicons name="chevron-forward" size={22} color="rgba(28,53,87,0.65)" />
            </Pressable>
          );
        })}
      </View>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  errorText: { marginTop: 8, fontSize: 13, fontWeight: "700", color: "#b91c1c", textAlign: "center" },

  topicCard: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: RADIUS.xl,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topicCardBusy: { opacity: 0.7 },

  topicLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.cream,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    alignItems: "center",
    justifyContent: "center",
  },
  topicText: { fontSize: 18, fontWeight: "900", color: COLORS.ink },
});

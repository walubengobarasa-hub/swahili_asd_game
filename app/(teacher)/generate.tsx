import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";
import { getJSON, postJSON } from "../../lib/api";

type TopicRow = { key: string; label_sw?: string; label_en?: string };

const TASK_TYPES = [
  { key: "match_image", label: "Match Image" },
  { key: "fill_blank", label: "Fill Blank" },
];

export default function TeacherGenerate() {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;

  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [topic, setTopic] = useState<string>("animals");
  const [taskType, setTaskType] = useState<string>("match_image");
  const [targetLexiconId, setTargetLexiconId] = useState<string>("1");
  const [maxWords, setMaxWords] = useState<string>("8");

  const [loadingTopics, setLoadingTopics] = useState(true);
  const [busy, setBusy] = useState(false);

  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  const safeMaxWords = useMemo(() => {
    const n = Number(maxWords);
    return Number.isFinite(n) && n > 0 ? Math.min(12, Math.max(4, n)) : 8;
  }, [maxWords]);

  const safeLexId = useMemo(() => {
    const n = Number(targetLexiconId);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [targetLexiconId]);

  const loadTopics = async () => {
    setLoadingTopics(true);
    try {
      const rows = await getJSON("/topics");
      const list = Array.isArray(rows) ? (rows as TopicRow[]) : [];
      setTopics(list);
      if (list.length && !list.find((t) => t.key === topic)) setTopic(list[0].key);
    } catch (e: any) {
      // topics endpoint exists but might fail; fallback to current topic
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const generate = async () => {
    setBusy(true);
    setErr(null);
    setResult(null);
    try {
      const data = await postJSON("/ai/generate-task", {
        topic,
        target_lexicon_id: safeLexId,
        task_type: taskType,
        max_words: safeMaxWords,
      });
      setResult(data);
    } catch (e: any) {
      setErr(e?.message || "Failed to generate task.");
    } finally {
      setBusy(false);
    }
  };

  const approvedText =
    result?.approved === true ? "Approved (auto)" : result?.approved === false ? "Pending approval" : "—";

  return (
    <ResponsiveScreen>
      <TopBar title="Generate AI Task" rightIcon="✕" onRight={() => router.back()} />

      <View style={[styles.grid, isWide && styles.gridWide]}>
        <View style={[styles.col, isWide && styles.colHalf]}>
          <GlassCard>
            <Text style={styles.h1}>Inputs</Text>

            <Text style={styles.label}>Topic</Text>
            <View style={styles.rowWrap}>
              {loadingTopics ? (
                <Text style={styles.muted}>Loading topics…</Text>
              ) : topics.length ? (
                topics.map((t) => {
                  const active = t.key === topic;
                  const label = t.label_en || t.label_sw || t.key;
                  return (
                    <Pressable
                      key={t.key}
                      onPress={() => setTopic(t.key)}
                      style={[styles.pill, active && styles.pillActive]}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
                    </Pressable>
                  );
                })
              ) : (
                <Text style={styles.muted}>No topics loaded (using "{topic}").</Text>
              )}
            </View>

            <Text style={[styles.label, { marginTop: 12 }]}>Task Type</Text>
            <View style={styles.rowWrap}>
              {TASK_TYPES.map((tt) => {
                const active = tt.key === taskType;
                return (
                  <Pressable key={tt.key} onPress={() => setTaskType(tt.key)} style={[styles.pill, active && styles.pillActive]}>
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{tt.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ marginTop: 12, gap: 10 }}>
              <View>
                <Text style={styles.label}>Target Lexicon ID</Text>
                <TextInput
                  value={targetLexiconId}
                  onChangeText={setTargetLexiconId}
                  keyboardType="number-pad"
                  placeholder="e.g. 21"
                  placeholderTextColor="rgba(28,53,87,0.45)"
                  style={styles.input}
                />
                <Text style={styles.help}>
                  Use an existing lexicon_items.id from your DB. (We can add a picker endpoint later.)
                </Text>
              </View>

              <View>
                <Text style={styles.label}>Max Words</Text>
                <TextInput
                  value={maxWords}
                  onChangeText={setMaxWords}
                  keyboardType="number-pad"
                  placeholder="8"
                  placeholderTextColor="rgba(28,53,87,0.45)"
                  style={styles.input}
                />
              </View>

              <Pressable
                disabled={busy}
                onPress={generate}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  pressed && !busy && { opacity: 0.92 },
                  busy && { opacity: 0.6 },
                ]}
              >
                <Text style={styles.primaryBtnText}>{busy ? "Generating…" : "Generate"}</Text>
              </Pressable>

              {err ? <Text style={styles.err}>{err}</Text> : null}
            </View>
          </GlassCard>
        </View>

        <View style={[styles.col, isWide && styles.colHalf]}>
          <GlassCard>
            <Text style={styles.h1}>Result</Text>

            {!result ? (
              <Text style={styles.muted}>Generate a task to see output here.</Text>
            ) : (
              <>
                <View style={styles.kvRow}>
                  <Text style={styles.k}>Validation</Text>
                  <Text style={styles.v}>{result.validation_ok ? "OK" : "FAILED"}</Text>
                </View>
                <View style={styles.kvRow}>
                  <Text style={styles.k}>Notes</Text>
                  <Text style={styles.v}>{String(result.notes ?? "—")}</Text>
                </View>
                <View style={styles.kvRow}>
                  <Text style={styles.k}>Task ID</Text>
                  <Text style={styles.v}>{result.task_id ?? "—"}</Text>
                </View>
                <View style={styles.kvRow}>
                  <Text style={styles.k}>Approval</Text>
                  <Text style={styles.v}>{approvedText}</Text>
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={styles.label}>Generated Text</Text>
                  <View style={styles.outputBox}>
                    <Text style={styles.outputText}>{String(result.generated_text ?? "")}</Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => router.push("/(teacher)/review")}
                  style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.92 }]}
                >
                  <Text style={styles.secondaryBtnText}>Go to Review</Text>
                </Pressable>
              </>
            )}
          </GlassCard>
        </View>
      </View>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 14 },
  gridWide: { flexDirection: "row", alignItems: "flex-start" },
  col: {},
  colHalf: { flex: 1 },

  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },

  label: { marginTop: 10, fontWeight: "900", color: COLORS.ink },
  help: { marginTop: 6, fontWeight: "700", color: "rgba(28,53,87,0.65)" },

  muted: { marginTop: 10, fontWeight: "800", color: "rgba(28,53,87,0.7)", textAlign: "center" },
  err: { marginTop: 10, fontWeight: "800", color: "#B42318", textAlign: "center" },

  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 10 },

  pill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },
  pillActive: { backgroundColor: COLORS.green, borderColor: COLORS.greenDark },
  pillText: { fontWeight: "900", color: COLORS.ink },
  pillTextActive: { color: "white" },

  input: {
    marginTop: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    color: COLORS.ink,
    backgroundColor: "rgba(255,255,255,0.75)",
  },

  primaryBtn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.green,
    borderWidth: 1,
    borderColor: COLORS.greenDark,
    alignItems: "center",
  },
  primaryBtnText: { color: "white", fontWeight: "900", fontSize: 16 },

  secondaryBtn: {
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    backgroundColor: "rgba(124,58,237,0.10)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.35)",
    alignItems: "center",
  },
  secondaryBtnText: { color: "#7C3AED", fontWeight: "900" },

  kvRow: { marginTop: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.stroke, backgroundColor: "rgba(255,255,255,0.65)" },
  k: { fontWeight: "900", color: "rgba(28,53,87,0.75)" },
  v: { marginTop: 4, fontWeight: "900", color: COLORS.ink },

  outputBox: {
    marginTop: 6,
    padding: 12,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  outputText: { fontWeight: "800", color: "rgba(28,53,87,0.85)", lineHeight: 20 },
});

import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import BigGreenButton from "../../components/BigGreenButton";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS } from "../../constants/theme";
import { postJSON } from "../../lib/api";

export default function GenerateTask() {
  const [topic, setTopic] = useState("animals");
  const [targetId, setTargetId] = useState("1");
  const [taskType, setTaskType] = useState<"match_image" | "fill_blank">("match_image");
  const [msg, setMsg] = useState<string>("");

  const generate = async () => {
    setMsg("Generating...");
    try {
      const res = await postJSON("/ai/generate-task", {
        topic,
        target_lexicon_id: Number(targetId),
        task_type: taskType,
        max_words: 8,
      });
      setMsg(res.validation_ok ? `OK: Stored task_id=${res.task_id} (approved=${res.approved})` : `FAILED: ${res.notes}`);
    } catch (e: any) {
      setMsg(String(e?.message ?? e));
    }
  };

  return (
    <ResponsiveScreen>
      <TopBar title="Generate AI Task" rightIcon="✕" onRight={() => router.back()} />

      <GlassCard>
        <Text style={styles.label}>Topic</Text>
        <TextInput style={styles.input} value={topic} onChangeText={setTopic} placeholder="animals" />

        <Text style={styles.label}>Target Lexicon ID</Text>
        <TextInput style={styles.input} value={targetId} onChangeText={setTargetId} keyboardType="numeric" placeholder="1" />

        <Text style={styles.label}>Task Type</Text>
        <View style={styles.row}>
          <Pressable style={[styles.pill, taskType === "match_image" && styles.pillActive]} onPress={() => setTaskType("match_image")}>
            <Text style={[styles.pillText, taskType === "match_image" && styles.pillTextActive]}>match_image</Text>
          </Pressable>
          <Pressable style={[styles.pill, taskType === "fill_blank" && styles.pillActive]} onPress={() => setTaskType("fill_blank")}>
            <Text style={[styles.pillText, taskType === "fill_blank" && styles.pillTextActive]}>fill_blank</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 14 }}>
          <BigGreenButton label="GENERATE" onPress={generate} />
        </View>

        {!!msg && <Text style={styles.msg}>{msg}</Text>}
      </GlassCard>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: 10, fontWeight: "900", color: COLORS.ink },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "rgba(28,53,87,0.12)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.75)",
    fontWeight: "800",
    color: COLORS.ink,
  },
  row: { marginTop: 10, flexDirection: "row", gap: 10, flexWrap: "wrap" },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: "rgba(28,53,87,0.12)",
  },
  pillActive: { backgroundColor: COLORS.green, borderColor: COLORS.greenDark },
  pillText: { fontWeight: "900", color: COLORS.ink },
  pillTextActive: { color: "white" },
  msg: { marginTop: 14, fontWeight: "800", color: "rgba(28,53,87,0.75)", textAlign: "center" },
});

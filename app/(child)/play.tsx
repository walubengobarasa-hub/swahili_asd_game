import { api } from "@/lib/api";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TaskRenderer from "../../components/tasks/TaskRenderer";
import TopBar from "../../components/TopBar";
import { COLORS } from "../../constants/theme";

export default function Play() {
  const { session_id, child_id } = useLocalSearchParams<{ session_id: string; child_id: string }>();
  const sessionId = Number(session_id);
  const childId = Number(child_id);

  const [taskId, setTaskId] = useState<number | null>(null);
  const [task, setTask] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadNext = useCallback(async () => {
    if (!Number.isFinite(sessionId) || !Number.isFinite(childId)) {
      setErr("Invalid session or child id.");
      return;
    }

    try {
      setErr(null);
      const data = await api.nextTask({ session_id: sessionId, child_id: childId });
      setTaskId(data.task_id);
      setTask(data.task);
    } catch (e: any) {
      setErr(e?.message || "Failed to load next task.");
    }
  }, [sessionId, childId]);

  useEffect(() => {
    loadNext();
  }, [loadNext]);

  if (err) {
    return (
      <ResponsiveScreen>
        <TopBar title="Lesson" />
        <GlassCard>
          <Text style={{ fontWeight: "900", color: COLORS.ink }}>Couldn’t load task</Text>
          <Text style={{ marginTop: 8, color: "rgba(28,53,87,0.75)" }}>{err}</Text>
          <Pressable onPress={loadNext} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </GlassCard>
      </ResponsiveScreen>
    );
  }

  if (!task) {
    return (
      <ResponsiveScreen>
        <TopBar title="Loading..." />
        <GlassCard>
          <Text>Loading task…</Text>
        </GlassCard>
      </ResponsiveScreen>
    );
  }

  const difficulty = Number(task?.meta?.difficulty ?? task?.difficulty ?? 1) || 1;

  return (
    <ResponsiveScreen>
      <TopBar title={`Lesson • Level ${difficulty}`} rightIcon="⚙️" onRight={() => router.push("/(child)/caregiver-pin")} />

      <View style={styles.levelWrap}>
        <Text style={styles.levelText}>Current challenge level: {difficulty}/5</Text>
        <Text style={styles.levelSub}>
          Two correct answers in a row unlock a harder visual task.
        </Text>
      </View>

      <TaskRenderer
        task={task}
        locked={submitting}
        onSubmit={async (answer: string, meta: any) => {
          try {
            setSubmitting(true);
            const res = await api.submitTask({
              session_id: sessionId,
              task_id: taskId!,
              child_id: childId,
              answer,
              response_time_ms: meta.rt,
              retries: meta.retries,
              skipped: !!meta.skipped,
              hint_used: !!meta.hint_used,
              taps: meta.taps ?? 0,
              timeouts: meta.timeouts ?? 0,
              pauses: meta.pauses ?? 0,
              audio_muted: !!meta.audio_muted,
              abandon_mid_task: !!meta.abandon_mid_task,
            });

            router.push({
              pathname: "/(child)/result",
              params: {
                ok: res.is_correct ? "1" : "0",
                feedback: res.feedback_sw,
                stars: String(res.reward?.stars ?? 0),
                level: String(res.reward?.level ?? difficulty),
                session_id: String(sessionId),
                child_id: String(childId),
              },
            });
          } catch (e: any) {
            setErr(e?.message || "Failed to submit task.");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  levelWrap: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  levelText: {
    color: COLORS.ink,
    fontWeight: "900",
    fontSize: 15,
  },
  levelSub: {
    marginTop: 4,
    color: "rgba(28,53,87,0.72)",
    fontWeight: "700",
  },
  retryBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: COLORS.green,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: "white",
    fontWeight: "900",
  },
});
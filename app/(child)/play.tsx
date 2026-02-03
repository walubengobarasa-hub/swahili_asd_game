import { api } from "@/lib/api";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TaskRenderer from "../../components/tasks/TaskRenderer";
import TopBar from "../../components/TopBar";

export default function Play() {
  const { session_id, child_id } = useLocalSearchParams<{ session_id: string; child_id: string }>();
  const sessionId = Number(session_id);
  const childId = Number(child_id);

  const [taskId, setTaskId] = useState<number | null>(null);
  const [task, setTask] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

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
          <Text style={{ fontWeight: "900" }}>Couldn’t load task</Text>
          <Text style={{ marginTop: 8 }}>{err}</Text>
          <Text style={{ marginTop: 12, fontWeight: "700" }} onPress={loadNext}>
            Tap to retry
          </Text>
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

  return (
    <ResponsiveScreen>
      <TopBar title="Lesson" rightIcon="⚙️" onRight={() => router.push("/(child)/caregiver-pin")} />

      <TaskRenderer
        task={task}
        onSubmit={async (
          answer: string,
          meta: { rt: number; retries: number; skipped?: boolean; hint_used?: boolean }
        ) => {
          const res = await api.submitTask({
            session_id: sessionId,
            task_id: taskId!,
            child_id: childId,
            answer,
            response_time_ms: meta.rt,
            retries: meta.retries,
            skipped: !!meta.skipped,
            hint_used: !!meta.hint_used,
          });

          router.push({
            pathname: "/(child)/result",
            params: {
              ok: res.is_correct ? "1" : "0",
              feedback: res.feedback_sw,
              stars: String(res.reward?.stars ?? 0),
              session_id: String(sessionId),
              child_id: String(childId),
            },
          });
        }}
      />
    </ResponsiveScreen>
  );
}

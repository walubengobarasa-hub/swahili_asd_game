import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TaskRenderer from "../../components/tasks/TaskRenderer";
import TopBar from "../../components/TopBar";
import { postJSON } from "../../lib/api";

export default function Play() {
  const { session_id, child_id } = useLocalSearchParams<{ session_id: string; child_id: string }>();
  const sessionId = Number(session_id);
  const childId = Number(child_id);

  const [taskId, setTaskId] = useState<number | null>(null);
  const [task, setTask] = useState<any>(null);

  const loadNext = async () => {
    const data = await postJSON("/tasks/next", { session_id: sessionId, child_id: childId });
    setTaskId(data.task_id);
    setTask(data.task);
  };

  useEffect(() => {
    loadNext();
  }, [sessionId, childId]);

  if (!task) {
    return (
      <ResponsiveScreen>
        <TopBar title="Loading..." />
        <GlassCard><Text>Loading task…</Text></GlassCard>
      </ResponsiveScreen>
    );
  }

  return (
    <ResponsiveScreen>
      <TopBar title="Lesson" rightIcon="⚙️" onRight={() => router.push("/(child)/caregiver-pin")} />

      <TaskRenderer
        task={task}
        onSubmit={async (answer: string, meta: { rt: number; retries: number; skipped?: boolean; hint_used?: boolean }) => {
          const res = await postJSON("/tasks/submit", {
            session_id: sessionId,
            task_id: taskId,
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

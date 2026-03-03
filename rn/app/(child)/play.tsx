import { api } from "@/lib/api";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { AppState, Text, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TaskRenderer from "../../components/tasks/TaskRenderer";
import TopBar from "../../components/TopBar";
import { useAccessibility } from "../../context/AccessibilityContext";

export default function Play() {
  const { session_id, child_id } = useLocalSearchParams<{ session_id: string; child_id: string }>();
  const sessionId = Number(session_id);
  const childId = Number(child_id);

  const [taskId, setTaskId] = useState<number | null>(null);
  const [task, setTask] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [serverModality, setServerModality] = useState<string | null>(null);
  const [decisionReason, setDecisionReason] = useState<string | null>(null);

  const { lowStimulation, audioMuted } = useAccessibility();

  // pause marker (backgrounding)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        api
          .submitSignal({
            session_id: sessionId,
            child_id: childId,
            task_id: taskId,
            kind: "pause",
            payload: { state },
          })
          .catch(() => {});
      }
    });
    return () => sub.remove();
  }, [sessionId, childId, taskId]);

  // audio muted marker
  useEffect(() => {
    api
      .submitSignal({
        session_id: sessionId,
        child_id: childId,
        task_id: taskId,
        kind: "audio_muted",
        payload: { muted: audioMuted },
      })
      .catch(() => {});
  }, [audioMuted, sessionId, childId, taskId]);

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
      setServerModality(data.modality ?? null);
      setDecisionReason(data.decision_reason ?? null);
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
      <TopBar
        title={lowStimulation ? "Lesson (Calm)" : "Lesson"}
        rightIcon="⚙️"
        onRight={() => router.push("/(child)/caregiver-pin")}
      />

      {!!serverModality && (
        <View style={{ marginTop: 10 }}>
          <GlassCard>
            <Text style={{ fontWeight: "900" }}>{`Mode: ${serverModality}${lowStimulation ? " • Low stimulation" : ""}`}</Text>
            {!!decisionReason && <Text style={{ marginTop: 6, fontWeight: "700" }}>{decisionReason}</Text>}
          </GlassCard>
        </View>
      )}

      <TaskRenderer
        task={task}
        onOverload={(kind, meta) => {
          api
            .submitSignal({
              session_id: sessionId,
              child_id: childId,
              task_id: taskId,
              kind: "overload_marker",
              payload: { kind, ...(meta ?? {}) },
            })
            .catch(() => {});
        }}
        onSubmit={async (
          answer: string,
          meta: {
            rt: number;
            retries: number;
            skipped?: boolean;
            hint_used?: boolean;
            taps?: number;
            pauses?: number;
            timeouts?: number;
          }
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
            taps: meta.taps ?? 0,
            pauses: meta.pauses ?? 0,
            timeouts: meta.timeouts ?? 0,
            audio_muted: audioMuted,
          });

          setServerModality(res.modality ?? serverModality);
          setDecisionReason(res.decision_reason ?? decisionReason);

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

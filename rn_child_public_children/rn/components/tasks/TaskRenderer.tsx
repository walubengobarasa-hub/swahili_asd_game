import React from "react";
import { Pressable, Text, View } from "react-native";

import StepCard from "../StepCard";
import { useAccessibility } from "../../context/AccessibilityContext";
import { useTaskSignalTracker } from "../../lib/signalTracker";

import FillBlankTask from "./FillBlankTask";
import MatchImageTask from "./MatchImageTask";
import MatchWordTask from "./MatchWordTask";
import SentenceBuilderTask from "./SentenceBuilderTask";

export type SubmitMeta = {
  rt: number;
  retries: number;
  skipped?: boolean;
  hint_used?: boolean;
  taps?: number;
  pauses?: number;
  timeouts?: number;
};

type Props = {
  task: any;
  onSubmit: (answer: string, meta: SubmitMeta) => void;
  locked?: boolean;
  onOverload?: (kind: string, meta?: any) => void;
};

export default function TaskRenderer({ task, onSubmit, locked, onOverload }: Props) {
  if (!task) return null;

  const { setLowStimulation, allowAutoLowStimulation } = useAccessibility();

  const tracker = useTaskSignalTracker({
    timeoutMs: 20000,
    onOverload: (e) => {
      if (!allowAutoLowStimulation) return;
      setLowStimulation(true);
      onOverload?.(e.kind, e.meta);
      // local UX: in low stimulation, we avoid extra popups.
      // play.tsx will also send this signal to backend.
    },
  });

  const finalizeAndSubmit = (answer: string, extra: Partial<SubmitMeta> = {}) => {
    const fin = tracker.finalize();
    onSubmit(answer, {
      rt: fin.rt,
      retries: extra.retries ?? 0,
      skipped: !!extra.skipped,
      hint_used: !!extra.hint_used,
      taps: fin.taps,
      pauses: fin.pauses,
      timeouts: fin.timeouts,
    });
  };

  const prompt = task?.prompt_sw ?? "";
  const hintText = task?.hint_sw ?? "";
  const hintImageUrl = task?.hint_image_url ?? null;

  const type = task.task_type;

  // Common “step-by-step” helper UI.
  const header = (
    <StepCard
      step={1}
      total={1}
      title={type?.replace(/_/g, " ")}
      text={prompt || "One step at a time."}
      icon={"🧩"}
      imageUrl={null}
      onRepeat={() => {
        tracker.recordTap();
      }}
      onShowMe={() => {
        tracker.markHintUsed();
      }}
    />
  );

  switch (type) {
    case "fill_blank":
      return (
        <View style={{ gap: 12 }}>
          {header}
          <FillBlankTask
            task={task}
            locked={locked}
            onAnswer={(answer, meta) => finalizeAndSubmit(answer, meta)}
            onTap={tracker.recordTap}
            onHint={() => tracker.markHintUsed()}
            hintText={hintText}
            hintImageUrl={hintImageUrl}
          />
        </View>
      );

    case "match_image":
      return (
        <View style={{ gap: 12 }}>
          {header}
          <MatchImageTask
            task={task}
            locked={locked}
            onAnswer={(answer, meta) => finalizeAndSubmit(answer, meta)}
            onTap={tracker.recordTap}
            onHint={() => tracker.markHintUsed()}
          />
        </View>
      );

    case "match_word":
      return (
        <View style={{ gap: 12 }}>
          {header}
          <MatchWordTask
            task={task}
            locked={locked}
            onAnswer={(answer, meta) => finalizeAndSubmit(answer, meta)}
            onTap={tracker.recordTap}
            onHint={() => tracker.markHintUsed()}
          />
        </View>
      );

    case "sentence_builder":
      return (
        <View style={{ gap: 12 }}>
          {header}
          <SentenceBuilderTask
            task={task}
            locked={locked}
            onAnswer={(answer, meta) => finalizeAndSubmit(answer, meta)}
            onTap={tracker.recordTap}
            onHint={() => tracker.markHintUsed()}
          />
        </View>
      );

    default:
      return (
        <View style={{ padding: 14 }}>
          <Text style={{ color: "#fca5a5", fontWeight: "700" }}>
            Unsupported task type: {String(type)}
          </Text>
          <Pressable
            onPress={() => finalizeAndSubmit("", { skipped: true })}
            style={{ marginTop: 12 }}
          >
            <Text style={{ fontWeight: "900" }}>Skip</Text>
          </Pressable>
        </View>
      );
  }
}

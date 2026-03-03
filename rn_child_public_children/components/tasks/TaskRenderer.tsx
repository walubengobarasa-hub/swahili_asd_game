import React, { useEffect, useMemo, useRef } from "react";
import { Text, View } from "react-native";

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
  timeouts?: number;
  pauses?: number;
  audio_muted?: boolean;
  abandon_mid_task?: boolean;
};

type Props = {
  task: any;
  onSubmit: (answer: string, meta: SubmitMeta) => void;
  locked?: boolean;
};

export default function TaskRenderer({ task, onSubmit, locked }: Props) {
  const startRef = useRef<number>(Date.now());
  const tapsRef = useRef<number>(0);

  // Reset timers/counters when task changes
  useEffect(() => {
    startRef.current = Date.now();
    tapsRef.current = 0;
  }, [task?.id, task?.task_type, task?.prompt_sw]);

  const onAnswer = (answer: string, meta?: Partial<SubmitMeta>) => {
    const rt = Date.now() - startRef.current;
    const taps = tapsRef.current + (meta?.taps ?? 0);
    tapsRef.current = taps;

    onSubmit(answer, {
      rt,
      retries: meta?.retries ?? 0,
      skipped: meta?.skipped,
      hint_used: meta?.hint_used,
      taps,
      timeouts: meta?.timeouts ?? 0,
      pauses: meta?.pauses ?? 0,
      audio_muted: meta?.audio_muted ?? false,
      abandon_mid_task: meta?.abandon_mid_task ?? false,
    });
  };

  const type = task?.task_type;

  switch (type) {
    case "fill_blank":
      return <FillBlankTask task={task} onAnswer={onAnswer} locked={locked} />;

    case "match_image":
      return <MatchImageTask task={task} onAnswer={onAnswer} locked={locked} />;

    case "match_word":
      return <MatchWordTask task={task} onAnswer={onAnswer} locked={locked} />;

    case "sentence_builder":
      return <SentenceBuilderTask task={task} onAnswer={onAnswer} locked={locked} />;

    default:
      return (
        <View style={{ padding: 14 }}>
          <Text style={{ color: "#fca5a5", fontWeight: "700" }}>
            Unsupported task type: {String(type)}
          </Text>
        </View>
      );
  }
}

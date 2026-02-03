import React from "react";
import { Text, View } from "react-native";

import FillBlankTask from "./FillBlankTask";
import MatchImageTask from "./MatchImageTask";
import MatchWordTask from "./MatchWordTask";
import SentenceBuilderTask from "./SentenceBuilderTask";

type SubmitMeta = { rt: number; retries: number; skipped?: boolean; hint_used?: boolean };

type Props = {
  task: any;
  onSubmit: (answer: string, meta: SubmitMeta) => void;
  locked?: boolean;
};

export default function TaskRenderer({ task, onSubmit, locked }: Props) {
  if (!task) return null;

  // Your tasks currently call onAnswer(answer: string).
  // Adapt to the onSubmit(answer, meta) signature used in Play.
  const onAnswer = (answer: string) => onSubmit(answer, { rt: 0, retries: 0 });

  const type = task.task_type;

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

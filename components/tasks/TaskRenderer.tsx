import React from "react";
import FillBlankTiles from "./FillBlankTiles";
import MatchImage from "./MatchImage";
import MatchWord from "./MatchWord";
import SentenceBuilder from "./SentenceBuilder";

type SubmitMeta = { rt: number; retries: number; skipped?: boolean; hint_used?: boolean };

export default function TaskRenderer({
  task,
  onSubmit,
}: {
  task: any;
  onSubmit: (answer: string, meta: SubmitMeta) => void;
}) {
  const t = task?.task_type;

  if (t === "match_image") return <MatchImage task={task} onSubmit={onSubmit} />;
  if (t === "match_word") return <MatchWord task={task} onSubmit={onSubmit} />;
  if (t === "fill_blank") return <FillBlankTiles task={task} onSubmit={onSubmit} />;
  if (t === "sentence_builder") return <SentenceBuilder task={task} onSubmit={onSubmit} />;

  return null;
}

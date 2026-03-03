export type Modality = "text" | "image" | "audio" | "mixed";

export type SignalSnapshot = {
  accuracy?: number; // 0..1
  avgResponseTimeMs?: number;
  repeatedAttempts?: number;
  skippedSteps?: number;
  hintUsed?: number;
  abandonments?: number;
  overloadMarkers?: number;
};

export type ModalityDecision = {
  modality: Modality;
  lowStimulation: boolean;
  reason: string;
};

/**
 * Client-side helper.
 * Server remains the authority; this is used for optimistic UI and offline.
 */
export function decideModalityClient(
  prev: Modality | null,
  signals: SignalSnapshot,
  opts: { prefersImages?: boolean; prefersAudio?: boolean; allowLowStim?: boolean } = {}
): ModalityDecision {
  const prefersImages = opts.prefersImages !== false;
  const prefersAudio = opts.prefersAudio !== false;
  const allowLowStim = opts.allowLowStim !== false;

  const acc = signals.accuracy ?? 1;
  const rt = signals.avgResponseTimeMs ?? 0;
  const hints = signals.hintUsed ?? 0;
  const overload = signals.overloadMarkers ?? 0;

  if (allowLowStim && overload >= 1) {
    return {
      modality: prefersImages ? "image" : "text",
      lowStimulation: true,
      reason: "Overload markers detected — switching to low stimulation",
    };
  }

  if (acc < 0.55 && rt > 7000) {
    return {
      modality: prefersImages ? "image" : "text",
      lowStimulation: false,
      reason: "Low accuracy + high time — visual-first",
    };
  }

  if (acc < 0.65 && hints >= 2) {
    return {
      modality: prefersImages ? "image" : "text",
      lowStimulation: false,
      reason: "Hints used — simplifying",
    };
  }

  if (acc >= 0.85 && rt > 0 && rt < 4500) {
    return {
      modality: prefersAudio || prefersImages ? "mixed" : "text",
      lowStimulation: false,
      reason: "Steady success — introducing mixed",
    };
  }

  return {
    modality: prev ?? (prefersImages ? "image" : "text"),
    lowStimulation: false,
    reason: "Maintaining modality",
  };
}

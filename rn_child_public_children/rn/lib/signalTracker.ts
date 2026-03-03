import { useEffect, useMemo, useRef, useState } from "react";

export type OverloadEvent = {
  kind: "rapid_tapping" | "timeout" | "pausing" | "muted_audio";
  meta?: Record<string, any>;
};

export function useTaskSignalTracker(opts: {
  overloadTapThreshold?: number;
  overloadWindowMs?: number;
  timeoutMs?: number;
  onOverload?: (e: OverloadEvent) => void;
}) {
  const startTs = useRef<number>(Date.now());
  const taps = useRef<number[]>([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const pauses = useRef(0);
  const timeouts = useRef(0);

  const overloadTapThreshold = opts.overloadTapThreshold ?? 12;
  const overloadWindowMs = opts.overloadWindowMs ?? 2000;

  // optional timeout
  useEffect(() => {
    if (!opts.timeoutMs) return;
    const t = setTimeout(() => {
      timeouts.current += 1;
      opts.onOverload?.({ kind: "timeout" });
    }, opts.timeoutMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recordTap = () => {
    const now = Date.now();
    taps.current.push(now);
    // keep window
    taps.current = taps.current.filter((t) => now - t <= overloadWindowMs);
    if (taps.current.length >= overloadTapThreshold) {
      opts.onOverload?.({ kind: "rapid_tapping", meta: { taps: taps.current.length } });
    }
  };

  const recordPause = () => {
    pauses.current += 1;
    if (pauses.current >= 3) {
      opts.onOverload?.({ kind: "pausing", meta: { pauses: pauses.current } });
    }
  };

  const markHintUsed = () => setHintUsed(true);
  const markSkipped = () => setSkipped(true);

  const snapshot = useMemo(
    () => ({
      started_at_ms: startTs.current,
      taps: taps.current.length,
      hint_used: hintUsed,
      skipped,
      pauses: pauses.current,
      timeouts: timeouts.current,
    }),
    [hintUsed, skipped]
  );

  const finalize = () => {
    const rt = Date.now() - startTs.current;
    return {
      rt,
      taps: taps.current.length,
      hint_used: hintUsed,
      skipped,
      pauses: pauses.current,
      timeouts: timeouts.current,
    };
  };

  return {
    snapshot,
    recordTap,
    recordPause,
    markHintUsed,
    markSkipped,
    finalize,
  };
}

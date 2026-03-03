// MVP: avoid AsyncStorage dependency (use web localStorage; native can be added later)
import { Platform } from "react-native";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type AccessibilityState = {
  lowStimulation: boolean;
  setLowStimulation: (v: boolean) => void;
  allowAutoLowStimulation: boolean;
  setAllowAutoLowStimulation: (v: boolean) => void;
  audioMuted: boolean;
  setAudioMuted: (v: boolean) => void;
};

const Ctx = createContext<AccessibilityState | null>(null);

const KEY = "asd_accessibility_v1";

async function storageGet(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") return window?.localStorage?.getItem(key) ?? null;
    return null;
  } catch {
    return null;
  }
}

async function storageSet(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === "web") window?.localStorage?.setItem(key, value);
  } catch {
    // ignore
  }
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [lowStimulation, setLowStimulation] = useState(false);
  const [allowAutoLowStimulation, setAllowAutoLowStimulation] = useState(true);
  const [audioMuted, setAudioMuted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await storageGet(KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        setLowStimulation(!!data.lowStimulation);
        setAllowAutoLowStimulation(data.allowAutoLowStimulation !== false);
        setAudioMuted(!!data.audioMuted);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await storageSet(KEY, JSON.stringify({ lowStimulation, allowAutoLowStimulation, audioMuted }));
      } catch {
        // ignore
      }
    })();
  }, [lowStimulation, allowAutoLowStimulation, audioMuted]);

  const value = useMemo(
    () => ({
      lowStimulation,
      setLowStimulation,
      allowAutoLowStimulation,
      setAllowAutoLowStimulation,
      audioMuted,
      setAudioMuted,
    }),
    [lowStimulation, allowAutoLowStimulation, audioMuted]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAccessibility() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return v;
}

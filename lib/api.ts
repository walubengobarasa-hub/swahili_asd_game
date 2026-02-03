import { Platform } from "react-native";

type FetchOptions = RequestInit & { json?: any };

function resolveBaseUrl() {
  const envUrl = (process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_API_URL || "").trim();
  if (envUrl) return envUrl.replace(/\/$/, "");

  if (Platform.OS === "web") return "http://127.0.0.1:8000";
  if (Platform.OS === "android") return "http://10.0.2.2:8000";
  return "http://127.0.0.1:8000";
}

export const BASE_URL = resolveBaseUrl();

async function http<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const url = `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.headers as any),
  };

  let body: any = opts.body;

  if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  }

  let res: Response;
  try {
    res = await fetch(url, { ...opts, headers, body });
  } catch (e: any) {
    const hint =
      Platform.OS === "android"
        ? "If you are on Android emulator, use 10.0.2.2 instead of 127.0.0.1."
        : "Check that the FastAPI server is running and CORS allows your app origin.";
    throw new Error(`Failed to fetch ${url}. ${hint}`);
  }

  const text = await res.text();
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = isJson && text ? JSON.parse(text) : (text as any);

  if (!res.ok) {
    const detail = (data && (data.detail || data.message)) || text || res.statusText;
    throw new Error(`HTTP ${res.status}: ${detail}`);
  }

  return data as T;
}

/** ✅ Named exports used across screens */
export function getJSON<T = any>(path: string, opts: RequestInit = {}) {
  return http<T>(path, { ...opts, method: "GET" });
}

export function postJSON<T = any>(path: string, json: any, opts: RequestInit = {}) {
  return http<T>(path, { ...opts, method: "POST", json });
}

/** Existing API object (keep this for typed calls) */
export const api = {
  baseUrl: BASE_URL,

  startSession: (payload: { child_id: number; lesson_focus: string }) =>
    postJSON<{ session_id: number; task_id: number; task: any }>("/sessions/start", payload),

  nextTask: (payload: { session_id: number; child_id: number }) =>
    postJSON<{ task_id: number; task: any }>("/tasks/next", payload),

  submitTask: (payload: {
    session_id: number;
    task_id: number;
    child_id: number;
    answer?: string | null;
    response_time_ms?: number;
    skipped?: boolean;
    hint_used?: boolean;
    retries?: number;
  }) =>
    postJSON<{ is_correct: boolean; feedback_sw: string; reward: any }>("/tasks/submit", payload),

  getChildReport: (childId: number) =>
    getJSON<{ child_id: number; total_attempts: number; correct: number; accuracy: number }>(
      `/reports/child/${childId}`
    ),

  getCaregiverSettings: (childId: number) =>
    getJSON<{ child_id: number; session_minutes: number; sound_on: boolean }>(
      `/caregiver/settings/${childId}`
    ),

  updateCaregiverSettings: (payload: { child_id: number; session_minutes: number; sound_on: boolean }) =>
    postJSON<{ ok: boolean }>("/caregiver/settings", payload),

  getPendingAi: (topic?: string) =>
    getJSON<any[]>(topic ? `/teacher/ai/pending?topic=${encodeURIComponent(topic)}` : "/teacher/ai/pending"),

  approveAiTask: (payload: { task_id: number; approved: boolean }) =>
    postJSON<{ ok: boolean; task_id: number; approved: boolean }>("/teacher/ai/approve", payload),

  generateAiTask: (payload: { topic: string; target_lexicon_id: number; task_type?: string; max_words?: number }) =>
    postJSON<any>("/ai/generate-task", payload),

  uploadLexiconBulk: (payload: any) =>
    postJSON<any>("/teacher/lexicon/bulk", payload),
};

import { Platform } from "react-native";

type FetchOptions = RequestInit & { json?: any };

function resolveBaseUrl() {
  const envUrl = (process.env.EXPO_PUBLIC_API_URL || (process.env as any).EXPO_API_URL || "").trim();
  if (envUrl) return envUrl.replace(/\/$/, "");

  if (Platform.OS === "web") return "http://127.0.0.1:8000";
  if (Platform.OS === "android") return "http://10.0.2.2:8000";
  return "http://127.0.0.1:8000";
}

export const BASE_URL = resolveBaseUrl();

const TOKEN_KEY = "auth_token";
const ROLE_KEY = "auth_role";

// MVP storage:
// - Web: localStorage
// - Native: in-memory (avoids adding AsyncStorage dependency during MVP)
const _mem: Record<string, string> = {};

async function storageGet(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") return window?.localStorage?.getItem(key) ?? null;
    return _mem[key] ?? null;
  } catch {
    return _mem[key] ?? null;
  }
}

async function storageSet(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      window?.localStorage?.setItem(key, value);
      return;
    }
    _mem[key] = value;
  } catch {
    _mem[key] = value;
  }
}

async function storageRemove(key: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      window?.localStorage?.removeItem(key);
      return;
    }
    delete _mem[key];
  } catch {
    delete _mem[key];
  }
}

export async function setSession(token: string, role: string) {
  await storageSet(TOKEN_KEY, token);
  await storageSet(ROLE_KEY, role);
}

export async function getSession(): Promise<{ token: string | null; role: string | null }> {
  const token = await storageGet(TOKEN_KEY);
  const role = await storageGet(ROLE_KEY);
  return { token, role };
}

export async function clearSession() {
  await storageRemove(TOKEN_KEY);
  await storageRemove(ROLE_KEY);
}

async function http<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const url = `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.headers as any),
  };

  // Attach token if present
  const { token } = await getSession();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let body: any = opts.body;

  if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  }

  const res = await fetch(url, { ...opts, headers, body });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = typeof data === "string" ? data : JSON.stringify(data);
    throw new Error(msg || `HTTP ${res.status}`);
  }

  return data as T;
}

export async function getJSON<T = any>(path: string): Promise<T> {
  return http<T>(path, { method: "GET" });
}

export async function postJSON<T = any>(path: string, json: any): Promise<T> {
  return http<T>(path, { method: "POST", json });
}

export async function request<T = any>(method: string, path: string, json?: any): Promise<T> {
  return http<T>(path, { method, json });
}

export async function deleteJSON<T = any>(path: string): Promise<T> {
  return http<T>(path, { method: "DELETE" });
}


// ------------------------------
// Convenience API object (compat)
// ------------------------------
// Some screens import `{ api }` and expect methods like `api.startSession(...)`.
// Keep these wrappers thin so we don't change existing gameplay logic.

export const api = {
  baseUrl: BASE_URL,

  // Gameplay/session flow
  startSession: (payload: { child_id: number; lesson_focus: string }) =>
    postJSON<any>("/sessions/start", payload),

  nextTask: (payload: { session_id: number; child_id?: number }) =>
    postJSON<any>("/tasks/next", payload),

  submitAnswer: (payload: { session_id: number; child_id?: number; task_id?: number | string; answer: any; correct?: boolean; meta?: any }) =>
    postJSON<any>("/tasks/submit", payload),

  submitTask: (payload: { session_id: number; child_id?: number; task_id?: number | string; answer: any; correct?: boolean; meta?: any }) =>
    postJSON<any>("/tasks/submit", payload),

  // Topics (public)
  getTopics: () => getJSON<any>("/topics"),

  // Teacher
  teacherTopics: {
    list: () => getJSON<any>("/teacher/topics"),
    create: (payload: any) => postJSON<any>("/teacher/topics", payload),
    remove: (key: string) => deleteJSON<any>(`/teacher/topics/${encodeURIComponent(key)}`),
  },

  // Caregiver
  caregiverChildren: {
    list: () => getJSON<any>("/caregiver/children"),
    create: (payload: any) => postJSON<any>("/caregiver/children", payload),
    remove: (id: number | string) => deleteJSON<any>(`/caregiver/children/${id}`),
  },

// Public children (MVP)
childrenPublic: {
  list: () => getJSON<any>("/children/public"),
},

};

import {
  SAMPLE_ADMIN,
  SAMPLE_AI_QUALITY,
  SAMPLE_COMMUNITIES,
  SAMPLE_ESCALATIONS,
  SAMPLE_FACILITIES,
  SAMPLE_LESSONS,
  SAMPLE_MYTHS,
  SAMPLE_OVERVIEW,
  SAMPLE_POSTS,
  SAMPLE_USERS,
} from "@/data/sampleData";
import type {
  AiQuality,
  Community,
  Escalation,
  EscalationStatus,
  Facility,
  Lesson,
  ModerationDecision,
  Myth,
  Overview,
  Post,
  Role,
  Sampled,
  Session,
  User,
} from "@/types";

/** Intyoza backend (Express, mounted at /api/v1). */
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

/** Set VITE_ADMIN_DEMO=true to sign in without a backend and browse sample data. */
export const DEMO_MODE = import.meta.env.VITE_ADMIN_DEMO === "true";

const TOKEN_KEY = "intyoza.admin.token";
const USER_KEY = "intyoza.admin.user";
const DEMO_TOKEN = "demo";

/** Error thrown for a failed request, with the HTTP status when there was a response. */
export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/* ---------- Session ---------- */

export function getSession(): Session | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = JSON.parse(localStorage.getItem(USER_KEY) || "null") as User | null;
    return token && user ? { token, user } : null;
  } catch {
    return null;
  }
}

function saveSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

const isDemoSession = () => getSession()?.token === DEMO_TOKEN;

/* ---------- Core request ---------- */

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

// Response bodies are not validated; callers describe the shape they expect.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function apiCall<T = any>(endpoint: string, { body, ...options }: RequestOptions = {}): Promise<T> {
  const token = getSession()?.token;
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401 && token) {
    clearSession();
    window.location.href = "/admin/login";
  }
  if (!response.ok) {
    throw new ApiError(data?.error?.message || data?.message || "Request failed", response.status);
  }
  return data;
}

/**
 * Reads an admin endpoint; when it is not available yet (demo session, network error or 404),
 * returns the sample data instead so the console still works. `sample: true` tells the page.
 */
async function readOrSample<T>(endpoint: string, sample: T): Promise<Sampled<T>> {
  if (isDemoSession()) return { data: sample, sample: true };
  try {
    const result = await apiCall(endpoint);
    return { data: (result?.data ?? result) as T, sample: false };
  } catch (error) {
    if (error instanceof ApiError && error.status && error.status !== 404) throw error;
    return { data: sample, sample: true };
  }
}

/* ---------- Auth ---------- */

export async function login(email: string, password: string): Promise<User> {
  if (DEMO_MODE) {
    const user = { ...SAMPLE_ADMIN, email };
    saveSession(DEMO_TOKEN, user);
    return user;
  }
  const result = await apiCall("/auth/admin/login", { method: "POST", body: { email, password } });
  const token: string | undefined = result?.token || result?.accessToken;
  const user: User | undefined = result?.user;
  if (!token) throw new Error("Sign in failed: no token received.");
  if (!user || user.role !== "ADMIN") throw new Error("This account does not have admin access.");
  saveSession(token, user);
  return user;
}

export async function logout() {
  if (!isDemoSession()) {
    await apiCall("/auth/logout", { method: "POST" }).catch(() => {});
  }
  clearSession();
}

/* ---------- Profile ---------- */

export async function getMe(): Promise<User> {
  if (isDemoSession()) return getSession()!.user;
  const result = await apiCall("/auth/me");
  return result?.user ?? result;
}

export async function updateProfile(changes: Partial<User>): Promise<User> {
  if (isDemoSession()) {
    const user = { ...getSession()!.user, ...changes };
    saveSession(DEMO_TOKEN, user);
    return user;
  }
  const result = await apiCall("/admin/me", { method: "PATCH", body: changes });
  const user: User = result?.user ?? result;
  saveSession(getSession()!.token, user);
  return user;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  if (isDemoSession()) return;
  await apiCall("/admin/me/password", { method: "PUT", body: { currentPassword, newPassword } });
}

/* ---------- Admin data ---------- */

export const getOverview = () => readOrSample<Overview>("/admin/overview", SAMPLE_OVERVIEW);
export const getUsers = () => readOrSample<User[]>("/admin/users", SAMPLE_USERS);
export const getEscalations = () => readOrSample<Escalation[]>("/admin/ai/escalations", SAMPLE_ESCALATIONS);
export const getAiQuality = () => readOrSample<AiQuality>("/admin/ai/quality", SAMPLE_AI_QUALITY);
export const getModerationQueue = () => readOrSample<Post[]>("/admin/community/queue", SAMPLE_POSTS);
export const getCommunities = () => readOrSample<Community[]>("/admin/community/groups", SAMPLE_COMMUNITIES);
export const getLessons = () => readOrSample<Lesson[]>("/admin/learning/lessons", SAMPLE_LESSONS);
export const getMyths = () => readOrSample<Myth[]>("/admin/myths", SAMPLE_MYTHS);
export const getFacilities = () => readOrSample<Facility[]>("/admin/facilities", SAMPLE_FACILITIES);

export const updateUserRole = (id: string, role: Role) =>
  apiCall(`/admin/users/${id}`, { method: "PATCH", body: { role } });
export const deleteUser = (id: string) => apiCall(`/admin/users/${id}`, { method: "DELETE" });
export const updateEscalation = (id: string, status: EscalationStatus) =>
  apiCall(`/admin/ai/escalations/${id}`, { method: "PATCH", body: { status } });
export const moderatePost = (id: string, decision: ModerationDecision) =>
  apiCall(`/admin/community/posts/${id}`, { method: "PATCH", body: { decision } });

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

/** Intyoza backend (Express, mounted at /api/v1). */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

/** Set NEXT_PUBLIC_ADMIN_DEMO=true to sign in without a backend and browse sample data. */
export const DEMO_MODE = process.env.NEXT_PUBLIC_ADMIN_DEMO === "true";

const TOKEN_KEY = "intyoza.admin.token";
const USER_KEY = "intyoza.admin.user";
const DEMO_TOKEN = "demo";

/* ---------- Session ---------- */

export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
    return token && user ? { token, user } : null;
  } catch {
    return null;
  }
}

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

const isDemoSession = () => getSession()?.token === DEMO_TOKEN;

/* ---------- Core request ---------- */

async function apiCall(endpoint, { body, ...options } = {}) {
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
    const error = new Error(data?.error?.message || data?.message || "Request failed");
    error.status = response.status;
    throw error;
  }
  return data;
}

/**
 * Reads an admin endpoint; when it is not available yet (demo session, network error or 404),
 * returns the sample data instead so the console still works. `sample: true` tells the page.
 */
async function readOrSample(endpoint, sample, pick = (d) => d?.data ?? d) {
  if (isDemoSession()) return { data: sample, sample: true };
  try {
    return { data: pick(await apiCall(endpoint)), sample: false };
  } catch (error) {
    if (error.status && error.status !== 404) throw error;
    return { data: sample, sample: true };
  }
}

/* ---------- Auth ---------- */

export async function login(email, password) {
  if (DEMO_MODE) {
    const user = { ...SAMPLE_ADMIN, email };
    saveSession(DEMO_TOKEN, user);
    return user;
  }
  const result = await apiCall("/auth/admin/login", { method: "POST", body: { email, password } });
  const token = result?.token || result?.accessToken;
  const user = result?.user;
  if (!token) throw new Error("Sign in failed: no token received.");
  if (user?.role !== "ADMIN") throw new Error("This account does not have admin access.");
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

export async function getMe() {
  if (isDemoSession()) return getSession().user;
  const result = await apiCall("/auth/me");
  return result?.user ?? result;
}

export async function updateProfile(changes) {
  if (isDemoSession()) {
    const user = { ...getSession().user, ...changes };
    saveSession(DEMO_TOKEN, user);
    return user;
  }
  const result = await apiCall("/admin/me", { method: "PATCH", body: changes });
  const user = result?.user ?? result;
  saveSession(getSession().token, user);
  return user;
}

export async function changePassword(currentPassword, newPassword) {
  if (isDemoSession()) return;
  await apiCall("/admin/me/password", { method: "PUT", body: { currentPassword, newPassword } });
}

/* ---------- Admin data ---------- */

export const getOverview = () => readOrSample("/admin/overview", SAMPLE_OVERVIEW);
export const getUsers = () => readOrSample("/admin/users", SAMPLE_USERS);
export const getEscalations = () => readOrSample("/admin/ai/escalations", SAMPLE_ESCALATIONS);
export const getAiQuality = () => readOrSample("/admin/ai/quality", SAMPLE_AI_QUALITY);
export const getModerationQueue = () => readOrSample("/admin/community/queue", SAMPLE_POSTS);
export const getCommunities = () => readOrSample("/admin/community/groups", SAMPLE_COMMUNITIES);
export const getLessons = () => readOrSample("/admin/learning/lessons", SAMPLE_LESSONS);
export const getMyths = () => readOrSample("/admin/myths", SAMPLE_MYTHS);
export const getFacilities = () => readOrSample("/admin/facilities", SAMPLE_FACILITIES);

export const updateUserRole = (id, role) => apiCall(`/admin/users/${id}`, { method: "PATCH", body: { role } });
export const deleteUser = (id) => apiCall(`/admin/users/${id}`, { method: "DELETE" });
export const updateEscalation = (id, status) =>
  apiCall(`/admin/ai/escalations/${id}`, { method: "PATCH", body: { status } });
export const moderatePost = (id, decision) =>
  apiCall(`/admin/community/posts/${id}`, { method: "PATCH", body: { decision } });

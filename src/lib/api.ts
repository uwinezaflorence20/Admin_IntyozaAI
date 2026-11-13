import type {
  AdminUser,
  Article,
  Category,
  CommunityReport,
  CommunitySpace,
  Facility,
  Myth,
  NewArticle,
  NewCategory,
  NewFacility,
  NewMyth,
  NewSpace,
  SpaceMember,
  SpaceUpdate,
  PostComment,
  Overview,
  Post,
  Referral,
  ReferralStatus,
  Session,
  SpacePost,
  User,
} from "@/types";

/** Intyoza backend (Express, mounted at /api/v1). In development, Vite proxies this path to it. */
const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

const TOKEN_KEY = "intyoza.admin.token";
const USER_KEY = "intyoza.admin.user";

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

/** Reads an endpoint and returns its payload (the `data` field when the response has one). */
async function read<T>(endpoint: string): Promise<T> {
  const result = await apiCall(endpoint);
  return (result?.data ?? result) as T;
}

/* ---------- Auth ---------- */

export async function login(email: string, password: string): Promise<User> {
  const result = await apiCall<{ token?: string; user?: User & { passwordHash?: string } }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  if (!result.token || !result.user) throw new Error("Sign in failed: the server did not return a session.");
  if (result.user.role !== "ADMIN") throw new Error("This account does not have admin access.");
  // The backend includes the password hash in this response; never keep it in the browser.
  const user = { ...result.user };
  delete user.passwordHash;
  saveSession(result.token, user);
  return user;
}

export function logout() {
  clearSession();
}

/* ---------- Profile ---------- */

export async function getMe(): Promise<User> {
  const result = await apiCall("/auth/me");
  return result?.user ?? result;
}

export async function updateProfile(changes: Partial<User>): Promise<User> {
  const result = await apiCall("/admin/me", { method: "PATCH", body: changes });
  const user: User = result?.user ?? result;
  saveSession(getSession()!.token, user);
  return user;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await apiCall("/admin/me/password", { method: "PUT", body: { currentPassword, newPassword } });
}

/* ---------- Admin data ---------- */

/** Read-only list of every registered user. The backend has no update/delete user route yet. */
export async function getUsers(): Promise<AdminUser[]> {
  return (await read<{ users: AdminUser[] }>("/admin/users")).users;
}

// These screens have their design but no backend endpoint yet, so they show empty states and make
// no request. Replace each one with read() when its endpoint exists.
export const getOverview = async (): Promise<Overview> => ({
  totals: {},
  signups: [],
  conversations: [],
  topics: [],
  ageBands: [],
  languages: {},
});
export const getModerationQueue = async (): Promise<Post[]> => [];

/* ---------- Learning content ---------- */

export async function getArticles(): Promise<Article[]> {
  return (await read<{ articles: Article[] }>("/learning/articles")).articles;
}

export async function createArticle(article: NewArticle): Promise<Article> {
  const result = await apiCall("/admin/learning/articles", { method: "POST", body: article });
  return result?.article ?? result?.data?.article ?? result;
}

export async function getMyths(): Promise<Myth[]> {
  return (await read<{ myths: Myth[] }>("/myths")).myths;
}

export async function createMyth(myth: NewMyth): Promise<Myth> {
  const result = await apiCall("/admin/myths", { method: "POST", body: myth });
  return result?.myth ?? result?.data?.myth ?? result;
}

/* ---------- Professional referrals ---------- */

export async function getReferrals(): Promise<Referral[]> {
  return (await read<{ referrals: Referral[] }>("/admin/referrals")).referrals;
}

export async function updateReferral(id: string, data: { status: ReferralStatus; notes?: string }): Promise<Referral> {
  const result = await apiCall<{ referral: Referral }>(`/admin/referrals/${id}`, { method: "PATCH", body: data });
  return result.referral;
}

/* ---------- Health facilities (Services) ---------- */

/** GET /admin/facilities returns every facility, including those hidden from the app. */
export async function getFacilities(): Promise<Facility[]> {
  return (await read<{ facilities: Facility[] }>("/admin/facilities")).facilities;
}

export async function createFacility(facility: NewFacility): Promise<Facility> {
  const result = await apiCall<{ facility: Facility }>("/admin/facilities", { method: "POST", body: facilityBody(facility) });
  return result.facility;
}

export async function updateFacility(id: string, facility: NewFacility): Promise<Facility> {
  const result = await apiCall<{ facility: Facility }>(`/admin/facilities/${id}`, { method: "PATCH", body: facilityBody(facility, true) });
  return result.facility;
}

/** Bulk import (the docs describe it as loading the 625-facility list). Sends plain service lists, per FacilityInput. */
export async function importFacilities(facilities: NewFacility[]) {
  return apiCall("/admin/facilities/import", { method: "POST", body: { facilities } });
}

/**
 * The backend passes this body straight to Prisma, so the related `services` must use Prisma's
 * nested-write form. On update, the existing services are replaced.
 */
function facilityBody(facility: NewFacility, isUpdate = false) {
  const { services, ...scalars } = facility;
  const create = services.map((s) => ({ serviceName: s.serviceName, status: s.status, costType: s.costType }));
  return { ...scalars, services: isUpdate ? { deleteMany: {}, create } : { create } };
}

/** The backend has no admin list route for categories, so this reads the public one. */
export async function getCategories(): Promise<Category[]> {
  return (await read<{ categories: Category[] }>("/learning/categories")).categories;
}

export async function createCategory(category: NewCategory): Promise<Category> {
  const result = await apiCall<{ category: Category }>("/admin/learning/categories", { method: "POST", body: category });
  return result.category;
}


/* ---------- Community ---------- */

export async function getReports(): Promise<CommunityReport[]> {
  return (await read<{ reports: CommunityReport[] }>("/admin/community/reports")).reports;
}

export const hidePost = (postId: string) => apiCall(`/admin/community/posts/${postId}/hide`, { method: "PATCH" });

/** Resolve or dismiss a report so it leaves the pending queue. */
export const resolveReport = (reportId: string, status: "RESOLVED" | "DISMISSED") =>
  apiCall(`/admin/community/reports/${reportId}`, { method: "PATCH", body: { status } });

/** Delete a post or comment entirely (for severe violations) — cannot be undone. */
export const deletePost = (postId: string) => apiCall(`/admin/community/posts/${postId}`, { method: "DELETE" });
export const deleteComment = (commentId: string) => apiCall(`/admin/community/comments/${commentId}`, { method: "DELETE" });
export const deleteSpace = (spaceId: string) => apiCall(`/admin/community/spaces/${spaceId}`, { method: "DELETE" });

export async function getSpaces(): Promise<CommunitySpace[]> {
  return (await read<{ spaces: CommunitySpace[] }>("/community/spaces")).spaces;
}

export async function createSpace(space: NewSpace): Promise<CommunitySpace> {
  const result = await apiCall<{ space: Omit<CommunitySpace, "_count"> }>("/community/spaces", { method: "POST", body: space });
  return { ...result.space, _count: { posts: 0 } };
}

export async function updateSpace(spaceId: string, changes: SpaceUpdate): Promise<Omit<CommunitySpace, "_count">> {
  const result = await apiCall(`/admin/community/spaces/${spaceId}`, { method: "PATCH", body: changes });
  return result?.space ?? result?.data?.space ?? result;
}

export async function getSpaceUsers(spaceId: string): Promise<SpaceMember[]> {
  const result = await read<{ users: SpaceMember[] } | SpaceMember[]>(`/admin/community/spaces/${spaceId}/users`);
  return Array.isArray(result) ? result : result.users;
}

export async function getSpacePosts(spaceId: string): Promise<SpacePost[]> {
  return (await read<{ posts: SpacePost[] }>(`/community/spaces/${spaceId}/posts`)).posts;
}

/** The signed-in admin, as the author of posts and comments they create here. */
const sessionAuthor = () => {
  const user = getSession()?.user;
  return { id: user?.id ?? "", alias: user?.alias ?? null };
};

/** Posts as the signed-in admin. The response has no author or counts, so they are filled in here. */
export async function createPost(spaceId: string, content: string): Promise<SpacePost> {
  const { post } = await apiCall<{ post: Omit<SpacePost, "user" | "_count"> }>(`/community/spaces/${spaceId}/posts`, {
    method: "POST",
    body: { content },
  });
  return { ...post, user: sessionAuthor(), _count: { comments: 0, reports: 0 } };
}

/** Not in the swagger docs yet, but served by the backend. Hidden comments are left out. */
export async function getComments(postId: string): Promise<PostComment[]> {
  return (await read<{ comments: PostComment[] }>(`/community/posts/${postId}/comments`)).comments;
}

export async function createComment(postId: string, content: string): Promise<PostComment> {
  const { comment } = await apiCall<{ comment: Omit<PostComment, "user"> }>(`/community/posts/${postId}/comments`, {
    method: "POST",
    body: { content },
  });
  return { ...comment, user: sessionAuthor() };
}

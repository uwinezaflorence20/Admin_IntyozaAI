/** Shapes shared by the API client, sample data and pages (follow backend/prisma/schema.prisma). */

export type Role = "USER" | "MODERATOR" | "ADMIN";
export type AgeBand = "AGE_10_14" | "AGE_15_19" | "AGE_20_24" | "AGE_25_PLUS" | "UNKNOWN";
export type Language = "EN" | "RW";

export interface User {
  id: string;
  alias: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  ageBand?: AgeBand;
  language: Language;
  role: Role;
  isAnonymous?: boolean;
  createdAt?: string;
}

export interface Session {
  token: string;
  user: User;
}

export interface WeeklyCount {
  week: string;
  count: number;
}

export interface Overview {
  totals: {
    users: number;
    newUsersThisWeek: number;
    conversations: number;
    openEscalations: number;
    pendingPosts: number;
    lessonsCompleted: number;
  };
  signups: WeeklyCount[];
  conversations: WeeklyCount[];
  topics: { topic: string; count: number }[];
  ageBands: { band: string; count: number }[];
  languages: Partial<Record<Language, number>>;
}

export type EscalationStatus = "open" | "handled";

export interface Escalation {
  id: string;
  level: "urgent" | "soon";
  topic: string;
  reason: string;
  referredTo: string;
  status: EscalationStatus;
  createdAt: string;
}

export interface AiQuality {
  answered: number;
  helpfulRate: number;
  escalationRate: number;
  averageReplySeconds: number;
}

export interface Post {
  id: string;
  community: string;
  author: string;
  text: string;
  reason: string;
  status: "pending" | "reported";
  reports: number;
  createdAt: string;
}

export type ModerationDecision = "approve" | "remove";

export interface Community {
  name: string;
  members: number;
  posts: number;
  preModerated: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  format: string;
  languages: string[];
  completions: number;
  status: "published" | "review" | "draft";
}

export interface Myth {
  id: string;
  myth: string;
  verdict: "Myth" | "Fact";
  views: number;
}

export interface Facility {
  id: string;
  name: string;
  district: string;
  type: string;
  services: string[];
  youthFriendly: boolean;
  verifiedAt: string;
}

/** Result of an admin read: `sample` is true when the page shows sample data instead of the backend's. */
export interface Sampled<T> {
  data: T;
  sample: boolean;
}

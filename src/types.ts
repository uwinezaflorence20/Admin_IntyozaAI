/** Shapes shared by the API client and pages (follow backend/prisma/schema.prisma). */

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

/** A row from GET /admin/users (read-only; the backend has no update/delete user route). */
export interface AdminUser {
  id: string;
  email: string | null;
  alias: string | null;
  ageBand?: AgeBand;
  gender?: string | null;
  district?: string | null;
  role: Role;
  createdAt: string;
  _count?: { posts: number; comments: number; aiSessions: number; proReferrals: number };
}

export interface WeeklyCount {
  week: string;
  count: number;
}

export interface Overview {
  totals: {
    users?: number;
    newUsersThisWeek?: number;
    conversations?: number;
    openEscalations?: number;
    pendingPosts?: number;
    lessonsCompleted?: number;
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
  answered?: number;
  helpfulRate?: number;
  escalationRate?: number;
  averageReplySeconds?: number;
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

/** A report from GET /admin/community/reports; it points at a post or at a comment. */
export interface CommunityReport {
  id: string;
  reason: string;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  createdAt: string;
  post: { id: string; content: string; isHidden: boolean } | null;
  comment: { id: string; content: string; isHidden: boolean } | null;
  reporter: { alias: string | null };
}

export interface CommunitySpace {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isModerated: boolean;
  moderator: { id: string; alias: string; email: string | null } | null;
  _count: { posts: number };
}

export interface NewSpace {
  name: string;
  description: string;
  imageUrl?: string;
}

/** Body for PATCH /admin/community/spaces/{spaceId}; every field is optional. */
export interface SpaceUpdate {
  name?: string;
  description?: string;
  imageUrl?: string;
  moderatorId?: string;
}

/** A user from GET /admin/community/spaces/{spaceId}/users (the docs do not describe the shape). */
export interface SpaceMember {
  id: string;
  alias: string | null;
  email?: string | null;
  role?: Role;
}

/** Aliases can be empty, for example on admin accounts. */
export interface Author {
  id: string;
  alias: string | null;
}

export interface SpacePost {
  id: string;
  content: string;
  createdAt: string;
  user: Author;
  _count: { comments: number; reports: number };
}

export interface PostComment {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  user: Author;
}

export interface Category {
  id: string;
  slug: string;
  nameEn: string;
  nameRw: string;
}

export type NewCategory = Omit<Category, "id">;

export type ArticleFormat = "ARTICLE" | "VIDEO" | "AUDIO" | "QUIZ";

/** A learning article from GET /learning/articles. */
export interface Article {
  id: string;
  title: string;
  format: ArticleFormat;
  isLowData: boolean;
  language: Language;
  categoryId: string;
}

/** Body for POST /admin/learning/articles. */
export interface NewArticle {
  categoryId: string;
  language: Language;
  title: string;
  content: string;
  format: ArticleFormat;
  isLowData: boolean;
}

/** A myth/fact entry from GET /myths. */
export interface Myth {
  id: string;
  language: Language;
  mythText: string;
  factText: string;
  sources: string[];
}

export type NewMyth = Omit<Myth, "id">;

export type ReferralStatus = "PENDING" | "CONTACTED" | "RESOLVED" | "CANCELLED";

/** A professional-callback request from GET /admin/referrals. */
export interface Referral {
  id: string;
  contactMethod: string;
  topic: string | null;
  status: ReferralStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; alias: string | null; ageBand?: AgeBand; district?: string | null };
}

/** Matches the backend's Facility / FacilityInput (prisma/schema.prisma). */
export type AvailabilityStatus = "YES" | "LIKELY" | "NO" | "UNKNOWN";
export type FacilityOwnership = "PUBLIC" | "FAITH_BASED" | "PRIVATE" | "UNKNOWN";
export type ServiceCostType = "FREE" | "SUBSIDIZED" | "PAID" | "UNKNOWN";

export interface FacilityService {
  id?: string;
  serviceName: string;
  status: AvailabilityStatus;
  costType: ServiceCostType;
}

export interface Facility {
  id: string;
  name: string;
  facilityType: string | null;
  ownership: FacilityOwnership;
  province: string | null;
  district: string;
  sector: string | null;
  cell: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  openingHours: string | null;
  isYouthFriendly: AvailabilityStatus;
  isIsange: AvailabilityStatus;
  showInApp: boolean;
  verifiedAt: string | null;
  services: FacilityService[];
}

/** What the admin create/update form sends. Coordinates are numbers; services is a plain list. */
export interface NewFacility {
  name: string;
  facilityType?: string;
  ownership: FacilityOwnership;
  province?: string;
  district: string;
  sector?: string;
  cell?: string;
  address?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  openingHours?: string;
  isYouthFriendly: AvailabilityStatus;
  isIsange: AvailabilityStatus;
  showInApp: boolean;
  verifiedAt?: string | null;
  services: FacilityService[];
}

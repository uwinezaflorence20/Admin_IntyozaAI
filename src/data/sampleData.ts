/**
 * Sample data for the admin console, shown while the Intyoza backend has no admin endpoints yet.
 * Shapes follow backend/prisma/schema.prisma (User, Role, AgeBand, Language) and the
 * shared content in Frontend/packages/shared (communities, lessons, myths, facilities).
 */

import type {
  AgeBand, AiQuality, Community, Escalation, Facility, Language, Lesson, Myth, Overview, Post, Role, User,
} from "@/types";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number, hours = 0) => new Date(Date.now() - n * DAY - hours * 60 * 60 * 1000).toISOString();

export const AGE_BAND_LABELS: Record<AgeBand, string> = {
  AGE_10_14: "10–14",
  AGE_15_19: "15–19",
  AGE_20_24: "20–24",
  AGE_25_PLUS: "25+",
  UNKNOWN: "Not shared",
};

export const LANGUAGE_LABELS: Record<Language, string> = { EN: "English", RW: "Kinyarwanda" };

const ADJECTIVES = ["Brave", "Calm", "Kind", "Bright", "Gentle", "Bold", "Quiet", "Sunny"];
const NOUNS = ["Acacia", "River", "Heron", "Hill", "Lake", "Sparrow", "Ibis", "Cedar"];
const BANDS: AgeBand[] = ["AGE_15_19", "AGE_20_24", "AGE_15_19", "AGE_10_14", "AGE_20_24", "UNKNOWN", "AGE_25_PLUS", "AGE_15_19"];

export const SAMPLE_USERS: User[] = Array.from({ length: 28 }, (_, i) => {
  const isAnonymous = i % 3 !== 0;
  const role: Role = i === 0 ? "ADMIN" : i === 4 || i === 11 ? "MODERATOR" : "USER";
  return {
    id: `u-${1000 + i}`,
    alias: `${ADJECTIVES[i % 8]} ${NOUNS[(i * 3) % 8]} ${(i * 7) % 90 + 3}`,
    email: !isAnonymous && i % 2 === 0 ? `member${i}@example.org` : null,
    phone: !isAnonymous && i % 2 === 1 ? `+250 78• ••• ${String(100 + i * 13).slice(-3)}` : null,
    ageBand: BANDS[i % BANDS.length],
    language: i % 5 < 3 ? "RW" : "EN",
    role,
    isAnonymous: role === "USER" ? isAnonymous : false,
    createdAt: daysAgo(i * 2 + (i % 4), i),
  };
});

const weeks = (values: number[]) =>
  values.map((count, i) => {
    const d = new Date(Date.now() - (values.length - 1 - i) * 7 * DAY);
    return { week: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), count };
  });

export const SAMPLE_OVERVIEW: Overview = {
  totals: {
    users: 1284,
    newUsersThisWeek: 96,
    conversations: 5371,
    openEscalations: 4,
    pendingPosts: 6,
    lessonsCompleted: 2215,
  },
  signups: weeks([54, 61, 58, 73, 70, 88, 81, 96]),
  conversations: weeks([410, 455, 498, 520, 611, 640, 702, 735]),
  topics: [
    { topic: "Contraception", count: 1340 },
    { topic: "Periods & puberty", count: 1105 },
    { topic: "STIs & HIV", count: 874 },
    { topic: "Pregnancy", count: 690 },
    { topic: "Consent & relationships", count: 512 },
    { topic: "Mental wellbeing", count: 331 },
  ],
  ageBands: [
    { band: "10–14", count: 142 },
    { band: "15–19", count: 571 },
    { band: "20–24", count: 418 },
    { band: "25+", count: 87 },
    { band: "Not shared", count: 66 },
  ],
  languages: { RW: 61, EN: 39 },
};

export const SAMPLE_ESCALATIONS: Escalation[] = [
  { id: "e-1", level: "urgent", topic: "Gender-based violence", reason: "Mentioned being hurt by a partner", referredTo: "Isange One Stop Centre — Kacyiru", status: "open", createdAt: daysAgo(0, 2) },
  { id: "e-2", level: "urgent", topic: "Emergency contraception", reason: "Unprotected sex within the last 72 hours", referredTo: "Kimironko Youth Health Corner", status: "open", createdAt: daysAgo(0, 6) },
  { id: "e-3", level: "soon", topic: "Pregnancy", reason: "Possible pregnancy, no antenatal care yet", referredTo: "Remera Health Center", status: "open", createdAt: daysAgo(1, 3) },
  { id: "e-4", level: "soon", topic: "STIs & HIV", reason: "Symptoms described for more than a week", referredTo: "Nyamirambo Health Center", status: "open", createdAt: daysAgo(1, 9) },
  { id: "e-5", level: "urgent", topic: "Self-harm", reason: "Expressed thoughts of self-harm", referredTo: "Hotline 114", status: "handled", createdAt: daysAgo(3) },
  { id: "e-6", level: "soon", topic: "Contraception", reason: "Side effects after an implant", referredTo: "Kimironko Youth Health Corner", status: "handled", createdAt: daysAgo(4, 5) },
  { id: "e-7", level: "urgent", topic: "PEP", reason: "Possible HIV exposure within 72 hours", referredTo: "Remera Health Center", status: "handled", createdAt: daysAgo(6) },
];

export const SAMPLE_AI_QUALITY: AiQuality = {
  answered: 5371,
  helpfulRate: 87,
  escalationRate: 2.4,
  averageReplySeconds: 3.1,
};

export const SAMPLE_POSTS: Post[] = [
  { id: "p-1", community: "Young & Expecting Parents", author: "Calm River 17", text: "Is it normal to feel this tired in the first months? I sleep all the time and worry something is wrong.", reason: "Pre-moderated group", status: "pending", reports: 0, createdAt: daysAgo(0, 1) },
  { id: "p-2", community: "Relationships & Wellbeing", author: "Bold Heron 45", text: "My boyfriend checks my phone every day. My friends say it's normal, is it?", reason: "Pre-moderated group", status: "pending", reports: 0, createdAt: daysAgo(0, 4) },
  { id: "p-3", community: "Periods & Reproductive Health", author: "Sunny Lake 31", text: "Someone told me you can't swim during your period. Message me on WhatsApp 078… for the truth", reason: "Shares personal info", status: "reported", reports: 3, createdAt: daysAgo(0, 7) },
  { id: "p-4", community: "Young People Living with HIV", author: "Gentle Cedar 52", text: "Four years on treatment today. To anyone just starting: it gets easier, you are not alone.", reason: "Pre-moderated group", status: "pending", reports: 0, createdAt: daysAgo(1) },
  { id: "p-5", community: "Relationships & Wellbeing", author: "Quiet Ibis 9", text: "Buy these pills to stop pregnancy for sure, link in my profile!!!", reason: "Harmful advice · Spam", status: "reported", reports: 5, createdAt: daysAgo(1, 5) },
  { id: "p-6", community: "Survivors & Safety", author: "Kind Sparrow 66", text: "Where can I get help at night if something happens? I am in Huye.", reason: "Someone may be in danger", status: "reported", reports: 1, createdAt: daysAgo(2) },
];

export const SAMPLE_COMMUNITIES: Community[] = [
  { name: "Young & Expecting Parents", members: 312, posts: 148, preModerated: true },
  { name: "Young Mothers & Young Fathers", members: 268, posts: 121, preModerated: true },
  { name: "Young People Living with HIV", members: 194, posts: 87, preModerated: true },
  { name: "Survivors & Safety", members: 141, posts: 52, preModerated: true },
  { name: "Periods & Reproductive Health", members: 507, posts: 264, preModerated: false },
  { name: "Relationships & Wellbeing", members: 433, posts: 219, preModerated: false },
];

export const SAMPLE_LESSONS: Lesson[] = [
  { id: "menstrual-cycle-explained", title: "Your menstrual cycle, explained", category: "Periods & puberty", format: "Article", languages: ["EN", "RW", "FR"], completions: 642, status: "published" },
  { id: "puberty-changes", title: "Puberty: what changes and why", category: "Periods & puberty", format: "Video", languages: ["EN", "RW", "FR"], completions: 518, status: "published" },
  { id: "periods-without-shame-audio", title: "Talking about periods without shame", category: "Periods & puberty", format: "Audio", languages: ["EN", "RW"], completions: 233, status: "published" },
  { id: "periods-puberty-quiz", title: "Quiz: periods & puberty", category: "Periods & puberty", format: "Quiz", languages: ["EN", "RW", "FR"], completions: 401, status: "published" },
  { id: "choosing-contraception", title: "Choosing contraception that fits you", category: "Contraception & choices", format: "Article", languages: ["EN", "RW", "FR"], completions: 287, status: "published" },
  { id: "sti-basics", title: "STIs: signs, testing and treatment", category: "STIs & HIV", format: "Article", languages: ["EN", "RW"], completions: 134, status: "review" },
  { id: "consent-basics", title: "What consent looks like", category: "Consent & relationships", format: "Myth or fact", languages: ["EN"], completions: 0, status: "draft" },
];

export const SAMPLE_MYTHS: Myth[] = [
  { id: "m-1", myth: "You can't get pregnant the first time you have sex.", verdict: "Myth", views: 1820 },
  { id: "m-2", myth: "Contraceptive pills make you infertile later.", verdict: "Myth", views: 1415 },
  { id: "m-3", myth: "You shouldn't bathe during your period.", verdict: "Myth", views: 1102 },
  { id: "m-4", myth: "PEP must be started within 72 hours of exposure.", verdict: "Fact", views: 760 },
];

export const SAMPLE_FACILITIES: Facility[] = [
  { id: "f-1", name: "Kimironko Youth Health Corner", district: "Gasabo", type: "Youth corner", services: ["Family planning", "HIV testing", "STI testing", "Counseling"], youthFriendly: true, verifiedAt: daysAgo(12) },
  { id: "f-2", name: "Remera Health Center", district: "Gasabo", type: "Health center", services: ["Family planning", "HIV treatment", "PrEP / PEP", "Maternal care"], youthFriendly: true, verifiedAt: daysAgo(30) },
  { id: "f-3", name: "Isange One Stop Centre — Kacyiru", district: "Gasabo", type: "GBV centre", services: ["GBV support", "PEP", "Emergency contraception", "Counseling"], youthFriendly: true, verifiedAt: daysAgo(8) },
  { id: "f-4", name: "Nyamirambo Health Center", district: "Nyarugenge", type: "Health center", services: ["Family planning", "HIV testing", "HIV treatment", "Maternal care"], youthFriendly: false, verifiedAt: daysAgo(95) },
];

export const SAMPLE_ADMIN: User = {
  id: "demo-admin",
  alias: "Intyoza Admin",
  email: "admin@intyoza.rw",
  role: "ADMIN",
  language: "EN",
};

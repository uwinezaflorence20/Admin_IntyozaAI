import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { TbUsers, TbSparkles, TbMessages, TbPhoneCall, TbArrowRight, TbFlag, TbCircleCheck } from "react-icons/tb";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { getReferrals, getReports, getSession, getUsers } from "@/lib/api";
import { AGE_BAND_LABELS } from "@/lib/labels";
import { PageHeader, StatCard, Panel, Loading, EmptyState } from "@/components/admin/parts";
import { chartTooltip, chartAxis } from "@/components/admin/chartStyles";
import { timeAgo } from "@/lib/utils";
import type { AdminUser, CommunityReport, Referral } from "@/types";

const fmt = (n: number) => n.toLocaleString("en-GB");
const WEEK = 7 * 24 * 60 * 60 * 1000;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/** Sign-ups per week for the last 8 weeks, from each user's createdAt. */
function weeklySignups(users: AdminUser[], now: number) {
  const buckets = Array.from({ length: 8 }, () => 0);
  for (const u of users) {
    const diff = now - new Date(u.createdAt).getTime();
    if (diff < 0) continue;
    const w = Math.floor(diff / WEEK);
    if (w < 8) buckets[7 - w] += 1;
  }
  return buckets.map((count, i) => ({
    week: new Date(now - (7 - i) * WEEK).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    count,
  }));
}

interface MetersProps<Row> {
  rows: Row[];
  labelKey: keyof Row & string;
  valueKey: keyof Row & string;
}

function Meters<Row extends Record<string, string | number>>({ rows, labelKey, valueKey }: MetersProps<Row>) {
  if (rows.length === 0) return <p className="m-0 py-6 text-center text-[0.9rem] text-muted">No data yet</p>;
  const max = Math.max(...rows.map((r) => Number(r[valueKey])), 1);
  return (
    <ul className="m-0 list-none space-y-3 p-0">
      {rows.map((row) => (
        <li key={row[labelKey]}>
          <div className="mb-1 flex justify-between gap-3 text-[0.88rem]">
            <span>{row[labelKey]}</span>
            <span className="font-semibold tabular-nums">{fmt(Number(row[valueKey]))}</span>
          </div>
          <div className="h-2 rounded-full bg-surface-2">
            <div className="h-2 rounded-full bg-brand" style={{ width: `${(Number(row[valueKey]) / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [name] = useState(() => getSession()?.user?.alias || "");
  const [now] = useState(() => Date.now());

  useEffect(() => {
    // Each source is optional — a page still renders if one endpoint is unavailable.
    Promise.allSettled([getUsers(), getReports(), getReferrals()]).then(([u, r, ref]) => {
      setUsers(u.status === "fulfilled" ? u.value : []);
      if (r.status === "fulfilled") setReports(r.value);
      if (ref.status === "fulfilled") setReferrals(ref.value);
    });
  }, []);

  if (!users) return <Loading label="Loading dashboard…" />;

  const newThisWeek = users.filter((u) => now - new Date(u.createdAt).getTime() < WEEK).length;
  const aiConversations = users.reduce((sum, u) => sum + (u._count?.aiSessions ?? 0), 0);
  const pendingReferrals = referrals.filter((r) => r.status === "PENDING").length;

  const ageBands = (Object.entries(AGE_BAND_LABELS) as [keyof typeof AGE_BAND_LABELS, string][])
    .map(([band, label]) => ({ band: label, count: users.filter((u) => u.ageBand === band).length }))
    .filter((r) => r.count > 0);

  const districtCounts = new Map<string, number>();
  for (const u of users) if (u.district) districtCounts.set(u.district, (districtCounts.get(u.district) ?? 0) + 1);
  const districts = [...districtCounts.entries()]
    .map(([district, count]) => ({ district, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title={`${greeting()}${name ? `, ${name.split(" ")[0]}` : ""}`}
        description="How young people are using Intyoza, and what needs your attention."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={TbUsers} tone="brand" label="People on Intyoza" value={fmt(users.length)} hint={`+${fmt(newThisWeek)} this week`} onClick={() => navigate("/admin/users")} />
        <StatCard icon={TbSparkles} tone="teal" label="AI conversations" value={fmt(aiConversations)} hint="Across all users" />
        <StatCard icon={TbMessages} tone="sun" label="Posts to review" value={fmt(reports.length)} hint="Community moderation" onClick={() => navigate("/admin/community")} />
        <StatCard icon={TbPhoneCall} tone="accent" label="Referral requests" value={fmt(referrals.length)} hint={`${fmt(pendingReferrals)} pending`} onClick={() => navigate("/admin/referrals")} />
      </div>

      <Panel title="New people" description="Sign-ups per week, last 8 weeks">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklySignups(users, now)} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="signupFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="week" {...chartAxis} />
              <YAxis allowDecimals={false} {...chartAxis} />
              <Tooltip {...chartTooltip} cursor={{ stroke: "var(--border)" }} />
              <Area type="monotone" dataKey="count" name="Sign-ups" stroke="var(--brand)" strokeWidth={2} fill="url(#signupFill)" activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Age groups" description="Self-reported during onboarding">
          <Meters rows={ageBands} labelKey="band" valueKey="count" />
        </Panel>
        <Panel title="Where people are" description="Top districts by sign-ups">
          <Meters rows={districts} labelKey="district" valueKey="count" />
        </Panel>
      </div>

      <Panel
        title="Community queue"
        description="Posts and comments waiting for a moderator"
        action={<Link to="/admin/community" className="btn btn-ghost btn-sm">Moderate <TbArrowRight size={16} /></Link>}
      >
        {reports.length === 0 ? (
          <EmptyState icon={TbCircleCheck} title="Queue is clear" text="Nothing has been reported right now." />
        ) : (
          <ul className="m-0 list-none divide-y divide-line p-0">
            {reports.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="tag tag-accent mt-0.5"><TbFlag size={12} /> {r.reason}</span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-[0.92rem]">{r.post?.content ?? r.comment?.content}</p>
                  <p className="m-0 text-[0.8rem] text-muted">
                    {r.post ? "Post" : "Comment"} · reported by {r.reporter.alias || "Anonymous"} · {timeAgo(r.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

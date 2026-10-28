"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TbUsers, TbSparkles, TbAlertTriangle, TbMessages, TbArrowRight, TbClock, TbFlag, TbCircleCheck,
} from "react-icons/tb";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { toast } from "sonner";
import { getEscalations, getModerationQueue, getOverview, getSession } from "@/lib/api";
import { LANGUAGE_LABELS } from "@/data/sampleData";
import { PageHeader, StatCard, Panel, Loading, EmptyState, chartTooltip, chartAxis } from "@/components/admin/parts";
import { timeAgo } from "@/lib/utils";

const fmt = (n) => (typeof n === "number" ? n.toLocaleString("en-GB") : "—");

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/** Horizontal meters with the value printed beside each bar, so no legend is needed. */
function Meters({ rows, labelKey, valueKey }) {
  const max = Math.max(...rows.map((r) => r[valueKey]), 1);
  return (
    <ul className="m-0 list-none space-y-3 p-0">
      {rows.map((row) => (
        <li key={row[labelKey]}>
          <div className="mb-1 flex justify-between gap-3 text-[0.88rem]">
            <span>{row[labelKey]}</span>
            <span className="font-semibold tabular-nums">{fmt(row[valueKey])}</span>
          </div>
          <div className="h-2 rounded-full bg-surface-2">
            <div className="h-2 rounded-full bg-brand" style={{ width: `${(row[valueKey] / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [overview, setOverview] = useState(null);
  const [escalations, setEscalations] = useState([]);
  const [queue, setQueue] = useState([]);
  const [sample, setSample] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setName(getSession()?.user?.alias || "");
      try {
        const [o, e, q] = await Promise.all([getOverview(), getEscalations(), getModerationQueue()]);
        if (cancelled) return;
        setOverview(o.data);
        setEscalations(e.data.filter((x) => x.status === "open"));
        setQueue(q.data);
        setSample(o.sample || e.sample || q.sample);
      } catch (error) {
        if (!cancelled) toast.error(error.message || "Could not load the dashboard");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!overview) return <Loading label="Loading dashboard…" />;

  const { totals } = overview;
  const languageTotal = Object.values(overview.languages).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title={`${greeting()}${name ? `, ${name.split(" ")[0]}` : ""}`}
        description="How young people are using Intyoza this week, and what needs your attention."
        sample={sample}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={TbUsers} tone="brand" label="People on Intyoza" value={fmt(totals.users)} hint={`+${fmt(totals.newUsersThisWeek)} this week`} onClick={() => router.push("/admin/users")} />
        <StatCard icon={TbSparkles} tone="teal" label="AI conversations" value={fmt(totals.conversations)} hint={`${fmt(totals.lessonsCompleted)} lessons completed`} />
        <StatCard icon={TbAlertTriangle} tone="accent" label="Open escalations" value={fmt(totals.openEscalations)} hint="Referred to a service" onClick={() => router.push("/admin/ai-safety")} />
        <StatCard icon={TbMessages} tone="sun" label="Posts to review" value={fmt(totals.pendingPosts)} hint="Community moderation" onClick={() => router.push("/admin/community")} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="New people" description="Sign-ups per week, last 8 weeks">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview.signups} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
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

        <Panel title="Questions to Intyoza AI" description="Conversations per week, last 8 weeks">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.conversations} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="week" {...chartAxis} />
                <YAxis allowDecimals={false} {...chartAxis} />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="count" name="Conversations" fill="var(--teal)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Most asked topics" description="Conversations by topic, all time">
          <Meters rows={overview.topics} labelKey="topic" valueKey="count" />
        </Panel>

        <Panel title="Age groups" description="Self-reported during onboarding">
          <Meters rows={overview.ageBands} labelKey="band" valueKey="count" />
        </Panel>

        <Panel title="Language" description="Share of people by app language">
          <div className="flex h-3 overflow-hidden rounded-full bg-surface-2">
            {Object.entries(overview.languages).map(([code, n], i) => (
              <div
                key={code}
                className={i === 0 ? "bg-brand" : "bg-accent"}
                style={{ width: `${(n / languageTotal) * 100}%`, marginLeft: i ? 2 : 0 }}
              />
            ))}
          </div>
          <ul className="mt-4 mb-0 list-none space-y-2.5 p-0">
            {Object.entries(overview.languages).map(([code, n], i) => (
              <li key={code} className="flex items-center justify-between text-[0.92rem]">
                <span className="flex items-center gap-2">
                  <span className={`size-2.5 rounded-full ${i === 0 ? "bg-brand" : "bg-accent"}`} aria-hidden="true" />
                  {LANGUAGE_LABELS[code] || code}
                </span>
                <span className="font-semibold tabular-nums">{Math.round((n / languageTotal) * 100)}%</span>
              </li>
            ))}
          </ul>
          <div className="notice mt-5 text-[0.85rem]">
            <TbSparkles size={16} className="text-brand" />
            <p className="m-0">Keep new lessons available in Kinyarwanda first — most people use it.</p>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Urgent safety referrals"
          description="Conversations where Intyoza AI pointed someone to care"
          action={<Link href="/admin/ai-safety" className="btn btn-ghost btn-sm">View all <TbArrowRight size={16} /></Link>}
        >
          {escalations.length === 0 ? (
            <EmptyState icon={TbCircleCheck} title="Nothing open" text="Every escalation has been followed up." />
          ) : (
            <ul className="m-0 list-none divide-y divide-line p-0">
              {escalations.slice(0, 4).map((e) => (
                <li key={e.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className={`tag ${e.level === "urgent" ? "tag-danger" : "tag-sun"} mt-0.5 capitalize`}>{e.level}</span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 font-semibold">{e.topic}</p>
                    <p className="m-0 truncate text-[0.85rem] text-muted">{e.reason} · {e.referredTo}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-[0.8rem] text-muted"><TbClock size={14} />{timeAgo(e.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Community queue"
          description="Posts waiting for a moderator"
          action={<Link href="/admin/community" className="btn btn-ghost btn-sm">Moderate <TbArrowRight size={16} /></Link>}
        >
          {queue.length === 0 ? (
            <EmptyState icon={TbCircleCheck} title="Queue is clear" text="No posts are waiting for review." />
          ) : (
            <ul className="m-0 list-none divide-y divide-line p-0">
              {queue.slice(0, 4).map((p) => (
                <li key={p.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className={`tag ${p.status === "reported" ? "tag-accent" : "tag-brand"} mt-0.5`}>
                    {p.status === "reported" ? <><TbFlag size={12} /> {p.reports}</> : "New"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-[0.92rem]">{p.text}</p>
                    <p className="m-0 text-[0.8rem] text-muted">{p.community} · {timeAgo(p.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

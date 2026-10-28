"use client";

import { useEffect, useState } from "react";
import { TbSparkles, TbThumbUp, TbAlertTriangle, TbBolt, TbCircleCheck, TbMapPin, TbClock, TbShieldLock, TbArrowBackUp } from "react-icons/tb";
import { toast } from "sonner";
import { getAiQuality, getEscalations, updateEscalation } from "@/lib/api";
import { PageHeader, StatCard, Loading, EmptyState } from "@/components/admin/parts";
import { cn, timeAgo } from "@/lib/utils";

const TABS = [
  { id: "open", label: "Open" },
  { id: "handled", label: "Followed up" },
  { id: "all", label: "All" },
];

export default function AiSafetyPage() {
  const [quality, setQuality] = useState(null);
  const [escalations, setEscalations] = useState(null);
  const [sample, setSample] = useState(false);
  const [tab, setTab] = useState("open");

  useEffect(() => {
    Promise.all([getAiQuality(), getEscalations()])
      .then(([q, e]) => {
        setQuality(q.data);
        setEscalations(e.data);
        setSample(q.sample || e.sample);
      })
      .catch((error) => toast.error(error.message || "Could not load AI safety data"));
  }, []);

  if (!quality || !escalations) return <Loading label="Loading AI safety…" />;

  const setStatus = async (item, status) => {
    try {
      if (!sample) await updateEscalation(item.id, status);
      setEscalations((list) => list.map((e) => (e.id === item.id ? { ...e, status } : e)));
      toast.success(status === "handled" ? "Marked as followed up" : "Moved back to open");
    } catch (error) {
      toast.error(error.message || "Could not update this escalation");
    }
  };

  const visible = escalations.filter((e) => tab === "all" || e.status === tab);
  const openCount = escalations.filter((e) => e.status === "open").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Intyoza AI"
        title="AI safety"
        description="When Intyoza AI detects someone may need care, it refers them to a service. Follow up and keep referrals accurate."
        sample={sample}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={TbSparkles} tone="brand" label="Questions answered" value={quality.answered.toLocaleString("en-GB")} />
        <StatCard icon={TbThumbUp} tone="teal" label="Marked helpful" value={`${quality.helpfulRate}%`} />
        <StatCard icon={TbAlertTriangle} tone="accent" label="Escalation rate" value={`${quality.escalationRate}%`} hint="of conversations" />
        <StatCard icon={TbBolt} tone="sun" label="Average reply" value={`${quality.averageReplySeconds}s`} />
      </div>

      <div className="notice">
        <TbShieldLock size={20} className="text-brand" />
        <p className="m-0 text-[0.92rem]">
          Only the topic and the reason for the referral are stored here. Message content stays private to the young person.
        </p>
      </div>

      <section className="card p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <h2 className="m-0 text-[1.05rem] font-bold">Escalations</h2>
          <div className="chip-row" role="group" aria-label="Filter escalations">
            {TABS.map((t) => (
              <button key={t.id} type="button" className="chip min-h-9" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
                {t.label}
                {t.id === "open" && openCount > 0 && <span className="font-bold">· {openCount}</span>}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState icon={TbCircleCheck} title="All caught up" text="There are no escalations in this list." />
        ) : (
          <ul className="m-0 list-none divide-y divide-line p-0">
            {visible.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-4 p-4">
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full",
                    e.level === "urgent" ? "bg-danger-soft text-danger" : "bg-sun-soft text-sun-text"
                  )}
                >
                  <TbAlertTriangle size={20} />
                </span>
                <div className="min-w-0 flex-1 basis-60">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>{e.topic}</strong>
                    <span className={`tag ${e.level === "urgent" ? "tag-danger" : "tag-sun"}`}>
                      {e.level === "urgent" ? "Urgent" : "See someone soon"}
                    </span>
                    {e.status === "handled" && <span className="tag tag-success"><TbCircleCheck size={12} /> Followed up</span>}
                  </div>
                  <p className="m-0 mt-0.5 text-[0.9rem] text-muted">{e.reason}</p>
                  <p className="m-0 mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[0.82rem] text-muted">
                    <span className="inline-flex items-center gap-1"><TbMapPin size={14} className="text-teal-text" /> {e.referredTo}</span>
                    <span className="inline-flex items-center gap-1"><TbClock size={14} /> {timeAgo(e.createdAt)}</span>
                  </p>
                </div>
                {e.status === "open" ? (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setStatus(e, "handled")}>
                    <TbCircleCheck size={16} /> Mark followed up
                  </button>
                ) : (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStatus(e, "open")}>
                    <TbArrowBackUp size={16} /> Reopen
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

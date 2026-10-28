"use client";

import { useEffect, useState } from "react";
import { TbCheck, TbX, TbFlag, TbCircleCheck, TbClock, TbLock, TbUsersGroup, TbMessages } from "react-icons/tb";
import { toast } from "sonner";
import { getCommunities, getModerationQueue, moderatePost } from "@/lib/api";
import { PageHeader, Panel, Loading, EmptyState } from "@/components/admin/parts";
import { timeAgo } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Waiting approval" },
  { id: "reported", label: "Reported" },
];

export default function CommunityPage() {
  const [queue, setQueue] = useState(null);
  const [groups, setGroups] = useState([]);
  const [sample, setSample] = useState(false);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    Promise.all([getModerationQueue(), getCommunities()])
      .then(([q, g]) => {
        setQueue(q.data);
        setGroups(g.data);
        setSample(q.sample || g.sample);
      })
      .catch((error) => toast.error(error.message || "Could not load the moderation queue"));
  }, []);

  if (!queue) return <Loading label="Loading community…" />;

  const decide = async (post, decision) => {
    try {
      if (!sample) await moderatePost(post.id, decision);
      setQueue((list) => list.filter((p) => p.id !== post.id));
      toast.success(decision === "approve" ? "Post published" : "Post removed");
    } catch (error) {
      toast.error(error.message || "Could not save your decision");
    }
  };

  const visible = queue.filter((p) => tab === "all" || p.status === tab);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Community"
        title="Moderation"
        description="Approve posts in pre-moderated groups and act on reports. Remove anything that shares personal details or harmful advice."
        sample={sample}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <section className="card p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
            <h2 className="m-0 text-[1.05rem] font-bold">Queue · {queue.length}</h2>
            <div className="chip-row" role="group" aria-label="Filter posts">
              {TABS.map((t) => (
                <button key={t.id} type="button" className="chip min-h-9" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState icon={TbCircleCheck} title="Queue is clear" text="Nothing is waiting for a moderator right now." />
          ) : (
            <ul className="m-0 list-none divide-y divide-line p-0">
              {visible.map((p) => (
                <li key={p.id} className="p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-[0.82rem] text-muted">
                    <span className="grid size-7 place-items-center rounded-full bg-accent-soft text-[0.72rem] font-bold text-accent-text">
                      {p.author.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </span>
                    <strong className="text-fg">{p.author}</strong>
                    <span>in {p.community}</span>
                    <span className="inline-flex items-center gap-1"><TbClock size={13} /> {timeAgo(p.createdAt)}</span>
                  </div>
                  <p className="mb-3 rounded-[14px] bg-surface-2 px-4 py-3 text-[0.95rem]">{p.text}</p>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className={`tag ${p.status === "reported" ? "tag-accent" : "tag-brand"}`}>
                      {p.status === "reported" ? (
                        <><TbFlag size={12} /> {p.reports} report{p.reports === 1 ? "" : "s"} · {p.reason}</>
                      ) : (
                        <><TbLock size={12} /> {p.reason}</>
                      )}
                    </span>
                    <div className="flex gap-2">
                      <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => decide(p, "remove")}>
                        <TbX size={16} /> Remove
                      </button>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => decide(p, "approve")}>
                        <TbCheck size={16} /> {p.status === "reported" ? "Keep" : "Approve"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Panel title="Groups" description="Members and posts per group">
          <ul className="m-0 list-none space-y-3 p-0">
            {groups.map((g) => (
              <li key={g.name} className="rounded-[14px] border border-line p-3">
                <p className="m-0 flex items-start justify-between gap-2 font-semibold">
                  {g.name}
                  {g.preModerated && <span className="tag tag-brand shrink-0" title="Posts are reviewed before they appear"><TbLock size={11} /> Reviewed</span>}
                </p>
                <p className="m-0 mt-1 flex gap-4 text-[0.82rem] text-muted">
                  <span className="inline-flex items-center gap-1"><TbUsersGroup size={14} /> {g.members}</span>
                  <span className="inline-flex items-center gap-1"><TbMessages size={14} /> {g.posts}</span>
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

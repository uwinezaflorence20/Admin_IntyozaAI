import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { TbBell, TbFlag, TbLoader2, TbPhoneCall } from "react-icons/tb";
import { getReferrals, getReports } from "@/lib/api";
import { cn, errorMessage, timeAgo } from "@/lib/utils";

/** Something waiting for an admin, built from the pending reports and referrals queues. */
interface Notice {
  id: string;
  kind: "report" | "referral";
  title: string;
  detail: string;
  createdAt: string;
  href: string;
}

const SEEN_KEY = "intyoza.admin.notificationsSeenAt";
const REFRESH_MS = 60_000;

// The last time this admin opened the list; only a per-browser convenience, so failures are ignored.
const readSeenAt = () => {
  try {
    return Number(localStorage.getItem(SEEN_KEY)) || 0;
  } catch {
    return 0;
  }
};
const writeSeenAt = (time: number) => {
  try {
    localStorage.setItem(SEEN_KEY, String(time));
  } catch {
    /* Private mode or blocked storage: the badge just won't remember. */
  }
};

async function loadNotices(): Promise<Notice[]> {
  const [reports, referrals] = await Promise.all([getReports(), getReferrals()]);
  const fromReports: Notice[] = reports.map((r) => ({
    id: `report-${r.id}`,
    kind: "report",
    title: `${r.post ? "Post" : "Comment"} reported · ${r.reason}`,
    detail: (r.post?.content ?? r.comment?.content ?? "").slice(0, 90),
    createdAt: r.createdAt,
    href: "/admin/community",
  }));
  const fromReferrals: Notice[] = referrals
    .filter((r) => r.status === "PENDING")
    .map((r) => ({
      id: `referral-${r.id}`,
      kind: "referral",
      title: `Callback requested${r.topic ? ` · ${r.topic}` : ""}`,
      detail: `${r.user.alias || "Anonymous"} by ${r.contactMethod}`,
      createdAt: r.createdAt,
      href: "/admin/referrals",
    }));
  return [...fromReports, ...fromReferrals].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Header bell: pending reports and referral requests, refreshed every minute. */
export function Notifications() {
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [error, setError] = useState("");
  const [seenAt, setSeenAt] = useState(readSeenAt);
  const ref = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    loadNotices()
      .then((list) => {
        setNotices(list);
        setError("");
      })
      .catch((e) => setError(errorMessage(e, "Could not load notifications")));
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // What counted as new when the list was opened, so those items stay highlighted while it is open.
  const [highlightFrom, setHighlightFrom] = useState(seenAt);
  const unseen = notices?.filter((n) => new Date(n.createdAt).getTime() > seenAt).length ?? 0;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (!next) return;
    refresh();
    // Opening the list counts as seeing everything in it.
    setHighlightFrom(seenAt);
    const now = Date.now();
    writeSeenAt(now);
    setSeenAt(now);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unseen ? `Notifications, ${unseen} new` : "Notifications"}
        className="icon-btn relative"
      >
        <TbBell size={19} />
        {unseen > 0 && (
          <span className="absolute -top-1 -right-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-accent px-1 text-[0.68rem] font-bold text-white">
            {unseen > 9 ? "9+" : unseen}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[14px] border border-line bg-surface shadow-card"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="m-0 font-semibold">Notifications</p>
              {notices && <span className="text-[0.8rem] text-muted">{notices.length} waiting</span>}
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {error ? (
                <p className="m-0 px-4 py-6 text-center text-[0.88rem] text-danger">{error}</p>
              ) : !notices ? (
                <p className="m-0 flex items-center justify-center gap-2 px-4 py-6 text-[0.88rem] text-muted">
                  <TbLoader2 className="animate-spin text-brand" size={18} /> Loading…
                </p>
              ) : notices.length === 0 ? (
                <p className="m-0 px-4 py-8 text-center text-[0.88rem] text-muted">Nothing is waiting for you. All caught up!</p>
              ) : (
                <ul className="m-0 list-none divide-y divide-line p-0">
                  {notices.map((n) => {
                    const isNew = new Date(n.createdAt).getTime() > highlightFrom;
                    const Icon = n.kind === "report" ? TbFlag : TbPhoneCall;
                    return (
                      <li key={n.id}>
                        <Link
                          to={n.href}
                          onClick={() => setOpen(false)}
                          className={cn("flex gap-3 px-4 py-3 text-fg no-underline hover:bg-surface-2", isNew && "bg-brand-soft/50")}
                        >
                          <span
                            className={cn(
                              "grid size-9 shrink-0 place-items-center rounded-full",
                              n.kind === "report" ? "bg-accent-soft text-accent-text" : "bg-teal-soft text-teal-text"
                            )}
                          >
                            <Icon size={17} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-2">
                              <span className="text-[0.88rem] font-semibold">{n.title}</span>
                              {isNew && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" aria-label="New" />}
                            </span>
                            {n.detail && <span className="block truncate text-[0.82rem] text-muted">{n.detail}</span>}
                            <span className="block text-[0.75rem] text-muted">{timeAgo(n.createdAt)}</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

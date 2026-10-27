"use client";

import { AnimatePresence, motion } from "framer-motion";
import { TbFlask, TbLoader2 } from "react-icons/tb";
import { cn } from "@/lib/utils";

/** Title block at the top of every admin page. */
export function PageHeader({ eyebrow, title, description, sample, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="m-0 flex flex-wrap items-center gap-3 font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-tight font-bold">
          {title}
          {sample && <SampleBadge />}
        </h1>
        {description && <p className="mt-1.5 mb-0 max-w-[62ch] text-muted">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/** Shown when a page falls back to sample data because the backend endpoint is not there yet. */
export function SampleBadge() {
  return (
    <span
      className="tag tag-sun font-sans text-[0.72rem] tracking-normal"
      title="The backend has no admin endpoint for this yet, so sample data is shown."
    >
      <TbFlask size={13} /> Sample data
    </span>
  );
}

// Card background and icon colour per tone (full class names so Tailwind can see them).
export const TONES = {
  brand: { soft: "bg-brand-soft", text: "text-brand" },
  teal: { soft: "bg-teal-soft", text: "text-teal-text" },
  accent: { soft: "bg-accent-soft", text: "text-accent-text" },
  sun: { soft: "bg-sun-soft", text: "text-sun-text" },
  lavender: { soft: "bg-lavender", text: "text-brand" },
  peach: { soft: "bg-peach", text: "text-peach-text" },
};

export function StatCard({ icon: Icon, label, value, hint, tone = "brand", onClick }) {
  const t = TONES[tone];
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "card flex w-full items-start gap-3.5 text-left",
        onClick && "transition hover:-translate-y-0.5 hover:shadow-card"
      )}
    >
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-full", t.soft, t.text)}>
        <Icon size={22} />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.85rem] font-medium text-muted">{label}</span>
        <span className="block font-display text-[1.6rem] leading-tight font-bold">{value}</span>
        {hint && <span className="mt-0.5 block text-[0.8rem] text-muted">{hint}</span>}
      </span>
    </Tag>
  );
}

export function Panel({ title, description, action, className, children }) {
  return (
    <section className={cn("card", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="m-0 text-[1.05rem] font-bold">{title}</h2>
            {description && <p className="mt-0.5 mb-0 text-[0.85rem] text-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Loading({ label = "Loading…" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-14 text-muted" role="status">
      <TbLoader2 className="animate-spin text-brand" size={22} /> {label}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-muted">
      {Icon && (
        <span className="grid size-12 place-items-center rounded-full bg-surface-2 text-brand">
          <Icon size={24} />
        </span>
      )}
      <strong className="text-fg">{title}</strong>
      {text && <p className="m-0 max-w-[40ch] text-[0.9rem]">{text}</p>}
    </div>
  );
}

/** Small modal used for confirmations (logout, delete, …). */
export function Dialog({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ scale: 0.95, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 8 }}
            className="w-full max-w-sm rounded-[22px] border border-line bg-surface p-6 shadow-card"
          >
            <h2 className="mb-2 text-[1.2rem] font-bold">{title}</h2>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Tooltip styling for recharts, so hover cards follow the theme. */
export const chartTooltip = {
  contentStyle: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    boxShadow: "var(--shadow)",
    color: "var(--text)",
    fontSize: 13,
  },
  labelStyle: { color: "var(--text-muted)", marginBottom: 2 },
  itemStyle: { color: "var(--text)" },
  cursor: { fill: "var(--surface-2)", stroke: "var(--border)" },
};

export const chartAxis = {
  tick: { fontSize: 12, fill: "var(--text-muted)" },
  axisLine: false,
  tickLine: false,
};

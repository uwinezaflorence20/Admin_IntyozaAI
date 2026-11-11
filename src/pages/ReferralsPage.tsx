import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { TbPhoneCall, TbClock, TbUser, TbMapPin, TbCircleCheck, TbShieldLock, TbAlertCircle } from "react-icons/tb";
import { toast } from "sonner";
import { getReferrals, updateReferral } from "@/lib/api";
import { AGE_BAND_LABELS } from "@/lib/labels";
import { Dialog, EmptyState, Loading, PageHeader, StatCard } from "@/components/admin/parts";
import { Button } from "@/components/ui/Button";
import { errorMessage, timeAgo } from "@/lib/utils";
import type { Referral, ReferralStatus } from "@/types";

const STATUSES: { value: ReferralStatus; label: string; tag: string }[] = [
  { value: "PENDING", label: "Pending", tag: "tag-sun" },
  { value: "CONTACTED", label: "Contacted", tag: "tag-brand" },
  { value: "RESOLVED", label: "Resolved", tag: "tag-success" },
  { value: "CANCELLED", label: "Cancelled", tag: "tag-danger" },
];
const tagFor = (s: ReferralStatus) => STATUSES.find((x) => x.value === s) ?? STATUSES[0];

const TABS: { id: ReferralStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  ...STATUSES.map((s) => ({ id: s.value, label: s.label })),
];

interface UpdateValues {
  status: ReferralStatus;
  notes: string;
}

function UpdateForm({ referral, onCancel, onSaved }: { referral: Referral; onCancel: () => void; onSaved: (r: Referral) => void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<UpdateValues>({
    defaultValues: { status: referral.status, notes: referral.notes ?? "" },
  });

  const onSubmit = async (values: UpdateValues) => {
    try {
      const saved = await updateReferral(referral.id, { status: values.status, notes: values.notes.trim() || undefined });
      onSaved(saved);
      toast.success("Referral updated");
    } catch (error) {
      toast.error(errorMessage(error, "Could not update the referral"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="status" className="label">Status</label>
        <select id="status" className="select" {...register("status")}>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="notes" className="label">Notes</label>
        <textarea id="notes" rows={4} className="input h-auto py-2.5" placeholder="What was done, or what the professional should know" {...register("notes")} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>Save</Button>
      </div>
    </form>
  );
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState<ReferralStatus | "all">("all");
  const [editing, setEditing] = useState<Referral | null>(null);

  useEffect(() => {
    getReferrals()
      .then(setReferrals)
      .catch((error) => setLoadError(errorMessage(error, "Could not load referrals")));
  }, []);

  if (loadError) return <EmptyState icon={TbAlertCircle} title="Could not load referrals" text={loadError} />;
  if (!referrals) return <Loading label="Loading referrals…" />;

  const pending = referrals.filter((r) => r.status === "PENDING").length;
  const resolved = referrals.filter((r) => r.status === "RESOLVED").length;
  const visible = referrals.filter((r) => tab === "all" || r.status === tab);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Professionals"
        title="Referrals"
        description="Callback requests from young people who asked to speak with a health professional."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={TbPhoneCall} tone="brand" label="Requests" value={referrals.length} />
        <StatCard icon={TbClock} tone="sun" label="Pending" value={pending} />
        <StatCard icon={TbCircleCheck} tone="teal" label="Resolved" value={resolved} />
      </div>

      <div className="notice">
        <TbShieldLock size={20} className="text-brand" />
        <p className="m-0 text-[0.92rem]">
          These are real contact details young people shared to get help. Only contact them about their request, and record what you do.
        </p>
      </div>

      <section className="card p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <h2 className="m-0 text-[1.05rem] font-bold">Requests · {visible.length}</h2>
          <div className="chip-row" role="group" aria-label="Filter referrals">
            {TABS.map((t) => (
              <button key={t.id} type="button" className="chip min-h-9" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState icon={TbPhoneCall} title="Nothing here" text="No referrals with this status." />
        ) : (
          <ul className="m-0 list-none divide-y divide-line p-0">
            {visible.map((r) => {
              const status = tagFor(r.status);
              return (
                <li key={r.id} className="flex flex-wrap items-start gap-4 p-4">
                  <div className="min-w-0 flex-1 basis-60">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong>{r.topic || "General"}</strong>
                      <span className={`tag ${status.tag}`}>{status.label}</span>
                    </div>
                    <p className="m-0 mt-1 inline-flex items-center gap-1.5 text-[0.95rem] font-medium">
                      <TbPhoneCall size={15} className="text-teal-text" /> {r.contactMethod}
                    </p>
                    <p className="m-0 mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[0.82rem] text-muted">
                      <span className="inline-flex items-center gap-1"><TbUser size={13} /> {r.user.alias || "Anonymous"}{r.user.ageBand ? ` · ${AGE_BAND_LABELS[r.user.ageBand]}` : ""}</span>
                      {r.user.district && <span className="inline-flex items-center gap-1"><TbMapPin size={13} /> {r.user.district}</span>}
                      <span className="inline-flex items-center gap-1"><TbClock size={13} /> {timeAgo(r.createdAt)}</span>
                    </p>
                    {r.notes && <p className="m-0 mt-2 rounded-[12px] bg-surface-2 px-3 py-2 text-[0.88rem]">{r.notes}</p>}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setEditing(r)}>Update</Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Dialog open={!!editing} onClose={() => setEditing(null)} title="Update referral">
        {editing && (
          <UpdateForm
            referral={editing}
            onCancel={() => setEditing(null)}
            onSaved={(saved) => {
              setReferrals((list) => list?.map((r) => (r.id === saved.id ? { ...r, ...saved } : r)) ?? null);
              setEditing(null);
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

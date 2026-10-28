"use client";

import { useEffect, useState } from "react";
import { TbMapPin, TbHeartHandshake, TbAlertTriangle, TbCalendarCheck, TbBuildingHospital } from "react-icons/tb";
import { toast } from "sonner";
import { getFacilities } from "@/lib/api";
import { PageHeader, Loading, StatCard } from "@/components/admin/parts";
import { timeAgo } from "@/lib/utils";

// Facility details should be re-checked at least every 90 days.
const STALE_AFTER_DAYS = 90;
const isStale = (date) => Date.now() - new Date(date).getTime() > STALE_AFTER_DAYS * 24 * 60 * 60 * 1000;

export default function ServicesPage() {
  const [facilities, setFacilities] = useState(null);
  const [sample, setSample] = useState(false);

  useEffect(() => {
    getFacilities()
      .then(({ data, sample }) => {
        setFacilities(data);
        setSample(sample);
      })
      .catch((error) => toast.error(error.message || "Could not load services"));
  }, []);

  if (!facilities) return <Loading label="Loading services…" />;

  const stale = facilities.filter((f) => isStale(f.verifiedAt)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Find services"
        title="Health services"
        description="Facilities Intyoza AI refers people to. Keep hours, costs and youth-friendly status up to date."
        sample={sample}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={TbBuildingHospital} tone="teal" label="Facilities" value={facilities.length} />
        <StatCard icon={TbHeartHandshake} tone="accent" label="Youth-friendly" value={facilities.filter((f) => f.youthFriendly).length} />
        <StatCard icon={TbAlertTriangle} tone="sun" label="Need re-checking" value={stale} hint={`Not verified in ${STALE_AFTER_DAYS} days`} />
      </div>

      <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
        {facilities.map((f) => (
          <li key={f.id} className="card flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-soft text-teal-text">
                <TbMapPin size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="m-0 text-[1.02rem] font-bold">{f.name}</h2>
                <p className="m-0 text-[0.85rem] text-muted">{f.type} · {f.district}</p>
              </div>
              {f.youthFriendly && <span className="tag tag-accent shrink-0">Youth-friendly</span>}
            </div>
            <div className="chip-row gap-1.5">
              {f.services.map((s) => <span key={s} className="tag tag-teal">{s}</span>)}
            </div>
            <p className={`m-0 mt-auto inline-flex items-center gap-1.5 text-[0.82rem] ${isStale(f.verifiedAt) ? "font-semibold text-sun-text" : "text-muted"}`}>
              {isStale(f.verifiedAt) ? <TbAlertTriangle size={15} /> : <TbCalendarCheck size={15} />}
              Verified {timeAgo(f.verifiedAt)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

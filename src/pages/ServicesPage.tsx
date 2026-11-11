import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  TbMapPin, TbHeartHandshake, TbAlertTriangle, TbCalendarCheck, TbBuildingHospital, TbPlus, TbPencil, TbTrash, TbEyeOff,
} from "react-icons/tb";
import { toast } from "sonner";
import { createFacility, getFacilities, updateFacility } from "@/lib/api";
import { Dialog, EmptyState, PageHeader, Loading, StatCard } from "@/components/admin/parts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn, errorMessage, timeAgo } from "@/lib/utils";
import type { AvailabilityStatus, Facility, NewFacility } from "@/types";

// Facility details should be re-checked at least every 90 days.
const STALE_AFTER_DAYS = 90;
const isStale = (date: string | null) => !date || Date.now() - new Date(date).getTime() > STALE_AFTER_DAYS * 24 * 60 * 60 * 1000;
const available = (status: AvailabilityStatus) => status === "YES" || status === "LIKELY";

const AVAILABILITY: { value: AvailabilityStatus; label: string }[] = [
  { value: "YES", label: "Yes" }, { value: "LIKELY", label: "Likely" }, { value: "NO", label: "No" }, { value: "UNKNOWN", label: "Unknown" },
];
const OWNERSHIP = [
  { value: "PUBLIC", label: "Public" }, { value: "FAITH_BASED", label: "Faith-based" }, { value: "PRIVATE", label: "Private" }, { value: "UNKNOWN", label: "Unknown" },
] as const;
const COST = [
  { value: "FREE", label: "Free" }, { value: "SUBSIDIZED", label: "Subsidized" }, { value: "PAID", label: "Paid" }, { value: "UNKNOWN", label: "Unknown" },
] as const;

const numberField = z.string().trim().min(1, "Required").refine((v) => Number.isFinite(Number(v)), "Enter a number");

const facilitySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  facilityType: z.string().trim(),
  ownership: z.enum(["PUBLIC", "FAITH_BASED", "PRIVATE", "UNKNOWN"]),
  province: z.string().trim(),
  district: z.string().trim().min(1, "District is required"),
  sector: z.string().trim(),
  cell: z.string().trim(),
  address: z.string().trim(),
  latitude: numberField,
  longitude: numberField,
  phone: z.string().trim(),
  openingHours: z.string().trim(),
  isYouthFriendly: z.enum(["YES", "LIKELY", "NO", "UNKNOWN"]),
  isIsange: z.enum(["YES", "LIKELY", "NO", "UNKNOWN"]),
  showInApp: z.boolean(),
  verified: z.boolean(),
  services: z.array(
    z.object({
      serviceName: z.string().trim().min(1, "Required"),
      status: z.enum(["YES", "LIKELY", "NO", "UNKNOWN"]),
      costType: z.enum(["FREE", "SUBSIDIZED", "PAID", "UNKNOWN"]),
    })
  ),
});

type FacilityValues = z.infer<typeof facilitySchema>;

function toDefaults(facility: Facility | null): FacilityValues {
  return {
    name: facility?.name ?? "",
    facilityType: facility?.facilityType ?? "",
    ownership: facility?.ownership ?? "UNKNOWN",
    province: facility?.province ?? "",
    district: facility?.district ?? "",
    sector: facility?.sector ?? "",
    cell: facility?.cell ?? "",
    address: facility?.address ?? "",
    latitude: facility ? String(facility.latitude) : "",
    longitude: facility ? String(facility.longitude) : "",
    phone: facility?.phone ?? "",
    openingHours: facility?.openingHours ?? "",
    isYouthFriendly: facility?.isYouthFriendly ?? "UNKNOWN",
    isIsange: facility?.isIsange ?? "UNKNOWN",
    showInApp: facility?.showInApp ?? true,
    verified: !!facility?.verifiedAt,
    services: facility?.services.map((s) => ({ serviceName: s.serviceName, status: s.status, costType: s.costType })) ?? [],
  };
}

function toPayload(values: FacilityValues): NewFacility {
  const blank = (v: string) => (v ? v : undefined);
  return {
    name: values.name,
    facilityType: blank(values.facilityType),
    ownership: values.ownership,
    province: blank(values.province),
    district: values.district,
    sector: blank(values.sector),
    cell: blank(values.cell),
    address: blank(values.address),
    latitude: Number(values.latitude),
    longitude: Number(values.longitude),
    phone: blank(values.phone),
    openingHours: blank(values.openingHours),
    isYouthFriendly: values.isYouthFriendly,
    isIsange: values.isIsange,
    showInApp: values.showInApp,
    verifiedAt: values.verified ? new Date().toISOString() : null,
    services: values.services,
  };
}

function FacilityForm({ facility, onCancel, onSaved }: { facility: Facility | null; onCancel: () => void; onSaved: (f: Facility, created: boolean) => void }) {
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FacilityValues>({
    resolver: zodResolver(facilitySchema),
    defaultValues: toDefaults(facility),
  });
  const { fields, append, remove } = useFieldArray({ control, name: "services" });

  const onSubmit = async (values: FacilityValues) => {
    try {
      const payload = toPayload(values);
      const saved = facility ? await updateFacility(facility.id, payload) : await createFacility(payload);
      onSaved(saved, !facility);
      toast.success(facility ? "Facility updated" : "Facility added");
    } catch (error) {
      toast.error(errorMessage(error, "Could not save the facility"));
    }
  };

  const field = (name: keyof FacilityValues, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <Input id={name} {...register(name)} aria-invalid={!!errors[name]} {...props} />
      {errors[name] && <p className="field-error">{(errors[name]?.message as string) ?? ""}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {field("name", "Name")}
      <div className="grid grid-cols-2 gap-3">
        {field("facilityType", "Type", { placeholder: "Health Center" })}
        <div>
          <label htmlFor="ownership" className="label">Ownership</label>
          <select id="ownership" className="select" {...register("ownership")}>
            {OWNERSHIP.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {field("province", "Province")}
        {field("district", "District")}
        {field("sector", "Sector")}
        {field("cell", "Cell")}
      </div>
      {field("address", "Address")}
      <div className="grid grid-cols-2 gap-3">
        {field("latitude", "Latitude", { inputMode: "decimal", placeholder: "-1.9441" })}
        {field("longitude", "Longitude", { inputMode: "decimal", placeholder: "30.0619" })}
        {field("phone", "Phone")}
        {field("openingHours", "Opening hours", { placeholder: "Mon–Fri 8:00–17:00" })}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="isYouthFriendly" className="label">Youth-friendly</label>
          <select id="isYouthFriendly" className="select" {...register("isYouthFriendly")}>
            {AVAILABILITY.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="isIsange" className="label">Isange one-stop centre</label>
          <select id="isIsange" className="select" {...register("isIsange")}>
            {AVAILABILITY.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="label mb-0">Services</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => append({ serviceName: "", status: "YES", costType: "UNKNOWN" })}>
            <TbPlus size={15} /> Add service
          </Button>
        </div>
        {fields.length === 0 && <p className="m-0 text-[0.85rem] text-muted">No services listed.</p>}
        <ul className="m-0 list-none space-y-2 p-0">
          {fields.map((f, i) => (
            <li key={f.id} className="flex flex-wrap items-start gap-2">
              <div className="min-w-[8rem] flex-1">
                <Input placeholder="Service, e.g. CONTRACEPTION" {...register(`services.${i}.serviceName`)} aria-invalid={!!errors.services?.[i]?.serviceName} />
                {errors.services?.[i]?.serviceName && <p className="field-error">{errors.services[i]?.serviceName?.message}</p>}
              </div>
              <select className="select w-auto" aria-label="Availability" {...register(`services.${i}.status`)}>
                {AVAILABILITY.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
              <select className="select w-auto" aria-label="Cost" {...register(`services.${i}.costType`)}>
                {COST.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <button type="button" className="icon-btn text-danger hover:bg-danger-soft" aria-label="Remove service" onClick={() => remove(i)}>
                <TbTrash size={16} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-[0.9rem] font-medium">
          <input type="checkbox" className="size-4" {...register("showInApp")} /> Show in the app
        </label>
        <label className="flex items-center gap-2 text-[0.9rem] font-medium">
          <input type="checkbox" className="size-4" {...register("verified")} /> Mark verified today
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>{facility ? "Save changes" : "Add facility"}</Button>
      </div>
    </form>
  );
}

const STATUS_TAG: Record<AvailabilityStatus, string> = { YES: "tag-success", LIKELY: "tag-teal", NO: "tag-danger", UNKNOWN: "" };

export default function ServicesPage() {
  const [facilities, setFacilities] = useState<Facility[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState<Facility | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getFacilities()
      .then(setFacilities)
      .catch((error) => setLoadError(errorMessage(error, "Could not load services")));
  }, []);

  if (loadError) return <EmptyState icon={TbAlertTriangle} title="Could not load services" text={loadError} />;
  if (!facilities) return <Loading label="Loading services…" />;

  const stale = facilities.filter((f) => isStale(f.verifiedAt)).length;
  const hidden = facilities.filter((f) => !f.showInApp).length;
  const youthFriendly = facilities.filter((f) => available(f.isYouthFriendly)).length;

  const upsert = (saved: Facility, created: boolean) => {
    setFacilities((list) => (created ? [...(list ?? []), saved] : (list ?? []).map((f) => (f.id === saved.id ? saved : f))).sort((a, b) => a.name.localeCompare(b.name)));
    setAdding(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Find services"
        title="Health services"
        description="Facilities Intyoza AI refers people to. Keep hours, services and youth-friendly status up to date."
      >
        <Button onClick={() => setAdding(true)}><TbPlus size={16} /> Add facility</Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={TbBuildingHospital} tone="teal" label="Facilities" value={facilities.length} />
        <StatCard icon={TbHeartHandshake} tone="accent" label="Youth-friendly" value={youthFriendly} />
        <StatCard icon={TbEyeOff} tone="lavender" label="Hidden from app" value={hidden} />
        <StatCard icon={TbAlertTriangle} tone="sun" label="Need re-checking" value={stale} hint={`Not verified in ${STALE_AFTER_DAYS} days`} />
      </div>

      {facilities.length === 0 ? (
        <section className="card">
          <EmptyState icon={TbBuildingHospital} title="No facilities yet" text="Add the first health facility." />
        </section>
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
          {facilities.map((f) => (
            <li key={f.id} className={cn("card flex flex-col gap-3", !f.showInApp && "opacity-70")}>
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-soft text-teal-text">
                  <TbMapPin size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="m-0 text-[1.02rem] font-bold">{f.name}</h2>
                  <p className="m-0 text-[0.85rem] text-muted">
                    {[f.facilityType, f.district, f.sector].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <button type="button" className="icon-btn" aria-label={`Edit ${f.name}`} title="Edit" onClick={() => setEditing(f)}>
                  <TbPencil size={17} />
                </button>
              </div>

              <div className="chip-row gap-1.5">
                {available(f.isYouthFriendly) && <span className="tag tag-accent">Youth-friendly</span>}
                {available(f.isIsange) && <span className="tag tag-brand">Isange centre</span>}
                {!f.showInApp && <span className="tag"><TbEyeOff size={12} /> Hidden</span>}
              </div>

              {f.services.length > 0 && (
                <div className="chip-row gap-1.5">
                  {f.services.map((s) => (
                    <span key={(s.id ?? s.serviceName)} className={cn("tag", STATUS_TAG[s.status])} title={`${s.status} · ${s.costType}`}>
                      {s.serviceName.toLowerCase()}
                    </span>
                  ))}
                </div>
              )}

              <p className={`m-0 mt-auto inline-flex items-center gap-1.5 text-[0.82rem] ${isStale(f.verifiedAt) ? "font-semibold text-sun-text" : "text-muted"}`}>
                {isStale(f.verifiedAt) ? <TbAlertTriangle size={15} /> : <TbCalendarCheck size={15} />}
                {f.verifiedAt ? `Verified ${timeAgo(f.verifiedAt)}` : "Not verified yet"}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={adding || !!editing} onClose={() => { setAdding(false); setEditing(null); }} title={editing ? "Edit facility" : "Add facility"}>
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <FacilityForm facility={editing} onCancel={() => { setAdding(false); setEditing(null); }} onSaved={upsert} />
        </div>
      </Dialog>
    </div>
  );
}

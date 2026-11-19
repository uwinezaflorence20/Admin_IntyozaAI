import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { TbFilterOff, TbSearch, TbUsers, TbUserShield, TbSpy } from "react-icons/tb";
import { getUsers } from "@/lib/api";
import { AGE_BAND_LABELS, sexLabel } from "@/lib/labels";
import { PageHeader, StatCard, Loading, EmptyState } from "@/components/admin/parts";
import Pagination from "@/components/shared/Pagination";
import { errorMessage, timeAgo } from "@/lib/utils";
import type { AdminUser, Role } from "@/types";

const PAGE_SIZE = 10;
const isAnonymous = (u: AdminUser) => !u.email;

const FILTERS: { id: string; label: string; test: (u: AdminUser) => boolean }[] = [
  { id: "all", label: "Everyone", test: () => true },
  { id: "anonymous", label: "Anonymous", test: (u) => isAnonymous(u) },
  { id: "account", label: "With account", test: (u) => !isAnonymous(u) },
  { id: "staff", label: "Moderators & admins", test: (u) => u.role !== "USER" },
];

const ALL = "all";
/** Filter value for people who did not share a detail. */
const NOT_SHARED = "none";
const SEX_TAG: Record<string, string> = { FEMALE: "tag-accent", MALE: "tag-teal" };

const ROLE_TAG: Record<Role, string> = { ADMIN: "tag-brand", MODERATOR: "tag-teal", USER: "" };
const initials = (alias: string | null) => (alias ? alias.split(" ").map((w) => w[0]).slice(0, 2).join("") : "?");

interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function FilterSelect({ id, label, value, options, onChange }: FilterSelectProps) {
  return (
    <div className="w-full sm:w-44">
      <label htmlFor={id} className="mb-1 block text-[0.78rem] font-semibold text-muted">{label}</label>
      <select id={id} className="select min-h-10" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value={ALL}>All</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [filter, setFilter] = useState("all");
  const [sex, setSex] = useState(ALL);
  const [ageBand, setAgeBand] = useState(ALL);
  const [district, setDistrict] = useState(ALL);
  const [page, setPage] = useState(1);

  // The header search links here with ?q=, also while this page is already open.
  const linkedQuery = searchParams.get("q");
  const [lastLinkedQuery, setLastLinkedQuery] = useState(linkedQuery);
  if (linkedQuery !== lastLinkedQuery) {
    setLastLinkedQuery(linkedQuery);
    setQuery(linkedQuery ?? "");
    setPage(1);
  }

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((error) => setLoadError(errorMessage(error, "Could not load users")));
  }, []);

  const visible = useMemo(() => {
    if (!users) return [];
    const test = FILTERS.find((f) => f.id === filter)!.test;
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) =>
        test(u) &&
        (!q || [u.alias, u.email].some((v) => v?.toLowerCase().includes(q))) &&
        (sex === ALL || (u.gender || NOT_SHARED) === sex) &&
        (ageBand === ALL || (u.ageBand || NOT_SHARED) === ageBand) &&
        (district === ALL || (u.district || NOT_SHARED) === district)
    );
  }, [users, filter, query, sex, ageBand, district]);

  // Filter choices come from the people actually listed, so no option leads to an empty table.
  const options = useMemo(() => {
    const list = users ?? [];
    const distinct = (pick: (u: AdminUser) => string | null | undefined) =>
      [...new Set(list.map((u) => pick(u) || NOT_SHARED))].sort((a, b) => (a === NOT_SHARED ? 1 : b === NOT_SHARED ? -1 : a.localeCompare(b)));
    return { sexes: distinct((u) => u.gender), ageBands: distinct((u) => u.ageBand), districts: distinct((u) => u.district) };
  }, [users]);

  const filtersActive = filter !== "all" || sex !== ALL || ageBand !== ALL || district !== ALL || query.trim() !== "";
  const clearFilters = () => {
    setFilter("all");
    setSex(ALL);
    setAgeBand(ALL);
    setDistrict(ALL);
    setQuery("");
    setPage(1);
  };

  if (loadError) return <EmptyState icon={TbUsers} title="Could not load users" text={loadError} />;
  if (!users) return <Loading label="Loading users…" />;

  const totalPages = Math.ceil(visible.length / PAGE_SIZE);
  const rows = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Users"
        description="Most people use Intyoza anonymously. You see their alias, never their conversations."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={TbUsers} tone="brand" label="Total" value={users.length.toLocaleString("en-GB")} />
        <StatCard icon={TbSpy} tone="lavender" label="Anonymous" value={users.filter(isAnonymous).length} />
        <StatCard icon={TbUserShield} tone="teal" label="Moderators & admins" value={users.filter((u) => u.role !== "USER").length} />
      </div>

      <section className="card p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <div className="relative w-full max-w-xs">
            <TbSearch className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" size={18} />
            <label htmlFor="user-search" className="sr-only">Search users</label>
            <input
              id="user-search"
              className="input min-h-10 rounded-full pl-10"
              placeholder="Search alias or email"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
          </div>
          <div className="chip-row" role="group" aria-label="Filter users">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" className="chip min-h-9" aria-pressed={filter === f.id} onClick={() => { setFilter(f.id); setPage(1); }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 border-b border-line px-4 py-3">
          <FilterSelect
            id="filter-sex"
            label="Sex"
            value={sex}
            onChange={(v) => { setSex(v); setPage(1); }}
            options={options.sexes.map((v) => ({ value: v, label: v === NOT_SHARED ? "Not shared" : sexLabel(v) }))}
          />
          <FilterSelect
            id="filter-age"
            label="Age group"
            value={ageBand}
            onChange={(v) => { setAgeBand(v); setPage(1); }}
            options={options.ageBands.map((v) => ({
              value: v,
              label: v === NOT_SHARED ? "Not shared" : AGE_BAND_LABELS[v as keyof typeof AGE_BAND_LABELS] ?? v,
            }))}
          />
          <FilterSelect
            id="filter-district"
            label="District"
            value={district}
            onChange={(v) => { setDistrict(v); setPage(1); }}
            options={options.districts.map((v) => ({ value: v, label: v === NOT_SHARED ? "Not shared" : v }))}
          />
          <p className="m-0 ml-auto self-center text-[0.85rem] text-muted">
            {visible.length} of {users.length} {users.length === 1 ? "person" : "people"}
            {filtersActive && (
              <button type="button" className="btn btn-ghost btn-sm ml-2" onClick={clearFilters}>
                <TbFilterOff size={15} /> Clear filters
              </button>
            )}
          </p>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={TbUsers} title={users.length ? "No users found" : "No users yet"} text={users.length ? "Try another search or filter." : "Registered people will appear here."} />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Sex</th>
                  <th>Age group</th>
                  <th>District</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-[0.8rem] font-bold text-brand">
                          {initials(u.alias)}
                        </span>
                        <div className="min-w-0">
                          <p className="m-0 font-semibold whitespace-nowrap">{u.alias || "Anonymous"}</p>
                          <p className="m-0 text-[0.8rem] whitespace-nowrap text-muted">
                            {isAnonymous(u) ? <span className="inline-flex items-center gap-1"><TbSpy size={13} /> Anonymous</span> : u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      {u.gender ? <span className={`tag ${SEX_TAG[u.gender] ?? ""}`}>{sexLabel(u.gender)}</span> : <span className="text-muted">Not shared</span>}
                    </td>
                    <td className="whitespace-nowrap">{(u.ageBand && AGE_BAND_LABELS[u.ageBand]) || "Not shared"}</td>
                    <td className="whitespace-nowrap">{u.district || "Not shared"}</td>
                    <td><span className={`tag ${ROLE_TAG[u.role]} capitalize`}>{u.role.toLowerCase()}</span></td>
                    <td className="whitespace-nowrap text-muted">{timeAgo(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-line px-4 pb-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </section>
    </div>
  );
}

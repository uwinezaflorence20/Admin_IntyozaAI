import { useEffect, useMemo, useState } from "react";
import { TbSearch, TbUsers, TbUserShield, TbSpy } from "react-icons/tb";
import { getUsers } from "@/lib/api";
import { AGE_BAND_LABELS } from "@/lib/labels";
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

const ROLE_TAG: Record<Role, string> = { ADMIN: "tag-brand", MODERATOR: "tag-teal", USER: "" };
const initials = (alias: string | null) => (alias ? alias.split(" ").map((w) => w[0]).slice(0, 2).join("") : "?");

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((error) => setLoadError(errorMessage(error, "Could not load users")));
  }, []);

  const visible = useMemo(() => {
    if (!users) return [];
    const test = FILTERS.find((f) => f.id === filter)!.test;
    const q = query.trim().toLowerCase();
    return users.filter((u) => test(u) && (!q || [u.alias, u.email].some((v) => v?.toLowerCase().includes(q))));
  }, [users, filter, query]);

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

        {rows.length === 0 ? (
          <EmptyState icon={TbUsers} title={users.length ? "No users found" : "No users yet"} text={users.length ? "Try another search or filter." : "Registered people will appear here."} />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Person</th>
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
                          <p className="m-0 font-semibold whitespace-nowrap">{u.alias || "—"}</p>
                          <p className="m-0 text-[0.8rem] whitespace-nowrap text-muted">
                            {isAnonymous(u) ? <span className="inline-flex items-center gap-1"><TbSpy size={13} /> Anonymous</span> : u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">{(u.ageBand && AGE_BAND_LABELS[u.ageBand]) || "—"}</td>
                    <td className="whitespace-nowrap">{u.district || "—"}</td>
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

      <p className="m-0 text-[0.82rem] text-muted">
        Role changes and account deletion aren’t available yet — the backend has no endpoint for them.
      </p>
    </div>
  );
}

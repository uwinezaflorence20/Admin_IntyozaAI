import { useEffect, useMemo, useState } from "react";
import { TbSearch, TbTrash, TbUsers, TbUserShield, TbSpy, TbLoader2 } from "react-icons/tb";
import { toast } from "sonner";
import { deleteUser, getUsers, updateUserRole } from "@/lib/api";
import { AGE_BAND_LABELS, LANGUAGE_LABELS } from "@/data/sampleData";
import { PageHeader, StatCard, Loading, EmptyState, Dialog } from "@/components/admin/parts";
import Pagination from "@/components/shared/Pagination";
import { errorMessage, timeAgo } from "@/lib/utils";
import type { Role, User } from "@/types";

const PAGE_SIZE = 10;

const FILTERS: { id: string; label: string; test: (u: User) => boolean }[] = [
  { id: "all", label: "Everyone", test: () => true },
  { id: "anonymous", label: "Anonymous", test: (u) => !!u.isAnonymous },
  { id: "account", label: "With account", test: (u) => !u.isAnonymous },
  { id: "staff", label: "Moderators & admins", test: (u) => u.role !== "USER" },
];

const ROLE_TAG: Record<Role, string> = { ADMIN: "tag-brand", MODERATOR: "tag-teal", USER: "" };

export default function UsersPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [sample, setSample] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getUsers()
      .then(({ data, sample }) => {
        setUsers(data);
        setSample(sample);
      })
      .catch((error) => toast.error(errorMessage(error, "Could not load users")));
  }, []);

  const visible = useMemo(() => {
    if (!users) return [];
    const test = FILTERS.find((f) => f.id === filter)!.test;
    const q = query.trim().toLowerCase();
    return users.filter((u) => test(u) && (!q || [u.alias, u.email, u.phone].some((v) => v?.toLowerCase().includes(q))));
  }, [users, filter, query]);

  if (!users) return <Loading label="Loading users…" />;

  const totalPages = Math.ceil(visible.length / PAGE_SIZE);
  const rows = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const changeRole = async (user: User, role: Role) => {
    try {
      if (!sample) await updateUserRole(user.id, role);
      setUsers((list) => list!.map((u) => (u.id === user.id ? { ...u, role } : u)));
      toast.success(`${user.alias} is now ${role.toLowerCase()}`);
    } catch (error) {
      toast.error(errorMessage(error, "Could not change the role"));
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      if (!sample) await deleteUser(toDelete.id);
      setUsers((list) => list!.filter((u) => u.id !== toDelete.id));
      toast.success(`${toDelete.alias} and their data were deleted`);
      setToDelete(null);
    } catch (error) {
      toast.error(errorMessage(error, "Could not delete this user"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Users"
        description="Most people use Intyoza anonymously. You see their alias, never their conversations."
        sample={sample}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={TbUsers} tone="brand" label="Total" value={users.length.toLocaleString("en-GB")} />
        <StatCard icon={TbSpy} tone="lavender" label="Anonymous" value={users.filter((u) => u.isAnonymous).length} />
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
              placeholder="Search alias, email or phone"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="chip-row" role="group" aria-label="Filter users">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className="chip min-h-9"
                aria-pressed={filter === f.id}
                onClick={() => {
                  setFilter(f.id);
                  setPage(1);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={TbUsers} title="No users found" text="Try another search or filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Age group</th>
                  <th>Language</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-[0.8rem] font-bold text-brand">
                          {u.alias?.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                        </span>
                        <div className="min-w-0">
                          <p className="m-0 font-semibold whitespace-nowrap">{u.alias || "—"}</p>
                          <p className="m-0 text-[0.8rem] whitespace-nowrap text-muted">
                            {u.isAnonymous ? (
                              <span className="inline-flex items-center gap-1"><TbSpy size={13} /> Anonymous</span>
                            ) : (
                              u.email || u.phone || "Account"
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">{(u.ageBand && AGE_BAND_LABELS[u.ageBand]) || "—"}</td>
                    <td className="whitespace-nowrap">{LANGUAGE_LABELS[u.language] || u.language}</td>
                    <td>
                      <span className={`tag ${ROLE_TAG[u.role]} capitalize`}>{u.role.toLowerCase()}</span>
                    </td>
                    <td className="whitespace-nowrap text-muted">{timeAgo(u.createdAt)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <label className="sr-only" htmlFor={`role-${u.id}`}>Role for {u.alias}</label>
                        <select
                          id={`role-${u.id}`}
                          className="select min-h-9 w-auto rounded-full py-1 text-[0.85rem]"
                          value={u.role}
                          onChange={(e) => changeRole(u, e.target.value as Role)}
                        >
                          <option value="USER">User</option>
                          <option value="MODERATOR">Moderator</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <button
                          type="button"
                          className="icon-btn text-danger hover:bg-danger-soft"
                          aria-label={`Delete ${u.alias}`}
                          title="Delete user"
                          onClick={() => setToDelete(u)}
                        >
                          <TbTrash size={17} />
                        </button>
                      </div>
                    </td>
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

      <Dialog open={!!toDelete} onClose={() => !deleting && setToDelete(null)} title="Delete this user?">
        <p className="mb-6 text-muted">
          <strong className="text-fg">{toDelete?.alias}</strong> and everything linked to them (consents, posts, saved chats)
          will be removed. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn btn-ghost flex-1" onClick={() => setToDelete(null)} disabled={deleting}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger flex-1" onClick={confirmDelete} disabled={deleting}>
            {deleting && <TbLoader2 className="animate-spin" size={18} />} Delete
          </button>
        </div>
      </Dialog>
    </div>
  );
}

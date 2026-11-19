import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import type { IconType } from "react-icons";
import {
  TbBook, TbBuildingHospital, TbCategory, TbHelpCircle, TbLayoutDashboard, TbLoader2, TbMessages, TbPhoneCall, TbSearch, TbUser, TbUsers,
} from "react-icons/tb";
import { getArticles, getCategories, getFacilities, getMyths, getSpaces, getUsers } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Result {
  id: string;
  group: string;
  icon: IconType;
  label: string;
  hint?: string;
  href: string;
}

const PAGES: Result[] = [
  { id: "p-dashboard", group: "Pages", icon: TbLayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { id: "p-users", group: "Pages", icon: TbUsers, label: "Users", href: "/admin/users" },
  { id: "p-community", group: "Pages", icon: TbMessages, label: "Safe Space", hint: "Reports and spaces", href: "/admin/safe-space" },
  { id: "p-learning", group: "Pages", icon: TbBook, label: "Learning", hint: "Categories and articles", href: "/admin/learning" },
  { id: "p-myths", group: "Pages", icon: TbHelpCircle, label: "Myths", hint: "Myth Buster", href: "/admin/myths" },
  { id: "p-services", group: "Pages", icon: TbBuildingHospital, label: "Services", hint: "Health facilities", href: "/admin/services" },
  { id: "p-referrals", group: "Pages", icon: TbPhoneCall, label: "Referrals", href: "/admin/referrals" },
  { id: "p-profile", group: "Pages", icon: TbUser, label: "Profile", href: "/admin/profile" },
];

const PER_GROUP = 5;

/** Loads everything searchable once. A list that fails to load is left out rather than failing the search. */
async function loadIndex(): Promise<Result[]> {
  const settle = <T,>(p: Promise<T[]>) => p.catch(() => [] as T[]);
  const [users, spaces, articles, categories, myths, facilities] = await Promise.all([
    settle(getUsers()), settle(getSpaces()), settle(getArticles()), settle(getCategories()), settle(getMyths()), settle(getFacilities()),
  ]);
  const categoryName = new Map(categories.map((c) => [c.id, c.nameEn]));
  return [
    ...users.map((u) => ({
      id: `u-${u.id}`, group: "Users", icon: TbUsers, label: u.alias || u.email || "Unnamed user",
      hint: [u.email, u.district].filter(Boolean).join(" · "), href: `/admin/users?q=${encodeURIComponent(u.alias || u.email || "")}`,
    })),
    ...spaces.map((s) => ({
      id: `s-${s.id}`, group: "Safe Space groups", icon: TbMessages, label: s.name, hint: s.description, href: `/admin/safe-space/${s.id}`,
    })),
    ...articles.map((a) => ({
      id: `a-${a.id}`, group: "Articles", icon: TbBook, label: a.title, hint: categoryName.get(a.categoryId), href: `/admin/learning/${a.categoryId}/${a.id}`,
    })),
    ...categories.map((c) => ({
      id: `c-${c.id}`, group: "Categories", icon: TbCategory, label: c.nameEn, hint: c.nameRw, href: `/admin/learning/${c.id}`,
    })),
    ...myths.map((m) => ({
      id: `m-${m.id}`, group: "Myths", icon: TbHelpCircle, label: m.mythText, hint: m.factText, href: "/admin/myths",
    })),
    ...facilities.map((f) => ({
      id: `f-${f.id}`, group: "Facilities", icon: TbBuildingHospital, label: f.name,
      hint: [f.district, f.sector].filter(Boolean).join(" · "), href: "/admin/services",
    })),
  ];
}

/** Header search across pages and console data. Ctrl+K (or ⌘K) focuses it. */
export function HeaderSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<Result[] | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const loading = useRef(false);

  const ensureIndex = () => {
    if (index || loading.current) return;
    loading.current = true;
    loadIndex()
      .then(setIndex)
      .finally(() => {
        loading.current = false;
      });
  };

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const matches = (r: Result) => r.label.toLowerCase().includes(q) || !!r.hint?.toLowerCase().includes(q);
    const all = [...PAGES, ...(index ?? [])].filter(matches);
    // Keep each group short, in the order the groups first appear.
    const counts = new Map<string, number>();
    return all.filter((r) => {
      const n = counts.get(r.group) ?? 0;
      counts.set(r.group, n + 1);
      return n < PER_GROUP;
    });
  }, [query, index]);

  const go = (result: Result) => {
    navigate(result.href);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showPanel = open && query.trim().length > 0;
  let lastGroup = "";

  return (
    <div className="relative w-full max-w-md" ref={boxRef}>
      <TbSearch className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" size={18} />
      <label htmlFor="header-search" className="sr-only">Search the console</label>
      <input
        ref={inputRef}
        id="header-search"
        type="search"
        autoComplete="off"
        placeholder="Search users, spaces, articles…"
        className="input h-10 rounded-full pr-14 pl-10"
        value={query}
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="header-search-results"
        aria-activedescendant={showPanel && results[active] ? `hs-${results[active].id}` : undefined}
        onFocus={() => {
          ensureIndex();
          setOpen(true);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border border-line px-1.5 text-[0.7rem] text-muted sm:block">
        Ctrl K
      </kbd>

      {showPanel && (
        <div
          id="header-search-results"
          role="listbox"
          className="absolute top-full right-0 left-0 z-50 mt-2 max-h-[65vh] overflow-y-auto rounded-[14px] border border-line bg-surface py-1 shadow-card"
        >
          {!index && (
            <p className="m-0 flex items-center gap-2 px-4 py-2 text-[0.8rem] text-muted">
              <TbLoader2 className="animate-spin text-brand" size={15} /> Loading console data…
            </p>
          )}
          {results.length === 0 && index && <p className="m-0 px-4 py-5 text-center text-[0.88rem] text-muted">No results for “{query.trim()}”</p>}
          {results.map((r, i) => {
            const heading = r.group !== lastGroup ? r.group : null;
            lastGroup = r.group;
            return (
              <div key={r.id}>
                {heading && <p className="m-0 px-4 pt-2.5 pb-1 text-[0.72rem] font-semibold tracking-[0.06em] text-muted uppercase">{heading}</p>}
                <button
                  type="button"
                  id={`hs-${r.id}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r)}
                  className={cn("flex w-full items-center gap-3 px-4 py-2 text-left", i === active && "bg-surface-2")}
                >
                  <r.icon size={17} className="shrink-0 text-brand" />
                  <span className="min-w-0">
                    <span className="block truncate text-[0.9rem] font-medium">{r.label}</span>
                    {r.hint && <span className="block truncate text-[0.78rem] text-muted">{r.hint}</span>}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

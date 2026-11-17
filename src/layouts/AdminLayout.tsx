import { useState, useRef, useEffect } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import {
  TbLayoutDashboard, TbUsers, TbMessages, TbBook, TbMapPin, TbPhoneCall,
  TbLogout, TbMenu2, TbX, TbUser, TbChevronDown, TbShieldLock, TbLoader2,
} from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getSession, logout } from '@/lib/api';
import { Brand } from '@/components/Brand';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Dialog } from '@/components/admin/parts';
import { HeaderSearch } from '@/components/admin/HeaderSearch';
import { Notifications } from '@/components/admin/Notifications';
import type { User } from '@/types';

const MENU = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: TbLayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: TbUsers },
  { name: 'Community', href: '/admin/community', icon: TbMessages },
  { name: 'Learning', href: '/admin/learning', icon: TbBook },
  { name: 'Services', href: '/admin/services', icon: TbMapPin },
  { name: 'Referrals', href: '/admin/referrals', icon: TbPhoneCall },
  { name: 'Profile', href: '/admin/profile', icon: TbUser },
];

const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'A';

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    // Links run to the panel's right edge so the hover/current tab can flow into the page (see .side-link).
    <nav aria-label="Admin" className="flex flex-col gap-2 pl-4">
      {MENU.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className="side-link group"
          >
            <item.icon size={20} className={active ? 'text-accent' : 'group-hover:text-brand'} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

function PrivacyNote() {
  return (
    // Hidden on short screens so the menu fits without scrolling.
    <div className="mx-4 rounded-[14px] bg-white/10 p-3.5 text-[0.8rem] text-white/80 [@media(max-height:760px)]:hidden">
      <strong className="mb-1 flex items-center gap-1.5 text-white">
        <TbShieldLock size={16} /> Privacy first
      </strong>
      Admins see aliases and totals, never chat messages. Handle every report with care.
    </div>
  );
}

/** The purple sidebar body, shared by the desktop panel and the mobile drawer. */
function SidebarBody({ pathname, onNavigate, onLogout }: { pathname: string; onNavigate?: () => void; onLogout: () => void }) {
  return (
    <>
      <div className="flex-1 py-6">
        <NavLinks pathname={pathname} onNavigate={onNavigate} />
      </div>
      <div className="space-y-3 pt-3 pb-6">
        <PrivacyNote />
        <div className="pl-4">
          <button type="button" onClick={onLogout} className="side-link group w-full cursor-pointer">
            <TbLogout size={20} className="group-hover:text-danger" /> Log out
          </button>
        </div>
      </div>
    </>
  );
}

const isAdmin = (user?: User | null) => user?.role === 'ADMIN';

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<User | null>(() => getSession()?.user ?? null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    const refreshUser = () => setUser(getSession()?.user ?? null);
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('profileUpdated', refreshUser);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('profileUpdated', refreshUser);
    };
  }, []);

  // Auth guard: re-checked on every route change, since the layout re-renders with the location.
  if (!isAdmin(getSession()?.user) || !user) return <Navigate to="/admin/login" replace />;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const displayName = user.alias || user.name || 'Admin';
  const current = MENU.find((m) => pathname.startsWith(m.href));

  return (
    <div className="flex min-h-screen bg-bg">
      <a
        href="#main"
        className="absolute top-2 -left-[9999px] z-[130] rounded-lg bg-brand px-3.5 py-2 text-on-brand focus:left-2"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
        <aside className="flex h-full flex-col rounded-r-[28px] bg-auth-panel text-white">
          <div className="flex flex-col items-center gap-2 px-5 pt-7 pb-4">
            <Link to="/admin/dashboard" aria-label="Intyoza admin home" className="rounded-[14px] bg-white px-3 py-2">
              <img src="/logo.png" width={305} height={127} alt="Intyoza" className="h-8 w-auto" />
            </Link>
            <span className="text-[0.72rem] font-semibold tracking-[0.08em] text-white/70 uppercase">Admin console</span>
          </div>
          <SidebarBody pathname={pathname} onLogout={() => setShowLogoutModal(true)} />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-md">
          <div className="flex h-[72px] items-center gap-3 px-4 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="icon-btn lg:hidden"
              aria-label="Open menu"
            >
              <TbMenu2 size={20} />
            </button>
            <div className="lg:hidden">
              <Brand className="h-8 w-auto" />
            </div>
            <p className="m-0 hidden shrink-0 text-[0.9rem] text-muted xl:block">
              Intyoza admin <span aria-hidden="true">/</span>{' '}
              <span className="font-semibold text-fg">{current?.name || 'Overview'}</span>
            </p>

            <div className="hidden min-w-0 flex-1 justify-center md:flex">
              <HeaderSearch />
            </div>

            <div className="ml-auto flex items-center gap-2.5">
              <Notifications />
              <ThemeToggle />
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pr-3 pl-1 transition hover:bg-surface-2"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-brand text-[0.8rem] font-bold text-on-brand">
                    {initialsOf(displayName)}
                  </span>
                  <span className="hidden max-w-40 truncate text-[0.9rem] font-semibold md:block">{displayName}</span>
                  <TbChevronDown size={16} className={cn('text-muted transition-transform', profileOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 z-50 mt-2 w-60 overflow-hidden rounded-[14px] border border-line bg-surface shadow-card"
                    >
                      <div className="border-b border-line px-4 py-3">
                        <p className="m-0 truncate font-semibold">{displayName}</p>
                        <p className="m-0 truncate text-[0.8rem] text-muted">{user.email || 'Administrator'}</p>
                      </div>
                      <Link
                        to="/admin/profile"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-[0.92rem] no-underline hover:bg-surface-2"
                      >
                        <TbUser size={18} className="text-brand" /> Profile & password
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setProfileOpen(false);
                          setShowLogoutModal(true);
                        }}
                        className="flex w-full items-center gap-3 border-t border-line px-4 py-3 text-[0.92rem] text-danger hover:bg-danger-soft"
                      >
                        <TbLogout size={18} /> Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main id="main" className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1160px]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-[101] flex w-72 flex-col rounded-r-[28px] bg-auth-panel text-white shadow-card lg:hidden"
            >
              <div className="flex h-[72px] items-center justify-between px-5">
                <span className="rounded-[12px] bg-white px-2.5 py-1.5">
                  <img src="/logo.png" width={305} height={127} alt="Intyoza" className="h-7 w-auto" />
                </span>
                <button
                  type="button"
                  className="grid size-[38px] place-items-center rounded-full text-white hover:bg-white/10"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close menu"
                >
                  <TbX size={20} />
                </button>
              </div>
              <SidebarBody
                pathname={pathname}
                onNavigate={() => setSidebarOpen(false)}
                onLogout={() => setShowLogoutModal(true)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <Dialog open={showLogoutModal} onClose={() => !isLoggingOut && setShowLogoutModal(false)} title="Log out?">
        <p className="mb-6 text-muted">You will need to sign in again to use the Intyoza admin console.</p>
        <div className="flex gap-3">
          <button
            type="button"
            className="btn btn-ghost flex-1"
            onClick={() => setShowLogoutModal(false)}
            disabled={isLoggingOut}
          >
            Cancel
          </button>
          <button type="button" className="btn btn-danger flex-1" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut && <TbLoader2 className="animate-spin" size={18} />}
            {isLoggingOut ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      </Dialog>
    </div>
  );
}

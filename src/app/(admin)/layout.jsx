'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  TbLayoutDashboard, TbUsers, TbSparkles, TbMessages, TbBook, TbMapPin,
  TbLogout, TbMenu2, TbX, TbUser, TbChevronDown, TbShieldLock, TbLoader2,
} from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getSession, logout } from '@/lib/api';
import { Brand } from '@/components/Brand';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Dialog } from '@/components/admin/parts';

const AUTH_PAGES = ['/admin/login', '/admin/forgot-password'];

const MENU = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: TbLayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: TbUsers },
  { name: 'AI Safety', href: '/admin/ai-safety', icon: TbSparkles },
  { name: 'Community', href: '/admin/community', icon: TbMessages },
  { name: 'Learning', href: '/admin/learning', icon: TbBook },
  { name: 'Services', href: '/admin/services', icon: TbMapPin },
  { name: 'Profile', href: '/admin/profile', icon: TbUser },
];

const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'A';

function NavLinks({ pathname, onNavigate }) {
  return (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {MENU.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-full px-4 py-2.5 text-[0.95rem] no-underline transition',
              active ? 'bg-brand-soft font-semibold text-brand' : 'font-medium text-fg hover:bg-surface-2'
            )}
          >
            <item.icon size={20} className={active ? 'text-brand' : 'text-muted'} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

function PrivacyNote() {
  return (
    <div className="rounded-[14px] bg-teal-soft p-3.5 text-[0.82rem] text-fg">
      <strong className="mb-1 flex items-center gap-1.5 text-teal-text">
        <TbShieldLock size={16} /> Privacy first
      </strong>
      Admins see aliases and totals, never chat messages. Handle every report with care.
    </div>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  const isAuthPage = AUTH_PAGES.includes(pathname) || pathname.startsWith('/admin/reset-password');

  // Auth guard — runs on every route change
  useEffect(() => {
    if (isAuthPage) return;
    const session = getSession();
    if (!session || session.user?.role !== 'ADMIN') {
      router.replace('/admin/login');
      return;
    }
    const t = setTimeout(() => setUser(session.user), 0);
    return () => clearTimeout(t);
  }, [isAuthPage, pathname, router]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setProfileOpen(false);
    };
    const refreshUser = () => setUser(getSession()?.user ?? null);
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('profileUpdated', refreshUser);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('profileUpdated', refreshUser);
    };
  }, []);

  if (isAuthPage) return <>{children}</>;

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <TbLoader2 className="animate-spin text-brand" size={32} aria-label="Loading" />
      </div>
    );
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.replace('/admin/login');
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
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-[72px] items-center px-5">
          <Link href="/admin/dashboard" aria-label="Intyoza admin home">
            <Brand className="h-10 w-auto" />
          </Link>
        </div>
        <div className="px-5 pb-2">
          <span className="tag tag-brand">Admin console</span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <NavLinks pathname={pathname} />
        </div>
        <div className="space-y-3 border-t border-line p-4">
          <PrivacyNote />
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 font-medium text-danger transition hover:bg-danger-soft"
          >
            <TbLogout size={20} /> Log out
          </button>
        </div>
      </aside>

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
            <p className="m-0 hidden text-[0.9rem] text-muted lg:block">
              Intyoza admin <span aria-hidden="true">/</span>{' '}
              <span className="font-semibold text-fg">{current?.name || 'Overview'}</span>
            </p>

            <div className="ml-auto flex items-center gap-2.5">
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
                        href="/admin/profile"
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
          <div className="mx-auto max-w-[1160px]">{children}</div>
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
              className="fixed inset-y-0 left-0 z-[101] flex w-72 flex-col bg-surface shadow-card lg:hidden"
            >
              <div className="flex h-[72px] items-center justify-between px-5">
                <Brand className="h-9 w-auto" />
                <button type="button" className="icon-btn" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
                  <TbX size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-3">
                <NavLinks pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
              </div>
              <div className="space-y-3 border-t border-line p-4">
                <PrivacyNote />
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 font-medium text-danger hover:bg-danger-soft"
                >
                  <TbLogout size={20} /> Log out
                </button>
              </div>
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

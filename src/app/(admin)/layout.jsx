'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  TbLayoutDashboard, TbUsers,
  TbLogout, TbMenu2, TbX, TbUser, TbChevronDown, TbChartHistogram, TbInbox, TbLeaf
} from 'react-icons/tb';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { logout as logoutApi, getMe } from '@/lib/api';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userInitials, setUserInitials] = useState('');
  const dropdownRef = useRef(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const isAuthPage =
    pathname === '/admin/login' ||
    pathname === '/login' ||
    pathname === '/admin/forgot-password' ||
    pathname.startsWith('/admin/reset-password');

  // Auth guard — runs on every route change
  useEffect(() => {
    if (isAuthPage) return; // auth pages bypass the loading screen via early return below

    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.Role !== 'Admin') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/admin/login');
        return;
      }
    } catch {
      localStorage.removeItem('token');
      router.replace('/admin/login');
      return;
    }

    const t = setTimeout(() => setAuthReady(true), 0);
    return () => clearTimeout(t);
  }, [isAuthPage, router]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);

    // Fetch admin info from API, fall back to localStorage
    const loadAdminInfo = async () => {
      // Immediate fallback from stored user object
      try {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        const fallbackName = `${stored.FirstName || ''} ${stored.LastName || ''}`.trim() || stored.name || '';
        if (fallbackName) {
          setUserName(fallbackName);
          setUserEmail(stored.Email || stored.email || '');
          setUserInitials(fallbackName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase());
        }
      } catch {}

      // Then fetch fresh data from API
      try {
        const res = await getMe();
        const u = res?.data || res?.user || res;
        const fullName = `${u.FirstName || ''} ${u.LastName || ''}`.trim();
        if (fullName) {
          setUserName(fullName);
          setUserEmail(u.Email || '');
          setUserInitials(fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase());
        }
      } catch {}
    };

    loadAdminInfo();
    window.addEventListener('profileUpdated', loadAdminInfo);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('profileUpdated', loadAdminInfo);
    };
  }, []);

  if (isAuthPage) return <>{children}</>;

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutApi();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('name');
      router.replace('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const menuItems = [
    { name: 'Dashboard',        href: '/admin/dashboard',        icon: TbLayoutDashboard },
    { name: 'Users',            href: '/admin/users',            icon: TbUsers           },
    { name: 'Predictions',      href: '/admin/predictions',      icon: TbLeaf            },
    { name: 'Contacts',         href: '/admin/contacts',         icon: TbInbox           },
    { name: 'Model Performance',href: '/admin/model-performance',icon: TbChartHistogram  },
    { name: 'Profile',          href: '/admin/profile',          icon: TbUser            },
  ];

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col bg-primary text-white sticky top-0 h-screen shadow-2xl">
        <div className="p-6 border-b border-white/5">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image src="/icon.png" alt="AgriWatch" width={38} height={38} className="rounded-xl" />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tighter text-white">AGRIWATCH</span>
              <span className="text-[10px] font-medium tracking-[0.2em] text-white/60 uppercase -mt-0.5">AI Detection System</span>
            </div>
          </Link>
        </div>

        <nav className="flex-grow p-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all group',
                pathname === item.href
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon
                size={22}
                className={cn(
                  'transition-colors',
                  pathname === item.href ? 'text-white' : 'group-hover:text-white'
                )}
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all group"
          >
            <TbLogout size={22} className="group-hover:translate-x-0.5 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-grow flex flex-col min-w-0">
        <header className="h-16 lg:h-20 bg-white border-b border-border sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-primary">
              <TbMenu2 size={24} />
            </button>
            <h1 className="text-lg lg:text-xl font-bold text-primary">
              {menuItems.find((m) => m.href === pathname)?.name || 'Admin Panel'}
            </h1>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 hover:bg-muted/40 rounded-xl px-3 py-2 transition-all"
            >
              <div className="hidden md:flex flex-col items-end mr-1">
                <span className="text-sm font-bold text-primary leading-none">{userName || 'Admin'}</span>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate max-w-40">{userEmail || 'Administrator'}</span>
              </div>
              <div className="w-10 h-10 lg:w-11 lg:h-11 bg-accent rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                <span className="text-white font-bold text-sm">{userInitials}</span>
              </div>
              <TbChevronDown
                size={16}
                className={cn('text-muted-foreground transition-transform duration-200', profileOpen && 'rotate-180')}
              />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-border z-50 overflow-hidden"
                >
                  <Link
                    href="/admin/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-muted/40 transition-colors"
                  >
                    <TbUser size={18} className="text-accent" />
                    <span className="font-semibold">Profile</span>
                  </Link>
                  <div className="border-t border-border" />
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <TbLogout size={18} />
                    <span className="font-semibold">Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="p-4 lg:p-8 flex-grow">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-72 bg-primary text-white z-[101] shadow-2xl lg:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Image src="/icon.png" alt="AgriWatch" width={34} height={34} className="rounded-xl" />
                  <span className="text-xl font-bold tracking-tighter">AGRIWATCH</span>
                </div>
                <button onClick={() => setSidebarOpen(false)}>
                  <TbX size={24} />
                </button>
              </div>
              <nav className="flex-grow p-4 space-y-2 mt-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                      pathname === item.href ? 'bg-white/20' : 'hover:bg-white/10'
                    )}
                  >
                    <item.icon size={22} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all group"
                >
                  <TbLogout size={22} className="group-hover:translate-x-0.5 transition-transform" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative overflow-hidden"
            >
              <h3 className="text-2xl font-bold text-primary mb-3">Confirm Logout</h3>
              <p className="text-muted-foreground mb-8">
                Are you sure you want to log out? You will need to sign in again to access the admin portal.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  className="flex-1 py-3 border border-border rounded-xl font-bold text-muted-foreground hover:bg-muted/40 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    'Confirm Logout'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

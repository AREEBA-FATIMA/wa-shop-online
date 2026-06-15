'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MessageCircle, Package, ShoppingBag, BarChart3, Settings, LogOut, Wifi, WifiOff, Menu, Home, Radio, RefreshCw, ChevronRight, X, Crown, Bell } from 'lucide-react';
import api, { removeToken } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

const NAV = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/chats', icon: MessageCircle, label: 'Chats' },
  { href: '/dashboard/products', icon: Package, label: 'Products' },
  { href: '/dashboard/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/dashboard/status', icon: Radio, label: 'Status' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/subscription', icon: Crown, label: 'Subscription' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

const BOTTOM_NAV = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/status', icon: Radio, label: 'Status' },
  { href: '/dashboard/products', icon: Package, label: 'Products' },
  { href: '/dashboard/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/dashboard/subscription', icon: Crown, label: 'Subscribe' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [waConnected, setWaConnected] = useState(false);
  const [waLoading, setWaLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [waAlert, setWaAlert] = useState(false);
  const [logoutTimer, setLogoutTimer] = useState(30 * 60); // 30 min in seconds
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activityRef = useRef(0);

  const WA_URL = process.env.NEXT_PUBLIC_WA_URL || process.env.NEXT_PUBLIC_API_URL || '';

  // Reset logout timer on activity
  const resetTimer = useCallback(() => {
    activityRef.current = Date.now();
    setLogoutTimer(30 * 60);
  }, []);

  // Auto-logout after 30 min of inactivity
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    timerRef.current = setInterval(() => {
      const elapsed = Math.round((Date.now() - activityRef.current) / 1000);
      const remaining = Math.max(0, 30 * 60 - elapsed);
      setLogoutTimer(remaining);
      if (remaining <= 0) {
        removeToken();
        router.push('/auth/login');
      }
    }, 1000);
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const u = localStorage.getItem('wa_user');
    if (!u) { router.push('/auth/login'); return; }
    const parsed = JSON.parse(u);
    setUser(parsed);
    async function checkWA() {
      try {
        const r = await fetch(`${WA_URL}/wa/status/${parsed.id}`);
        const d = await r.json();
        setWaConnected(!!d.connected);
      } catch { setWaConnected(false); }
    }
    checkWA();
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`${WA_URL}/wa/status/${parsed.id}`);
        const d = await r.json();
        setWaConnected(!!d.connected);
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // WA connect alert polling
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const r = await api.get('/api/auth/wa-alert');
        if (r.data?.alert) setWaAlert(true);
      } catch {}
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [path]);

  function logout() { removeToken(); router.push('/'); }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm animate-fade-in" onClick={() => setSidebarOpen(false)} />}

      {/* ─── Sidebar ─── */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-30 w-64 flex flex-col transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ background: 'var(--bg2)', borderRight: '0.5px solid var(--border)' }}>
        
        {/* Logo + close */}
        <div className="h-16 flex items-center px-5 gap-3" style={{ borderBottom: '0.5px solid var(--border)' }}>
          <span className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--green-gradient)' }}>
            <MessageCircle size={16} className="text-white" />
          </span>
          <span className="brand font-bold text-lg" style={{ color: 'var(--text)' }}>WA<span className="gradient-text-green">SHOP</span></span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto p-1" style={{ color: 'var(--text3)' }}><X size={18} /></button>
        </div>

        {/* User card */}
        <div className="mx-3 mt-3 p-3 rounded-xl flex items-center gap-3" style={{ background: 'var(--bg3)' }}>
          <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{user?.name || 'User'}</p>
            <p className="text-xs capitalize" style={{ color: 'var(--text3)' }}>{user?.plan || 'free'} plan</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Link href="/connect-wa" className="relative">
              <span className={`w-2 h-2 rounded-full block ${waLoading ? 'animate-pulse' : ''}`} style={{ background: waConnected ? 'var(--green)' : '#e05a5a' }} />
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-3 pb-2 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold tracking-widest px-3 mb-2 uppercase" style={{ color: 'var(--text3)' }}>Menu</p>
          {NAV.map(n => {
            const active = path === n.href;
            return (
              <Link key={n.href} href={n.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${active ? '' : 'hover:opacity-80'}`}
                style={{ background: active ? 'var(--green-dim)' : 'transparent', color: active ? 'var(--green)' : 'var(--text2)' }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: active ? 'var(--green)' : 'var(--bg3)', color: active ? '#fff' : 'var(--text3)' }}>
                  <n.icon size={15} strokeWidth={active ? 2.5 : 1.8} />
                </span>
                <span className="flex-1">{n.label}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }} />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 space-y-1.5" style={{ borderTop: '0.5px solid var(--border)' }}>
          <Link href="/connect-wa"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: waConnected ? 'var(--green-dim)' : 'rgba(220,50,50,0.08)',
              color: waConnected ? 'var(--green)' : '#e05a5a',
            }}>
            {waLoading ? (
              <><RefreshCw size={14} className="animate-spin" />Reconnecting...</>
            ) : waConnected ? (
              <><span className="w-2 h-2 rounded-full" style={{ background: 'var(--green)' }} /><Wifi size={14} />WhatsApp Connected</>
            ) : (
              <><WifiOff size={14} />Connect WhatsApp</>
            )}
            <ChevronRight size={14} className="ml-auto" />
          </Link>
          <button onClick={logout} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-medium transition-all hover:opacity-70" style={{ color: '#e05a5a' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="flex-1 flex flex-col min-w-0 pb-[60px] md:pb-0">
        {/* Mobile top bar */}
        <header className="md:hidden h-14 flex items-center px-4 gap-3 sticky top-0 z-10" style={{ background: 'var(--bg2)', borderBottom: '0.5px solid var(--border)' }}>
          <button onClick={() => setSidebarOpen(true)} className="p-1 -ml-1" style={{ color: 'var(--text2)' }}><Menu size={20} /></button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--green-gradient)' }}>
              <MessageCircle size={12} className="text-white" />
            </span>
            <span className="brand font-bold text-sm" style={{ color: 'var(--text)' }}>WA<span className="gradient-text-green">SHOP</span></span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/connect-wa"><span className={`w-2 h-2 rounded-full block ${waLoading ? 'animate-pulse' : ''}`} style={{ background: waConnected ? 'var(--green)' : '#e05a5a' }} /></Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {/* WA Alert Banner */}
          {waAlert && (
            <div className="flex items-center gap-3 px-4 py-2.5 text-sm animate-slide-down" style={{ background: 'var(--green-dim)', color: 'var(--green)', borderBottom: '0.5px solid var(--border)' }}>
              <Bell size={16} />
              <span className="flex-1">New WhatsApp session connected — aapka session secure hai</span>
              <button onClick={() => setWaAlert(false)} className="text-xs font-medium px-2.5 py-1 rounded-lg hover:opacity-70" style={{ background: 'var(--green)', color: '#fff' }}>OK</button>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* ─── Bottom Nav ─── */}
      <nav className="bottom-nav md:hidden">
        {BOTTOM_NAV.map(n => {
          const active = path === n.href || (n.href !== '/dashboard' && path.startsWith(n.href));
          return (
            <Link key={n.href} href={n.href} className={active ? 'active' : ''}>
              <n.icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span>{n.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

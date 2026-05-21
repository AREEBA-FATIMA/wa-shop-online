'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MessageCircle, Package, ShoppingBag, BarChart3, Settings, LogOut, Wifi, WifiOff, Menu, Home, Radio, RefreshCw } from 'lucide-react';
import { removeToken } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

const NAV = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/chats', icon: MessageCircle, label: 'Chats' },
  { href: '/dashboard/products', icon: Package, label: 'Products' },
  { href: '/dashboard/status', icon: Radio, label: 'Status Post' },
  { href: '/dashboard/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [waConnected, setWaConnected] = useState(false);
  const [waLoading, setWaLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const WA_URL = process.env.NEXT_PUBLIC_WA_URL || process.env.NEXT_PUBLIC_API_URL || '';

  async function tryReconnectWA(userId: string) {
    setWaLoading(true);
    try {
      // Pehle restart karo (session preserve hoti hai)
      await fetch(`${WA_URL}/wa/restart/${userId}`, { method: 'POST' });
      // 5 sec wait karo reconnect hone ke liye
      await new Promise(r => setTimeout(r, 5000));
      const r = await fetch(`${WA_URL}/wa/status/${userId}`);
      const d = await r.json();
      setWaConnected(!!d.connected);
    } catch (e) {
      setWaConnected(false);
    }
    setWaLoading(false);
  }

  useEffect(() => {
    const u = localStorage.getItem('wa_user');
    if (!u) { router.push('/auth/login'); return; }
    const parsed = JSON.parse(u);
    setUser(parsed);

    async function checkWA() {
      try {
        const r = await fetch(`${WA_URL}/wa/status/${parsed.id}`);
        const d = await r.json();
        if (d.connected) {
          setWaConnected(true);
        } else {
          // Disconnected hai — auto-reconnect try karo
          console.log('[Dashboard] WA disconnected, trying auto-reconnect...');
          await tryReconnectWA(parsed.id);
        }
      } catch (e) {
        // WA service unavailable — 30 sec baad dobara try karega
        setWaConnected(false);
      }
    }

    checkWA();
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`${WA_URL}/wa/status/${parsed.id}`);
        const d = await r.json();
        setWaConnected(!!d.connected);
      } catch (e) {}
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  function logout() { removeToken(); router.push('/'); }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-56 flex flex-col transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ background: 'var(--bg2)', borderRight: '0.5px solid var(--border)' }}>

        {/* Logo */}
        <div className="h-16 flex items-center px-5 gap-2.5" style={{ borderBottom: '0.5px solid var(--border)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--green)' }}>
            <MessageCircle size={14} className="text-white" />
          </div>
          <span className="brand font-bold text-base" style={{ color: 'var(--text)' }}>
            WA-SHOP<span style={{ color: 'var(--green)' }}>.Online</span>
          </span>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-xs font-600 px-3 mb-2 mt-1" style={{ color: 'var(--text3)', letterSpacing: '0.08em' }}>MENU</p>
          {NAV.map(n => {
            const active = path === n.href;
            return (
              <Link key={n.href} href={n.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all ${active ? 'nav-active' : 'hover:opacity-80'}`}
                style={{ color: active ? 'var(--green)' : 'var(--text2)' }}>
                <n.icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 space-y-2" style={{ borderTop: '0.5px solid var(--border)' }}>
          <Link href="/connect-wa"
            className={`flex items-center gap-2 px-3 py-2 rounded-[10px] text-xs font-medium transition-all`}
            style={{
              background: waConnected ? 'var(--green-dim)' : 'rgba(220,50,50,0.08)',
              color: waConnected ? 'var(--green)' : '#e05a5a',
              border: `0.5px solid ${waConnected ? 'rgba(61,186,94,0.2)' : 'rgba(220,50,50,0.2)'}`,
            }}
            onClick={e => {
              if (waLoading) e.preventDefault();
            }}>
            {waLoading ? (
              <><RefreshCw size={13} className="animate-spin" />Reconnecting...</>
            ) : waConnected ? (
              <><span className="dot-live" /><Wifi size={13} />WhatsApp Connected</>
            ) : (
              <><WifiOff size={13} />Connect WhatsApp</>
            )}
          </Link>
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{user?.name || 'User'}</p>
              <p className="text-xs capitalize" style={{ color: 'var(--text3)' }}>{user?.plan || 'free'} plan</p>
            </div>
            <button onClick={logout} className="transition-opacity hover:opacity-70" style={{ color: '#e05a5a' }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="md:hidden h-14 flex items-center px-4 gap-3" style={{ background: 'var(--bg2)', borderBottom: '0.5px solid var(--border)' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--text2)' }}>
            <Menu size={20} />
          </button>
          <span className="brand font-bold text-sm" style={{ color: 'var(--text)' }}>
            WA-SHOP<span style={{ color: 'var(--green)' }}>.Online</span>
          </span>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

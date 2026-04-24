'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MessageCircle, Package, ShoppingBag, BarChart3, Settings, LogOut, Wifi, WifiOff, Menu, Home, Radio } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('wa_user');
    if (!u) { router.push('/auth/login'); return; }
    const parsed = JSON.parse(u);
    setUser(parsed);
    fetch(`http://localhost:8000/api/wa/status/${parsed.id}`)
      .then(r => r.json()).then(d => setWaConnected(d.connected)).catch(() => {});
  }, []);

  function logout() { removeToken(); router.push('/'); }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-60 flex flex-col transition-transform duration-200 border-r
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>

        <div className="h-16 flex items-center px-4 gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center shrink-0">
            <MessageCircle size={16} className="text-white" />
          </div>
          <span className="font-bold" style={{ color: 'var(--text)' }}>
            WA-SHOP<span className="text-[#25D366]">.Online</span>
          </span>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(n => {
            const active = path === n.href;
            return (
              <Link key={n.href} href={n.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active ? 'bg-[#25D366]/15 text-[#25D366]' : 'hover:opacity-80'}`}
                style={{ color: active ? '#25D366' : 'var(--text2)' }}>
                <n.icon size={18} />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
          <Link href="/connect-wa"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all
              ${waConnected ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}>
            {waConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
            {waConnected ? 'WhatsApp Connected' : 'Connect WhatsApp'}
          </Link>
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{user?.name || 'User'}</p>
              <p className="text-xs capitalize" style={{ color: 'var(--text3)' }}>{user?.plan || 'free'} plan</p>
            </div>
            <button onClick={logout} className="text-red-400 hover:text-red-300 transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden h-14 flex items-center px-4 gap-3 border-b"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--text2)' }}>
            <Menu size={20} />
          </button>
          <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>
            WA-SHOP<span className="text-[#25D366]">.Online</span>
          </span>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

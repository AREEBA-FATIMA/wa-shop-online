'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { ShoppingBag, MessageCircle, Package, TrendingUp, ArrowRight, DollarSign, Clock, AlertTriangle, Users, Sparkles } from 'lucide-react';

export default function DashboardHome() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    try { setUserName(JSON.parse(localStorage.getItem('wa_user') || '{}').name || ''); } catch {}
    api.get('/api/analytics').then(r => setStats(r.data)).catch(() => setStats(null)).finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: "Today's Orders", value: stats.today_orders ?? 0, icon: ShoppingBag, color: '#a855f7', bg: 'rgba(168,85,247,0.12)', trend: '+12%' },
    { label: "Today's Revenue", value: `Rs.${(stats.today_revenue ?? 0).toLocaleString()}`, icon: DollarSign, color: '#25D366', bg: 'rgba(37,211,102,0.12)', trend: '+8%' },
    { label: 'Active Chats', value: stats.total_chats ?? 0, icon: MessageCircle, color: '#f472b6', bg: 'rgba(244,114,182,0.12)', trend: '+5%' },
    { label: 'Products', value: stats.total_products ?? 0, icon: Package, color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', trend: '' },
  ] : [];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="brand text-xl font-bold" style={{ color: 'var(--text)' }}>
            {userName ? `Assalam-o-Alaikum, ${userName.split(' ')[0]}!` : 'Dashboard'}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text3)' }}>
            {new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
          <Sparkles size={18} />
        </span>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="rounded-2xl h-28 animate-pulse" style={{ background: 'var(--bg3)' }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {cards.map((c, i) => (
            <div key={i} className="rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s`, background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.bg }}>
                  <c.icon size={18} style={{ color: c.color }} />
                </div>
                {c.trend && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: c.bg, color: c.color }}>{c.trend}</span>}
              </div>
              <p className="brand font-bold text-xl" style={{ color: 'var(--text)' }}>{c.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{c.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Low stock */}
      {stats?.low_stock?.length > 0 && (
        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(234,160,30,0.08)', border: '0.5px solid rgba(234,160,30,0.2)' }}>
          <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(234,160,30,0.15)' }}>
            <AlertTriangle size={16} style={{ color: '#e8a030' }} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold mb-2" style={{ color: '#e8a030' }}>Low Stock Alert</p>
            <div className="flex flex-wrap gap-1.5">
              {stats.low_stock.map((p: any, i: number) => (
                <span key={i} className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ background: 'rgba(234,160,30,0.12)', color: '#e8a030', border: '0.5px solid rgba(234,160,30,0.2)' }}>
                  {p.name} — {p.stock} left{p.ordered ? ` (${p.ordered} ordered)` : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--text3)' }}>Quick Actions</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: '/dashboard/chats', icon: MessageCircle, label: 'Chats', color: '#25D366' },
            { href: '/dashboard/products', icon: Package, label: 'Products', color: '#22d3ee' },
            { href: '/dashboard/orders', icon: ShoppingBag, label: 'Orders', color: '#a855f7' },
          ].map(a => (
            <Link key={a.href} href={a.href} className="rounded-2xl p-4 text-center transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
              <span className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: a.color + '18' }}>
                <a.icon size={18} style={{ color: a.color }} />
              </span>
              <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>{a.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Recent Activity</p>
          <Clock size={14} style={{ color: 'var(--text3)' }} />
        </div>
        <div className="space-y-3">
          {[
            { t: 'New order confirmed', s: 'Rs. 1,200', time: '2 min ago', color: '#25D366' },
            { t: 'Chat replied by AI', s: 'Urdu', time: '15 min ago', color: '#22d3ee' },
            { t: 'Product stock low', s: 'Lawn Shirt', time: '1 hr ago', color: '#e8a030' },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: a.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>{a.t}</p>
                <p className="text-[11px]" style={{ color: 'var(--text3)' }}>{a.s}</p>
              </div>
              <span className="text-[10px] shrink-0" style={{ color: 'var(--text3)' }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

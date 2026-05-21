'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { ShoppingBag, MessageCircle, Package, TrendingUp, AlertTriangle, ArrowRight, DollarSign, Users, Clock } from 'lucide-react';

export default function DashboardHome() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/analytics')
      .then(r => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: "Today's Orders", value: stats.today_orders ?? 0, icon: ShoppingBag, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
    { label: "Today's Revenue", value: `Rs.${(stats.today_revenue ?? 0).toLocaleString()}`, icon: DollarSign, color: 'var(--green)', bg: 'var(--green-dim)' },
    { label: 'Total Chats', value: stats.total_chats ?? 0, icon: MessageCircle, color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
    { label: 'Products', value: stats.total_products ?? 0, icon: Package, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' },
  ] : [];

  const quickLinks = [
    { href: '/dashboard/chats', icon: MessageCircle, title: 'Chats', desc: 'Messages aur AI auto-replies', color: 'var(--green)' },
    { href: '/dashboard/products', icon: Package, title: 'Products', desc: 'Manage inventory & prices', color: '#22d3ee' },
    { href: '/dashboard/orders', icon: ShoppingBag, title: 'Orders', desc: 'Pending & completed orders', color: '#a855f7' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="brand text-xl font-bold" style={{ color: 'var(--text)' }}>Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text3)' }}>Aaj ka overview</p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-2xl h-24 animate-pulse" style={{ background: 'var(--bg3)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {cards.map((c, i) => (
            <div key={i} className="card p-4 animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: c.bg }}>
                <c.icon size={18} style={{ color: c.color }} strokeWidth={2} />
              </div>
              <p className="brand font-bold text-xl md:text-2xl" style={{ color: 'var(--text)' }}>{c.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{c.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Low stock */}
      {stats?.low_stock?.length > 0 && (
        <div className="mb-5 p-4 rounded-2xl" style={{
          background: 'rgba(234,160,30,0.08)',
          border: '0.5px solid rgba(234,160,30,0.2)',
        }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} style={{ color: '#e8a030' }} />
            <span className="text-sm font-semibold" style={{ color: '#e8a030' }}>Low Stock Alert</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.low_stock.map((p: any, i: number) => (
              <span key={i} className="text-xs px-3 py-1 rounded-full" style={{
                background: 'rgba(234,160,30,0.12)',
                color: '#e8a030',
                border: '0.5px solid rgba(234,160,30,0.25)',
              }}>
                {p.name} — {p.stock} baqi
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text3)', letterSpacing: '0.06em' }}>QUICK ACCESS</p>
      <div className="grid md:grid-cols-3 gap-3">
        {quickLinks.map(c => (
          <Link key={c.href} href={c.href}
            className="card p-4 hover:scale-[1.01] active:scale-[0.99] transition-all group"
            style={{ display: 'block' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: c.color + '18' }}>
                <c.icon size={16} style={{ color: c.color }} strokeWidth={2} />
              </div>
              <ArrowRight size={14} style={{ color: 'var(--text3)' }} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{c.title}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

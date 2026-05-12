'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { ShoppingBag, MessageCircle, Package, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

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
    { label: "Aaj ke Orders", value: stats.today_orders, icon: ShoppingBag },
    { label: "Aaj ki Kamai", value: `Rs.${stats.today_revenue?.toLocaleString() || 0}`, icon: TrendingUp },
    { label: "Total Chats", value: stats.total_chats, icon: MessageCircle },
    { label: "Total Products", value: stats.total_products, icon: Package },
  ] : [];

  const quickLinks = [
    { href: '/dashboard/chats', icon: MessageCircle, title: 'Chats', desc: 'Customer messages aur AI replies' },
    { href: '/dashboard/products', icon: Package, title: 'Products', desc: 'Add, edit ya delete products' },
    { href: '/dashboard/orders', icon: ShoppingBag, title: 'Orders', desc: 'Pending aur completed orders' },
  ];

  return (
    <div className="p-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 mt-1">
        <h1 className="brand text-xl font-bold" style={{ color: 'var(--text)' }}>Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text3)' }}>Aaj ki overview</p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="card h-24 animate-pulse" style={{ background: 'var(--bg2)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {cards.map((c, i) => (
            <div key={i} className="card p-4">
              <div className="icon-box mb-3">
                <c.icon size={16} strokeWidth={2} />
              </div>
              <p className="stat-num">{c.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{c.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Low stock */}
      {stats?.low_stock?.length > 0 && (
        <div className="mb-5 p-4 rounded-[14px]" style={{
          background: 'rgba(234,160,30,0.08)',
          border: '0.5px solid rgba(234,160,30,0.2)',
        }}>
          <div className="flex items-center gap-2 mb-2">
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
      <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text3)', letterSpacing: '0.08em' }}>QUICK ACCESS</p>
      <div className="grid md:grid-cols-3 gap-3">
        {quickLinks.map(c => (
          <Link key={c.href} href={c.href}
            className="card p-4 hover:scale-[1.01] active:scale-[0.99] transition-all group"
            style={{ display: 'block' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="icon-box">
                <c.icon size={16} strokeWidth={2} />
              </div>
              <ArrowRight size={14} style={{ color: 'var(--text3)' }} className="group-hover:translate-x-0.5 transition-transform mt-1" />
            </div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{c.title}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

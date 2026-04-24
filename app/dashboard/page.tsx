'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { ShoppingBag, MessageCircle, Package, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react';

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
    { label: "Aaj ke Orders", value: stats.today_orders, icon: ShoppingBag, color: "text-[#25D366]", bg: "bg-[#25D366]/10" },
    { label: "Aaj ki Kamai", value: `Rs.${stats.today_revenue?.toLocaleString() || 0}`, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Total Chats", value: stats.total_chats, icon: MessageCircle, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Total Products", value: stats.total_products, icon: Package, color: "text-amber-400", bg: "bg-amber-400/10" },
  ] : [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">Aaj ki overview</p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-[#111] rounded-2xl h-24 animate-pulse border border-white/5" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {cards.map((c,i) => (
            <div key={i} className="bg-[#111] border border-white/8 rounded-2xl p-4">
              <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                <c.icon size={18} className={c.color} />
              </div>
              <p className="text-2xl font-bold text-white">{c.value}</p>
              <p className="text-gray-500 text-xs mt-1">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Low stock alert */}
      {stats?.low_stock?.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-400" />
            <span className="text-amber-400 font-medium text-sm">Low Stock Alert</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.low_stock.map((p: any, i: number) => (
              <span key={i} className="bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full">
                {p.name} — {p.stock} baqi
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { href: '/dashboard/chats', icon: MessageCircle, title: 'Chats Dekho', desc: 'Customer messages aur AI replies', color: 'text-[#25D366]' },
          { href: '/dashboard/products', icon: Package, title: 'Products Manage', desc: 'Add, edit ya delete products', color: 'text-blue-400' },
          { href: '/dashboard/orders', icon: ShoppingBag, title: 'Orders Track', desc: 'Pending aur completed orders', color: 'text-purple-400' },
        ].map(c => (
          <Link key={c.href} href={c.href} className="bg-[#111] border border-white/8 rounded-2xl p-5 hover:border-white/20 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <c.icon size={20} className={c.color} />
              <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
            </div>
            <p className="font-medium text-white mb-1">{c.title}</p>
            <p className="text-gray-500 text-xs">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

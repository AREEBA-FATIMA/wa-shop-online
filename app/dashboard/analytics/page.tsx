'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { TrendingUp, ShoppingBag, MessageCircle, Package, AlertTriangle, Clock } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/analytics')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-[#111] rounded-2xl animate-pulse border border-white/5" />)}
      </div>
    </div>
  );

  const stats = [
    { label: 'Total Revenue', value: `Rs.${data?.total_revenue?.toLocaleString() || 0}`, icon: TrendingUp, color: 'text-[#25D366]', bg: 'bg-[#25D366]/10' },
    { label: 'Aaj ki Kamai', value: `Rs.${data?.today_revenue?.toLocaleString() || 0}`, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Total Orders', value: data?.total_orders || 0, icon: ShoppingBag, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Aaj ke Orders', value: data?.today_orders || 0, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Total Chats', value: data?.total_chats || 0, icon: MessageCircle, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { label: 'Total Products', value: data?.total_products || 0, icon: Package, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-1">Analytics</h1>
      <p className="text-gray-500 text-sm mb-6">Aapke business ki performance</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((s,i) => (
          <div key={i} className="bg-[#111] border border-white/8 rounded-2xl p-5">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending orders */}
      {(data?.pending_orders || 0) > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <Clock size={20} className="text-amber-400 shrink-0" />
          <div>
            <p className="text-amber-400 font-medium text-sm">{data.pending_orders} orders pending hain</p>
            <p className="text-amber-600 text-xs">Orders page par ja kar status update karein</p>
          </div>
        </div>
      )}

      {/* Low stock */}
      {data?.low_stock?.length > 0 && (
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-400" />
            <h2 className="font-semibold text-sm">Low Stock Products</h2>
          </div>
          <div className="space-y-3">
            {data.low_stock.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">{p.name}</span>
                <span className={`text-xs px-2 py-1 rounded-lg ${p.stock === 0 ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  {p.stock === 0 ? 'Out of stock' : `${p.stock} baqi`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

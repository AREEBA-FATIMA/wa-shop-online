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
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 rounded-2xl skeleton" />)}
      </div>
    </div>
  );

  const stats = [
    { label: 'Total Revenue', value: `Rs.${data?.total_revenue?.toLocaleString() || 0}`, icon: TrendingUp, color: 'var(--green)', bg: 'var(--green-dim)' },
    { label: 'Aaj ki Kamai', value: `Rs.${data?.today_revenue?.toLocaleString() || 0}`, icon: TrendingUp, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
    { label: 'Total Orders', value: data?.total_orders || 0, icon: ShoppingBag, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
    { label: 'Aaj ke Orders', value: data?.today_orders || 0, icon: Clock, color: '#e8a030', bg: 'rgba(234,160,30,0.1)' },
    { label: 'Total Chats', value: data?.total_chats || 0, icon: MessageCircle, color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
    { label: 'Total Products', value: data?.total_products || 0, icon: Package, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>Analytics</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text3)' }}>Aapke business ki performance</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((s,i) => (
          <div key={i} className="card p-5 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending orders */}
      {(data?.pending_orders || 0) > 0 && (
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-3"
          style={{ background: 'rgba(234,160,30,0.08)', border: '0.5px solid rgba(234,160,30,0.2)' }}>
          <Clock size={20} className="shrink-0" style={{ color: '#e8a030' }} />
          <div>
            <p className="font-medium text-sm" style={{ color: '#e8a030' }}>{data.pending_orders} orders pending hain</p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>Orders page par ja kar status update karein</p>
          </div>
        </div>
      )}

      {/* Low stock */}
      {data?.low_stock?.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} style={{ color: '#e8a030' }} />
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Low Stock Products</h2>
          </div>
          <div className="space-y-3">
            {data.low_stock.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text)' }}>{p.name}</span>
                <span className={`text-xs px-2 py-1 rounded-lg ${p.stock === 0 ? 'text-red-400' : ''}`}
                  style={p.stock > 0 ? { background: 'rgba(234,160,30,0.1)', color: '#e8a030' } : { background: 'rgba(220,50,50,0.1)', color: '#e05a5a' }}>
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

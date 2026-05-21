'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { TrendingUp, ShoppingBag, MessageCircle, Package, AlertTriangle, Clock, DollarSign, Users, ArrowUp, ArrowDown } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/api/analytics').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const stats = [
    { label: 'Total Revenue', value: `Rs.${(data?.total_revenue || 0).toLocaleString()}`, icon: DollarSign, color: '#25D366', bg: 'rgba(37,211,102,0.12)' },
    { label: "Today's Revenue", value: `Rs.${(data?.today_revenue || 0).toLocaleString()}`, icon: TrendingUp, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
    { label: 'Total Orders', value: data?.total_orders || 0, icon: ShoppingBag, color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
    { label: "Today's Orders", value: data?.today_orders || 0, icon: Clock, color: '#e8a030', bg: 'rgba(234,160,30,0.12)' },
    { label: 'Total Chats', value: data?.total_chats || 0, icon: MessageCircle, color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
    { label: 'Products', value: data?.total_products || 0, icon: Package, color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
  ];

  if (loading) return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="h-28 rounded-2xl skeleton" />)}</div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(168,85,247,0.12)' }}>
          <TrendingUp size={18} style={{ color: '#a855f7' }} />
        </span>
        <div>
          <h1 className="brand text-xl font-bold" style={{ color: 'var(--text)' }}>Analytics</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Your business performance</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s`, background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <s.icon size={17} style={{ color: s.color }} />
            </div>
            <p className="brand font-bold text-xl" style={{ color: 'var(--text)' }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending orders alert */}
      {(data?.pending_orders || 0) > 0 && (
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'rgba(234,160,30,0.08)', border: '0.5px solid rgba(234,160,30,0.2)' }}>
          <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(234,160,30,0.15)' }}>
            <Clock size={16} style={{ color: '#e8a030' }} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: '#e8a030' }}>{data.pending_orders} pending orders</p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>Update status in the Orders page</p>
          </div>
        </div>
      )}

      {/* Low stock */}
      {data?.low_stock?.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} style={{ color: '#e8a030' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Low Stock Products</h2>
          </div>
          <div className="space-y-2">
            {data.low_stock.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{p.name}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${p.stock === 0 ? '' : ''}`}
                  style={p.stock > 0 ? { background: 'rgba(234,160,30,0.1)', color: '#e8a030' } : { background: 'rgba(220,50,50,0.1)', color: '#e05a5a' }}>
                  {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance summary */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Summary</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Conversion Rate', value: '68%', trend: '+5%', up: true },
            { label: 'Avg Order Value', value: 'Rs. 1,250', trend: '+12%', up: true },
            { label: 'Response Time', value: '< 2 min', trend: '-30s', up: true },
            { label: 'AI Replies', value: '85%', trend: '+8%', up: true },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--bg3)' }}>
              <p className="text-[11px] font-medium" style={{ color: 'var(--text3)' }}>{s.label}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold" style={{ color: 'var(--text)' }}>{s.value}</span>
                <span className="text-[10px] font-semibold flex items-center gap-0.5" style={{ color: s.up ? '#25D366' : '#e05a5a' }}>
                  {s.up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}{s.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useT } from '@/contexts/LangContext';
import { TrendingUp, ShoppingBag, MessageCircle, Package, AlertTriangle, Clock, DollarSign, Users, ArrowUp, ArrowDown } from 'lucide-react';

export default function AnalyticsPage() {
  const { t } = useT();
  const [data, setData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/analytics').then(r => setData(r.data)).catch(() => {}),
      api.get('/api/orders').then(r => setOrders(r.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  // Best sellers (by order count)
  const bestSellers = (() => {
    const m: Record<string, { count: number; revenue: number }> = {};
    orders.forEach(o => {
      const k = o.product_name || '—';
      if (!m[k]) m[k] = { count: 0, revenue: 0 };
      m[k].count += 1; m[k].revenue += (o.amount || 0);
    });
    return Object.entries(m).sort((a, b) => b[1].count - a[1].count).slice(0, 5);
  })();
  const maxCount = Math.max(1, ...bestSellers.map(([, v]) => v.count));

  // Revenue last 7 days
  const revenue7d = (() => {
    const days: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-PK', { weekday: 'short' });
      const value = orders.filter(o => (o.created_at || '').slice(0, 10) === key).reduce((s, o) => s + (o.amount || 0), 0);
      days.push({ label, value });
    }
    return days;
  })();
  const maxRev = Math.max(1, ...revenue7d.map(d => d.value));

  const stats = [
    { label: t('analytics_total_revenue'), value: `Rs.${(data?.total_revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'var(--green)', bg: 'var(--green-dim)' },
    { label: t('dash_today_revenue'), value: `Rs.${(data?.today_revenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'var(--blue)', bg: 'rgba(2,126,181,0.12)' },
    { label: t('analytics_total_orders'), value: data?.total_orders || 0, icon: ShoppingBag, color: 'var(--teal)', bg: 'var(--green-dim)' },
    { label: t('dash_today_orders'), value: data?.today_orders || 0, icon: Clock, color: 'var(--amber)', bg: 'rgba(196,130,14,0.12)' },
    { label: t('analytics_total_chats'), value: data?.total_chats || 0, icon: MessageCircle, color: 'var(--blue)', bg: 'rgba(2,126,181,0.12)' },
    { label: t('analytics_products'), value: data?.total_products || 0, icon: Package, color: 'var(--green)', bg: 'var(--green-dim)' },
  ];

  if (loading) return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>{t('analytics_title')}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="h-28 rounded-2xl skeleton" />)}</div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--green-dim)' }}>
          <TrendingUp size={18} style={{ color: 'var(--teal)' }} />
        </span>
        <div>
          <h1 className="brand text-xl font-bold" style={{ color: 'var(--text)' }}>{t('analytics_title')}</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>{t('analytics_sub')}</p>
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
            <p className="text-sm font-semibold" style={{ color: '#e8a030' }}>{data.pending_orders} {t('analytics_pending_orders')}</p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>{t('analytics_pending_sub')}</p>
          </div>
        </div>
      )}

      {/* Low stock */}
      {data?.low_stock?.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} style={{ color: '#e8a030' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{t('analytics_low_stock_products')}</h2>
          </div>
          <div className="space-y-2">
            {data.low_stock.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{p.name}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${p.stock === 0 ? '' : ''}`}
                  style={p.stock > 0 ? { background: 'rgba(234,160,30,0.1)', color: '#e8a030' } : { background: 'rgba(220,50,50,0.1)', color: '#e05a5a' }}>
                  {p.stock === 0 ? t('prod_out_of_stock') : `${p.stock} ${t('prod_left')}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue last 7 days */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>{t('analytics_revenue_7d')}</h2>
        <div className="flex items-end justify-between gap-2" style={{ height: 120 }}>
          {revenue7d.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
              <span className="text-[9px] font-semibold" style={{ color: 'var(--text3)' }}>{d.value > 0 ? (d.value >= 1000 ? (d.value/1000).toFixed(1)+'k' : d.value) : ''}</span>
              <div className="w-full rounded-t-md transition-all" style={{ height: `${Math.max(2, (d.value / maxRev) * 90)}%`, background: d.value > 0 ? 'var(--green)' : 'var(--bg4)', minHeight: 3 }} />
              <span className="text-[10px]" style={{ color: 'var(--text3)' }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Best sellers */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>{t('analytics_best_sellers')}</h2>
        {bestSellers.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: 'var(--text3)' }}>{t('analytics_no_data')}</p>
        ) : (
          <div className="space-y-3">
            {bestSellers.map(([name, v], i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium truncate" style={{ color: 'var(--text)' }}>{name}</span>
                  <span style={{ color: 'var(--text3)' }}>{v.count} {t('analytics_orders_word')} · Rs.{v.revenue.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(v.count / maxCount) * 100}%`, background: 'var(--teal)' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance summary */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>{t('analytics_summary')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t('analytics_conv'), value: '68%', trend: '+5%', up: true },
            { label: t('analytics_aov'), value: 'Rs. 1,250', trend: '+12%', up: true },
            { label: t('analytics_resp'), value: '< 2 min', trend: '-30s', up: true },
            { label: t('analytics_ai_replies'), value: '85%', trend: '+8%', up: true },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--bg3)' }}>
              <p className="text-[11px] font-medium" style={{ color: 'var(--text3)' }}>{s.label}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold" style={{ color: 'var(--text)' }}>{s.value}</span>
                <span className="text-[10px] font-semibold flex items-center gap-0.5" style={{ color: s.up ? 'var(--green)' : '#e05a5a' }}>
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

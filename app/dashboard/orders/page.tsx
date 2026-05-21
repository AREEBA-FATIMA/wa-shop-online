'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ShoppingBag, CheckCircle2, Clock, XCircle, Truck, Package, MapPin, Search } from 'lucide-react';

interface Order { id: string; customer_name: string; customer_phone: string; product_name: string; amount: number; status: string; created_at: string; delivery_address?: string; }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; next: string[] }> = {
  pending:   { label: 'Pending',   color: '#e8a030', bg: 'rgba(234,160,30,0.1)', next: ['confirmed', 'cancelled'] },
  confirmed: { label: 'Confirmed', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', next: ['shipped', 'cancelled'] },
  shipped:   { label: 'Shipped',   color: '#a855f7', bg: 'rgba(168,85,247,0.1)', next: ['delivered', 'cancelled'] },
  delivered: { label: 'Delivered', color: '#25D366', bg: 'rgba(37,211,102,0.1)', next: [] },
  cancelled: { label: 'Cancelled', color: '#e05a5a', bg: 'rgba(220,50,50,0.1)', next: [] },
};

const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'delivered'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  async function load() { try { const r = await api.get('/api/orders'); setOrders(r.data); } catch {} finally { setLoading(false); } }
  async function updateStatus(id: string, status: string) { try { await api.put(`/api/orders/${id}/status`, { status }); await load(); } catch {} }
  useEffect(() => { load(); }, []);

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search && !o.customer_name?.toLowerCase().includes(search.toLowerCase()) && !o.customer_phone.includes(search) && !o.product_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts: Record<string, number> = {};
  orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });

  function renderIcon(status: string) {
    const cfg = STATUS_CONFIG[status];
    if (!cfg) return null;
    const icons: Record<string, any> = {
      pending: Clock, confirmed: CheckCircle2, shipped: Truck, delivered: CheckCircle2, cancelled: XCircle
    };
    const IconCmp = icons[status];
    return IconCmp ? <IconCmp size={12} /> : null;
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="brand text-xl font-bold" style={{ color: 'var(--text)' }}>Orders</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>{orders.length} total</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="field pl-9" />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {Object.entries({ all: { label: 'All', color: 'var(--text2)', bg: 'var(--bg3)', icon: null }, ...STATUS_CONFIG }).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all"
            style={{
              background: filter === k ? v.color : v.bg,
              color: filter === k ? '#fff' : v.color,
              border: filter === k ? 'none' : `0.5px solid ${v.color}33`,
            }}>
            {k !== 'all' ? renderIcon(k) : null}
            {v.label}
            {k !== 'all' && counts[k] ? <span className="text-[10px] opacity-70" style={{ marginLeft: 2 }}>({counts[k]})</span> : null}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl skeleton" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ background: 'var(--bg3)' }}>
            <ShoppingBag size={32} style={{ color: 'var(--text3)' }} />
          </div>
          <p className="font-semibold" style={{ color: 'var(--text3)' }}>No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const currentStep = STATUS_FLOW.indexOf(order.status);
            const isTerminal = order.status === 'delivered' || order.status === 'cancelled';
            return (
              <div key={order.id} className="rounded-2xl overflow-hidden animate-fade-in" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
                {/* Main content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{order.customer_name || 'Unknown'}</span>
                        <span className="text-xs" style={{ color: 'var(--text3)' }}>{order.customer_phone}</span>
                      </div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text2)' }}>{order.product_name}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="font-bold" style={{ color: 'var(--green)' }}>Rs.{order.amount?.toLocaleString()}</span>
                        <span className="text-[10px]" style={{ color: 'var(--text3)' }}>
                          {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      {order.delivery_address && (
                        <div className="mt-2 flex items-start gap-1.5">
                          <MapPin size={11} className="mt-0.5 shrink-0" style={{ color: '#60a5fa' }} />
                          {order.delivery_address.includes('maps') || order.delivery_address.includes('goo.gl') ? (
                            <a href={order.delivery_address} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: '#60a5fa' }}>View location</a>
                          ) : (
                            <p className="text-xs" style={{ color: 'var(--text3)' }}>{order.delivery_address}</p>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Status badge + actions */}
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: st.bg, color: st.color }}>
                        {renderIcon(order.status)}{st.label}
                      </span>
                      {!isTerminal && st.next.length > 0 && (
                        <div className="flex gap-1">
                          {st.next.filter(s => s !== 'cancelled').map(nextStatus => (
                            <button key={nextStatus} onClick={() => updateStatus(order.id, nextStatus)}
                              className="text-[10px] font-medium px-2.5 py-1 rounded-full transition-all hover:scale-105"
                              style={{ background: STATUS_CONFIG[nextStatus].bg, color: STATUS_CONFIG[nextStatus].color }}>
                              {STATUS_CONFIG[nextStatus].label}
                            </button>
                          ))}
                          {st.next.includes('cancelled') && (
                            <button onClick={() => updateStatus(order.id, 'cancelled')}
                              className="text-[10px] font-medium px-2.5 py-1 rounded-full transition-all hover:scale-105"
                              style={{ background: 'rgba(220,50,50,0.08)', color: '#e05a5a' }}>
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline progress */}
                {!isTerminal && (
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-0">
                      {STATUS_FLOW.map((s, i) => {
                        const isActive = i <= currentStep;
                        const isCurrent = i === currentStep;
                        return (
                          <div key={s} className="flex-1 flex items-center">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2.5 h-2.5 rounded-full transition-all ${isCurrent ? 'animate-pulse' : ''}`}
                                style={{ background: isActive ? STATUS_CONFIG[s].color : 'var(--bg4)' }} />
                              <span className="text-[9px] font-medium hidden sm:inline" style={{ color: isActive ? STATUS_CONFIG[s].color : 'var(--text3)' }}>
                                {STATUS_CONFIG[s].label}
                              </span>
                            </div>
                            {i < STATUS_FLOW.length - 1 && (
                              <div className="flex-1 h-px mx-1" style={{ background: i < currentStep ? STATUS_CONFIG[s].color : 'var(--bg4)' }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ShoppingBag, CheckCircle2, Clock, XCircle, Truck } from 'lucide-react';

interface Order { id: string; customer_name: string; customer_phone: string; product_name: string; amount: number; status: string; created_at: string; delivery_address?: string; }

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending:   { label: 'Pending',   color: '#e8a030', bg: 'rgba(234,160,30,0.1)', icon: Clock },
  confirmed: { label: 'Confirmed', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', icon: CheckCircle2 },
  shipped:   { label: 'Shipped',   color: '#a855f7', bg: 'rgba(168,85,247,0.1)', icon: Truck },
  delivered: { label: 'Delivered', color: 'var(--green)', bg: 'var(--green-dim)', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: '#e05a5a', bg: 'rgba(220,50,50,0.1)', icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  async function load() {
    try { const r = await api.get('/api/orders'); setOrders(r.data); }
    catch {} finally { setLoading(false); }
  }

  async function updateStatus(id: string, status: string) {
    try { await api.put(`/api/orders/${id}/status`, { status }); await load(); } catch {}
  }

  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Orders</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>{orders.length} total orders</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {['all','pending','confirmed','shipped','delivered','cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors capitalize"
            style={{
              background: filter === s ? 'var(--green)' : 'var(--bg3)',
              color: filter === s ? '#fff' : 'var(--text2)',
              border: filter === s ? 'none' : '0.5px solid var(--border)',
            }}>
            {s === 'all' ? `All (${orders.length})` : `${STATUS_MAP[s]?.label} (${orders.filter(o=>o.status===s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={48} className="mx-auto mb-4" style={{ color: 'var(--text3)' }} />
          <p style={{ color: 'var(--text3)' }}>Koi order nahi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
            const Icon = st.icon;
            return (
              <div key={order.id} className="card p-4 hover:border-[var(--border2)] transition-all animate-fade-in">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>{order.customer_name}</span>
                      <span className="text-xs" style={{ color: 'var(--text3)' }}>{order.customer_phone}</span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text2)' }}>{order.product_name}</p>
                    <p className="font-semibold mt-1" style={{ color: 'var(--green)' }}>Rs.{order.amount?.toLocaleString()}</p>
                    {order.delivery_address && (
                      <div className="mt-1">
                        {order.delivery_address.includes('maps') || order.delivery_address.includes('goo.gl') ? (
                          <a href={order.delivery_address} target="_blank" rel="noopener noreferrer"
                            className="text-xs hover:underline flex items-center gap-1" style={{ color: '#60a5fa' }}>
                            📍 Google Maps location dekhen
                          </a>
                        ) : (
                          <p className="text-xs" style={{ color: 'var(--text3)' }}>📍 {order.delivery_address}</p>
                        )}
                      </div>
                    )}
                    <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{new Date(order.created_at).toLocaleString('en-PK')}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                      style={{ background: st.bg, color: st.color }}>
                      <Icon size={11} />{st.label}
                    </span>
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                        className="field text-xs px-2 py-1"
                        style={{ width: 'auto', minWidth: '90px' }}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

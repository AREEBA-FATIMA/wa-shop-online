'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ShoppingBag, CheckCircle2, Clock, XCircle, Truck } from 'lucide-react';

interface Order { id: string; customer_name: string; customer_phone: string; product_name: string; amount: number; status: string; created_at: string; delivery_address?: string; }

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending:   { label: 'Pending',   color: 'text-amber-400 bg-amber-400/10',   icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-400 bg-blue-400/10',     icon: CheckCircle2 },
  shipped:   { label: 'Shipped',   color: 'text-purple-400 bg-purple-400/10', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-[#25D366] bg-[#25D366]/10',   icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-400/10',       icon: XCircle },
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
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Orders</h1>
          <p className="text-gray-500 text-sm">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {['all','pending','confirmed','shipped','delivered','cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors capitalize
              ${filter === s ? 'bg-[#25D366] text-white' : 'bg-[#111] text-gray-400 hover:text-white border border-white/8'}`}>
            {s === 'all' ? `All (${orders.length})` : `${STATUS_MAP[s]?.label} (${orders.filter(o=>o.status===s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-[#111] rounded-2xl animate-pulse border border-white/5" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={48} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">Koi order nahi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
            const Icon = st.icon;
            return (
              <div key={order.id} className="bg-[#111] border border-white/8 rounded-2xl p-4 hover:border-white/15 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-sm">{order.customer_name}</span>
                      <span className="text-gray-600 text-xs">{order.customer_phone}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{order.product_name}</p>
                    <p className="text-[#25D366] font-semibold mt-1">Rs.{order.amount?.toLocaleString()}</p>
                    {order.delivery_address && (
                      <div className="mt-1">
                        {order.delivery_address.includes('maps') || order.delivery_address.includes('goo.gl') ? (
                          <a href={order.delivery_address} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                            📍 Google Maps location dekhen
                          </a>
                        ) : (
                          <p className="text-xs text-gray-500">📍 {order.delivery_address}</p>
                        )}
                      </div>
                    )}
                    <p className="text-gray-600 text-xs mt-1">{new Date(order.created_at).toLocaleString('en-PK')}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${st.color}`}>
                      <Icon size={11} />{st.label}
                    </span>
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                        className="bg-[#1a1a1a] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#25D366]">
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

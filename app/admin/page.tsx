'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Users, Wifi, WifiOff, Shield, Search, ArrowUpRight } from 'lucide-react';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { api.get('/api/admin/users').then(r => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  async function setPlan(id: string, plan: string) { try { await api.put(`/api/admin/users/${id}/plan`, { plan }); setUsers(u => u.map(x => x.id === id ? { ...x, plan } : x)); } catch {} }

  const filtered = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search));

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(124,58,237,0.12)' }}>
          <Shield size={18} style={{ color: '#7c3aed' }} />
        </span>
        <div>
          <h1 className="brand text-xl font-bold" style={{ color: 'var(--text)' }}>Admin</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Manage users & plans</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Users', value: users.length, color: 'var(--text)', bg: 'var(--bg3)' },
          { label: 'WA Connected', value: users.filter(u => u.wa_connected).length, color: 'var(--green)', bg: 'var(--green-dim)' },
          { label: 'Paid Users', value: users.filter(u => u.plan !== 'free').length, color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4 text-center" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
            <p className="brand text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="field pl-9" />
      </div>

      {/* Users list */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '0.5px solid var(--border)' }}>
          <Users size={15} style={{ color: 'var(--text3)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Users</span>
          <span className="text-xs ml-auto" style={{ color: 'var(--text3)' }}>{users.length} total</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--text3)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--text3)' }}>No users found</div>
        ) : (
          <div>
            {filtered.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 p-3.5 animate-fade-in" style={{ animationDelay: `${i * 0.03}s`, borderBottom: '0.5px solid var(--border)' }}>
                <span className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
                  {u.name?.charAt(0)?.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{u.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>{u.phone} · {new Date(u.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {u.wa_connected ? <Wifi size={14} style={{ color: 'var(--green)' }} /> : <WifiOff size={14} style={{ color: 'var(--text3)' }} />}
                  <select value={u.plan} onChange={e => setPlan(u.id, e.target.value)}
                    className="text-xs rounded-lg px-2 py-1.5 outline-none" style={{ background: 'var(--bg3)', color: 'var(--text)', border: '0.5px solid var(--border)' }}>
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

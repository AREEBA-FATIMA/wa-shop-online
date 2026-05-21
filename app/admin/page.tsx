'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Users, Wifi, WifiOff, Shield } from 'lucide-react';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/users').then(r => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function setPlan(id: string, plan: string) {
    try { await api.put(`/api/admin/users/${id}/plan`, { plan }); setUsers(u => u.map(x => x.id === id ? { ...x, plan } : x)); } catch {}
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={20} style={{ color: 'var(--green)' }} />
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Admin Panel</h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{users.length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Total Users</p>
        </div>
        <div className="card p-5">
          <p className="text-2xl font-bold gradient-text-green">{users.filter(u=>u.wa_connected).length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>WA Connected</p>
        </div>
        <div className="card p-5">
          <p className="text-2xl font-bold" style={{ color: '#a855f7' }}>{users.filter(u=>u.plan!=='free').length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Paid Users</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex items-center gap-2" style={{ borderBottom: '0.5px solid var(--border)' }}>
          <Users size={16} style={{ color: 'var(--text3)' }} />
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>All Users</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text3)' }}>Loading...</div>
        ) : (
          <div>
            {users.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 p-4 animate-fade-in"
                style={{ animationDelay: `${i * 0.03}s`, borderBottom: '0.5px solid var(--border)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
                  {u.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{u.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>{u.phone} · {new Date(u.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {u.wa_connected ? <Wifi size={14} style={{ color: 'var(--green)' }} /> : <WifiOff size={14} style={{ color: 'var(--text3)' }} />}
                  <select value={u.plan} onChange={e => setPlan(u.id, e.target.value)}
                    className="field text-xs"
                    style={{ width: 'auto', minWidth: '80px', padding: '6px 10px' }}>
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

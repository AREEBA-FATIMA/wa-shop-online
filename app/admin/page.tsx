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
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={20} className="text-[#25D366]" />
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <p className="text-2xl font-bold text-white">{users.length}</p>
          <p className="text-gray-500 text-xs mt-1">Total Users</p>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <p className="text-2xl font-bold text-[#25D366]">{users.filter(u=>u.wa_connected).length}</p>
          <p className="text-gray-500 text-xs mt-1">WA Connected</p>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <p className="text-2xl font-bold text-purple-400">{users.filter(u=>u.plan!=='free').length}</p>
          <p className="text-gray-500 text-xs mt-1">Paid Users</p>
        </div>
      </div>

      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/8 flex items-center gap-2">
          <Users size={16} className="text-gray-400" />
          <h2 className="font-semibold text-sm">All Users</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="divide-y divide-white/5">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] font-bold text-sm shrink-0">
                  {u.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{u.name}</p>
                  <p className="text-gray-500 text-xs">{u.phone} · {new Date(u.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {u.wa_connected ? <Wifi size={14} className="text-[#25D366]" /> : <WifiOff size={14} className="text-gray-600" />}
                  <select value={u.plan} onChange={e => setPlan(u.id, e.target.value)}
                    className="bg-[#1a1a1a] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#25D366]">
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

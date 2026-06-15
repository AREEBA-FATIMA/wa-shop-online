'use client';
import { useEffect, useState } from 'react';
import { Users, Wifi, WifiOff, Shield, Search, ArrowUpRight, Crown, Clock, CheckCircle, XCircle, KeyRound } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState('users');

  useEffect(() => {
    const saved = localStorage.getItem('admin_secret');
    if (saved) {
      setAdminSecret(saved);
      setAdminAuthed(true);
      fetchData(saved);
    } else {
      setLoading(false);
    }
  }, []);

  async function adminFetch(path: string, options: RequestInit = {}) {
    const secret = localStorage.getItem('admin_secret');
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers || {}) as Record<string, string> };
    if (secret) headers['Authorization'] = `Bearer ${secret}`;
    const r = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!r.ok) throw { response: { status: r.status, data: await r.json().catch(() => ({})) } };
    return r.json();
  }

  async function fetchData(secret?: string) {
    if (secret) localStorage.setItem('admin_secret', secret);
    try {
      const [u, p] = await Promise.all([
        adminFetch('/api/admin/users'),
        adminFetch('/api/admin/payments'),
      ]);
      setUsers(u);
      setPayments(p);
      setAdminAuthed(true);
      setAuthError('');
    } catch (e: any) {
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        setAuthError('Wrong admin secret');
        setAdminAuthed(false);
        localStorage.removeItem('admin_secret');
      }
    }
    setLoading(false);
  }

  function login() {
    if (!adminSecret.trim()) return;
    localStorage.setItem('admin_secret', adminSecret.trim());
    setLoading(true);
    fetchData(adminSecret.trim());
  }

  async function setPlan(id: string, plan: string) {
    try { await adminFetch(`/api/admin/users/${id}/plan`, { method: 'PUT', body: JSON.stringify({ plan }) }); setUsers(u => u.map(x => x.id === id ? { ...x, plan } : x)); } catch {}
  }

  async function approvePayment(id: string) {
    try { await adminFetch(`/api/admin/payments/${id}/approve`, { method: 'POST', body: '{}' }); setPayments(p => p.map(x => x.id === id ? { ...x, status: 'approved' } : x)); } catch {}
  }

  async function rejectPayment(id: string) {
    try { await adminFetch(`/api/admin/payments/${id}/reject`, { method: 'POST', body: '{}' }); setPayments(p => p.map(x => x.id === id ? { ...x, status: 'rejected' } : x)); } catch {}
  }

  const filtered = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search));
  const pendingPayments = payments.filter(p => p.status === 'pending');

  // If not authed, show login prompt
  if (!adminAuthed) {
    return (
      <div className="p-4 md:p-6 max-w-sm mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(124,58,237,0.12)' }}>
            <Shield size={18} style={{ color: '#7c3aed' }} />
          </span>
          <div>
            <h1 className="brand text-xl font-bold" style={{ color: 'var(--text)' }}>Admin</h1>
            <p className="text-sm" style={{ color: 'var(--text3)' }}>Enter admin secret to continue</p>
          </div>
        </div>
        <div className="rounded-2xl p-6 space-y-4 text-center" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
          <KeyRound size={28} className="mx-auto" style={{ color: 'var(--text3)' }} />
          <input value={adminSecret} onChange={e => setAdminSecret(e.target.value)} type="password" placeholder="Admin Secret" className="field text-center" onKeyDown={e => { if (e.key === 'Enter') login(); }} />
          {authError && <p className="text-xs" style={{ color: '#e05a5a' }}>{authError}</p>}
          <button onClick={login} className="btn-primary w-full justify-center text-sm" disabled={loading}>
            {loading ? 'Checking...' : 'Login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(124,58,237,0.12)' }}>
          <Shield size={18} style={{ color: '#7c3aed' }} />
        </span>
        <div>
          <h1 className="brand text-xl font-bold" style={{ color: 'var(--text)' }}>Admin</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Manage users, plans & payments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: users.length, color: 'var(--text)', bg: 'var(--bg3)' },
          { label: 'WA Connected', value: users.filter(u => u.wa_connected).length, color: 'var(--green)', bg: 'var(--green-dim)' },
          { label: 'Paid Users', value: users.filter(u => u.plan !== 'free').length, color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
          { label: 'Pending Payments', value: pendingPayments.length, color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4 text-center" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
            <p className="brand text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('users')} className="text-sm font-medium px-4 py-2 rounded-xl transition-all"
          style={{ background: tab === 'users' ? 'var(--green-dim)' : 'var(--bg2)', color: tab === 'users' ? 'var(--green)' : 'var(--text2)' }}>
          <Users size={14} className="inline mr-1.5" />Users
        </button>
        <button onClick={() => setTab('payments')} className="text-sm font-medium px-4 py-2 rounded-xl transition-all relative"
          style={{ background: tab === 'payments' ? 'var(--green-dim)' : 'var(--bg2)', color: tab === 'payments' ? 'var(--green)' : 'var(--text2)' }}>
          <Crown size={14} className="inline mr-1.5" />Payments
          {pendingPayments.length > 0 && (
            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#facc15', color: '#000' }}>{pendingPayments.length}</span>
          )}
        </button>
      </div>

      {tab === 'users' && (
        <>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="field pl-9" />
          </div>
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
        </>
      )}

      {tab === 'payments' && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '0.5px solid var(--border)' }}>
            <Crown size={15} style={{ color: 'var(--text3)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Payment Requests</span>
            <span className="text-xs ml-auto" style={{ color: 'var(--text3)' }}>{payments.length} total</span>
          </div>
          {payments.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: 'var(--text3)' }}>No payment requests</div>
          ) : (
            <div>
              {payments.map((p, i) => {
                const user = users.find(u => u.id === p.user_id);
                return (
                  <div key={p.id} className="flex items-center gap-3 p-3.5 animate-fade-in" style={{ animationDelay: `${i * 0.03}s`, borderBottom: '0.5px solid var(--border)' }}>
                    <span className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'rgba(250,204,21,0.12)', color: '#facc15' }}>
                      <Crown size={14} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize" style={{ color: 'var(--text)' }}>{p.plan} Plan</p>
                      <p className="text-xs" style={{ color: 'var(--text3)' }}>
                        {user?.name || 'User ' + p.user_id} · Rs.{p.amount?.toLocaleString()} · {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {p.status === 'pending' ? (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => approvePayment(p.id)} className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
                          <CheckCircle size={12} className="inline mr-1" />Approve
                        </button>
                        <button onClick={() => rejectPayment(p.id)} className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all" style={{ background: 'rgba(220,50,50,0.08)', color: '#e05a5a' }}>
                          <XCircle size={12} className="inline mr-1" />Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                        p.status === 'approved' ? '' : ''
                      }`} style={{
                        background: p.status === 'approved' ? 'var(--green-dim)' : 'rgba(220,50,50,0.08)',
                        color: p.status === 'approved' ? 'var(--green)' : '#e05a5a'
                      }}>
                        {p.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

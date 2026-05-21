'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { setToken } from '@/lib/api';
import { MessageCircle, Phone, Lock, User, Loader2 } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', password: '', language: 'roman_ur' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  function update(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const res = await api.post('/api/auth/register', form);
      setToken(res.data.token);
      localStorage.setItem('wa_user', JSON.stringify(res.data.user));
      router.push('/connect-wa');
    } catch (e: any) {
      setErr(e.response?.data?.detail || 'Registration failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--green)', boxShadow: '0 8px 24px rgba(61,186,94,0.25)' }}>
            <MessageCircle size={24} className="text-white" />
          </div>
          <h1 className="brand font-bold text-2xl" style={{ color: 'var(--text)' }}>Account Banayein</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>Free 7 din trial — koi card nahi chahiye</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm block mb-1 font-medium" style={{ color: 'var(--text2)' }}>Aapka Naam</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
              <input value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Sara Boutique"
                className="field pl-9" required />
            </div>
          </div>
          <div>
            <label className="text-sm block mb-1 font-medium" style={{ color: 'var(--text2)' }}>Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
              <input value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="03001234567"
                className="field pl-9" required />
            </div>
          </div>
          <div>
            <label className="text-sm block mb-1 font-medium" style={{ color: 'var(--text2)' }}>Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
              <input value={form.password} onChange={e=>update('password',e.target.value)} type="password" placeholder="••••••••"
                className="field pl-9" required />
            </div>
          </div>
          <div>
            <label className="text-sm block mb-1 font-medium" style={{ color: 'var(--text2)' }}>Language / Zaban</label>
            <select value={form.language} onChange={e=>update('language',e.target.value)}
              className="field">
              <option value="roman_ur">Roman Urdu</option>
              <option value="urdu">اردو (Urdu)</option>
              <option value="en">English</option>
            </select>
          </div>

          {err && (
            <p className="text-xs text-center py-2 px-3 rounded-[8px]"
              style={{ background: 'rgba(220,50,50,0.08)', color: '#e05a5a', border: '0.5px solid rgba(220,50,50,0.2)' }}>
              {err}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="btn-primary w-full justify-center"
            style={{ opacity: loading ? 0.7 : 1 }}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            Account Banayein
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text3)' }}>
          Pehle se account hai?{' '}
          <Link href="/auth/login" className="font-semibold" style={{ color: 'var(--green)' }}>Login karein</Link>
        </p>
      </div>
    </div>
  );
}

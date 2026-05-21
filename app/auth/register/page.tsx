'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { setToken } from '@/lib/api';
import { MessageCircle, Phone, Lock, User, Loader2, ArrowRight, Globe } from 'lucide-react';

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
    <div className="min-h-screen flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex w-1/2 items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #075E54, #128C7E, #25D366)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />
        <div className="relative text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6">
            <MessageCircle size={32} className="text-white" />
          </div>
          <h2 className="brand font-bold text-4xl mb-3">Free Trial Start</h2>
          <p className="text-white/70 max-w-sm">7 din free — koi card nahi chahiye. Apna WhatsApp dukaan banayein!</p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-8" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:hidden"
              style={{ background: 'var(--green-gradient)', boxShadow: '0 8px 24px rgba(37,211,102,0.25)' }}>
              <MessageCircle size={24} className="text-white" />
            </div>
            <h1 className="brand font-bold text-2xl" style={{ color: 'var(--text)' }}>Account Banayein</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>Free 7 din trial — koi card nahi chahiye</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="floating-label">
              <input value={form.name} onChange={e=>update('name',e.target.value)} placeholder=" " className="field" required />
              <label><User size={12} style={{ display: 'inline', marginRight: 4 }} />Aapka Naam</label>
            </div>
            <div className="floating-label">
              <input value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder=" " className="field" required />
              <label><Phone size={12} style={{ display: 'inline', marginRight: 4 }} />Phone Number</label>
            </div>
            <div className="floating-label">
              <input value={form.password} onChange={e=>update('password',e.target.value)} type="password" placeholder=" " className="field" required />
              <label><Lock size={12} style={{ display: 'inline', marginRight: 4 }} />Password</label>
            </div>
            <div className="floating-label">
              <select value={form.language} onChange={e=>update('language',e.target.value)} className="field">
                <option value="roman_ur">Roman Urdu</option>
                <option value="urdu">اردو (Urdu)</option>
                <option value="en">English</option>
              </select>
              <label><Globe size={12} style={{ display: 'inline', marginRight: 4 }} />Language / Zaban</label>
            </div>

            {err && (
              <p className="text-xs text-center py-2.5 px-3 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '0.5px solid rgba(239,68,68,0.2)' }}>
                {err}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary-gradient w-full justify-center"
              style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Account Banayein <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--text3)' }}>
            Pehle se account hai?{' '}
            <Link href="/auth/login" className="font-semibold" style={{ color: 'var(--green)' }}>Login karein</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { setToken } from '@/lib/api';
import { MessageCircle, Phone, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const res = await api.post('/api/auth/login', { phone, password: pass });
      setToken(res.data.token);
      localStorage.setItem('wa_user', JSON.stringify(res.data.user));
      if (res.data.user?.wa_connected) {
        router.push('/dashboard');
      } else {
        router.push('/connect-wa');
      }
    } catch (e: any) {
      setErr(e.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding/Illustration */}
      <div className="hidden lg:flex w-1/2 items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #075E54, #128C7E, #25D366)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />
        <div className="relative text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6">
            <MessageCircle size={32} className="text-white" />
          </div>
          <h2 className="brand font-bold text-4xl mb-3">Welcome Back!</h2>
          <p className="text-white/70 max-w-sm">Apne WhatsApp business ko manage karein — AI ke sath</p>
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
            <h1 className="brand font-bold text-2xl" style={{ color: 'var(--text)' }}>Login</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>Apne account mein wapas aayein</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="floating-label">
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder=" "
                className="field"
                required
              />
              <label><Phone size={12} style={{ display: 'inline', marginRight: 4 }} />Phone Number</label>
            </div>
            <div className="floating-label">
              <input
                value={pass}
                onChange={e => setPass(e.target.value)}
                type="password"
                placeholder=" "
                className="field"
                required
              />
              <label><Lock size={12} style={{ display: 'inline', marginRight: 4 }} />Password</label>
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
              Login <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--text3)' }}>
            Account nahi hai?{' '}
            <Link href="/auth/register" className="font-semibold" style={{ color: 'var(--green)' }}>
              Register karein
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

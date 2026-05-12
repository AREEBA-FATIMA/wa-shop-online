'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { setToken } from '@/lib/api';
import { MessageCircle, Phone, Lock, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-[340px]">
        {/* Logo mark */}
        <div className="text-center mb-8">
          <div className="w-11 h-11 rounded-[14px] flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--green)', boxShadow: '0 8px 24px rgba(61,186,94,0.25)' }}>
            <MessageCircle size={20} className="text-white" />
          </div>
          <h1 className="brand font-bold text-2xl" style={{ color: 'var(--text)' }}>WA-SHOP</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>Apne account mein login karein</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text2)' }}>Phone Number</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="03001234567"
                className="field pl-9"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text2)' }}>Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
              <input
                value={pass}
                onChange={e => setPass(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="field pl-9"
                required
              />
            </div>
          </div>

          {err && (
            <p className="text-xs text-center py-2 px-3 rounded-[8px]"
              style={{ background: 'rgba(220,50,50,0.08)', color: '#e05a5a', border: '0.5px solid rgba(220,50,50,0.2)' }}>
              {err}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="btn-primary w-full justify-center mt-1"
            style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Login
          </button>
        </form>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--text3)' }}>
          Account nahi hai?{' '}
          <Link href="/auth/register" className="font-semibold" style={{ color: 'var(--green)' }}>
            Register karein
          </Link>
        </p>
      </div>
    </div>
  );
}

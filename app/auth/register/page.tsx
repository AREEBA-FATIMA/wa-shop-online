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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">Account Banayein</h1>
          <p className="text-gray-500 text-sm mt-1">Free 7 din trial — koi card nahi chahiye</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Aapka Naam</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Sara Boutique"
                className="w-full bg-[#111] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#25D366] transition-colors" required />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="03001234567"
                className="w-full bg-[#111] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#25D366] transition-colors" required />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={form.password} onChange={e=>update('password',e.target.value)} type="password" placeholder="••••••••"
                className="w-full bg-[#111] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#25D366] transition-colors" required />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Language / Zaban</label>
            <select value={form.language} onChange={e=>update('language',e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#25D366] transition-colors">
              <option value="roman_ur">Roman Urdu</option>
              <option value="urdu">اردو (Urdu)</option>
              <option value="en">English</option>
            </select>
          </div>

          {err && <p className="text-red-400 text-sm text-center">{err}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-[#25D366] hover:bg-[#1da855] disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
            {loading && <Loader2 size={18} className="animate-spin" />}
            Account Banayein
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Pehle se account hai?{' '}
          <Link href="/auth/login" className="text-[#25D366] hover:underline">Login karein</Link>
        </p>
      </div>
    </div>
  );
}

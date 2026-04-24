'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Loader2, Check, Wifi, WifiOff, Crown, Clock, User, Globe, Bot, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface UserData {
  id: string; name: string; phone: string; plan: string;
  language: string; wa_connected: boolean; ai_auto_reply: boolean;
  trial_ends?: string;
}

const PLAN_LABEL: Record<string, string> = { free: 'Free', trial: 'Trial', premium: 'Premium ⭐', enterprise: 'Enterprise' };
const PLAN_COLOR: Record<string, string> = { free: '#888', trial: '#60a5fa', premium: '#facc15', enterprise: '#c084fc' };

export default function SettingsPage() {
  const [form, setForm] = useState({ name: '', language: 'roman_ur', ai_auto_reply: true });
  const [userData, setUserData] = useState<UserData | null>(null);
  const [waStatus, setWaStatus] = useState<{ connected: boolean; phone?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('wa_user') || '{}');
    setUserId(u.id || '');
    api.get('/api/auth/me').then(r => {
      setUserData(r.data);
      setForm({ name: r.data.name, language: r.data.language || 'roman_ur', ai_auto_reply: r.data.ai_auto_reply ?? true });
    }).catch(() => {});
    if (u.id) {
      api.get(`/api/wa/status/${u.id}`).then(r => setWaStatus(r.data)).catch(() => {});
    }
  }, []);

  async function save() {
    setSaving(true);
    try {
      await api.put('/api/settings', form);
      const u = JSON.parse(localStorage.getItem('wa_user') || '{}');
      localStorage.setItem('wa_user', JSON.stringify({ ...u, name: form.name, language: form.language }));
      setUserData(prev => prev ? { ...prev, ...form } : prev);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch {}
    setSaving(false);
  }

  async function disconnect() {
    if (!confirm('WhatsApp disconnect karna chahte hain?')) return;
    try {
      await api.post(`/api/wa/disconnect/${userId}`);
      setWaStatus({ connected: false });
      setUserData(prev => prev ? { ...prev, wa_connected: false } : prev);
      // Session clear ho gayi — connect page par jao
      setTimeout(() => window.location.href = '/connect-wa', 500);
    } catch {}
  }

  const upd = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const trialDaysLeft = userData?.trial_ends
    ? Math.max(0, Math.ceil((new Date(userData.trial_ends).getTime() - Date.now()) / 86400000))
    : null;

  const isPremium = userData?.plan === 'premium' || userData?.plan === 'enterprise';

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Settings</h1>

      {/* Profile */}
      <div className="rounded-2xl p-5 border" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <User size={15} /> Profile
        </h2>
        <div className="flex items-center gap-3 p-3 rounded-xl mb-4" style={{ background: 'var(--bg3)' }}>
          <div className="w-11 h-11 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-base shrink-0">
            {(form.name || userData?.name || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>{form.name || userData?.name}</p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>{userData?.phone}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: PLAN_COLOR[userData?.plan || 'free'] }}>
              {PLAN_LABEL[userData?.plan || 'free']}
              {userData?.plan === 'trial' && trialDaysLeft !== null && ` — ${trialDaysLeft} din baqi`}
            </p>
          </div>
          {isPremium && <Crown size={16} className="text-yellow-400 shrink-0" />}
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text3)' }}>Naam</label>
            <input value={form.name} onChange={e => upd('name', e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm border focus:outline-none focus:border-[#25D366]"
              style={{ background: 'var(--bg3)', borderColor: 'var(--border)', color: 'var(--text)' }} />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text3)' }}>Phone (change nahi ho sakta)</label>
            <input value={userData?.phone || ''} disabled
              className="w-full rounded-xl px-3 py-2.5 text-sm border opacity-50 cursor-not-allowed"
              style={{ background: 'var(--bg3)', borderColor: 'var(--border)', color: 'var(--text3)' }} />
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="rounded-2xl p-5 border" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Crown size={15} /> Plan & Subscription
        </h2>
        <div className="p-3 rounded-xl mb-3" style={{ background: 'var(--bg3)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: PLAN_COLOR[userData?.plan || 'free'] }}>
                {PLAN_LABEL[userData?.plan || 'free']}
              </p>
              {userData?.plan === 'trial' && trialDaysLeft !== null && (
                <p className="text-xs mt-1 flex items-center gap-1 text-blue-400">
                  <Clock size={11} /> {trialDaysLeft} din mein trial khatam ho jaye ga
                </p>
              )}
              {userData?.plan === 'free' && (
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Premium upgrade ke liye admin se rabta karein</p>
              )}
              {isPremium && <p className="text-xs mt-1 text-[#25D366]">✓ Tamam features available hain</p>}
            </div>
            {isPremium && <ShieldCheck size={20} className="text-yellow-400" />}
          </div>
        </div>
        {!isPremium && (
          <div className="p-3 rounded-xl border border-yellow-400/20 text-xs space-y-1" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
            <p className="font-semibold text-yellow-400 mb-2">⭐ Premium mein milega:</p>
            <p>✅ Unlimited AI auto-replies</p>
            <p>✅ WhatsApp Status pe product images</p>
            <p>✅ Unlimited status posts</p>
            <p>✅ Advanced analytics</p>
            <p className="mt-2 text-blue-400">Upgrade ke liye admin se message karein</p>
          </div>
        )}
      </div>

      {/* AI Language */}
      <div className="rounded-2xl p-5 border" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Globe size={15} /> AI Reply Language
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text3)' }}>Language select karein</label>
            <select value={form.language} onChange={e => upd('language', e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm border focus:outline-none focus:border-[#25D366]"
              style={{ background: 'var(--bg3)', borderColor: 'var(--border)', color: 'var(--text)' }}>
              <option value="roman_ur">Roman Urdu (Urdu English haroof mein)</option>
              <option value="urdu">اردو (Asli Urdu)</option>
              <option value="en">English</option>
            </select>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text3)' }}>
              Save ke baad AI is language mein customers ko jawab dega
            </p>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg3)' }}>
            <div className="flex items-center gap-2">
              <Bot size={15} style={{ color: 'var(--text3)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>AI Auto-Reply</p>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>
                  {form.ai_auto_reply ? 'ON — AI jawab de raha hai' : 'OFF — AI jawab nahi de ga'}
                </p>
              </div>
            </div>
            <div onClick={() => upd('ai_auto_reply', !form.ai_auto_reply)}
              className={`w-11 h-6 rounded-full flex items-center px-0.5 cursor-pointer shrink-0 transition-colors ${form.ai_auto_reply ? 'bg-[#25D366]' : 'bg-gray-600'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${form.ai_auto_reply ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp */}
      <div className="rounded-2xl p-5 border" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Wifi size={15} /> WhatsApp Connection
        </h2>
        <div className={`flex items-center gap-3 p-3 rounded-xl mb-3 ${waStatus?.connected ? 'bg-[#25D366]/10' : 'bg-red-500/10'}`}>
          {waStatus?.connected ? <Wifi size={16} className="text-[#25D366]" /> : <WifiOff size={16} className="text-red-400" />}
          <div>
            <p className={`font-medium text-sm ${waStatus?.connected ? 'text-[#25D366]' : 'text-red-400'}`}>
              {waStatus?.connected ? `Connected — ${waStatus.phone || ''}` : 'Connected nahi hai'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              {waStatus?.connected ? 'Status aur messages chal rahe hain' : 'Connect karein taake status aur AI kaam karey'}
            </p>
          </div>
        </div>
        {waStatus?.connected ? (
          <button onClick={disconnect}
            className="text-red-400 hover:text-red-300 text-sm border border-red-400/30 px-4 py-2 rounded-xl transition-all">
            Disconnect karein
          </button>
        ) : (
          <Link href="/connect-wa"
            className="inline-block bg-[#25D366] hover:bg-[#1da855] text-white text-sm px-4 py-2 rounded-xl transition-colors">
            WhatsApp Connect karein →
          </Link>
        )}
      </div>

      {/* Save */}
      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1da855] disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-colors">
        {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
        {saved ? '✅ Saved!' : 'Save Karein'}
      </button>
    </div>
  );
}

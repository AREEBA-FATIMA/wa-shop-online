'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Loader2, Check, Wifi, WifiOff, Crown, Clock, User, Globe, Bot, ShieldCheck, ChevronRight, Smartphone, LogOut, ExternalLink, Monitor, Trash2, KeyRound, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface UserData { id: string; name: string; phone: string; plan: string; language: string; wa_connected: boolean; ai_auto_reply: boolean; trial_ends?: string; }
interface Session { token_preview: string; ip: string; agent: string; created: string; last_active: number; is_current: boolean; }

const PLAN_STYLE: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: '#8899a6' },
  trial: { label: 'Trial', color: '#60a5fa' },
  basic: { label: 'Basic', color: '#facc15' },
  pro: { label: 'Pro', color: '#c084fc' },
  premium: { label: 'Premium', color: '#facc15' },
  enterprise: { label: 'Enterprise', color: '#c084fc' },
};

export default function SettingsPage() {
  const [form, setForm] = useState({ name: '', language: 'roman_ur', ai_auto_reply: true });
  const [userData, setUserData] = useState<UserData | null>(null);
  const [waStatus, setWaStatus] = useState<{ connected: boolean; phone?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [passphraseShow, setPassphraseShow] = useState(false);
  const [passphraseMsg, setPassphraseMsg] = useState('');
  const [passphraseErr, setPassphraseErr] = useState('');
  const [passphraseLoading, setPassphraseLoading] = useState(false);
  const [hasPassphrase, setHasPassphrase] = useState(false);
  const [passphraseChecking, setPassphraseChecking] = useState(true);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('wa_user') || '{}');
    setUserId(u.id || '');
    api.get('/api/auth/me').then(r => { setUserData(r.data); setForm({ name: r.data.name, language: r.data.language || 'roman_ur', ai_auto_reply: r.data.ai_auto_reply ?? true }); }).catch(() => {});
    if (u.id) api.get(`/api/wa/status/${u.id}`).then(r => setWaStatus(r.data)).catch(() => {});
    loadSessions();
    // Check if passphrase already set
    const stored = localStorage.getItem('wa_has_passphrase');
    setHasPassphrase(stored === 'true');
    setPassphraseChecking(false);
  }, []);

  async function loadSessions() {
    setSessionsLoading(true);
    try { const r = await api.get('/api/auth/sessions'); setSessions(r.data.sessions); } catch {}
    setSessionsLoading(false);
  }

  async function revokeAll() {
    if (!confirm('Kya aap dosre sab devices ko logout karna chahte hain?')) return;
    setRevoking(true);
    try { await api.post('/api/auth/sessions/revoke-all'); setSessions(s => s.filter(x => x.is_current)); } catch {}
    setRevoking(false);
  }

  async function setPassphraseFn() {
    if (passphrase.length < 6) { setPassphraseErr('Kam se kam 6 characters'); return; }
    setPassphraseLoading(true); setPassphraseMsg(''); setPassphraseErr('');
    try {
      await api.put('/api/settings/passphrase', { passphrase });
      localStorage.setItem('wa_has_passphrase', 'true');
      setHasPassphrase(true);
      setPassphrase('');
      setPassphraseMsg('Passphrase set ho gaya! Messages ab extra encryption se store hote hain.');
    } catch (e: any) { setPassphraseErr(e?.response?.data?.detail || 'Kuch error aaya'); }
    setPassphraseLoading(false);
  }

  async function removePassphraseFn() {
    if (!confirm('Kya aap passphrase remove karna chahte hain? Purane messages sirf server key se decrypt honge.')) return;
    setPassphraseLoading(true);
    try {
      await api.delete('/api/settings/passphrase');
      localStorage.removeItem('wa_has_passphrase');
      setHasPassphrase(false);
      setPassphraseMsg('Passphrase remove ho gaya.');
    } catch (e: any) { setPassphraseErr(e?.response?.data?.detail || 'Kuch error aaya'); }
    setPassphraseLoading(false);
  }

  function formatAgent(agent: string): string {
    if (!agent) return 'Unknown device';
    if (agent.includes('Chrome') && agent.includes('Windows')) return 'Chrome (Windows)';
    if (agent.includes('Chrome') && agent.includes('Android')) return 'Chrome (Android)';
    if (agent.includes('Chrome') && agent.includes('Mac')) return 'Chrome (Mac)';
    if (agent.includes('Firefox')) return 'Firefox';
    if (agent.includes('Safari') && !agent.includes('Chrome')) return 'Safari';
    if (agent.includes('Edge')) return 'Edge';
    if (agent.includes('iPhone') || agent.includes('iPad')) return 'iPhone/iPad';
    return agent.slice(0, 40);
  }

  async function save() {
    setSaving(true);
    try {
      await api.put('/api/settings', form);
      const u = JSON.parse(localStorage.getItem('wa_user') || '{}');
      localStorage.setItem('wa_user', JSON.stringify({ ...u, name: form.name, language: form.language }));
      setUserData(prev => prev ? { ...prev, ...form } : prev);
      window.dispatchEvent(new Event('langchange'));
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch {}
    setSaving(false);
  }

  async function disconnect() {
    if (!confirm('WhatsApp disconnect karna chahte hain?')) return;
    try { await api.post(`/api/wa/disconnect/${userId}`); setWaStatus({ connected: false }); setUserData(prev => prev ? { ...prev, wa_connected: false } : prev); setTimeout(() => window.location.href = '/connect-wa', 500); } catch {}
  }

  const upd = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const trialDaysLeft = userData?.trial_ends ? Math.max(0, Math.ceil((new Date(userData.trial_ends).getTime() - Date.now()) / 86400000)) : null;
  const plan = PLAN_STYLE[userData?.plan || 'free'];
  const isPremium = userData?.plan === 'premium' || userData?.plan === 'enterprise';

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--bg3)' }}>
          <User size={18} style={{ color: 'var(--text2)' }} />
        </span>
        <div>
          <h1 className="brand text-xl font-bold" style={{ color: 'var(--text)' }}>Settings</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Manage your account</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
        <div className="flex items-center gap-4 mb-5">
          <span className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0" style={{ background: 'var(--green-gradient)', color: '#fff' }}>
            {(form.name || userData?.name || '?')[0].toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base truncate" style={{ color: 'var(--text)' }}>{form.name || userData?.name}</p>
            <p className="text-sm" style={{ color: 'var(--text3)' }}>{userData?.phone}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: plan.color + '18', color: plan.color }}>{plan.label}</span>
              {userData?.plan === 'trial' && trialDaysLeft !== null && (
                <span className="text-[11px]" style={{ color: 'var(--text3)' }}>{trialDaysLeft}d left</span>
              )}
            </div>
          </div>
          {isPremium && <Crown size={20} style={{ color: '#facc15' }} />}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text3)' }}>Name</label>
            <input value={form.name} onChange={e => upd('name', e.target.value)} className="field" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text3)' }}>Phone</label>
            <input value={userData?.phone || ''} disabled className="field opacity-50 cursor-not-allowed" />
          </div>
        </div>
      </div>

      {/* Language & AI */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Globe size={15} /> AI Language
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text3)' }}>Reply language</label>
            <select value={form.language} onChange={e => upd('language', e.target.value)} className="field">
              <option value="roman_ur">Roman Urdu</option>
              <option value="urdu">اردو (Urdu)</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg3)' }}>
            <div className="flex items-center gap-3">
              <Bot size={16} style={{ color: 'var(--text3)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Auto-Reply</p>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>{form.ai_auto_reply ? 'AI replies are ON' : 'AI replies are OFF'}</p>
              </div>
            </div>
            <div onClick={() => upd('ai_auto_reply', !form.ai_auto_reply)} className={`toggle ${form.ai_auto_reply ? 'on' : 'off'}`}><div className="knob" /></div>
          </div>
        </div>
      </div>

      {/* WhatsApp */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Smartphone size={15} /> WhatsApp
        </h2>
        <div className="flex items-center gap-3 p-3 rounded-xl mb-3" style={{ background: waStatus?.connected ? 'var(--green-dim)' : 'rgba(220,50,50,0.08)' }}>
          {waStatus?.connected ? <Wifi size={16} style={{ color: 'var(--green)' }} /> : <WifiOff size={16} style={{ color: '#e05a5a' }} />}
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: waStatus?.connected ? 'var(--green)' : '#e05a5a' }}>
              {waStatus?.connected ? `Connected ${waStatus.phone || ''}` : 'Not connected'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              {waStatus?.connected ? 'Status and AI replies are active' : 'Connect to enable WhatsApp features'}
            </p>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--text3)' }} />
        </div>
        {waStatus?.connected ? (
          <button onClick={disconnect} className="text-xs font-medium px-4 py-2 rounded-xl transition-all" style={{ color: '#e05a5a', border: '0.5px solid rgba(220,50,50,0.3)' }}>Disconnect</button>
        ) : (
          <Link href="/connect-wa" className="btn-primary text-sm">Connect WhatsApp</Link>
        )}
      </div>

      {/* Plan */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Crown size={15} /> Plan
        </h2>
        <div className="flex items-center justify-between p-3 rounded-xl mb-3" style={{ background: 'var(--bg3)' }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: plan.color }}>{plan.label}</p>
            {userData?.plan === 'trial' && trialDaysLeft !== null && (
              <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#60a5fa' }}><Clock size={11} /> {trialDaysLeft} days remaining</p>
            )}
          </div>
          {isPremium && <ShieldCheck size={20} style={{ color: '#facc15' }} />}
        </div>
        {!isPremium && (
          <div className="p-3 rounded-xl text-xs space-y-1" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
            <p className="font-semibold mb-2" style={{ color: '#facc15' }}>Premium features:</p>
            <p>✅ Unlimited AI auto-replies</p>
            <p>✅ Images in WhatsApp status</p>
            <p>✅ Unlimited status posts</p>
            <p>✅ Advanced analytics</p>
            <Link href="/dashboard/subscription" className="mt-3 btn-primary w-full justify-center text-xs flex items-center gap-1.5">
              <Crown size={12} />Upgrade Now
            </Link>
          </div>
        )}
      </div>

      {/* Extra Encryption (Passphrase) */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <KeyRound size={15} /> Extra Encryption
        </h2>
        <div className="p-3 rounded-xl mb-3" style={{ background: 'var(--bg3)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--text3)' }}>
            {hasPassphrase
              ? '✅ Passphrase set hai — messages double encryption se store hote hain. Server key + aapka passphrase dono chahiye decrypt karne ke liye.'
              : 'Passphrase set karein taake koi server access kare to bhi aapke messages nahi padh sakta. Ye aapke password se alag hai.'}
          </p>
          {!hasPassphrase ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input value={passphrase} onChange={e => setPassphrase(e.target.value)}
                  type={passphraseShow ? 'text' : 'password'} placeholder="Enter secret passphrase (min 6 chars)" className="field pr-8"
                  onKeyDown={e => { if (e.key === 'Enter') setPassphraseFn(); }} />
                <button onClick={() => setPassphraseShow(!passphraseShow)} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }}>
                  {passphraseShow ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button onClick={setPassphraseFn} disabled={passphraseLoading || passphrase.length < 6} className="btn-primary text-sm shrink-0">
                {passphraseLoading ? <Loader2 size={14} className="animate-spin" /> : 'Set'}
              </button>
            </div>
          ) : (
            <button onClick={removePassphraseFn} disabled={passphraseLoading} className="text-xs font-medium px-4 py-2 rounded-xl transition-all" style={{ color: '#e05a5a', border: '0.5px solid rgba(220,50,50,0.3)' }}>
              {passphraseLoading ? 'Removing...' : 'Remove Passphrase'}
            </button>
          )}
          {passphraseMsg && <p className="text-xs mt-2" style={{ color: 'var(--green)' }}>{passphraseMsg}</p>}
          {passphraseErr && <p className="text-xs mt-2" style={{ color: '#e05a5a' }}>{passphraseErr}</p>}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Monitor size={15} /> Active Sessions
        </h2>
        {sessionsLoading ? (
          <div className="flex items-center justify-center py-4"><Loader2 size={18} className="animate-spin" style={{ color: 'var(--text3)' }} /></div>
        ) : sessions.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text3)' }}>No active sessions</p>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.token_preview} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: s.is_current ? 'var(--green-dim)' : 'var(--bg3)' }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.is_current ? 'var(--green)' : 'var(--bg3)', color: s.is_current ? '#fff' : 'var(--text3)' }}>
                  <Monitor size={14} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                    {formatAgent(s.agent)}
                    {s.is_current && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--green)', color: '#fff' }}>Current</span>}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text3)' }}>
                    {s.ip || 'IP unknown'} · {new Date(s.created).toLocaleDateString()}
                    {s.last_active && ` · ${Math.round((Date.now()/1000 - s.last_active)/60)}m ago`}
                  </p>
                </div>
              </div>
            ))}
            {sessions.length > 1 && (
              <button onClick={revokeAll} disabled={revoking} className="text-xs font-medium px-4 py-2 rounded-xl transition-all w-full flex items-center justify-center gap-1.5" style={{ color: '#e05a5a', border: '0.5px solid rgba(220,50,50,0.3)' }}>
                <Trash2 size={12} /> {revoking ? 'Revoking...' : 'Revoke all other sessions'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Save */}
      <button onClick={save} disabled={saving} className="btn-primary w-full justify-center" style={{ opacity: saving ? 0.6 : 1 }}>
        {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}

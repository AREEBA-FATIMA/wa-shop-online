'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Radio, Send, Loader2, Calendar, Settings2, Hash } from 'lucide-react';
import Link from 'next/link';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function StatusPage() {
  const [count, setCount] = useState(5);
  const [postTime, setPostTime] = useState('09:00');
  const [days, setDays] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const [waConnected, setWaConnected] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('wa_user') || '{}');
    setUserId(u.id || '');
    if (u.id) api.get(`/api/wa/status/${u.id}`).then(r => setWaConnected(r.data.connected)).catch(() => {});
  }, []);

  const toggleDay = (d: number) => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort());

  async function postNow() {
    if (!userId) return;
    setSending(true); setMsg('');
    try {
      const r = await api.post('/api/wa/status-post', { count });
      const results = r.data.results || [];
      const succeeded = results.filter((res: any) => res.success).length;
      const failed = results.filter((res: any) => !res.success).length;
      if (failed === 0) setMsg(`✅ ${succeeded} statuses posted!`);
      else setMsg(`⚠️ ${succeeded} posted, ${failed} failed`);
    } catch (e: any) { setMsg('❌ Error: ' + (e?.response?.data?.detail || e?.message || 'Connection error')); }
    setSending(false);
  }

  async function saveSchedule() {
    if (!userId) return;
    setSending(true); setMsg('');
    try { await api.post('/api/schedule', { user_id: userId, post_time: postTime, count, days_of_week: days }); setMsg('✅ Schedule saved!'); } catch { setMsg('❌ Schedule failed'); }
    setSending(false);
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--green-dim)' }}>
          <Radio size={18} style={{ color: 'var(--green)' }} />
        </span>
        <div className="flex-1">
          <h1 className="brand text-xl font-bold" style={{ color: 'var(--text)' }}>Status</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Rozana stock mein se products ki status auto-post karein</p>
        </div>
        {!waConnected && (
          <Link href="/connect-wa" className="text-xs font-medium px-3 py-1.5 rounded-full shrink-0" style={{ background: 'rgba(220,50,50,0.1)', color: '#e05a5a' }}>
            Connect WA
          </Link>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl p-4" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Hash size={14} />Products per day
          </h2>
          <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>Har roz stock mein se itne products random select honge aur alag status story lage gi</p>
          <input type="number" min={1} max={50} value={count} onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="field text-lg font-bold text-center" style={{ maxWidth: 120 }} />
        </div>

        <div className="rounded-2xl p-4" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Calendar size={14} />Auto Schedule
          </h2>
          <div className="mb-3">
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text3)' }}>Post time</label>
            <input type="time" value={postTime} onChange={e => setPostTime(e.target.value)} className="field" />
          </div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text3)' }}>Days</label>
          <div className="flex gap-1.5 flex-wrap">
            {DAYS.map((d, i) => (
              <button key={d} onClick={() => toggleDay(i + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: days.includes(i + 1) ? 'var(--green)' : 'var(--bg3)', color: days.includes(i + 1) ? '#fff' : 'var(--text2)' }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={postNow} disabled={sending || !waConnected}
            className="btn-primary flex-1 justify-center text-sm" style={{ opacity: sending || !waConnected ? 0.5 : 1 }}>
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Post Now
          </button>
          <button onClick={saveSchedule} disabled={sending}
            className="btn-ghost flex-1 justify-center text-sm" style={{ opacity: sending ? 0.5 : 1 }}>
            <Settings2 size={14} /> Schedule
          </button>
        </div>

        {msg && (
          <p className="text-sm text-center py-2.5 px-4 rounded-xl" style={msg.startsWith('✅') ? { background: 'var(--green-dim)', color: 'var(--green)' } : { background: 'rgba(220,50,50,0.08)', color: '#e05a5a' }}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

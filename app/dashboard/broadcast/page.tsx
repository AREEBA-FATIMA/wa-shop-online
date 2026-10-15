'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Megaphone, Send, Loader2, AlertTriangle, Users } from 'lucide-react';
import { useT } from '@/contexts/LangContext';

export default function BroadcastPage() {
  const { t } = useT();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const [waConnected, setWaConnected] = useState(true);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('wa_user') || '{}');
      if (u.id) api.get(`/api/wa/status/${u.id}`).then(r => setWaConnected(!!r.data.connected)).catch(() => {});
    } catch {}
  }, []);

  async function send() {
    if (!message.trim()) return;
    if (!confirm(t('bc_confirm'))) return;
    setSending(true); setMsg('');
    try {
      const r = await api.post('/api/broadcast', { message: message.trim() });
      const d = r.data;
      if ((d.total ?? 0) === 0) setMsg(t('bc_no_customers'));
      else setMsg(t('bc_result', { sent: String(d.sent ?? 0), failed: String(d.failed ?? 0) }));
      if ((d.sent ?? 0) > 0) setMessage('');
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || 'Error');
    }
    setSending(false);
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--green-dim)' }}>
          <Megaphone size={18} style={{ color: 'var(--green)' }} />
        </span>
        <div className="flex-1">
          <h1 className="brand text-xl font-bold" style={{ color: 'var(--text)' }}>{t('bc_title')}</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>{t('bc_sub')}</p>
        </div>
      </div>

      {!waConnected && (
        <Link href="/connect-wa" className="flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-xl mb-4"
          style={{ background: 'rgba(220,50,50,0.08)', color: '#e05a5a' }}>
          <AlertTriangle size={15} /> {t('bc_connect_first')}
        </Link>
      )}

      <div className="rounded-2xl p-4" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} maxLength={2000}
          placeholder={t('bc_placeholder')} className="field" style={{ resize: 'vertical', lineHeight: 1.6 }} />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px]" style={{ color: 'var(--text3)' }}>{message.length}/2000</span>
        </div>

        <div className="flex items-start gap-2 mt-3 mb-4 text-[11px] rounded-lg p-2.5"
          style={{ background: 'rgba(196,130,14,0.08)', color: 'var(--amber)' }}>
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          <span>{t('bc_warn')}</span>
        </div>

        <button onClick={send} disabled={sending || !message.trim() || !waConnected}
          className="btn-primary w-full justify-center" style={{ opacity: sending || !message.trim() || !waConnected ? 0.5 : 1 }}>
          {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          {sending ? t('bc_sending') : t('bc_send')}
        </button>

        {msg && (
          <p className="text-sm text-center mt-3 py-2.5 px-4 rounded-xl"
            style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>{msg}</p>
        )}
      </div>
    </div>
  );
}

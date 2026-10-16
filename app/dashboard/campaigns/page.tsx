'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useT } from '@/contexts/LangContext';
import { Percent, Plus, Trash2, Loader2, Check, X, Calendar, Zap } from 'lucide-react';

interface Campaign {
  id: string; name: string; percent: number; active: boolean; live: boolean;
  starts_at: string | null; ends_at: string | null;
}

const PRESETS = [
  { name: '10.10 Sale', percent: 20 },
  { name: 'Eid Sale', percent: 25 },
  { name: 'Azadi Sale', percent: 14 },
  { name: 'Black Friday', percent: 40 },
];

export default function CampaignsPage() {
  const { t } = useT();
  const [list, setList] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ name: '', percent: 20, starts_at: '', ends_at: '', active: true });

  async function load() { try { const r = await api.get('/api/campaigns'); setList(r.data); } catch {} finally { setLoading(false); } }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.name.trim()) { setErr(t('camp_name_req')); return; }
    if (!form.percent || form.percent < 1 || form.percent > 90) { setErr(t('camp_pct_req')); return; }
    setSaving(true); setErr('');
    try {
      await api.post('/api/campaigns', {
        name: form.name.trim(), percent: Number(form.percent), active: form.active,
        starts_at: form.starts_at || null, ends_at: form.ends_at || null,
      });
      setOpen(false); setForm({ name: '', percent: 20, starts_at: '', ends_at: '', active: true });
      await load();
    } catch (e: any) { setErr(e?.response?.data?.detail || 'Error'); }
    setSaving(false);
  }

  async function toggleActive(c: Campaign) {
    try { await api.put(`/api/campaigns/${c.id}`, { active: !c.active }); await load(); } catch {}
  }
  async function del(id: string) {
    if (!confirm(t('camp_delete_confirm'))) return;
    try { await api.delete(`/api/campaigns/${id}`); await load(); } catch {}
  }

  const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString() : '—';

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--green-dim)' }}>
          <Percent size={18} style={{ color: 'var(--green)' }} />
        </span>
        <div className="flex-1">
          <h1 className="brand text-xl font-bold" style={{ color: 'var(--text)' }}>{t('camp_title')}</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>{t('camp_sub')}</p>
        </div>
        <button onClick={() => { setOpen(true); setErr(''); }} className="btn-primary text-sm"><Plus size={15} /> {t('camp_new')}</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="rounded-2xl skeleton h-20" />)}</div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ background: 'var(--bg3)' }}>
            <Percent size={30} style={{ color: 'var(--text3)' }} />
          </div>
          <p className="font-semibold mb-1" style={{ color: 'var(--text3)' }}>{t('camp_empty')}</p>
          <p className="text-sm mb-5 text-center max-w-xs" style={{ color: 'var(--text3)' }}>{t('camp_empty_sub')}</p>
          <button onClick={() => { setOpen(true); setErr(''); }} className="btn-primary text-sm">{t('camp_new')}</button>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(c => (
            <div key={c.id} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
              <span className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm" style={{ background: c.live ? 'rgba(234,88,12,0.12)' : 'var(--bg3)', color: c.live ? '#ea580c' : 'var(--text3)' }}>
                {c.percent}%
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate" style={{ color: 'var(--text)' }}>{c.name}</p>
                  {c.live && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(234,88,12,0.95)', color: '#fff' }}><Zap size={9} /> {t('camp_live')}</span>}
                </div>
                <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--text3)' }}>
                  <Calendar size={11} /> {fmtDate(c.starts_at)} → {fmtDate(c.ends_at)}
                </p>
              </div>
              <div onClick={() => toggleActive(c)} className={`toggle ${c.active ? 'on' : 'off'}`} title={c.active ? t('camp_on') : t('camp_off')}><div className="knob" /></div>
              <button onClick={() => del(c.id)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: '#e05a5a' }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 rounded-2xl text-xs leading-relaxed" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', color: 'var(--text3)' }}>
        {t('camp_how')}
      </div>

      {/* Sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg rounded-t-3xl animate-slide-up max-h-[92vh] overflow-y-auto" style={{ background: 'var(--bg2)' }} onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-1" style={{ background: 'var(--bg4)' }} />
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '0.5px solid var(--border)' }}>
              <h2 className="font-bold text-base" style={{ color: 'var(--text)' }}>{t('camp_new')}</h2>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-xl hover:opacity-70" style={{ color: 'var(--text3)' }}><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Presets */}
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text3)' }}>{t('camp_presets')}</label>
                <div className="flex gap-1.5 flex-wrap">
                  {PRESETS.map(p => (
                    <button key={p.name} type="button" onClick={() => setForm(f => ({ ...f, name: p.name, percent: p.percent }))}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: 'var(--green-dim)', color: 'var(--green)', border: '0.5px solid rgba(37,211,102,0.3)' }}>
                      {p.name} · {p.percent}%
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text3)' }}>{t('camp_name')}</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t('camp_name_ph')} className="field" maxLength={100} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text3)' }}>{t('camp_percent')}</label>
                <input type="number" min={1} max={90} value={form.percent} onChange={e => setForm(f => ({ ...f, percent: parseInt(e.target.value) || 0 }))} className="field text-lg font-bold" style={{ maxWidth: 120 }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text3)' }}>{t('camp_start')}</label>
                  <input type="date" value={form.starts_at} onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))} className="field" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text3)' }}>{t('camp_end')}</label>
                  <input type="date" value={form.ends_at} onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))} className="field" />
                </div>
              </div>
              <p className="text-[11px]" style={{ color: 'var(--text3)' }}>{t('camp_date_hint')}</p>
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg3)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t('camp_activate')}</p>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>{t('camp_activate_sub')}</p>
                </div>
                <div onClick={() => setForm(f => ({ ...f, active: !f.active }))} className={`toggle ${form.active ? 'on' : 'off'}`}><div className="knob" /></div>
              </div>
              {err && <p className="text-xs text-center py-2 px-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>{err}</p>}
              <button onClick={save} disabled={saving} className="btn-primary w-full justify-center" style={{ opacity: saving ? 0.6 : 1 }}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {t('camp_create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Radio, Send, Clock, Check, Package, Loader2, Image as ImageIcon, Calendar, Settings2 } from 'lucide-react';
import Link from 'next/link';

interface Product { id: string; name: string; price: number; discount_price: number | null; stock: number; include_in_status: boolean; image_url?: string; }

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function StatusPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [postTime, setPostTime] = useState('09:00');
  const [days, setDays] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const [preview, setPreview] = useState('');
  const [waConnected, setWaConnected] = useState(false);
  const [userId, setUserId] = useState('');
  const [imageMode, setImageMode] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('wa_user') || '{}');
    setUserId(u.id || '');
    api.get('/api/products').then(r => { setProducts(r.data); setSelected(r.data.filter((p: Product) => p.include_in_status).map((p: Product) => p.id)); }).catch(() => {});
    if (u.id) api.get(`/api/wa/status/${u.id}`).then(r => setWaConnected(r.data.connected)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selected.length === 0) { setPreview(''); return; }
    const sel = products.filter(p => selected.includes(p.id));
    let text = '🛍️ *Aaj ki Products*\n\n';
    sel.forEach(p => {
      const price = p.discount_price || p.price;
      text += `✅ *${p.name}*\n`;
      text += `   💰 Rs.${price}`;
      if (p.discount_price && p.discount_price < p.price) text += ` ~~Rs.${p.price}~~`;
      text += `\n   📦 Stock: ${p.stock} baqi\n\n`;
    });
    text += '_Order ke liye reply karein! 📲_';
    setPreview(text);
  }, [selected, products]);

  const toggleDay = (d: number) => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort());
  const toggleProduct = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const firstImage = products.find(p => selected.includes(p.id) && p.image_url)?.image_url;

  async function postNow() {
    if (!userId) return;
    setSending(true); setMsg('');
    try {
      const r = await api.post('/api/wa/status-post', { product_ids: selected });
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
    try { await api.post('/api/schedule', { user_id: userId, post_time: postTime, product_ids: selected, days_of_week: days }); setMsg('✅ Schedule saved!'); } catch { setMsg('❌ Schedule failed'); }
    setSending(false);
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--green-dim)' }}>
          <Radio size={18} style={{ color: 'var(--green)' }} />
        </span>
        <div className="flex-1">
          <h1 className="brand text-xl font-bold" style={{ color: 'var(--text)' }}>Status</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Auto-post products to WhatsApp daily</p>
        </div>
        {!waConnected && (
          <Link href="/connect-wa" className="text-xs font-medium px-3 py-1.5 rounded-full shrink-0" style={{ background: 'rgba(220,50,50,0.1)', color: '#e05a5a' }}>
            Connect WA
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Left */}
        <div className="space-y-4">
          {/* Products picker */}
          <div className="rounded-2xl p-4" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Package size={14} />Select Products
            </h2>
            {products.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text3)' }}>No products yet — add some first</p>
            ) : (
              <div className="space-y-1">
                {products.map(p => (
                  <div key={p.id} onClick={() => toggleProduct(p.id)} className="flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all hover:opacity-80">
                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors`}
                      style={{ background: selected.includes(p.id) ? 'var(--green)' : 'transparent', border: selected.includes(p.id) ? 'none' : '1.5px solid var(--border2)' }}>
                      {selected.includes(p.id) && <Check size={12} className="text-white" />}
                    </div>
                    {p.image_url && <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{p.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text3)' }}>Rs.{p.discount_price || p.price} · {p.stock} left</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image toggle */}
          {firstImage && (
            <div className="rounded-2xl p-4" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ImageIcon size={15} style={{ color: 'var(--text3)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Include image</p>
                    <p className="text-xs" style={{ color: 'var(--text3)' }}>First product image</p>
                  </div>
                </div>
                <div onClick={() => setImageMode(!imageMode)} className={`toggle ${imageMode ? 'on' : 'off'}`}><div className="knob" /></div>
              </div>
              {imageMode && <img src={firstImage} alt="" className="mt-3 w-full h-28 object-cover rounded-xl" />}
            </div>
          )}

          {/* Schedule */}
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

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={postNow} disabled={sending || selected.length === 0 || !waConnected}
              className="btn-primary flex-1 justify-center text-sm" style={{ opacity: sending || selected.length === 0 || !waConnected ? 0.5 : 1 }}>
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Post Now
            </button>
            <button onClick={saveSchedule} disabled={sending || selected.length === 0}
              className="btn-ghost flex-1 justify-center text-sm" style={{ opacity: sending || selected.length === 0 ? 0.5 : 1 }}>
              <Settings2 size={14} /> Schedule
            </button>
          </div>

          {msg && (
            <p className="text-sm text-center py-2.5 px-4 rounded-xl" style={msg.startsWith('✅') ? { background: 'var(--green-dim)', color: 'var(--green)' } : { background: 'rgba(220,50,50,0.08)', color: '#e05a5a' }}>
              {msg}
            </p>
          )}
        </div>

        {/* Right: Preview */}
        <div>
          <div className="rounded-2xl p-4 sticky top-4" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Preview</h2>
            {/* Phone mockup */}
            <div className="rounded-2xl overflow-hidden max-w-xs mx-auto" style={{ background: 'var(--bg3)', border: '0.5px solid var(--border)' }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'var(--bg2)', borderBottom: '0.5px solid var(--border)' }}>
                <span className="w-3 h-3 rounded-full" style={{ background: 'var(--green)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>WhatsApp Status</span>
              </div>
              {preview ? (
                <div className="p-4">
                  {imageMode && firstImage && <img src={firstImage} alt="" className="w-full h-32 object-cover rounded-xl mb-3" />}
                  <div className="text-sm whitespace-pre-line leading-relaxed" style={{ color: 'var(--text)' }}>{preview}</div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Radio size={28} className="mx-auto mb-3" style={{ color: 'var(--text3)' }} />
                  <p className="text-sm" style={{ color: 'var(--text3)' }}>Select products to preview</p>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-1 text-xs" style={{ color: 'var(--text3)' }}>
              <p>Status is only visible to your WhatsApp contacts</p>
              <p>Add product images in the Products page</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

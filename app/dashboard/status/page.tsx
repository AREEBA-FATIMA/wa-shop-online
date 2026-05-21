'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Radio, Send, Clock, Check, Package, Loader2, Image as ImageIcon } from 'lucide-react';

interface Product {
  id: string; name: string; price: number; discount_price: number | null;
  stock: number; include_in_status: boolean; image_url?: string;
}

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
    api.get('/api/products').then(r => {
      setProducts(r.data);
      setSelected(r.data.filter((p: Product) => p.include_in_status).map((p: Product) => p.id));
    }).catch(() => {});
    if (u.id) {
      api.get(`/api/wa/status/${u.id}`)
        .then(r => setWaConnected(r.data.connected))
        .catch(() => {});
    }
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

  const toggleDay = (d: number) =>
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort());

  const toggleProduct = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const firstImage = products.find(p => selected.includes(p.id) && p.image_url)?.image_url;

  async function postNow() {
    if (!userId) return;
    setSending(true); setMsg('');
    try {
      const payload: any = { user_id: String(userId), text: preview };
      if (imageMode && firstImage) payload.image_url = firstImage;

      const r = await api.post('/api/wa/status-post', payload);
      if (r.data.success) setMsg('✅ Status WhatsApp par post ho gaya!');
      else setMsg('❌ Error: ' + (r.data.error || 'Unknown'));
    } catch (e: any) {
      setMsg('❌ Error: ' + (e?.response?.data?.detail || e?.message || 'Connection error'));
    }
    setSending(false);
  }

  async function saveSchedule() {
    if (!userId) return;
    setSending(true); setMsg('');
    try {
      await api.post('/api/schedule', {
        user_id: userId, post_time: postTime,
        product_ids: selected, days_of_week: days
      });
      setMsg('✅ Schedule save ho gaya! Roz apne time par status lagega.');
    } catch {
      setMsg('❌ Schedule save nahi hua');
    }
    setSending(false);
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Radio size={20} style={{ color: 'var(--green)' }} />
        <div className="flex-1">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>WhatsApp Status</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Products ka status lagao — abhi ya schedule karein</p>
        </div>
        {!waConnected && (
          <span className="text-xs px-3 py-1 rounded-full shrink-0"
            style={{ background: 'rgba(220,50,50,0.1)', color: '#e05a5a' }}>
            WA connected nahi
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Left */}
        <div className="space-y-4">
          {/* Products */}
          <div className="card p-5">
            <h2 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Package size={14} /> Products Select Karein
            </h2>
            {products.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text3)' }}>Koi product nahi — pehle products add karein</p>
            ) : (
              <div className="space-y-1.5">
                {products.map(p => (
                  <div key={p.id} onClick={() => toggleProduct(p.id)}
                    className="flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all hover:opacity-80">
                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${selected.includes(p.id) ? '' : 'border-2'}`}
                      style={{
                        background: selected.includes(p.id) ? 'var(--green)' : 'transparent',
                        borderColor: selected.includes(p.id) ? 'transparent' : 'var(--border)',
                      }}>
                      {selected.includes(p.id) && <Check size={12} className="text-white" />}
                    </div>
                    {p.image_url && (
                      <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{p.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text3)' }}>
                        Rs.{p.discount_price || p.price} · {p.stock} baqi
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image toggle */}
          {firstImage && (
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon size={14} style={{ color: 'var(--text3)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Image ke saath post karo</p>
                    <p className="text-xs" style={{ color: 'var(--text3)' }}>Pehle selected product ki image use hogi</p>
                  </div>
                </div>
                <div onClick={() => setImageMode(!imageMode)}
                  className={`toggle ${imageMode ? 'on' : 'off'}`}>
                  <div className="knob" />
                </div>
              </div>
              {imageMode && (
                <img src={firstImage} alt="Preview" className="mt-3 w-full h-28 object-cover rounded-xl" />
              )}
            </div>
          )}

          {/* Schedule */}
          <div className="card p-5">
            <h2 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Clock size={14} /> Auto Schedule
            </h2>
            <div className="mb-3">
              <label className="text-xs mb-1 block font-medium" style={{ color: 'var(--text3)' }}>Post time</label>
              <input type="time" value={postTime} onChange={e => setPostTime(e.target.value)}
                className="field" />
            </div>
            <div>
              <label className="text-xs mb-2 block font-medium" style={{ color: 'var(--text3)' }}>Kaunse din</label>
              <div className="flex gap-1 flex-wrap">
                {DAYS.map((d, i) => (
                  <button key={d} onClick={() => toggleDay(i + 1)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: days.includes(i + 1) ? 'var(--green)' : 'var(--bg3)',
                      color: days.includes(i + 1) ? '#fff' : 'var(--text2)',
                      border: days.includes(i + 1) ? 'none' : '0.5px solid var(--border)',
                    }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={postNow} disabled={sending || selected.length === 0 || !waConnected}
              className="btn-primary flex-1 justify-center text-sm"
              style={{ opacity: sending || selected.length === 0 || !waConnected ? 0.5 : 1 }}>
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Abhi Post Karo
            </button>
            <button onClick={saveSchedule} disabled={sending || selected.length === 0}
              className="btn-ghost flex-1 justify-center text-sm"
              style={{ opacity: sending || selected.length === 0 ? 0.5 : 1 }}>
              <Clock size={14} /> Schedule
            </button>
          </div>

          {msg && (
            <p className={`text-sm text-center py-2 px-4 rounded-xl ${msg.startsWith('✅') ? '' : ''}`}
              style={msg.startsWith('✅') ? { background: 'var(--green-dim)', color: 'var(--green)' } : { background: 'rgba(220,50,50,0.08)', color: '#e05a5a' }}>
              {msg}
            </p>
          )}
        </div>

        {/* Right: Preview */}
        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>Status Preview</h2>
          {preview ? (
            <div>
              {imageMode && firstImage && (
                <img src={firstImage} alt="Status image" className="w-full h-36 object-cover rounded-xl mb-3" />
              )}
              <div className="rounded-xl p-4 text-sm whitespace-pre-line leading-relaxed"
                style={{ background: 'var(--bg3)', color: 'var(--text)' }}>
                {preview}
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg3)' }}>
              <Radio size={28} className="mx-auto mb-3" style={{ color: 'var(--text3)' }} />
              <p className="text-sm" style={{ color: 'var(--text3)' }}>Products select karo preview ke liye</p>
            </div>
          )}
          <div className="mt-4 p-3 rounded-xl border text-xs space-y-1"
            style={{ borderColor: 'var(--border)', color: 'var(--text3)' }}>
            <p>ℹ️ Status sirf WhatsApp contacts ko dikhta hai</p>
            <p>ℹ️ Products mein image add karo "Products" page se</p>
            <p>ℹ️ "Image ke saath" ON karo toh picture bhi status mein lagti hai</p>
          </div>
        </div>
      </div>
    </div>
  );
}

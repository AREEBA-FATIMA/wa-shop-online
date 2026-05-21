'use client';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Plus, Edit2, Trash2, Package, X, Loader2, Check, Camera } from 'lucide-react';

interface Product {
  id: string; name: string; description: string; price: number;
  discount_price: number | null; floor_price: number; stock: number;
  category: string | null; include_in_status: boolean; image_url?: string;
}

const EMPTY: Omit<Product, 'id'> = {
  name: '', description: '', price: 0, discount_price: null,
  floor_price: 0, stock: 0, category: '', include_in_status: true, image_url: ''
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [imgUploading, setImgUploading] = useState(false);
  const [imgPreview, setImgPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    try { const r = await api.get('/api/products'); setProducts(r.data); }
    catch { } finally { setLoading(false); }
  }

  function openAdd() {
    setForm(EMPTY); setEditing(null); setModal(true);
    setErr(''); setImgPreview('');
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name, description: p.description, price: p.price,
      discount_price: p.discount_price, floor_price: p.floor_price,
      stock: p.stock, category: p.category || '', include_in_status: p.include_in_status,
      image_url: p.image_url || ''
    });
    setEditing(p); setModal(true); setErr('');
    setImgPreview(p.image_url || '');
  }

  async function save() {
    if (!form.name || !form.price || !form.floor_price) {
      setErr('Name, price aur floor price zaroor bharo'); return;
    }
    setSaving(true); setErr('');
    try {
      if (editing) await api.put(`/api/products/${editing.id}`, form);
      else await api.post('/api/products', form);
      setModal(false); await load();
    } catch (e: any) { setErr(e.response?.data?.detail || 'Error saving'); }
    setSaving(false);
  }

  async function del(id: string) {
    if (!confirm('Delete karna chahte hain?')) return;
    try { await api.delete(`/api/products/${id}`); await load(); } catch { }
  }

  function upd(k: string, v: any) { setForm(f => ({ ...f, [k]: v })); }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErr('Sirf image files allowed hain'); return; }
    if (file.size > 5 * 1024 * 1024) { setErr('Image 5MB se bari nahi honi chahiye'); return; }

    const reader = new FileReader();
    reader.onload = (ev) => setImgPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    if (editing) {
      setImgUploading(true);
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.onerror = () => reject(new Error('File read failed'));
          r.readAsDataURL(file);
        });
        const res = await api.post(`/api/products/${editing.id}/image`, { image_data: base64 });
        upd('image_url', res.data.image_url);
        setEditing(prev => prev ? { ...prev, image_url: res.data.image_url } : prev);
        await load();
      } catch (e: any) {
        setErr('Image upload nahi hui: ' + (e.response?.data?.detail || e.message));
      }
      setImgUploading(false);
    } else {
      const reader2 = new FileReader();
      reader2.onload = (ev) => {
        upd('image_url', ev.target?.result as string);
      };
      reader2.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Products</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>{products.length} products</p>
        </div>
        <button onClick={openAdd}
          className="btn-primary text-sm" style={{ padding: '10px 20px' }}>
          <Plus size={15} /> Product Add Karein
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-2xl skeleton" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="mx-auto mb-4" style={{ color: 'var(--text3)' }} />
          <p className="mb-2" style={{ color: 'var(--text3)' }}>Koi product nahi</p>
          <button onClick={openAdd} className="text-sm hover:underline font-medium" style={{ color: 'var(--green)' }}>
            Pehla product add karein
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p, i) => (
            <div key={p.id} className="card overflow-hidden group animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}>
              {p.image_url ? (
                <img src={p.image_url} alt={p.name}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-20 flex items-center justify-center" style={{ background: 'var(--bg3)' }}>
                  <Package size={24} style={{ color: 'var(--text3)' }} />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold leading-tight" style={{ color: 'var(--text)' }}>{p.name}</h3>
                  <div className="flex gap-1 shrink-0 ml-2">
                    <button onClick={() => openEdit(p)}
                      className="p-1.5 rounded-lg transition-all hover:opacity-70"
                      style={{ color: 'var(--text3)' }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => del(p.id)}
                      className="p-1.5 rounded-lg transition-all hover:opacity-70"
                      style={{ color: '#e05a5a' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {p.description && (
                  <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--text3)' }}>
                    {p.description}
                  </p>
                )}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text3)' }}>Selling Price</span>
                    <span className="font-medium" style={{ color: 'var(--text)' }}>
                      Rs.{p.discount_price || p.price}
                      {p.discount_price && p.discount_price < p.price && (
                        <span className="line-through ml-1" style={{ color: 'var(--text3)' }}>Rs.{p.price}</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text3)' }}>Floor (min)</span>
                    <span style={{ color: '#e8a030' }}>Rs.{p.floor_price}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text3)' }}>Stock</span>
                    <span className={p.stock <= 3 ? '' : ''}
                      style={p.stock <= 3 ? { color: '#e05a5a' } : { color: 'var(--text)' }}>
                      {p.stock} baqi
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium`}
                    style={p.include_in_status ? { background: 'var(--green-dim)', color: 'var(--green)' } : { background: 'var(--bg3)', color: 'var(--text3)' }}>
                    {p.include_in_status ? '📡 Status mein' : 'Status se bahir'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setModal(false)}>
          <div className="rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto card-elevated animate-scale-in"
            style={{ background: 'var(--bg)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b sticky top-0 z-10"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <h2 className="font-bold" style={{ color: 'var(--text)' }}>
                {editing ? 'Product Edit' : 'Naya Product'}
              </h2>
              <button onClick={() => setModal(false)} className="p-1 rounded-lg hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text3)' }}>
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Image upload */}
              <div>
                <label className="text-xs mb-2 block font-medium" style={{ color: 'var(--text3)' }}>
                  Product Image (gallery se)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImagePick}
                />
                {imgPreview ? (
                  <div className="relative rounded-xl overflow-hidden mb-2">
                    <img src={imgPreview} alt="Preview" className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 flex items-end justify-center pb-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={imgUploading}
                        className="flex items-center gap-1.5 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm hover:bg-black/80 transition-all">
                        {imgUploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                        {imgUploading ? 'Upload ho raha hai...' : 'Image Badlein'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:opacity-70"
                    style={{ borderColor: 'var(--border)', color: 'var(--text3)' }}>
                    <Camera size={22} />
                    <span className="text-xs">Gallery se image add karein</span>
                    <span className="text-xs" style={{ opacity: 0.6 }}>JPG, PNG, WebP — max 5MB</span>
                  </button>
                )}
              </div>

              {/* Text fields */}
              {[
                { label: 'Product Name *', key: 'name', type: 'text', placeholder: 'Lawn Shirt' },
                { label: 'Description', key: 'description', type: 'text', placeholder: 'White cotton, 3 sizes available' },
                { label: 'Original Price (Rs.) *', key: 'price', type: 'number', placeholder: '1200' },
                { label: 'Discount / Sale Price (Rs.)', key: 'discount_price', type: 'number', placeholder: '950 — agar sale chal rahi ho' },
                { label: 'Floor Price — minimum jo accept karo (Rs.) *', key: 'floor_price', type: 'number', placeholder: '850' },
                { label: 'Stock', key: 'stock', type: 'number', placeholder: '10' },
                { label: 'Category', key: 'category', type: 'text', placeholder: 'Clothes, Electronics...' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs mb-1 block font-medium" style={{ color: 'var(--text3)' }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as any)[f.key] ?? ''}
                    onChange={e => upd(f.key, f.type === 'number'
                      ? (e.target.value ? parseFloat(e.target.value) : null)
                      : e.target.value)}
                    placeholder={f.placeholder}
                    className="field"
                  />
                  {f.key === 'floor_price' && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                      ⚠️ AI customer ko yeh price kabhi nahi batayega — sirf andar ki baat hai
                    </p>
                  )}
                  {f.key === 'discount_price' && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                      Agar discount price dalo to AI customer ko sale price batayega
                    </p>
                  )}
                </div>
              ))}

              {/* Status toggle */}
              <div className="flex items-center gap-3">
                <div onClick={() => upd('include_in_status', !form.include_in_status)}
                  className={`toggle ${form.include_in_status ? 'on' : 'off'}`}>
                  <div className="knob" />
                </div>
                <span className="text-sm" style={{ color: 'var(--text)' }}>Daily Status mein include karo</span>
              </div>

              {err && <p className="text-sm" style={{ color: '#e05a5a' }}>{err}</p>}

              <button onClick={save} disabled={saving || imgUploading}
                className="btn-primary w-full justify-center"
                style={{ opacity: saving || imgUploading ? 0.6 : 1 }}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {editing ? 'Update Karein' : 'Add Karein'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Plus, Edit2, Trash2, Package, X, Loader2, Check, Camera, Grid3X3, List, Image as ImageIcon, DollarSign, Hash } from 'lucide-react';

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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [imgPreview, setImgPreview] = useState<string>('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() { try { const r = await api.get('/api/products'); setProducts(r.data); } catch {} finally { setLoading(false); } }

  function openAdd() { setForm(EMPTY); setEditing(null); setSheetOpen(true); setErr(''); setImgPreview(''); }
  function openEdit(p: Product) {
    setForm({ name: p.name, description: p.description, price: p.price, discount_price: p.discount_price, floor_price: p.floor_price, stock: p.stock, category: p.category || '', include_in_status: p.include_in_status, image_url: p.image_url || '' });
    setEditing(p); setSheetOpen(true); setErr(''); setImgPreview(p.image_url || '');
  }

  async function save() {
    if (!form.name || !form.price || !form.floor_price) { setErr('Name, price & floor price required'); return; }
    setSaving(true); setErr('');
    try {
      if (editing) await api.put(`/api/products/${editing.id}`, form);
      else await api.post('/api/products', form);
      setSheetOpen(false); await load();
    } catch (e: any) { setErr(e.response?.data?.detail || 'Error saving'); }
    setSaving(false);
  }

  async function del(id: string) { if (!confirm('Delete this product?')) return; try { await api.delete(`/api/products/${id}`); await load(); } catch {} }
  function upd(k: string, v: any) { setForm(f => ({ ...f, [k]: v })); }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { setErr('Only images allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { setErr('Image max 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setImgPreview(ev.target?.result as string); upd('image_url', ev.target?.result as string); };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="brand text-xl font-bold" style={{ color: 'var(--text)' }}>Products</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>{products.length} products</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: '0.5px solid var(--border)' }}>
            <button onClick={() => setView('grid')} className="p-2 transition-colors" style={{ background: view === 'grid' ? 'var(--bg3)' : 'transparent', color: view === 'grid' ? 'var(--text)' : 'var(--text3)' }}><Grid3X3 size={15} /></button>
            <button onClick={() => setView('list')} className="p-2 transition-colors" style={{ background: view === 'list' ? 'var(--bg3)' : 'transparent', color: view === 'list' ? 'var(--text)' : 'var(--text3)' }}><List size={15} /></button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={view === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {[1,2,3,4,5,6].map(i => <div key={i} className={`rounded-2xl skeleton ${view === 'grid' ? 'h-52' : 'h-16'}`} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ background: 'var(--bg3)' }}>
            <Package size={32} style={{ color: 'var(--text3)' }} />
          </div>
          <p className="font-semibold mb-1" style={{ color: 'var(--text3)' }}>No products yet</p>
          <p className="text-sm mb-5" style={{ color: 'var(--text3)' }}>Add your first product to get started</p>
          <button onClick={openAdd} className="btn-primary text-sm">Add Product</button>
        </div>
      ) : view === 'grid' ? (
        /* ─── Grid View ─── */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p, i) => (
            <div key={p.id} className="rounded-2xl overflow-hidden animate-fade-in-up transition-all hover:-translate-y-0.5" style={{ animationDelay: `${i * 0.05}s`, background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
              {/* Image */}
              <div className="relative h-36" style={{ background: 'var(--bg3)' }}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full"><ImageIcon size={28} style={{ color: 'var(--text3)' }} /></div>
                )}
                {/* Badge */}
                <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full`}
                  style={p.include_in_status ? { background: 'rgba(37,211,102,0.9)', color: '#fff' } : { background: 'rgba(0,0,0,0.4)', color: '#fff' }}>
                  {p.include_in_status ? 'Active' : 'Hidden'}
                </span>
                {/* Edit button overlay */}
                <button onClick={() => openEdit(p)} className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#fff' }}><Edit2 size={12} /></button>
              </div>
              {/* Info */}
              <div className="p-3.5">
                <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{p.name}</h3>
                {p.description && <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text3)' }}>{p.description}</p>}
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="font-bold" style={{ color: 'var(--green)' }}>Rs.{p.discount_price || p.price}</p>
                    {p.discount_price && <span className="text-[10px] line-through" style={{ color: 'var(--text3)' }}>Rs.{p.price}</span>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium" style={{ color: p.stock <= 3 ? '#e05a5a' : 'var(--text2)' }}>{p.stock} left</p>
                    {p.floor_price && <p className="text-[10px]" style={{ color: 'var(--text3)' }}>Floor: Rs.{p.floor_price}</p>}
                  </div>
                </div>
                {p.category && (
                  <div className="mt-2 flex">
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>{p.category}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ─── List View ─── */
        <div className="space-y-2">
          {products.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl transition-all animate-fade-in-up hover:scale-[1.002]" style={{ animationDelay: `${i * 0.03}s`, background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--bg3)' }}>
                {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><Package size={18} style={{ color: 'var(--text3)' }} /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{p.name}</p>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>Rs.{p.discount_price || p.price} · {p.stock} left</p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full`}
                style={p.include_in_status ? { background: 'var(--green-dim)', color: 'var(--green)' } : { background: 'var(--bg3)', color: 'var(--text3)' }}>
                {p.include_in_status ? 'Active' : 'Hidden'}
              </span>
              <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg transition-all hover:opacity-70" style={{ color: 'var(--text3)' }}><Edit2 size={13} /></button>
              <button onClick={() => del(p.id)} className="p-1.5 rounded-lg transition-all hover:opacity-70" style={{ color: '#e05a5a' }}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}

      {/* ─── FAB ─── */}
      {products.length > 0 && (
        <button onClick={openAdd} className="fab" style={{ bottom: '80px' }}>
          <Plus size={22} />
        </button>
      )}

      {/* ─── Bottom Sheet ─── */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setSheetOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg rounded-t-3xl animate-slide-up max-h-[92vh] overflow-y-auto" style={{ background: 'var(--bg2)' }} onClick={e => e.stopPropagation()}>
            {/* Handle */}
            <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-1" style={{ background: 'var(--bg4)' }} />
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '0.5px solid var(--border)' }}>
              <h2 className="font-bold text-base" style={{ color: 'var(--text)' }}>{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setSheetOpen(false)} className="p-1.5 rounded-xl transition-all hover:opacity-70" style={{ color: 'var(--text3)' }}><X size={18} /></button>
            </div>
            {/* Form */}
            <div className="p-5 space-y-4">
              {/* Image */}
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text3)' }}>Product Image</label>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                {imgPreview ? (
                  <div className="relative rounded-2xl overflow-hidden mb-2">
                    <img src={imgPreview} alt="Preview" className="w-full h-36 object-cover" />
                    <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                      <Camera size={12} style={{ display: 'inline', marginRight: 4 }} />Change
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="w-full h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all hover:opacity-70" style={{ borderColor: 'var(--border)', color: 'var(--text3)' }}>
                    <Camera size={20} />
                    <span className="text-xs">Add photo</span>
                  </button>
                )}
              </div>
              {/* Fields */}
              {[
                { label: 'Product Name', key: 'name', type: 'text', icon: Package },
                { label: 'Description', key: 'description', type: 'text', icon: null },
                { label: 'Price (Rs.)', key: 'price', type: 'number', icon: DollarSign },
                { label: 'Sale Price (Rs.)', key: 'discount_price', type: 'number', icon: null },
                { label: 'Floor Price (Rs.)', key: 'floor_price', type: 'number', icon: null, tip: 'Minimum price — AI never reveals this to customers' },
                { label: 'Stock', key: 'stock', type: 'number', icon: Hash },
                { label: 'Category', key: 'category', type: 'text', icon: null },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text3)' }}>{f.label}</label>
                  <div className="relative">
                    {f.icon && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }}>
                        <f.icon size={14} />
                      </span>
                    )}
                    <input type={f.type} value={(form as any)[f.key] ?? ''} onChange={e => upd(f.key, f.type === 'number' ? (e.target.value ? parseFloat(e.target.value) : null) : e.target.value)}
                      placeholder={f.label} className="field" style={f.icon ? { paddingLeft: '36px' } : {}} />
                  </div>
                  {f.tip && <p className="text-[11px] mt-1" style={{ color: 'var(--text3)' }}>{f.tip}</p>}
                </div>
              ))}
              {/* Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg3)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Include in daily status</p>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>Auto-post to WhatsApp status</p>
                </div>
                <div onClick={() => upd('include_in_status', !form.include_in_status)} className={`toggle ${form.include_in_status ? 'on' : 'off'}`}><div className="knob" /></div>
              </div>
              {err && <p className="text-xs text-center py-2 px-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>{err}</p>}
              <button onClick={save} disabled={saving} className="btn-primary w-full justify-center" style={{ opacity: saving ? 0.6 : 1 }}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {editing ? 'Update' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

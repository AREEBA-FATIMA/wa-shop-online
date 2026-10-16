'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MessageCircle, Package, Loader2 } from 'lucide-react';
import { useT } from '@/contexts/LangContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Item { id: string; name: string; description: string; price: number; discount_price: number | null; sale_price?: number; on_sale?: boolean; in_stock?: boolean; image_url?: string; category?: string; variants?: string; }
interface Camp { name: string; percent: number; }

export default function ShopPage() {
  const { t } = useT();
  const params = useParams();
  const id = (params?.id as string) || '';
  const [shop, setShop] = useState<{ shop_name: string; phone: string; campaign?: Camp | null; products: Item[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/api/shop/${id}`)
      .then(r => { if (!r.ok) throw new Error('nf'); return r.json(); })
      .then(setShop)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // wa.me ko international format chahiye: 03710279194 -> 923710279194
  function waNumber(raw: string): string {
    let n = (raw || '').replace(/\D/g, '');
    if (n.startsWith('00')) n = n.slice(2);                 // 0092... -> 92...
    if (n.startsWith('92')) return n;                       // already intl
    if (n.startsWith('0')) return '92' + n.slice(1);        // 03xx -> 923xx
    if (n.length === 10 && n.startsWith('3')) return '92' + n; // 3xx... -> 923xx
    return n;
  }

  function order(item: Item) {
    const phone = waNumber(shop?.phone || '');
    const price = item.on_sale ? item.sale_price : (item.discount_price || item.price);
    const text = encodeURIComponent(`${t('shop_order_msg')}${item.name} (Rs.${price})`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <Loader2 className="animate-spin" style={{ color: 'var(--green)' }} />
    </div>
  );
  if (notFound || !shop) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center" style={{ background: 'var(--bg)' }}>
      <p style={{ color: 'var(--text3)' }}>404 — Shop not found</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10" style={{ background: 'var(--teal)', color: '#fff' }}>
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.22)' }}>
            <MessageCircle size={18} />
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="brand font-bold text-lg truncate">{shop.shop_name}</h1>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.8)' }}>WhatsApp Shop</p>
          </div>
          <LanguageSwitcher compact />
        </div>
      </header>

      {/* Campaign sale banner */}
      {shop.campaign && shop.campaign.percent ? (
        <div className="text-center py-2.5 px-4 text-sm font-bold" style={{ background: 'linear-gradient(90deg,#ea580c,#f97316)', color: '#fff' }}>
          🔥 {shop.campaign.name} — {shop.campaign.percent}% OFF
        </div>
      ) : null}

      <main className="max-w-3xl mx-auto px-4 py-5">
        {shop.products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package size={36} style={{ color: 'var(--text3)' }} />
            <p className="text-sm mt-3" style={{ color: 'var(--text3)' }}>{t('shop_empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {shop.products.map(p => {
              const outOfStock = p.in_stock === false;
              const showPrice = p.on_sale ? p.sale_price : (p.discount_price || p.price);
              const strike = p.on_sale || (p.discount_price && p.discount_price < p.price);
              return (
                <div key={p.id} className="rounded-2xl overflow-hidden flex flex-col" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', opacity: outOfStock ? 0.7 : 1 }}>
                  <div className="relative aspect-square flex items-center justify-center" style={{ background: 'var(--bg3)' }}>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" style={outOfStock ? { filter: 'grayscale(0.6)' } : {}} />
                    ) : (
                      <Package size={32} style={{ color: 'var(--text3)' }} />
                    )}
                    {p.on_sale && !outOfStock && <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(234,88,12,0.95)', color: '#fff' }}>🔥 SALE</span>}
                    {outOfStock && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(220,50,50,0.95)', color: '#fff' }}>{t('prod_out_of_stock')}</span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text)' }}>{p.name}</p>
                    {p.description && <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--text3)' }}>{p.description}</p>}
                    {p.variants && <p className="text-[10px] mt-1" style={{ color: 'var(--teal)' }}>{p.variants}</p>}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="font-bold" style={{ color: p.on_sale ? '#ea580c' : 'var(--green)' }}>Rs.{showPrice}</span>
                      {strike && <span className="text-[10px] line-through" style={{ color: 'var(--text3)' }}>Rs.{p.price}</span>}
                    </div>
                    <button onClick={() => order(p)} disabled={outOfStock} className="btn-primary justify-center mt-2.5 text-xs w-full" style={{ padding: '8px 12px', opacity: outOfStock ? 0.5 : 1 }}>
                      <MessageCircle size={13} /> {outOfStock ? t('shop_sold_out') : t('shop_order')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-center text-[11px] mt-8" style={{ color: 'var(--text3)' }}>{t('shop_powered')}</p>
      </main>
    </div>
  );
}

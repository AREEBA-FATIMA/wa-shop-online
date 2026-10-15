'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MessageCircle, Package, Loader2 } from 'lucide-react';
import { useT } from '@/contexts/LangContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Item { id: string; name: string; description: string; price: number; discount_price: number | null; image_url?: string; category?: string; }

export default function ShopPage() {
  const { t } = useT();
  const params = useParams();
  const id = (params?.id as string) || '';
  const [shop, setShop] = useState<{ shop_name: string; phone: string; products: Item[] } | null>(null);
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

  function order(item: Item) {
    const phone = (shop?.phone || '').replace(/\D/g, '');
    const price = item.discount_price || item.price;
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

      <main className="max-w-3xl mx-auto px-4 py-5">
        {shop.products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package size={36} style={{ color: 'var(--text3)' }} />
            <p className="text-sm mt-3" style={{ color: 'var(--text3)' }}>{t('shop_empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {shop.products.map(p => {
              const onSale = p.discount_price && p.discount_price < p.price;
              return (
                <div key={p.id} className="rounded-2xl overflow-hidden flex flex-col" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
                  <div className="aspect-square flex items-center justify-center" style={{ background: 'var(--bg3)' }}>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={32} style={{ color: 'var(--text3)' }} />
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text)' }}>{p.name}</p>
                    {p.description && <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--text3)' }}>{p.description}</p>}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="font-bold" style={{ color: 'var(--green)' }}>Rs.{p.discount_price || p.price}</span>
                      {onSale && <span className="text-[10px] line-through" style={{ color: 'var(--text3)' }}>Rs.{p.price}</span>}
                    </div>
                    <button onClick={() => order(p)} className="btn-primary justify-center mt-2.5 text-xs w-full" style={{ padding: '8px 12px' }}>
                      <MessageCircle size={13} /> {t('shop_order')}
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

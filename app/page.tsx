'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Zap, Bot, Package, BarChart3, Shield, Clock, ArrowRight, Check } from 'lucide-react';

const t = {
  en: {
    badge: 'AI-Powered WhatsApp Store',
    title: 'Your WhatsApp,\nNow a Smart Shop',
    sub: 'Auto-post daily status, let AI answer customers in Urdu, confirm orders — all without WhatsApp API.',
    f1: 'Start Free', f2: 'See Demo',
    features: [
      { icon: Zap, t: 'Auto Daily Status', d: 'Set products once. AI posts status every day at your time with prices, stock & discounts.' },
      { icon: Bot, t: 'AI Chat Replies', d: 'Customer asks price or bargains — AI replies instantly in Urdu, Roman Urdu or English.' },
      { icon: Package, t: 'Smart Inventory', d: 'Track stock live. When sold out, removed from status automatically.' },
      { icon: BarChart3, t: 'Sales Analytics', d: 'See today revenue, top products, stock alerts — one dashboard.' },
      { icon: Shield, t: 'Invisible Branding', d: 'Customers never know you use WA-SHOP. Replies look 100% personal.' },
      { icon: Clock, t: 'Order Tracking', d: 'Every confirmed order saved with customer info. Never lose an order.' },
    ],
    plans: [
      { name: 'Free Trial', price: '0', per: '7 days', hot: false, cta: 'Start Free',
        f: ['10 products', '50 msgs/day', 'Basic AI', 'Manual status', 'QR connect'] },
      { name: 'Basic', price: '1,500', per: '/month', hot: false, cta: 'Get Basic',
        f: ['50 products', '500 msgs/day', 'AI replies', 'Auto status', 'Order tracking', 'Analytics'] },
      { name: 'Pro', price: '3,000', per: '/month', hot: true, cta: 'Get Pro',
        f: ['500 products', 'Unlimited msgs', 'AI + bargaining', 'Multi-schedule', 'Full analytics', 'Priority support'] },
    ]
  },
  ur: {
    badge: 'AI WhatsApp Dukaan',
    title: 'Apna WhatsApp,\nAb Smart Dukaan',
    sub: 'Roz auto status, AI se jawab, orders track — sab ek jagah se. Koi API key nahi chahiye.',
    f1: 'Free Shuru', f2: 'Demo Dekho',
    features: [
      { icon: Zap, t: 'Roz Auto Status', d: 'Ek baar products daalo. AI roz apne time par status lagayega — price, stock, discount ke sath.' },
      { icon: Bot, t: 'AI Chat Jawab', d: 'Customer price poche ya bargain kare — AI usi waqt Urdu mein jawab deta hai.' },
      { icon: Package, t: 'Smart Stock', d: 'Real-time stock track. Bik gayi? Auto status se hat jaati hai.' },
      { icon: BarChart3, t: 'Sales Report', d: 'Aaj ki kamai, top products, stock alerts — sab dashboard mein.' },
      { icon: Shield, t: 'Chhupi Pehchaan', d: 'Customer ko pata nahi chalega ke tum WA-SHOP use kar rahe ho.' },
      { icon: Clock, t: 'Order Management', d: 'Har order save hoti hai. Customer detail, amount, sab kuch.' },
    ],
    plans: [
      { name: 'Free Trial', price: '0', per: '7 din', hot: false, cta: 'Free Try Karo',
        f: ['10 products', '50 msgs/din', 'Basic AI', 'Manual status', 'QR connect'] },
      { name: 'Basic', price: '1,500', per: '/mahine', hot: false, cta: 'Basic Lo',
        f: ['50 products', '500 msgs/din', 'AI jawab', 'Auto status', 'Order tracking', 'Analytics'] },
      { name: 'Pro', price: '3,000', per: '/mahine', hot: true, cta: 'Pro Lo',
        f: ['500 products', 'Unlimited msgs', 'AI + bargaining', 'Multi-schedule', 'Full analytics', 'Priority support'] },
    ]
  }
};

export default function Landing() {
  const [lang, setLang] = useState<'en'|'ur'>('ur');
  const c = t[lang];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '0.5px solid var(--border)', background: 'var(--bg2)', backdropFilter: 'blur(12px)' }}
        className="fixed top-0 inset-x-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-15 flex items-center justify-between" style={{ height: '60px' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--green)' }}>
              <MessageCircle size={14} className="text-white" />
            </div>
            <span className="brand font-bold text-base" style={{ color: 'var(--text)' }}>
              WA-SHOP<span style={{ color: 'var(--green)' }}>.Online</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Lang toggle */}
            <div className="flex rounded-full overflow-hidden text-xs" style={{ border: '0.5px solid var(--border2)' }}>
              {(['en','ur'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className="px-3 py-1 font-medium transition-colors"
                  style={{ background: lang===l ? 'var(--green)' : 'transparent', color: lang===l ? '#fff' : 'var(--text2)' }}>
                  {l === 'en' ? 'EN' : 'UR'}
                </button>
              ))}
            </div>
            <Link href="/auth/login" className="text-sm font-medium px-3 py-1" style={{ color: 'var(--text2)' }}>Login</Link>
            <Link href="/auth/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '100px' }}>
              {c.f1}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 text-center">
        <div className="badge-green mb-5 inline-flex">
          <span className="dot-live" />
          {c.badge}
        </div>
        <h1 className="brand font-bold text-5xl md:text-6xl leading-tight max-w-2xl mx-auto mb-5 whitespace-pre-line"
          style={{ color: 'var(--text)' }}>{c.title}</h1>
        <p className="text-base max-w-xl mx-auto mb-8 leading-relaxed" style={{ color: 'var(--text2)' }}>{c.sub}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/register" className="btn-primary" style={{ padding: '13px 28px', fontSize: '15px', borderRadius: '100px' }}>
            {c.f1} <ArrowRight size={16} />
          </Link>
          <button className="btn-ghost" style={{ padding: '13px 28px', fontSize: '15px', borderRadius: '100px' }}>
            {c.f2}
          </button>
        </div>

        {/* WA chat mockup */}
        <div className="max-w-[260px] mx-auto mt-14">
          <div className="rounded-2xl overflow-hidden" style={{ border: '0.5px solid var(--border2)', background: 'var(--bg2)' }}>
            <div className="px-4 py-3 flex items-center gap-3" style={{ background: 'var(--green-dim)', borderBottom: '0.5px solid var(--border)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>S</div>
              <div className="text-left">
                <p className="text-white text-xs font-semibold">Sara Boutique</p>
                <p className="text-xs" style={{ color: 'var(--green)' }}>online</p>
              </div>
            </div>
            <div className="p-3 space-y-2" style={{ background: 'var(--bg3)' }}>
              <div className="wa-bubble-in p-2 max-w-[82%] text-xs" style={{ color: 'var(--text2)' }}>Yeh shirt available hai?</div>
              <div className="wa-bubble-out p-2 max-w-[82%] ml-auto text-xs" style={{ color: 'var(--text)' }}>Ji! White cotton Rs.950 mein, 3 pieces baqi 🛍️</div>
              <div className="wa-bubble-in p-2 max-w-[82%] text-xs" style={{ color: 'var(--text2)' }}>800 mein dein ge? 🙏</div>
              <div className="wa-bubble-out p-2 max-w-[82%] ml-auto text-xs" style={{ color: 'var(--text)' }}>Aapke liye Rs.900 final! Confirm? 😊</div>
            </div>
            <div className="px-3 py-2 flex items-center gap-2" style={{ background: 'var(--bg2)', borderTop: '0.5px solid var(--border)' }}>
              <div className="flex-1 py-1.5 px-3 text-xs rounded-full" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>Message</div>
            </div>
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--text3)' }}>AI ne jawab diya — aap ne kuch nahi kiya ✨</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10" style={{ borderTop: '0.5px solid var(--border)', borderBottom: '0.5px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['500+','Active Resellers'],['10K+','Orders'],['98%','Response Rate'],['3x','More Sales']].map(([v,l]) => (
            <div key={l}>
              <p className="brand font-bold text-3xl" style={{ color: 'var(--green)' }}>{v}</p>
              <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text3)' }}>{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="badge-green mb-3 inline-flex">Features</p>
          <h2 className="brand font-bold text-3xl" style={{ color: 'var(--text)' }}>Sab kuch ek jagah</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {c.features.map((f, i) => (
            <div key={i} className="card p-5 group hover:border-[var(--border2)] transition-all">
              <div className="icon-box mb-3">
                <f.icon size={16} strokeWidth={2} />
              </div>
              <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{f.t}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text3)' }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4" style={{ background: 'var(--bg2)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="badge-green mb-3 inline-flex">Pricing</p>
            <h2 className="brand font-bold text-3xl" style={{ color: 'var(--text)' }}>Pricing — PKR</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {c.plans.map((p, i) => (
              <div key={i} className="relative rounded-[16px] p-5"
                style={{
                  background: p.hot ? 'var(--green-dim)' : 'var(--bg3)',
                  border: `0.5px solid ${p.hot ? 'rgba(61,186,94,0.4)' : 'var(--border)'}`,
                }}>
                {p.hot && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge-green text-xs px-3 py-1">Most Popular</span>
                  </div>
                )}
                <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text)' }}>{p.name}</h3>
                <div className="flex items-end gap-1 mb-5">
                  <span className="brand font-bold text-3xl" style={{ color: 'var(--text)' }}>Rs.{p.price}</span>
                  <span className="text-xs mb-1" style={{ color: 'var(--text3)' }}>{p.per}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {p.f.map((ft, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text2)' }}>
                      <Check size={13} strokeWidth={2.5} style={{ color: 'var(--green)', flexShrink: 0 }} />{ft}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register"
                  className={p.hot ? 'btn-primary w-full justify-center' : 'btn-ghost w-full justify-center'}
                  style={{ display: 'flex', width: '100%' }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center" style={{ borderTop: '0.5px solid var(--border)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--green)' }}>
            <MessageCircle size={12} className="text-white" />
          </div>
          <span className="brand font-bold text-sm" style={{ color: 'var(--text)' }}>WA-SHOP<span style={{ color: 'var(--green)' }}>.Online</span></span>
        </div>
        <p className="text-xs" style={{ color: 'var(--text3)' }}>Pakistan ka pehla AI WhatsApp reseller platform. © 2025</p>
      </footer>
    </div>
  );
}

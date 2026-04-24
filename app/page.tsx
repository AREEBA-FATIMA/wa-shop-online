'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Zap, Bot, Package, BarChart3, Shield, Clock, ChevronRight, Check, Star } from 'lucide-react';

const t = {
  en: {
    badge: 'AI-Powered WhatsApp Store',
    title: 'Turn WhatsApp Into Your Smart Shop',
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
    title: 'Apna WhatsApp Smart Dukaan Banao',
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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center">
              <MessageCircle size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg">WA-SHOP<span className="text-[#25D366]">.Online</span></span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-full border border-white/10 overflow-hidden text-xs">
              {(['en','ur'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-3 py-1 transition-colors ${lang===l ? 'bg-[#25D366] text-white' : 'text-gray-400 hover:text-white'}`}>
                  {l === 'en' ? 'EN' : 'UR'}
                </button>
              ))}
            </div>
            <Link href="/auth/login" className="text-sm text-gray-300 hover:text-white px-3 py-1">Login</Link>
            <Link href="/auth/register" className="text-sm bg-[#25D366] hover:bg-[#1da855] text-white px-4 py-2 rounded-full font-medium transition-colors">
              {c.f1}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
          <span className="text-[#25D366] text-sm font-medium">{c.badge}</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight max-w-3xl mx-auto">{c.title}</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">{c.sub}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da855] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105">
            {c.f1} <ChevronRight size={20} />
          </Link>
          <button className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/5 transition-all">
            {c.f2}
          </button>
        </div>

        {/* WhatsApp mockup */}
        <div className="max-w-xs mx-auto mt-16">
          <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-300 flex items-center justify-center text-xs font-bold text-green-900">S</div>
              <div>
                <p className="text-white text-sm font-medium">Sara Boutique</p>
                <p className="text-green-200 text-xs">online</p>
              </div>
            </div>
            <div className="bg-[#0d1117] p-3 space-y-2">
              <div className="wa-bubble-in p-2 max-w-[80%] text-xs text-gray-300">Yeh shirt available hai?</div>
              <div className="wa-bubble-out p-2 max-w-[80%] ml-auto text-xs text-green-100">Ji! White cotton Rs.950 mein, 3 pieces baqi hain 🛍️</div>
              <div className="wa-bubble-in p-2 max-w-[80%] text-xs text-gray-300">800 mein dein ge? 🙏</div>
              <div className="wa-bubble-out p-2 max-w-[80%] ml-auto text-xs text-green-100">Aapke liye Rs.900 final! Order confirm karein? 😊</div>
            </div>
            <div className="bg-[#1a1a1a] px-3 py-2 border-t border-white/5 flex items-center gap-2">
              <div className="flex-1 bg-[#2a2a2a] rounded-full px-3 py-1.5 text-xs text-gray-500">Message</div>
            </div>
          </div>
          <p className="text-gray-600 text-xs mt-3">AI ne jawab diya — aap ne kuch nahi kiya ✨</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[['500+','Active Resellers'],['10K+','Orders'],['98%','Response Rate'],['3x','More Sales']].map(([v,l])=>(
            <div key={l}><p className="text-3xl font-bold text-[#25D366]">{v}</p><p className="text-gray-500 text-sm mt-1">{l}</p></div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {c.features.map((f,i) => (
            <div key={i} className="bg-[#111] border border-white/8 rounded-2xl p-6 hover:border-[#25D366]/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] mb-4 group-hover:bg-[#25D366]/20 transition-colors">
                <f.icon size={20} />
              </div>
              <h3 className="font-semibold mb-2">{f.t}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-[#060606]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing — PKR</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {c.plans.map((p,i)=>(
              <div key={i} className={`relative rounded-2xl p-6 border ${p.hot ? 'border-[#25D366] bg-[#25D366]/5' : 'border-white/10 bg-[#111]'}`}>
                {p.hot && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="bg-[#25D366] text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"><Star size={10} fill="white"/>Most Popular</span></div>}
                <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-3xl font-bold">Rs.{p.price}</span>
                  <span className="text-gray-500 text-sm mb-1">{p.per}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.f.map((ft,j)=>(
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check size={14} className="text-[#25D366] shrink-0"/>{ft}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className={`block text-center py-3 rounded-xl font-medium transition-all ${p.hot ? 'bg-[#25D366] hover:bg-[#1da855] text-white' : 'border border-white/20 text-white hover:bg-white/5'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-10 px-4 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-[#25D366] flex items-center justify-center"><MessageCircle size={14} className="text-white"/></div>
          <span className="font-bold">WA-SHOP<span className="text-[#25D366]">.Online</span></span>
        </div>
        <p className="text-gray-600 text-sm">Pakistan ka pehla AI WhatsApp reseller platform. © 2025</p>
      </footer>
    </div>
  );
}

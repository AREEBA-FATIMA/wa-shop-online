'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MessageCircle, Zap, Bot, Package, BarChart3, Shield, Clock, ArrowRight, Check, Star, ChevronDown, Menu, X } from 'lucide-react';
import { useT } from '@/contexts/LangContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const CONTENT: Record<string, any> = {
  en: {
    badge: 'AI-Powered WhatsApp Store',
    title: 'Your WhatsApp,\nNow a Smart Shop',
    sub: 'Auto-post daily status, let AI answer customers, confirm orders — all without the WhatsApp API.',
    f1: 'Start Free', f2: 'See Demo', login: 'Login',
    feat_head: 'Everything in one place', feat_sub: 'Whatever you need — it is here',
    stats: [['500+','Active Resellers'],['10K+','Orders'],['98%','Response Rate'],['3x','More Sales']],
    price_head: 'Pricing — PKR', price_sub: 'No risk — start with the free trial',
    monthly: 'Monthly', yearly: 'Yearly', save: 'Save 20%', popular: 'Most Popular', per_year: '/year',
    copyright: "Pakistan's first AI WhatsApp reseller platform. © 2025",
    register: 'Register', privacy: 'Privacy',
    features: [
      { icon: Zap, t: 'Auto Daily Status', d: 'Set products once. AI posts status every day at your time with prices, stock & discounts.' },
      { icon: Bot, t: 'AI Chat Replies', d: 'Customer asks price or bargains — AI replies instantly in Urdu, Roman Urdu or English.' },
      { icon: Package, t: 'Smart Inventory', d: 'Track stock live. When sold out, it is removed from status automatically.' },
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
  roman_ur: {
    badge: 'AI WhatsApp Dukaan',
    title: 'Apna WhatsApp,\nAb Smart Dukaan',
    sub: 'Roz auto status, AI se jawab, orders track — sab ek jagah se. Koi API key nahi chahiye.',
    f1: 'Free Shuru', f2: 'Demo Dekho', login: 'Login',
    feat_head: 'Sab kuch ek jagah', feat_sub: 'Jo bhi chahiye — sab hai',
    stats: [['500+','Active Resellers'],['10K+','Orders'],['98%','Response Rate'],['3x','Zyada Sales']],
    price_head: 'Pricing — PKR', price_sub: 'Koi risk nahi — free trial se start karo',
    monthly: 'Monthly', yearly: 'Yearly', save: '20% bachao', popular: 'Sab se Popular', per_year: '/saal',
    copyright: 'Pakistan ka pehla AI WhatsApp reseller platform. © 2025',
    register: 'Register', privacy: 'Privacy',
    features: [
      { icon: Zap, t: 'Roz Auto Status', d: 'Ek baar products daalo. AI roz apne time par status lagayega — price, stock, discount ke sath.' },
      { icon: Bot, t: 'AI Chat Jawab', d: 'Customer price poche ya bargain kare — AI usi waqt jawab deta hai.' },
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
  },
  ur: {
    badge: 'AI واٹس ایپ دکان',
    title: 'آپ کا واٹس ایپ،\nاب اسمارٹ دکان',
    sub: 'روزانہ خودکار اسٹیٹس، AI سے گاہکوں کو جواب، آرڈر کنفرم — سب ایک جگہ۔ کوئی WhatsApp API نہیں چاہیے۔',
    f1: 'مفت شروع کریں', f2: 'ڈیمو دیکھیں', login: 'لاگ ان',
    feat_head: 'سب کچھ ایک جگہ', feat_sub: 'جو بھی چاہیے — سب موجود ہے',
    stats: [['500+','ایکٹو ری سیلرز'],['10K+','آرڈرز'],['98%','ریسپانس ریٹ'],['3x','زیادہ سیلز']],
    price_head: 'قیمتیں — PKR', price_sub: 'کوئی رسک نہیں — مفت ٹرائل سے شروع کریں',
    monthly: 'ماہانہ', yearly: 'سالانہ', save: '20% بچائیں', popular: 'سب سے مقبول', per_year: '/سال',
    copyright: 'پاکستان کا پہلا AI واٹس ایپ ری سیلر پلیٹ فارم۔ © 2025',
    register: 'رجسٹر', privacy: 'پرائیویسی',
    features: [
      { icon: Zap, t: 'روزانہ خودکار اسٹیٹس', d: 'ایک بار پروڈکٹ ڈالیں۔ AI روزانہ آپ کے وقت پر قیمت، اسٹاک اور ڈسکاؤنٹ کے ساتھ اسٹیٹس لگائے گا۔' },
      { icon: Bot, t: 'AI چیٹ جواب', d: 'گاہک قیمت پوچھے یا مول تول کرے — AI فوراً جواب دیتا ہے۔' },
      { icon: Package, t: 'اسمارٹ اسٹاک', d: 'اسٹاک لائیو ٹریک۔ بک گیا؟ اسٹیٹس سے خودبخود ہٹ جاتا ہے۔' },
      { icon: BarChart3, t: 'سیلز رپورٹ', d: 'آج کی کمائی، ٹاپ پروڈکٹس، اسٹاک الرٹ — سب ایک ڈیش بورڈ میں۔' },
      { icon: Shield, t: 'پوشیدہ برانڈنگ', d: 'گاہک کو پتا نہیں چلے گا کہ آپ WA-SHOP استعمال کر رہے ہیں۔' },
      { icon: Clock, t: 'آرڈر ٹریکنگ', d: 'ہر کنفرم آرڈر گاہک کی تفصیل کے ساتھ محفوظ۔ کوئی آرڈر ضائع نہیں۔' },
    ],
    plans: [
      { name: 'مفت ٹرائل', price: '0', per: '7 دن', hot: false, cta: 'مفت شروع کریں',
        f: ['10 پروڈکٹس', '50 پیغام/دن', 'بیسک AI', 'مینوئل اسٹیٹس', 'QR کنیکٹ'] },
      { name: 'بیسک', price: '1,500', per: '/ماہ', hot: false, cta: 'بیسک لیں',
        f: ['50 پروڈکٹس', '500 پیغام/دن', 'AI جواب', 'آٹو اسٹیٹس', 'آرڈر ٹریکنگ', 'تجزیہ'] },
      { name: 'پرو', price: '3,000', per: '/ماہ', hot: true, cta: 'پرو لیں',
        f: ['500 پروڈکٹس', 'لامحدود پیغام', 'AI + مول تول', 'ملٹی شیڈول', 'مکمل تجزیہ', 'پرائیورٹی سپورٹ'] },
    ]
  }
};

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className}
      style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {children}
    </div>
  );
}

export default function Landing() {
  const { lang } = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [yearly, setYearly] = useState(false);
  const c = CONTENT[lang] || CONTENT.roman_ur;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* ─── Nav ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-strong" style={{ borderBottom: '0.5px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--green-gradient)' }}>
              <MessageCircle size={16} className="text-white" />
            </div>
            <span className="brand font-bold text-base" style={{ color: 'var(--text)' }}>
              WA<span className="gradient-text-green">SHOP</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher compact />
            <Link href="/auth/login" className="text-sm font-medium px-3 py-1.5 transition-colors hover:opacity-70" style={{ color: 'var(--text2)' }}>{c.login}</Link>
            <Link href="/auth/register" className="btn-primary text-sm" style={{ padding: '8px 20px', borderRadius: '100px' }}>
              {c.f1}
            </Link>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2" style={{ color: 'var(--text2)' }}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2 animate-fade-in">
            <div className="flex justify-center mb-3"><LanguageSwitcher /></div>
            <Link href="/auth/login" className="block text-sm py-2 px-3 rounded-lg" style={{ color: 'var(--text2)' }}>{c.login}</Link>
            <Link href="/auth/register" className="block text-sm py-2 px-3 rounded-lg text-center font-semibold" style={{ background: 'var(--green)', color: '#fff' }}>
              {c.f1}
            </Link>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section className="min-h-[90vh] flex items-center pt-20 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 30%, var(--green-glow), transparent 70%)', position: 'absolute', inset: 0 }} />
          <div style={{ background: 'radial-gradient(ellipse 40% 30% at 70% 60%, color-mix(in srgb, var(--green) 5%, transparent), transparent 70%)', position: 'absolute', inset: 0 }} />
        </div>
        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center relative">
          <div className="animate-fade-in">
            <div className="badge badge-green mb-5 inline-flex">
              <span className="dot-live" />{c.badge}
            </div>
            <h1 className="brand font-extrabold text-5xl md:text-7xl leading-[1.1] mb-5 whitespace-pre-line" style={{ color: 'var(--text)' }}>
              {c.title}
            </h1>
            <p className="text-base md:text-lg max-w-md mb-8 leading-relaxed" style={{ color: 'var(--text2)' }}>{c.sub}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth/register" className="btn-primary-gradient" style={{ padding: '14px 32px', fontSize: '16px', borderRadius: '100px' }}>
                {c.f1} <ArrowRight size={18} />
              </Link>
              <button className="btn-ghost" style={{ padding: '14px 32px', fontSize: '16px', borderRadius: '100px' }}>
                <Zap size={16} />{c.f2}
              </button>
            </div>
          </div>
          <div className="hidden md:flex justify-center animate-float">
            <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', boxShadow: 'var(--shadow-xl)', width: 300 }}>
              <div className="px-4 py-3 flex items-center gap-3" style={{ background: 'var(--green-dim)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>S</div>
                <div className="text-left">
                  <p className="text-white text-xs font-semibold">Sara Boutique</p>
                  <p className="text-xs" style={{ color: 'var(--green)' }}>online</p>
                </div>
              </div>
              <div className="p-4 space-y-2.5" style={{ background: 'var(--bg3)' }}>
                <div className="wa-bubble-in p-2.5 max-w-[80%] text-xs" style={{ color: 'var(--text2)' }}>Yeh shirt available hai?</div>
                <div className="wa-bubble-out p-2.5 max-w-[80%] ml-auto text-xs">Ji! White cotton Rs.950 mein, 3 pieces baqi</div>
                <div className="wa-bubble-in p-2.5 max-w-[80%] text-xs" style={{ color: 'var(--text2)' }}>800 mein dein ge?</div>
                <div className="wa-bubble-out p-2.5 max-w-[80%] ml-auto text-xs">Aapke liye Rs.900 final! Confirm?</div>
              </div>
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'var(--bg2)', borderTop: '0.5px solid var(--border)' }}>
                <div className="flex-1 py-1.5 px-3 text-xs rounded-full" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>Message</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <AnimatedSection>
        <div className="py-12" style={{ borderTop: '0.5px solid var(--border)', borderBottom: '0.5px solid var(--border)' }}>
          <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {c.stats.map(([v,l]: [string,string], i: number) => (
              <div key={l} className="animate-fade-in-up">
                <p className="brand font-extrabold text-4xl gradient-text-green">{v}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text3)' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── Features ─── */}
      <AnimatedSection>
        <section className="py-20 px-4 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="badge badge-green mb-4 inline-flex">{c.feat_head}</div>
            <h2 className="brand font-bold text-3xl md:text-5xl mb-3" style={{ color: 'var(--text)' }}>{c.feat_head}</h2>
            <p className="text-sm" style={{ color: 'var(--text3)' }}>{c.feat_sub}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {c.features.map((f: any, i: number) => (
              <div key={i} className="card p-6 group hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
                  <f.icon size={18} strokeWidth={2} />
                </div>
                <h3 className="font-semibold mb-1.5" style={{ color: 'var(--text)' }}>{f.t}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text3)' }}>{f.d}</p>
              </div>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* ─── Pricing ─── */}
      <AnimatedSection>
        <section className="py-20 px-4" style={{ background: 'var(--bg2)' }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="badge badge-green mb-4 inline-flex">{c.price_head}</div>
              <h2 className="brand font-bold text-3xl md:text-5xl mb-3" style={{ color: 'var(--text)' }}>{c.price_head}</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text3)' }}>{c.price_sub}</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-sm font-medium" style={{ color: yearly ? 'var(--text3)' : 'var(--text)' }}>{c.monthly}</span>
                <div onClick={() => setYearly(!yearly)} className={`toggle ${yearly ? 'on' : 'off'}`}><div className="knob" /></div>
                <span className="text-sm font-medium" style={{ color: yearly ? 'var(--text)' : 'var(--text3)' }}>
                  {c.yearly} <span className="badge badge-green text-[10px] ml-1">{c.save}</span>
                </span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {c.plans.map((p: any, i: number) => (
                <div key={i} className="relative rounded-2xl p-6 animate-fade-in-up transition-all duration-300 hover:-translate-y-1"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    background: p.hot ? 'linear-gradient(135deg, var(--green-dim), color-mix(in srgb, var(--green-dim) 50%, var(--bg2)))' : 'var(--bg3)',
                    border: `0.5px solid ${p.hot ? 'rgba(37,211,102,0.4)' : 'var(--border)'}`,
                    boxShadow: p.hot ? '0 8px 40px rgba(37,211,102,0.15)' : 'none',
                  }}>
                  {p.hot && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="badge badge-green text-xs px-4 py-1"><Star size={10} /> {c.popular}</span>
                    </div>
                  )}
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>{p.name}</h3>
                  <div className="flex items-end gap-1 mb-6">
                    <span className="brand font-extrabold text-4xl" style={{ color: 'var(--text)' }}>
                      Rs.{yearly ? parseInt(p.price.replace(/,/g,'')) * 10 : p.price}
                    </span>
                    <span className="text-xs mb-1.5" style={{ color: 'var(--text3)' }}>
                      {yearly ? c.per_year : p.per}
                    </span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {p.f.map((ft: string, j: number) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text2)' }}>
                        <Check size={14} strokeWidth={2.5} style={{ color: 'var(--green)', flexShrink: 0 }} />{ft}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register"
                    className={p.hot ? 'btn-primary-gradient w-full justify-center' : 'btn-ghost w-full justify-center'}
                    style={{ display: 'flex' }}>
                    {p.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ─── Footer ─── */}
      <footer className="py-12 px-4 text-center" style={{ borderTop: '0.5px solid var(--border)' }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'var(--green-gradient)' }}>
            <MessageCircle size={14} className="text-white" />
          </div>
          <span className="brand font-bold text-sm" style={{ color: 'var(--text)' }}>
            WA<span className="gradient-text-green">SHOP</span>
          </span>
        </div>
        <p className="text-xs" style={{ color: 'var(--text3)' }}>{c.copyright}</p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Link href="/auth/login" className="text-xs transition-colors hover:opacity-70" style={{ color: 'var(--text3)' }}>{c.login}</Link>
          <span style={{ color: 'var(--border2)' }}>·</span>
          <Link href="/auth/register" className="text-xs transition-colors hover:opacity-70" style={{ color: 'var(--text3)' }}>{c.register}</Link>
          <span style={{ color: 'var(--border2)' }}>·</span>
          <Link href="/privacy" className="text-xs transition-colors hover:opacity-70" style={{ color: 'var(--text3)' }}>{c.privacy}</Link>
        </div>
      </footer>
    </div>
  );
}

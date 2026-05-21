'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Crown, Check, Loader2, Clock, CreditCard, ChevronRight, Copy, Smartphone, Building2 } from 'lucide-react';

const PLAN_ICONS: Record<string, string> = { basic: '🥉', pro: '👑' };

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Record<string, any>>({});
  const [paymentDetails, setPaymentDetails] = useState<Record<string, string>>({});
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [msg, setMsg] = useState('');
  const [userId, setUserId] = useState('');
  const [userPlan, setUserPlan] = useState('free');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('wa_user') || '{}');
    setUserId(u.id || '');
    setUserPlan(u.plan || 'free');
    api.get('/api/subscription/plans').then(r => { setPlans(r.data.plans); setPaymentDetails(r.data.payment_details); }).catch(() => {});
    api.get('/api/subscription/my-orders').then(r => setOrders(r.data)).catch(() => {});
  }, []);

  async function buy(plan: string) {
    setBuying(true); setMsg(''); setSelectedPlan(plan);
    try {
      const r = await api.post('/api/subscription/create-order', { plan });
      if (r.data.success) {
        setOrders(prev => [r.data.payment, ...prev]);
        setMsg(`✅ Order create ho gaya! Neeche diye gaye payment details se pay karein. Admin approve kare ga.`);
      }
    } catch (e: any) { setMsg('❌ Error: ' + (e?.response?.data?.detail || e?.message)); }
    setBuying(false);
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }

  const pendingOrders = orders.filter(o => o.status === 'pending');

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(250,204,21,0.12)' }}>
          <Crown size={18} style={{ color: '#facc15' }} />
        </span>
        <div>
          <h1 className="brand text-xl font-bold" style={{ color: 'var(--text)' }}>Subscription</h1>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>Premium plans unlock all features</p>
        </div>
      </div>

      {Object.keys(plans).length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(plans).map(([key, plan]: [string, any]) => {
            const isActive = userPlan === key;
            const isSelected = selectedPlan === key;
            return (
              <div key={key} className={`rounded-2xl p-5 transition-all ${isActive ? 'ring-2' : ''}`}
                style={{ background: 'var(--bg2)', border: isActive ? '2px solid var(--green)' : '0.5px solid var(--border)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{PLAN_ICONS[key] || '📋'}</span>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>{plan.name}</h3>
                    {isActive && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>Current Plan</span>}
                  </div>
                </div>
                <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>
                  Rs.{plan.price?.toLocaleString()}
                  <span className="text-sm font-normal" style={{ color: 'var(--text3)' }}>/{plan.period}</span>
                </p>
                <ul className="space-y-1.5 my-4">
                  {plan.features?.map((f: string, i: number) => (
                    <li key={i} className="text-sm flex items-center gap-2" style={{ color: 'var(--text2)' }}>
                      <Check size={13} style={{ color: 'var(--green)' }} />{f}
                    </li>
                  ))}
                </ul>
                {!isActive && (
                  <button onClick={() => buy(key)} disabled={buying}
                    className="btn-primary w-full justify-center text-sm" style={{ opacity: buying ? 0.6 : 1 }}>
                    {buying && isSelected ? <Loader2 size={14} className="animate-spin" /> : <Crown size={14} />}
                    {buying && isSelected ? 'Processing...' : `Buy ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {msg && (
        <p className="text-sm text-center py-3 px-4 rounded-xl" style={msg.startsWith('✅') ? { background: 'var(--green-dim)', color: 'var(--green)' } : { background: 'rgba(220,50,50,0.08)', color: '#e05a5a' }}>
          {msg}
        </p>
      )}

      {/* Payment Details */}
      {Object.keys(paymentDetails).length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <CreditCard size={14} />Payment Details
          </h2>
          <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>Order create karein, phir neeche diye gaye account mein pay karein. Admin approve kare ga.</p>
          <div className="space-y-2">
            {Object.entries(paymentDetails).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl text-sm" style={{ background: 'var(--bg3)' }}>
                <div className="flex items-center gap-2.5">
                  {key === 'jazzcash' && <Smartphone size={15} style={{ color: '#e53935' }} />}
                  {key === 'easypaisa' && <Smartphone size={15} style={{ color: '#4caf50' }} />}
                  {key === 'bank' && <Building2 size={15} style={{ color: '#2196f3' }} />}
                  <div>
                    <p className="text-xs font-medium uppercase" style={{ color: 'var(--text3)' }}>{key}</p>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{val}</p>
                  </div>
                </div>
                <button onClick={() => copyText(val, key)} className="text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ background: copied === key ? 'var(--green-dim)' : 'var(--bg2)', color: copied === key ? 'var(--green)' : 'var(--text3)' }}>
                  {copied === key ? <><Check size={11} />Copied</> : <><Copy size={11} />Copy</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)' }}>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Clock size={14} />Pending Orders
          </h2>
          <div className="space-y-2">
            {pendingOrders.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-xl text-sm" style={{ background: 'var(--bg3)' }}>
                <div>
                  <p className="font-medium capitalize" style={{ color: 'var(--text)' }}>{o.plan} Plan</p>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>Rs.{o.amount?.toLocaleString()} · {new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'rgba(250,204,21,0.12)', color: '#facc15' }}>Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

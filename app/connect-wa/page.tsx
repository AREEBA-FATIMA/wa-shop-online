'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, CheckCircle2, XCircle, RefreshCw, Smartphone, QrCode, Loader2, Copy, ArrowLeft } from 'lucide-react';

type ConnectStatus = 'idle' | 'loading' | 'qr' | 'authenticated' | 'ready' | 'error';

const WA_URL = process.env.NEXT_PUBLIC_WA_URL || process.env.NEXT_PUBLIC_API_URL || '';

export default function ConnectWA() {
  const router = useRouter();
  const [method, setMethod] = useState<'qr' | 'phone'>('phone');
  const [status, setStatus] = useState<ConnectStatus>('idle');
  const [qrImg, setQrImg] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [phone, setPhone] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [pairingLoading, setPairingLoading] = useState(false);
  const [pairingError, setPairingError] = useState('');
  const [frontendTimeout, setFrontendTimeout] = useState(false);
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const qrReadyRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function getUserId() {
    try { return JSON.parse(localStorage.getItem('wa_user') || '{}').id || ''; } catch { return ''; }
  }

  function clearAllTimers() {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    setFrontendTimeout(false);
  }

  function startSSE(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (esRef.current) esRef.current.close();
      const es = new EventSource(`${WA_URL}/wa/qr/${userId}`);
      esRef.current = es;
      qrReadyRef.current = resolve;

      // Frontend timeout — 90 seconds
      timeoutRef.current = setTimeout(() => {
        setFrontendTimeout(true);
        setStatus('error');
        setErrMsg('WhatsApp load hone mein zyada waqt lag raha hai. Dobara try karein.');
        es.close();
        if (qrReadyRef.current) { qrReadyRef.current(); qrReadyRef.current = null; }
      }, 90000);

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.event === 'loading') {
            setStep(1);
          } else if (data.event === 'qr') {
            setQrImg(data.qrCode);
            setStatus('qr');
            setStep(2);
            clearAllTimers();
            if (qrReadyRef.current) { qrReadyRef.current(); qrReadyRef.current = null; }
          } else if (data.event === 'pairing_code') {
            setPairingCode(data.code);
            setPairingLoading(false);
            clearAllTimers();
          } else if (data.event === 'authenticated') {
            setStatus('authenticated');
            setStep(3);
          } else if (data.event === 'ready') {
            setStatus('ready');
            clearAllTimers();
            es.close();
            setTimeout(() => router.push('/dashboard'), 2000);
          } else if (data.event === 'error') {
            setStatus('error');
            setErrMsg(data.message || 'Unknown error');
            clearAllTimers();
            es.close();
            if (qrReadyRef.current) { qrReadyRef.current(); qrReadyRef.current = null; }
          }
        } catch {}
      };
      es.onerror = () => {
        // Don't resolve on error — let the timeout handle it
      };
    });
  }

  async function startAndWaitForQR(userId: string) {
    setStatus('loading');
    setFrontendTimeout(false);
    setStep(1);
    try { await fetch(`${WA_URL}/wa/restart/${userId}`, { method: 'POST' }); } catch {}
    await new Promise(r => setTimeout(r, 1500));
    await startSSE(userId);
  }

  async function handleQRConnect() {
    const userId = getUserId();
    if (!userId) { router.push('/auth/login'); return; }
    setErrMsg(''); setQrImg('');
    await startAndWaitForQR(userId);
  }

  async function handlePairingCode() {
    const userId = getUserId();
    if (!userId) { router.push('/auth/login'); return; }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setPairingError('Phone number sahi likho — country code ke saath (923xxxxxxxxx)');
      return;
    }
    setPairingError(''); setPairingCode(''); setPairingLoading(true);
    setFrontendTimeout(false);

    // Step 1: Start WhatsApp
    await startAndWaitForQR(userId);
    if (status === 'error') { setPairingLoading(false); return; }

    // Step 2: Get pairing code
    setStep(3);
    try {
      const r = await fetch(`${WA_URL}/wa/pairing-code/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const data = await r.json();
      if (data.success) {
        setPairingCode(data.code);
      } else {
        setPairingError(data.error || 'Code nahi mila — dobara try karo');
      }
    } catch {
      setPairingError('Server se connect nahi hua');
    }
    setPairingLoading(false);
  }

  function reset() {
    setStatus('idle'); setQrImg(''); setErrMsg('');
    setPairingCode(''); setPairingError(''); setPairingLoading(false);
    setStep(0); setFrontendTimeout(false); setCopied(false);
    clearAllTimers();
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
  }

  function handleCopy() {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode.replace(/-/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handlePhoneChange(val: string) {
    // Auto-add 92 if user types without country code
    let v = val.replace(/\D/g, '');
    if (v.startsWith('0')) v = '92' + v.slice(1);
    if (v.length === 10 && !v.startsWith('92')) v = '92' + v;
    setPhone(v);
    setPairingError('');
  }

  useEffect(() => {
    const userId = getUserId();
    if (!userId) { router.push('/auth/login'); return; }

    async function checkAndReconnect() {
      try {
        const r = await fetch(`${WA_URL}/wa/status/${userId}`);
        const d = await r.json();
        if (d.connected) {
          router.push('/dashboard');
          return;
        }
        setStatus('loading'); setStep(1);
        await fetch(`${WA_URL}/wa/restart/${userId}`, { method: 'POST' });
        await new Promise(res => setTimeout(res, 4000));
        const r2 = await fetch(`${WA_URL}/wa/status/${userId}`);
        const d2 = await r2.json();
        if (d2.connected) {
          router.push('/dashboard');
        } else {
          setStatus('idle'); setStep(0);
        }
      } catch { setStatus('idle'); }
    }

    checkAndReconnect();
    return () => { esRef.current?.close(); clearAllTimers(); };
  }, []);

  const showTabs = status === 'idle' || status === 'error';
  const isConnecting = status === 'loading';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Simple header */}
      <div className="flex items-center px-4 h-14 shrink-0" style={{ borderBottom: '0.5px solid var(--border)' }}>
        <button onClick={() => router.push('/dashboard')} className="p-2 -ml-2" style={{ color: 'var(--text2)' }}>
          <ArrowLeft size={20} />
        </button>
        <span className="brand font-bold text-sm ml-2" style={{ color: 'var(--text)' }}>Connect WhatsApp</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-sm text-center animate-fade-in">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, var(--green), var(--green-light))', boxShadow: '0 8px 32px rgba(37,211,102,0.3)' }}>
            <MessageCircle size={28} className="text-white" />
          </div>
          <h1 className="font-bold text-xl mb-1" style={{ color: 'var(--text)' }}>WhatsApp Connect</h1>
          <p className="text-xs mb-6" style={{ color: 'var(--text3)' }}>Apna tarika chunein</p>

          {/* Tabs */}
          {showTabs && (
            <div className="flex gap-1.5 mb-6 p-1 rounded-xl"
              style={{ background: 'var(--bg3)', border: '0.5px solid var(--border)' }}>
              <button onClick={() => { setMethod('phone'); reset(); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: method === 'phone' ? 'var(--green)' : 'transparent',
                  color: method === 'phone' ? '#fff' : 'var(--text2)',
                  boxShadow: method === 'phone' ? '0 2px 8px rgba(37,211,102,0.3)' : 'none',
                }}>
                <Smartphone size={15} /> Phone
              </button>
              <button onClick={() => { setMethod('qr'); reset(); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: method === 'qr' ? 'var(--green)' : 'transparent',
                  color: method === 'qr' ? '#fff' : 'var(--text2)',
                  boxShadow: method === 'qr' ? '0 2px 8px rgba(37,211,102,0.3)' : 'none',
                }}>
                <QrCode size={15} /> QR Code
              </button>
            </div>
          )}

          {/* ── Main Card ─── */}
          <div className="rounded-2xl p-6 card-elevated" style={{ background: 'var(--bg2)' }}>
            {/* Loading indicator step */}
            {isConnecting && (
              <div className="flex items-center justify-center gap-3 mb-4">
                {[1,2,3].map(s => (
                  <div key={s} className="w-2.5 h-2.5 rounded-full transition-all duration-500"
                    style={{
                      background: step >= s ? 'var(--green)' : 'var(--bg4)',
                      transform: step === s ? 'scale(1.3)' : 'scale(1)',
                    }} />
                ))}
              </div>
            )}

            {/* READY */}
            {status === 'ready' && (
              <div className="py-6 animate-scale-in">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'var(--green-dim)' }}>
                  <CheckCircle2 size={40} style={{ color: 'var(--green)' }} />
                </div>
                <p className="font-bold text-lg" style={{ color: 'var(--text)' }}>Connected! ✅</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>Dashboard par ja raha hai...</p>
                {/* Progress bar */}
                <div className="w-full h-1 rounded-full mt-4 overflow-hidden" style={{ background: 'var(--bg3)' }}>
                  <div className="h-full rounded-full animate-progress" style={{ background: 'var(--green)', width: '100%', animation: 'progress 2s ease forwards' }} />
                </div>
              </div>
            )}

            {/* AUTHENTICATED */}
            {status === 'authenticated' && (
              <div className="py-6">
                <Loader2 size={36} className="mx-auto mb-3 animate-spin" style={{ color: 'var(--green)' }} />
                <p className="font-semibold text-sm" style={{ color: 'var(--green)' }}>Verifying... Load ho raha hai</p>
              </div>
            )}

            {/* ERROR */}
            {status === 'error' && (
              <div className="py-4">
                <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ background: 'rgba(220,50,50,0.1)' }}>
                  <XCircle size={32} style={{ color: '#e05a5a' }} />
                </div>
                <p className="font-semibold text-sm mb-1" style={{ color: '#e05a5a' }}>Kuch masla hua</p>
                <p className="text-xs mb-5 px-2" style={{ color: 'var(--text3)' }}>{errMsg}</p>
                <button onClick={reset}
                  className="btn-primary justify-center mx-auto text-sm">
                  <RefreshCw size={14} /> Dobara Try Karein
                </button>
              </div>
            )}

            {/* ══ PHONE METHOD ══ */}
            {method === 'phone' && status !== 'ready' && status !== 'authenticated' && status !== 'error' && (
              pairingCode ? (
                <div className="animate-scale-in">
                  <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                    style={{ background: 'var(--green-dim)' }}>
                    <CheckCircle2 size={24} style={{ color: 'var(--green)' }} />
                  </div>
                  <p className="text-sm font-medium mb-4" style={{ color: 'var(--text)' }}>
                    Yeh code WhatsApp mein daalo:
                  </p>
                  <div className="rounded-2xl p-6 mb-4 relative"
                    style={{ background: 'var(--green-dim)', border: '2px solid rgba(37,211,102,0.4)' }}>
                    <p className="text-4xl font-bold tracking-[0.25em]" style={{ color: 'var(--green)' }}>
                      {pairingCode}
                    </p>
                    <button onClick={handleCopy}
                      className="absolute top-2 right-2 p-2 rounded-lg transition-all hover:opacity-70"
                      style={{ color: 'var(--green)' }}>
                      {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="text-left rounded-xl p-3 text-xs space-y-1 mb-4"
                    style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                    <p className="font-semibold text-sm mb-1.5" style={{ color: 'var(--text)' }}>Ab yeh karo:</p>
                    <p>1. WhatsApp kholein</p>
                    <p>2. Settings (3 dots) → Linked Devices</p>
                    <p>3. "Link a Device" dabao → "Link with phone number"</p>
                    <p>4. Yeh code daalo: <span className="font-bold" style={{ color: 'var(--green)' }}>{pairingCode}</span></p>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>Code 2-3 minute mein expire hota hai</p>
                  <button onClick={reset} className="mt-3 text-xs hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--text3)' }}>Dobara try karein</button>
                </div>
              ) : (
                <div>
                  <Smartphone size={36} className="mx-auto mb-3" style={{ color: 'var(--green)' }} />
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Phone Number se connect karein</p>
                  <p className="text-xs mb-5" style={{ color: 'var(--text3)' }}>
                    Same mobile mein bhi kaam karta hai
                  </p>
                  <div className="text-left mb-4">
                    <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--text2)' }}>
                      WhatsApp Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                        style={{ color: 'var(--text3)' }}>🇵🇰 +92</div>
                      <input
                        type="tel"
                        value={phone.replace('92', '')}
                        onChange={e => handlePhoneChange(e.target.value)}
                        placeholder="3001234567"
                        disabled={isConnecting || pairingLoading}
                        className="field pl-14"
                      />
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: 'var(--text3)' }}>
                      Bina 0 ke number likhein (e.g., 3001234567)
                    </p>
                  </div>
                  {pairingError && (
                    <p className="text-xs mb-3 text-left rounded-lg px-3 py-2"
                      style={{ background: 'rgba(220,50,50,0.08)', color: '#e05a5a' }}>
                      {pairingError}
                    </p>
                  )}
                  <button onClick={handlePairingCode}
                    disabled={isConnecting || pairingLoading}
                    className="btn-primary w-full justify-center text-sm"
                    style={{ opacity: isConnecting || pairingLoading ? 0.6 : 1 }}>
                    {(isConnecting || pairingLoading) ? (
                      <><Loader2 size={15} className="animate-spin" />
                        {step === 1 ? 'WhatsApp start ho raha hai...' : step === 2 ? 'QR tayyar ho raha hai...' : 'Code mil raha hai...'}</>
                    ) : 'Pairing Code Lao'}
                  </button>
                </div>
              )
            )}

            {/* ══ QR METHOD ══ */}
            {method === 'qr' && status !== 'ready' && status !== 'authenticated' && status !== 'error' && (
              status === 'idle' ? (
                <div className="py-4">
                  <QrCode size={40} className="mx-auto mb-3" style={{ color: 'var(--green)' }} />
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Doosre phone se QR scan karein</p>
                  <p className="text-xs mb-6" style={{ color: 'var(--text3)' }}>WhatsApp → Linked Devices → Link a Device</p>
                  <button onClick={handleQRConnect} className="btn-primary w-full justify-center text-sm">
                    QR Generate Karein
                  </button>
                </div>
              ) : status === 'loading' ? (
                <div className="py-6">
                  <Loader2 size={36} className="mx-auto mb-3 animate-spin" style={{ color: 'var(--green)' }} />
                  <p className="text-sm" style={{ color: 'var(--text2)' }}>Tayyar ho raha hai...</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>30-60 seconds lag sakte hain</p>
                </div>
              ) : status === 'qr' && qrImg ? (
                <div className="animate-scale-in">
                  <div className="bg-white p-3 rounded-xl inline-block mb-3"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
                    <img src={qrImg} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>QR scan karein</p>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>WhatsApp → Linked Devices</p>
                </div>
              ) : null
            )}
          </div>

          {/* Steps guide */}
          {showTabs && (
            <div className="mt-5 text-left space-y-2.5">
              {(method === 'phone' ? [
                { n: '1', t: 'Phone number likho', d: 'Bina 0 ke — 3001234567' },
                { n: '2', t: '"Pairing Code Lao" dabao', d: 'Code screen par aayega' },
                { n: '3', t: 'WhatsApp → Linked Devices', d: 'Settings → Linked Devices' },
                { n: '4', t: 'Code daalo', d: '"Link with phone number" select karo' },
              ] : [
                { n: '1', t: 'QR Generate karein', d: 'Button dabao' },
                { n: '2', t: 'WhatsApp kholein', d: 'Doosre phone mein' },
                { n: '3', t: 'Settings → Linked Devices', d: 'Link a Device' },
                { n: '4', t: 'QR scan karein', d: 'Auto dashboard par jaoge' },
              ]).map(s => (
                <div key={s.n} className="flex items-start gap-3 animate-fade-in">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shrink-0 mt-0.5 font-bold"
                    style={{ background: 'var(--green)' }}>{s.n}</div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{s.t}</p>
                    <p className="text-xs" style={{ color: 'var(--text3)' }}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => router.push('/dashboard')}
            className="mt-5 text-xs transition-colors hover:opacity-70"
            style={{ color: 'var(--text3)' }}>
            Skip — baad mein connect karna hai
          </button>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}

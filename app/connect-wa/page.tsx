'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, CheckCircle2, XCircle, RefreshCw, Smartphone, QrCode, Loader2 } from 'lucide-react';

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
  const esRef = useRef<EventSource | null>(null);
  const qrReadyRef = useRef<(() => void) | null>(null);

  function getUserId() {
    try { return JSON.parse(localStorage.getItem('wa_user') || '{}').id || ''; }
    catch { return ''; }
  }

  function startSSE(userId: string): Promise<void> {
    return new Promise((resolve) => {
      if (esRef.current) esRef.current.close();
      const es = new EventSource(`${WA_URL}/wa/qr/${userId}`);
      esRef.current = es;
      qrReadyRef.current = resolve;

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.event === 'qr') {
            setQrImg(data.qrCode);
            setStatus('qr');
            if (qrReadyRef.current) { qrReadyRef.current(); qrReadyRef.current = null; }
          } else if (data.event === 'pairing_code') {
            setPairingCode(data.code);
            setPairingLoading(false);
          } else if (data.event === 'authenticated') {
            setStatus('authenticated');
          } else if (data.event === 'ready') {
            setStatus('ready');
            es.close();
            setTimeout(() => router.push('/dashboard'), 2000);
          } else if (data.event === 'error') {
            setStatus('error');
            setErrMsg(data.message || 'Unknown error');
            es.close();
            if (qrReadyRef.current) { qrReadyRef.current(); qrReadyRef.current = null; }
          }
        } catch {}
      };
      es.onerror = () => {
        if (qrReadyRef.current) { qrReadyRef.current(); qrReadyRef.current = null; }
      };
    });
  }

  async function startAndWaitForQR(userId: string) {
    setStatus('loading');
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

    await startAndWaitForQR(userId);

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
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
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
        setStatus('loading');
        await fetch(`${WA_URL}/wa/restart/${userId}`, { method: 'POST' });
        await new Promise(res => setTimeout(res, 4000));
        const r2 = await fetch(`${WA_URL}/wa/status/${userId}`);
        const d2 = await r2.json();
        if (d2.connected) {
          router.push('/dashboard');
        } else {
          setStatus('idle');
        }
      } catch {
        setStatus('idle');
      }
    }

    checkAndReconnect();
    return () => esRef.current?.close();
  }, []);

  const showTabs = status === 'idle' || status === 'error';
  const isConnecting = status === 'loading';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md text-center animate-fade-in">

        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'var(--green)', boxShadow: '0 8px 24px rgba(61,186,94,0.25)' }}>
          <MessageCircle size={24} className="text-white" />
        </div>
        <h1 className="brand font-bold text-2xl mb-1" style={{ color: 'var(--text)' }}>WhatsApp Connect Karein</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text3)' }}>Apna tarika chunein</p>

        {/* Tabs */}
        {showTabs && (
          <div className="flex gap-2 mb-5 p-1 rounded-xl" style={{ background: 'var(--bg3)', border: '0.5px solid var(--border)' }}>
            <button onClick={() => { setMethod('phone'); reset(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${method === 'phone' ? 'btn-primary justify-center' : ''}`}
              style={method === 'phone' ? { background: 'var(--green)', color: '#fff' } : { color: 'var(--text2)' }}>
              <Smartphone size={15} /> Phone Number
            </button>
            <button onClick={() => { setMethod('qr'); reset(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${method === 'qr' ? 'btn-primary justify-center' : ''}`}
              style={method === 'qr' ? { background: 'var(--green)', color: '#fff' } : { color: 'var(--text2)' }}>
              <QrCode size={15} /> QR Code
            </button>
          </div>
        )}

        <div className="rounded-2xl p-7 card-elevated" style={{ background: 'var(--bg2)' }}>

          {/* ── READY ── */}
          {status === 'ready' && (
            <div className="py-8 animate-scale-in">
              <CheckCircle2 size={52} className="mx-auto mb-4" style={{ color: 'var(--green)' }} />
              <p className="font-bold text-xl" style={{ color: 'var(--text)' }}>Connected! ✅</p>
              <p className="text-sm mt-2" style={{ color: 'var(--text3)' }}>Dashboard par ja raha hai...</p>
            </div>
          )}

          {/* ── AUTHENTICATED ── */}
          {status === 'authenticated' && (
            <div className="py-8">
              <Loader2 size={40} className="mx-auto mb-4 animate-spin" style={{ color: 'var(--green)' }} />
              <p className="font-semibold" style={{ color: 'var(--green)' }}>Connected! Load ho raha hai...</p>
            </div>
          )}

          {/* ── ERROR ── */}
          {status === 'error' && (
            <div className="py-5">
              <XCircle size={40} className="mx-auto mb-3" style={{ color: '#e05a5a' }} />
              <p className="font-semibold mb-1" style={{ color: '#e05a5a' }}>Error hua</p>
              <p className="text-xs mb-5" style={{ color: 'var(--text3)' }}>{errMsg}</p>
              <button onClick={reset}
                className="btn-primary justify-center mx-auto">
                <RefreshCw size={14} /> Dobara Try Karein
              </button>
            </div>
          )}

          {/* ══ PHONE METHOD ══ */}
          {method === 'phone' && status !== 'ready' && status !== 'authenticated' && status !== 'error' && (

            pairingCode ? (
              <div className="animate-scale-in">
                <CheckCircle2 size={32} className="mx-auto mb-3" style={{ color: 'var(--green)' }} />
                <p className="text-sm font-medium mb-4" style={{ color: 'var(--text)' }}>Yeh code WhatsApp mein daalo:</p>
                <div className="rounded-2xl p-6 mb-5" style={{ background: 'var(--green-dim)', border: '2px solid rgba(61,186,94,0.4)' }}>
                  <p className="text-5xl font-bold tracking-[0.25em]" style={{ color: 'var(--green)' }}>{pairingCode}</p>
                </div>
                <div className="text-left rounded-xl p-4 text-xs space-y-1.5 mb-4" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                  <p className="font-semibold text-sm mb-2" style={{ color: 'var(--text)' }}>Ab yeh karo:</p>
                  <p>1. WhatsApp kholein (usi mobile mein bhi chalega)</p>
                  <p>2. Settings (3 dots) → Linked Devices</p>
                  <p>3. "Link a Device" button dabao</p>
                  <p>4. "Link with phone number" select karo</p>
                  <p>5. Upar wala <span className="font-bold" style={{ color: 'var(--green)' }}>{pairingCode}</span> code daalo</p>
                </div>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>Code 2-3 minute mein expire hota hai</p>
                <button onClick={reset} className="mt-3 text-xs underline block mx-auto transition-colors hover:opacity-70" style={{ color: 'var(--text3)' }}>
                  Dobara try karein
                </button>
              </div>
            ) : (
              <div>
                <Smartphone size={40} className="mx-auto mb-4" style={{ color: 'var(--green)' }} />
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Phone Number se connect karein</p>
                <p className="text-xs mb-5" style={{ color: 'var(--text3)' }}>
                  Same mobile mein bhi kaam karta hai — WhatsApp mein code aayega
                </p>
                <div className="text-left mb-4">
                  <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--text2)' }}>
                    WhatsApp Number (country code ke saath)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setPairingError(''); }}
                    placeholder="923001234567"
                    disabled={isConnecting || pairingLoading}
                    className="field"
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                    Pakistan: 92 + number bina 0 ke — jaise <span style={{ color: 'var(--text2)' }}>923001234567</span>
                  </p>
                </div>
                {pairingError && (
                  <p className="text-xs mb-3 text-left rounded-lg px-3 py-2" style={{ background: 'rgba(220,50,50,0.08)', color: '#e05a5a' }}>{pairingError}</p>
                )}
                <button
                  onClick={handlePairingCode}
                  disabled={isConnecting || pairingLoading}
                  className="btn-primary w-full justify-center"
                  style={{ opacity: isConnecting || pairingLoading ? 0.6 : 1 }}>
                  {(isConnecting || pairingLoading)
                    ? <><Loader2 size={16} className="animate-spin" />
                        {isConnecting ? 'WhatsApp load ho raha hai... (30-60 sec)' : 'Code mil raha hai...'}</>
                    : 'Pairing Code Lao'}
                </button>
              </div>
            )
          )}

          {/* ══ QR METHOD ══ */}
          {method === 'qr' && status !== 'ready' && status !== 'authenticated' && status !== 'error' && (
            status === 'idle' ? (
              <div className="py-4">
                <QrCode size={44} className="mx-auto mb-4" style={{ color: 'var(--green)' }} />
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Doosre phone se QR scan karein</p>
                <p className="text-xs mb-6" style={{ color: 'var(--text3)' }}>WhatsApp → Settings → Linked Devices → Link a Device</p>
                <button onClick={handleQRConnect}
                  className="btn-primary w-full justify-center">
                  QR Generate Karein
                </button>
              </div>
            ) : status === 'loading' ? (
              <div className="py-8">
                <Loader2 size={40} className="mx-auto mb-4 animate-spin" style={{ color: 'var(--green)' }} />
                <p className="text-sm" style={{ color: 'var(--text2)' }}>Tayyar ho raha hai...</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>30-60 seconds lag sakte hain</p>
              </div>
            ) : status === 'qr' && qrImg ? (
              <div className="animate-scale-in">
                <div className="bg-white p-3 rounded-xl inline-block mb-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
                  <img src={qrImg} alt="QR Code" className="w-56 h-56" />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>QR scan karein</p>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>WhatsApp → Settings → Linked Devices</p>
              </div>
            ) : null
          )}

        </div>

        {/* Steps */}
        <div className="mt-5 text-left space-y-2.5">
          {(method === 'phone' ? [
            { n: '1', t: 'Phone number likho', d: '923xxxxxxxxx — country code ke saath' },
            { n: '2', t: '"Pairing Code Lao" dabao', d: '30-60 sec mein code screen par aayega' },
            { n: '3', t: 'WhatsApp → Linked Devices', d: 'Settings (3 dots) → Linked Devices' },
            { n: '4', t: 'Code daalo — ho gaya!', d: '"Link with phone number" select karo' },
          ] : [
            { n: '1', t: 'QR Generate karein', d: 'Button dabao' },
            { n: '2', t: 'WhatsApp kholein', d: 'Doosre phone mein' },
            { n: '3', t: 'Settings → Linked Devices', d: 'Link a Device' },
            { n: '4', t: 'QR scan karein', d: 'Auto dashboard par jaoge' },
          ]).map(s => (
            <div key={s.n} className="flex items-start gap-3 animate-fade-in">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shrink-0 mt-0.5 font-bold" style={{ background: 'var(--green)' }}>{s.n}</div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{s.t}</p>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>{s.d}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => router.push('/dashboard')} className="mt-6 text-sm underline transition-colors hover:opacity-70" style={{ color: 'var(--text3)' }}>
          Skip — baad mein connect karna hai
        </button>
      </div>
    </div>
  );
}

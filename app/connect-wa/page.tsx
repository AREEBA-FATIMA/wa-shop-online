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
  // QR ready hone ka promise resolve karne ke liye
  const qrReadyRef = useRef<(() => void) | null>(null);

  function getUserId() {
    try { return JSON.parse(localStorage.getItem('wa_user') || '{}').id || ''; }
    catch { return ''; }
  }

  // SSE start karo — QR ready hone par resolve hoga
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
            // QR aa gaya — pairing code maang sakte hain
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
    await startSSE(userId); // QR ready hone tak wait
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

    // Pehle client start karo aur QR ready hone ka wait karo
    await startAndWaitForQR(userId);

    // Ab pairing code maango
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
    fetch(`${WA_URL}/wa/status/${userId}`)
      .then(r => r.json()).then(d => { if (d.connected) router.push('/dashboard'); })
      .catch(() => {});
    return () => esRef.current?.close();
  }, []);

  const showTabs = status === 'idle' || status === 'error';
  const isConnecting = status === 'loading';

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md text-center">

        <div className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center mx-auto mb-5">
          <MessageCircle size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-1 text-white">WhatsApp Connect Karein</h1>
        <p className="text-gray-500 text-sm mb-6">Apna tarika chunein</p>

        {/* Tabs */}
        {showTabs && (
          <div className="flex gap-2 mb-5 bg-[#111] p-1 rounded-xl border border-white/10">
            <button onClick={() => { setMethod('phone'); reset(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${method === 'phone' ? 'bg-[#25D366] text-white' : 'text-gray-400 hover:text-white'}`}>
              <Smartphone size={15} /> Phone Number
            </button>
            <button onClick={() => { setMethod('qr'); reset(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${method === 'qr' ? 'bg-[#25D366] text-white' : 'text-gray-400 hover:text-white'}`}>
              <QrCode size={15} /> QR Code
            </button>
          </div>
        )}

        <div className="bg-[#111] border border-white/10 rounded-2xl p-7">

          {/* ── READY ── */}
          {status === 'ready' && (
            <div className="py-8">
              <CheckCircle2 size={52} className="text-[#25D366] mx-auto mb-4" />
              <p className="text-white font-bold text-xl">Connected! ✅</p>
              <p className="text-gray-400 text-sm mt-2">Dashboard par ja raha hai...</p>
            </div>
          )}

          {/* ── AUTHENTICATED ── */}
          {status === 'authenticated' && (
            <div className="py-8">
              <Loader2 size={40} className="text-[#25D366] mx-auto mb-4 animate-spin" />
              <p className="text-[#25D366] font-semibold">Connected! Load ho raha hai...</p>
            </div>
          )}

          {/* ── ERROR ── */}
          {status === 'error' && (
            <div className="py-5">
              <XCircle size={40} className="text-red-400 mx-auto mb-3" />
              <p className="text-red-400 font-semibold mb-1">Error hua</p>
              <p className="text-gray-500 text-xs mb-5">{errMsg}</p>
              <button onClick={reset}
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-xl text-sm font-medium">
                <RefreshCw size={14} /> Dobara Try Karein
              </button>
            </div>
          )}

          {/* ══ PHONE METHOD ══════════════════════════════════════════ */}
          {method === 'phone' && status !== 'ready' && status !== 'authenticated' && status !== 'error' && (

            pairingCode ? (
              /* Code show karo */
              <div>
                <CheckCircle2 size={32} className="text-[#25D366] mx-auto mb-3" />
                <p className="text-white text-sm font-medium mb-4">Yeh code WhatsApp mein daalo:</p>
                <div className="bg-[#25D366]/10 border-2 border-[#25D366]/50 rounded-2xl p-6 mb-5">
                  <p className="text-5xl font-bold tracking-[0.25em] text-[#25D366]">{pairingCode}</p>
                </div>
                <div className="text-left bg-[#1a1a1a] rounded-xl p-4 text-xs text-gray-400 space-y-1.5 mb-4">
                  <p className="font-semibold text-white text-sm mb-2">Ab yeh karo:</p>
                  <p>1. WhatsApp kholein (usi mobile mein bhi chalega)</p>
                  <p>2. Settings (3 dots) → Linked Devices</p>
                  <p>3. "Link a Device" button dabao</p>
                  <p>4. "Link with phone number" select karo</p>
                  <p>5. Upar wala <span className="text-[#25D366] font-bold">{pairingCode}</span> code daalo</p>
                </div>
                <p className="text-gray-600 text-xs">Code 2-3 minute mein expire hota hai</p>
                <button onClick={reset} className="mt-3 text-gray-500 text-xs hover:text-gray-300 underline block mx-auto">
                  Dobara try karein
                </button>
              </div>
            ) : (
              /* Phone input form — idle ya loading dono mein dikhe */
              <div>
                <Smartphone size={40} className="text-[#25D366] mx-auto mb-4" />
                <p className="text-white text-sm font-medium mb-1">Phone Number se connect karein</p>
                <p className="text-gray-500 text-xs mb-5">
                  Same mobile mein bhi kaam karta hai — WhatsApp mein code aayega
                </p>
                <div className="text-left mb-4">
                  <label className="text-xs text-gray-400 mb-1.5 block">
                    WhatsApp Number (country code ke saath)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setPairingError(''); }}
                    placeholder="923001234567"
                    disabled={isConnecting || pairingLoading}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#25D366] transition-colors disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Pakistan: 92 + number bina 0 ke — jaise <span className="text-gray-400">923001234567</span>
                  </p>
                </div>
                {pairingError && (
                  <p className="text-red-400 text-xs mb-3 text-left bg-red-500/10 rounded-lg px-3 py-2">{pairingError}</p>
                )}
                <button
                  onClick={handlePairingCode}
                  disabled={isConnecting || pairingLoading}
                  className="w-full bg-[#25D366] hover:bg-[#1da855] disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm">
                  {(isConnecting || pairingLoading)
                    ? <><Loader2 size={16} className="animate-spin" />
                        {isConnecting ? 'WhatsApp load ho raha hai... (30-60 sec)' : 'Code mil raha hai...'}</>
                    : 'Pairing Code Lao'}
                </button>
              </div>
            )
          )}

          {/* ══ QR METHOD ══════════════════════════════════════════════ */}
          {method === 'qr' && status !== 'ready' && status !== 'authenticated' && status !== 'error' && (
            status === 'idle' ? (
              <div className="py-4">
                <QrCode size={44} className="text-[#25D366] mx-auto mb-4" />
                <p className="text-white text-sm font-medium mb-1">Doosre phone se QR scan karein</p>
                <p className="text-gray-500 text-xs mb-6">WhatsApp → Settings → Linked Devices → Link a Device</p>
                <button onClick={handleQRConnect}
                  className="w-full bg-[#25D366] hover:bg-[#1da855] text-white py-3 rounded-xl font-medium text-sm transition-colors">
                  QR Generate Karein
                </button>
              </div>
            ) : status === 'loading' ? (
              <div className="py-8">
                <Loader2 size={40} className="text-[#25D366] mx-auto mb-4 animate-spin" />
                <p className="text-gray-400 text-sm">Tayyar ho raha hai...</p>
                <p className="text-gray-600 text-xs mt-1">30-60 seconds lag sakte hain</p>
              </div>
            ) : status === 'qr' && qrImg ? (
              <div>
                <div className="bg-white p-3 rounded-xl inline-block mb-4">
                  <img src={qrImg} alt="QR Code" className="w-56 h-56" />
                </div>
                <p className="text-white text-sm font-medium mb-1">QR scan karein</p>
                <p className="text-gray-500 text-xs">WhatsApp → Settings → Linked Devices</p>
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
            <div key={s.n} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#25D366] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{s.n}</div>
              <div>
                <p className="text-sm font-medium text-white">{s.t}</p>
                <p className="text-xs text-gray-500">{s.d}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => router.push('/dashboard')} className="mt-6 text-gray-600 hover:text-gray-400 text-sm underline">
          Skip — baad mein connect karna hai
        </button>
      </div>
    </div>
  );
}
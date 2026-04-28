'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, CheckCircle2, XCircle, RefreshCw, Smartphone, QrCode, Loader2 } from 'lucide-react';

type Status = 'idle' | 'loading' | 'qr' | 'authenticated' | 'ready' | 'error';
type Method = 'qr' | 'phone';

const WA_URL = process.env.NEXT_PUBLIC_WA_URL || process.env.NEXT_PUBLIC_API_URL || '';

export default function ConnectWA() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [method, setMethod] = useState<Method>('qr');
  const [qrImg, setQrImg] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [phone, setPhone] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [pairingLoading, setPairingLoading] = useState(false);
  const [pairingError, setPairingError] = useState('');
  const [waitingForQR, setWaitingForQR] = useState(false); // phone mode: QR aane ka wait
  const esRef = useRef<EventSource | null>(null);

  function getUserId() {
    try { return JSON.parse(localStorage.getItem('wa_user') || '{}').id || ''; }
    catch { return ''; }
  }

  function startSSE(userId: string) {
    if (esRef.current) esRef.current.close();
    const es = new EventSource(`${WA_URL}/wa/qr/${userId}`);
    esRef.current = es;
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.event === 'qr') {
          setQrImg(data.qrCode);
          setStatus('qr');
          setWaitingForQR(false); // QR aa gaya — pairing code maang sakte hain
        } else if (data.event === 'pairing_code') {
          // Server ne code bheja SSE se
          setPairingCode(data.code);
          setPairingLoading(false);
          setWaitingForQR(false);
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
        }
      } catch {}
    };
    es.onerror = () => {
      if (status !== 'ready' && status !== 'authenticated') {
        setStatus('error');
        setErrMsg('Server se connect nahi ho saka');
        es.close();
      }
    };
  }

  async function startConnect() {
    const userId = getUserId();
    if (!userId) { router.push('/auth/login'); return; }
    setStatus('loading'); setQrImg(''); setErrMsg('');
    setPairingCode(''); setPairingError(''); setWaitingForQR(false);
    if (esRef.current) esRef.current.close();
    try { await fetch(`${WA_URL}/wa/restart/${userId}`, { method: 'POST' }); } catch {}
    await new Promise(r => setTimeout(r, 1500));
    startSSE(userId);
  }

  async function requestPairingCode() {
    const userId = getUserId();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setPairingError('Phone number sahi likho — country code ke saath (923xxxxxxxxx)');
      return;
    }
    setPairingLoading(true); setPairingError(''); setPairingCode('');
    
    // Agar SSE connected nahi — pehle start karo
    if (status === 'idle') {
      setWaitingForQR(true);
      await startConnect();
      // QR event aane tak wait — SSE se milega
    }

    try {
      const r = await fetch(`${WA_URL}/wa/pairing-code/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const data = await r.json();
      if (data.success) {
        setPairingCode(data.code); // HTTP response se bhi set karo (backup)
        setPairingLoading(false);
        setWaitingForQR(false);
      } else {
        setPairingError(data.error || 'Code nahi mila — dobara try karo');
        setPairingLoading(false);
        setWaitingForQR(false);
      }
    } catch {
      setPairingError('Server se connect nahi hua');
      setPairingLoading(false);
      setWaitingForQR(false);
    }
  }

  function reset() {
    setStatus('idle'); setQrImg(''); setErrMsg('');
    setPairingCode(''); setPairingError(''); setWaitingForQR(false);
    setPairingLoading(false);
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
  }

  useEffect(() => {
    const userId = getUserId();
    if (!userId) { router.push('/auth/login'); return; }
    fetch(`${WA_URL}/wa/status/${userId}`)
      .then(r => r.json())
      .then(d => { if (d.connected) router.push('/dashboard'); })
      .catch(() => {});
    return () => esRef.current?.close();
  }, []);

  const isConnecting = status === 'loading' || status === 'authenticated';

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center mx-auto mb-6">
          <MessageCircle size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-white">WhatsApp Connect Karein</h1>
        <p className="text-gray-500 text-sm mb-6">Apna tarika chunein</p>

        {/* Tabs — sirf idle ya error mein dikhao */}
        {(status === 'idle' || status === 'error') && (
          <div className="flex gap-2 mb-6 bg-[#111] p-1 rounded-xl border border-white/10">
            <button onClick={() => { setMethod('qr'); reset(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${method === 'qr' ? 'bg-[#25D366] text-white' : 'text-gray-400 hover:text-white'}`}>
              <QrCode size={15} /> QR Code
            </button>
            <button onClick={() => { setMethod('phone'); reset(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${method === 'phone' ? 'bg-[#25D366] text-white' : 'text-gray-400 hover:text-white'}`}>
              <Smartphone size={15} /> Phone Number
            </button>
          </div>
        )}

        <div className="bg-[#111] border border-white/10 rounded-2xl p-8">

          {/* Loading */}
          {isConnecting && (
            <div className="py-8">
              <div className="w-10 h-10 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-sm">
                {status === 'authenticated' ? 'Connected! Loading...' : 'Tayyar ho raha hai...'}
              </p>
              <p className="text-gray-600 text-xs mt-1">30-60 seconds lag sakte hain</p>
            </div>
          )}

          {/* Ready */}
          {status === 'ready' && (
            <div className="py-8">
              <CheckCircle2 size={48} className="text-[#25D366] mx-auto mb-4" />
              <p className="text-white font-bold text-lg">Connected! ✅</p>
              <p className="text-gray-400 text-sm mt-2">Dashboard par ja raha hai...</p>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="py-4">
              <XCircle size={36} className="text-red-400 mx-auto mb-3" />
              <p className="text-red-400 font-semibold mb-1">Error</p>
              <p className="text-gray-500 text-xs mb-5">{errMsg}</p>
              <button onClick={reset}
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-xl text-sm font-medium">
                <RefreshCw size={14} /> Dobara Try Karein
              </button>
            </div>
          )}

          {/* QR Method — idle */}
          {method === 'qr' && status === 'idle' && (
            <div className="py-4">
              <QrCode size={44} className="text-[#25D366] mx-auto mb-4" />
              <p className="text-white text-sm mb-1 font-medium">Doosre phone se QR scan karein</p>
              <p className="text-gray-500 text-xs mb-6">WhatsApp → Settings → Linked Devices → Link a Device</p>
              <button onClick={startConnect}
                className="w-full bg-[#25D366] hover:bg-[#1da855] text-white py-3 rounded-xl font-medium transition-colors">
                QR Generate Karein
              </button>
            </div>
          )}

          {/* QR Code show */}
          {method === 'qr' && status === 'qr' && qrImg && (
            <div>
              <div className="bg-white p-3 rounded-xl inline-block mb-4">
                <img src={qrImg} alt="QR Code" className="w-56 h-56" />
              </div>
              <p className="text-white text-sm font-medium mb-1">QR scan karein</p>
              <p className="text-gray-500 text-xs">WhatsApp → Settings → Linked Devices</p>
            </div>
          )}

          {/* Phone Method — idle */}
          {method === 'phone' && status === 'idle' && !pairingCode && (
            <div className="py-2">
              <Smartphone size={40} className="text-[#25D366] mx-auto mb-4" />
              <p className="text-white text-sm font-medium mb-1">Phone Number se connect karein</p>
              <p className="text-gray-500 text-xs mb-5">
                Same phone par bhi kaam karta hai — WhatsApp mein code aayega
              </p>
              <div className="text-left mb-3">
                <label className="text-xs text-gray-400 mb-1.5 block">
                  WhatsApp Number (country code ke saath)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setPairingError(''); }}
                  placeholder="923001234567"
                  className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#25D366] transition-colors"
                />
                <p className="text-xs text-gray-600 mt-1">Pakistan: 92 + number bina 0 ke (jaise 923001234567)</p>
              </div>
              {pairingError && (
                <p className="text-red-400 text-xs mb-3 text-left">{pairingError}</p>
              )}
              <button onClick={requestPairingCode} disabled={pairingLoading}
                className="w-full bg-[#25D366] hover:bg-[#1da855] disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                {pairingLoading
                  ? <><Loader2 size={15} className="animate-spin" /> {waitingForQR ? 'WhatsApp load ho raha hai...' : 'Code mil raha hai...'}</>
                  : 'Pairing Code Lao'}
              </button>
            </div>
          )}

          {/* Pairing Code show — QR status ya idle mein */}
          {method === 'phone' && pairingCode && (
            <div>
              <CheckCircle2 size={32} className="text-[#25D366] mx-auto mb-3" />
              <p className="text-white text-sm font-medium mb-3">
                Yeh code WhatsApp mein daalo:
              </p>
              <div className="bg-[#25D366]/10 border border-[#25D366]/40 rounded-2xl p-5 mb-4">
                <p className="text-4xl font-bold tracking-[0.3em] text-[#25D366]">
                  {pairingCode}
                </p>
              </div>
              <div className="text-left bg-[#1a1a1a] rounded-xl p-4 text-xs text-gray-400 space-y-1.5">
                <p className="font-medium text-white mb-2">Steps:</p>
                <p>1. WhatsApp kholein</p>
                <p>2. Settings → Linked Devices</p>
                <p>3. "Link a Device" → "Link with phone number"</p>
                <p>4. Upar wala code daalo</p>
              </div>
              <p className="text-gray-600 text-xs mt-3">
                Code 2-3 minutes mein expire ho jaata hai
              </p>
              <button onClick={reset} className="mt-4 text-gray-500 text-xs hover:text-gray-300 underline">
                Dobara try karein
              </button>
            </div>
          )}

          {/* Phone mode + waiting for QR (connecting state) */}
          {method === 'phone' && !pairingCode && (status === 'qr') && pairingLoading && (
            <div className="py-6">
              <Loader2 size={36} className="text-[#25D366] mx-auto mb-3 animate-spin" />
              <p className="text-gray-400 text-sm">Code generate ho raha hai...</p>
            </div>
          )}
        </div>

        {/* Steps guide */}
        {(status === 'idle' || status === 'qr') && !pairingCode && (
          <div className="mt-6 text-left space-y-2.5">
            {(method === 'qr' ? [
              { n: '1', t: 'QR Generate karein', d: 'Button dabao' },
              { n: '2', t: 'WhatsApp kholein', d: 'Doosre phone mein' },
              { n: '3', t: 'Settings → Linked Devices', d: 'Link a Device' },
              { n: '4', t: 'QR scan karein', d: 'Auto dashboard par jaoge' },
            ] : [
              { n: '1', t: 'Phone number likho', d: '923xxxxxxxxx format mein' },
              { n: '2', t: '"Pairing Code Lao" dabao', d: '30 sec mein code aayega' },
              { n: '3', t: 'WhatsApp kholein', d: 'Settings → Linked Devices' },
              { n: '4', t: '"Link with phone number"', d: 'Code daalo — connected!' },
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
        )}

        <button onClick={() => router.push('/dashboard')} className="mt-6 text-gray-600 hover:text-gray-400 text-sm underline">
          Skip — baad mein connect karna hai
        </button>
      </div>
    </div>
  );
}
'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, CheckCircle2, XCircle, RefreshCw, Smartphone, QrCode } from 'lucide-react';

type Status = 'waiting' | 'qr' | 'authenticated' | 'ready' | 'error';
type Method = 'qr' | 'phone';

const HF_SPACE = process.env.NEXT_PUBLIC_WA_URL || process.env.NEXT_PUBLIC_API_URL || '';
const WA_URL = HF_SPACE;

export default function ConnectWA() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('waiting');
  const [method, setMethod] = useState<Method>('qr');
  const [qrImg, setQrImg] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [phone, setPhone] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [pairingLoading, setPairingLoading] = useState(false);
  const [pairingError, setPairingError] = useState('');
  const [started, setStarted] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  function getUserId() {
    try { return JSON.parse(localStorage.getItem('wa_user') || '{}').id || ''; }
    catch { return ''; }
  }

  async function restartAndConnect() {
    const userId = getUserId();
    if (!userId) { router.push('/auth/login'); return; }
    setStarted(true);
    setStatus('waiting'); setQrImg(''); setErrMsg(''); setPairingCode(''); setPairingError('');
    if (esRef.current) esRef.current.close();
    try { await fetch(`${WA_URL}/wa/restart/${userId}`, { method: 'POST' }); } catch {}
    await new Promise(r => setTimeout(r, 1500));
    startSSE(userId);
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
        } else if (data.event === 'disconnected') {
          setStatus('error');
          setErrMsg('Disconnected: ' + data.message);
        }
      } catch {}
    };
    es.onerror = () => {
      setStatus('error');
      setErrMsg('WA service se connect nahi ho raha (' + WA_URL + ')');
      es.close();
    };
  }

  async function requestPairingCode() {
    const userId = getUserId();
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setPairingError('Phone number sahi likho (e.g. 923001234567)');
      return;
    }
    setPairingLoading(true); setPairingError(''); setPairingCode('');
    try {
      const r = await fetch(`${WA_URL}/wa/pairing-code/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/\D/g, '') })
      });
      const data = await r.json();
      if (data.success) {
        setPairingCode(data.code);
      } else {
        setPairingError(data.error || 'Code nahi mila');
      }
    } catch {
      setPairingError('Server se connect nahi hua');
    }
    setPairingLoading(false);
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

  const qrSteps = [
    { n: '1', t: 'WhatsApp kholein', d: 'Android ya iPhone mein' },
    { n: '2', t: 'Settings → Linked Devices', d: '3 dots menu ya Settings se' },
    { n: '3', t: 'Link a Device', d: 'QR ka option' },
    { n: '4', t: 'Upar wala QR scan karein', d: 'Done! Automatic dashboard par jayega' },
  ];

  const phoneSteps = [
    { n: '1', t: 'Phone number likhein', d: 'Country code ke saath (923xxxxxxxxx)' },
    { n: '2', t: '"Pairing Code Lo" dabao', d: 'Code generate hoga' },
    { n: '3', t: 'WhatsApp kholein', d: 'Settings → Linked Devices' },
    { n: '4', t: '"Link with Phone Number"', d: '8-digit code daalo' },
  ];

  const steps = method === 'qr' ? qrSteps : phoneSteps;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center mx-auto mb-6">
          <MessageCircle size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-white">WhatsApp Connect Karein</h1>
        <p className="text-gray-500 text-sm mb-6">Phone mein WhatsApp kholein aur QR scan karein</p>

        {/* Method tabs */}
        {(!started || status === 'error') && (
          <div className="flex gap-2 mb-6 bg-[#111] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setMethod('qr')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${method === 'qr' ? 'bg-[#25D366] text-white' : 'text-gray-400 hover:text-white'}`}>
              <QrCode size={15} /> QR Code
            </button>
            <button
              onClick={() => setMethod('phone')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${method === 'phone' ? 'bg-[#25D366] text-white' : 'text-gray-400 hover:text-white'}`}>
              <Smartphone size={15} /> Phone Number
            </button>
          </div>
        )}

        <div className="bg-[#111] border border-white/10 rounded-2xl p-8">

          {/* QR Method */}
          {method === 'qr' && (
            <>
              {!started && (
                <div className="py-4">
                  <QrCode size={48} className="text-[#25D366] mx-auto mb-4" />
                  <p className="text-white text-sm mb-2">Doosre phone se QR scan karein</p>
                  <p className="text-gray-500 text-xs mb-6">WhatsApp → Settings → Linked Devices → Link a Device</p>
                  <button onClick={restartAndConnect}
                    className="bg-[#25D366] hover:bg-[#1da855] text-white px-6 py-3 rounded-xl font-medium transition-colors w-full">
                    QR Generate Karein
                  </button>
                </div>
              )}
              {started && status === 'waiting' && (
                <div className="py-8">
                  <div className="w-10 h-10 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Tayyar ho raha hai...</p>
                  <p className="text-gray-600 text-xs mt-2">30-60 seconds lag sakte hain</p>
                </div>
              )}
              {status === 'qr' && qrImg && (
                <div>
                  <div className="bg-white p-3 rounded-xl inline-block mb-4">
                    <img src={qrImg} alt="QR Code" className="w-56 h-56" />
                  </div>
                  <p className="text-white text-sm font-medium mb-1">QR scan karein</p>
                  <p className="text-gray-500 text-xs">WhatsApp → Settings → Linked Devices</p>
                </div>
              )}
            </>
          )}

          {/* Phone Method */}
          {method === 'phone' && (
            <>
              {!started && (
                <div className="py-2">
                  <Smartphone size={40} className="text-[#25D366] mx-auto mb-4" />
                  <p className="text-white text-sm font-medium mb-1">Phone Number se connect karein</p>
                  <p className="text-gray-500 text-xs mb-6">
                    Aapko WhatsApp mein ek code milega — usi mobile par bhi kaam karta hai
                  </p>
                  <div className="text-left mb-3">
                    <label className="text-xs text-gray-400 mb-1 block">WhatsApp Number (country code ke saath)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="923001234567"
                      className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#25D366] transition-colors"
                    />
                    <p className="text-xs text-gray-600 mt-1">Pakistan: 92 + number (0 ke bina) — jaise 923001234567</p>
                  </div>
                  {pairingError && <p className="text-red-400 text-xs mb-3">{pairingError}</p>}
                  {!pairingCode ? (
                    <button
                      onClick={async () => {
                        await restartAndConnect();
                        await new Promise(r => setTimeout(r, 3000));
                        await requestPairingCode();
                      }}
                      disabled={pairingLoading}
                      className="w-full bg-[#25D366] hover:bg-[#1da855] disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                      {pairingLoading
                        ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Code mil raha hai...</>
                        : 'Pairing Code Lo'}
                    </button>
                  ) : (
                    <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl p-4 mt-2">
                      <p className="text-xs text-gray-400 mb-2">Yeh code WhatsApp mein daalo:</p>
                      <p className="text-3xl font-bold tracking-widest text-[#25D366] mb-3">{pairingCode}</p>
                      <p className="text-xs text-gray-500">
                        WhatsApp → Settings → Linked Devices → Link with Phone Number → Code daalo
                      </p>
                    </div>
                  )}
                </div>
              )}
              {started && status === 'waiting' && (
                <div className="py-8">
                  <div className="w-10 h-10 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Tayyar ho raha hai...</p>
                </div>
              )}
              {pairingCode && status === 'qr' && (
                <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-2">Yeh code WhatsApp mein daalo:</p>
                  <p className="text-3xl font-bold tracking-widest text-[#25D366] mb-3">{pairingCode}</p>
                  <p className="text-xs text-gray-500">
                    WhatsApp → Settings → Linked Devices → Link with Phone Number
                  </p>
                </div>
              )}
            </>
          )}

          {/* Common states */}
          {status === 'authenticated' && (
            <div className="py-8">
              <div className="w-10 h-10 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#25D366] font-semibold">Connected ho gaya! Loading...</p>
            </div>
          )}
          {status === 'ready' && (
            <div className="py-8">
              <CheckCircle2 size={48} className="text-[#25D366] mx-auto mb-4" />
              <p className="text-white font-bold text-lg">Connected! ✅</p>
              <p className="text-gray-400 text-sm mt-2">Dashboard par ja raha hai...</p>
            </div>
          )}
          {status === 'error' && (
            <div className="py-6">
              <XCircle size={40} className="text-red-400 mx-auto mb-3" />
              <p className="text-red-400 font-semibold mb-2">Error</p>
              <p className="text-gray-500 text-xs mb-6">{errMsg}</p>
              <p className="text-gray-600 text-xs mb-4">Docker chal raha hai? wa-service port 3001 open hai?</p>
              <button onClick={() => { setStarted(false); setStatus('waiting'); setPairingCode(''); }}
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da855] text-white px-6 py-3 rounded-xl font-medium transition-colors">
                <RefreshCw size={15} /> Dobara Try Karein
              </button>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="mt-6 text-left space-y-3">
          {steps.map(s => (
            <div key={s.n} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#25D366] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{s.n}</div>
              <div>
                <p className="text-sm font-medium text-white">{s.t}</p>
                <p className="text-xs text-gray-500">{s.d}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => router.push('/dashboard')} className="mt-8 text-gray-600 hover:text-gray-400 text-sm underline">
          Skip — baad mein connect karna hai
        </button>
      </div>
    </div>
  );
}
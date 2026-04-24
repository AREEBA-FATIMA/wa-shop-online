'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

type Status = 'waiting' | 'qr' | 'authenticated' | 'ready' | 'error';

// Vercel par NEXT_PUBLIC_WA_URL set karo (HF Space URL)
// Local par empty = proxy
const WA_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_WA_URL || '')
  : '';

export default function ConnectWA() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('waiting');
  const [qrImg, setQrImg] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const esRef = useRef<EventSource | null>(null);

  function getUserId() {
    try { return JSON.parse(localStorage.getItem('wa_user') || '{}').id || ''; }
    catch { return ''; }
  }

  async function restartAndConnect() {
    const userId = getUserId();
    if (!userId) { router.push('/auth/login'); return; }

    setStatus('waiting'); setQrImg(''); setErrMsg('');
    if (esRef.current) esRef.current.close();

    // Pehle restart endpoint call karo (lock saaf kare)
    try {
      await fetch(`${WA_URL}/wa/restart/${userId}`, { method: 'POST' });
    } catch (e) {}

    // 1.5 second wait phir SSE connect
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
        } else if (data.event === 'loading') {
          // loading — spinner dikhao
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
      setErrMsg(`WA service se connect nahi ho raha (${WA_URL})\nDocker chal raha hai? wa-service port 3001 open hai?`);
      es.close();
    };
  }

  useEffect(() => {
    const userId = getUserId();
    if (!userId) { router.push('/auth/login'); return; }
    
    // Pehle check karo — already connected hai?
    fetch(`${WA_URL}/wa/status/${userId}`)
      .then(r => r.json())
      .then(d => {
        if (d.connected) {
          // Already connected — dashboard par jao
          router.push('/dashboard');
        } else {
          // Connected nahi — restart aur QR dikhao
          restartAndConnect();
        }
      })
      .catch(() => restartAndConnect());
    
    return () => esRef.current?.close();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center mx-auto mb-6">
          <MessageCircle size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">WhatsApp Connect Karein</h1>
        <p className="text-gray-500 text-sm mb-8">Phone mein WhatsApp kholein aur QR scan karein</p>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
          {status === 'waiting' && (
            <div className="py-8">
              <div className="w-10 h-10 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Tayyar ho raha hai...</p>
              <p className="text-gray-600 text-xs mt-2">30-60 seconds lag sakte hain pehli baar</p>
            </div>
          )}

          {status === 'qr' && qrImg && (
            <div>
              <div className="bg-white p-3 rounded-xl inline-block mb-4">
                <img src={qrImg} alt="WhatsApp QR Code" className="w-56 h-56" />
              </div>
              <p className="text-white text-sm font-medium mb-1">QR scan karein</p>
              <p className="text-gray-500 text-xs">WhatsApp → Settings → Linked Devices → Link a Device</p>
            </div>
          )}

          {status === 'authenticated' && (
            <div className="py-8">
              <div className="w-10 h-10 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#25D366] font-semibold">Scan ho gaya! Loading...</p>
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
              <p className="text-gray-500 text-xs mb-6 leading-relaxed whitespace-pre-line">{errMsg}</p>
              <button onClick={restartAndConnect}
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da855] text-white px-6 py-3 rounded-xl font-medium transition-colors">
                <RefreshCw size={15} /> Dobara Try Karein
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-left space-y-3">
          {[
            { n: '1', t: 'WhatsApp kholein', d: 'Android ya iPhone mein' },
            { n: '2', t: 'Settings → Linked Devices', d: '3 dots menu ya Settings se' },
            { n: '3', t: 'Link a Device', d: 'QR scan ka option' },
            { n: '4', t: 'Upar wala QR scan karein', d: 'Done! Automatic dashboard par jayega' },
          ].map(s => (
            <div key={s.n} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#25D366] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{s.n}</div>
              <div><p className="text-sm font-medium text-white">{s.t}</p><p className="text-xs text-gray-500">{s.d}</p></div>
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

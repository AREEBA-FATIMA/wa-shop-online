'use client';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Send, Bot, User2, Search, RefreshCw, MessageCircle, Trash2, Phone, MoreVertical, Check, CheckCheck } from 'lucide-react';

interface Chat { id: string; customer_phone: string; customer_name: string; last_message: string; last_message_at: string; unread_count: number; status: string; }
interface Message { id: string; content: string; from_customer: boolean; created_at: string; ai_generated: boolean; }

function timeAgo(iso: string) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function formatTime(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [active, setActive] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function getUserId() { try { return JSON.parse(localStorage.getItem('wa_user') || '{}').id || ''; } catch { return ''; } }

  async function loadChats() { try { const r = await api.get('/api/chats'); setChats(r.data); } catch {} setLoading(false); }

  async function deleteChat(chatId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Delete this chat?')) return;
    try { await api.delete(`/api/chats/${chatId}`); setChats(prev => prev.filter(c => c.id !== chatId)); if (active?.id === chatId) { setActive(null); setMessages([]); } } catch {}
  }

  async function loadMessages(chatId: string) {
    try { const r = await api.get(`/api/chats/${chatId}/messages`); setMessages(r.data); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); } catch {}
  }

  async function getAiSuggestion(lastMsg: string) {
    const userId = getUserId();
    if (!userId || !lastMsg) return;
    try {
      const user = JSON.parse(localStorage.getItem('wa_user') || '{}');
      const history = messages.slice(-10).map(m => ({ role: m.from_customer ? 'user' : 'assistant', content: m.content }));
      const r = await api.post('/api/ai/reply', { user_id: userId, customer_phone: active?.customer_phone || '', customer_message: lastMsg, language: user.language || 'roman_ur', history });
      setAiSuggestion(r.data.reply || '');
    } catch {}
  }

  async function sendReply(text?: string) {
    if (!active) return;
    const content = text || replyText;
    if (!content.trim()) return;
    setSending(true);
    try {
      await api.post(`/api/chats/${active.id}/reply`, { content });
      setReplyText(''); setAiSuggestion('');
      await loadMessages(active.id); await loadChats();
    } catch {}
    setSending(false);
  }

  function selectChat(chat: Chat) { setActive(chat); setAiSuggestion(''); loadMessages(chat.id); }

  useEffect(() => { loadChats(); pollRef.current = setInterval(loadChats, 5000); return () => { if (pollRef.current) clearInterval(pollRef.current); }; }, []);

  useEffect(() => { if (active) { const poll = setInterval(() => loadMessages(active.id), 3000); return () => clearInterval(poll); } }, [active]);

  useEffect(() => {
    if (!active || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.from_customer && !last.ai_generated) getAiSuggestion(last.content);
  }, [messages.length]);

  const filtered = chats.filter(c => c.customer_phone.includes(search) || c.customer_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-56px-60px)] md:h-[calc(100vh-0px)] overflow-hidden">
      {/* ─── Chat List ─── */}
      <div className={`${active ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 shrink-0`} style={{ background: 'var(--bg2)', borderRight: '0.5px solid var(--border)' }}>
        {/* Search */}
        <div className="p-3" style={{ borderBottom: '0.5px solid var(--border)' }}>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chats..." className="w-full bg-[var(--bg3)] border-none rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none" style={{ color: 'var(--text)' }} />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-3 space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="flex items-center gap-3 p-2"><div className="w-12 h-12 rounded-full skeleton shrink-0" /><div className="flex-1 space-y-2"><div className="h-3 rounded skeleton w-3/4" /><div className="h-2.5 rounded skeleton w-1/2" /></div></div>)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'var(--bg3)' }}><MessageCircle size={24} style={{ color: 'var(--text3)' }} /></div>
              <p className="text-sm font-medium" style={{ color: 'var(--text3)' }}>No chats yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Messages from customers will appear here</p>
            </div>
          ) : (
            filtered.map(chat => (
              <button key={chat.id} onClick={() => selectChat(chat)} className="w-full flex items-start gap-3 p-3 transition-colors text-left"
                style={{ borderBottom: '0.5px solid var(--border)', background: active?.id === chat.id ? 'var(--green-dim)' : 'transparent' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
                  {chat.customer_name?.charAt(0)?.toUpperCase() || chat.customer_phone.slice(-2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{chat.customer_name || chat.customer_phone}</span>
                    <span className="text-[10px] shrink-0 ml-2" style={{ color: 'var(--text3)' }}>{timeAgo(chat.last_message_at)}</span>
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--text3)' }}>{chat.last_message || 'No messages yet'}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {chat.unread_count > 0 && (
                    <span className="min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-white text-[10px] font-bold px-1" style={{ background: 'var(--green)' }}>
                      {chat.unread_count}
                    </span>
                  )}
                  <button onClick={(e) => deleteChat(chat.id, e)} className="p-0.5 transition-opacity hover:opacity-60" style={{ color: 'var(--text3)' }}><Trash2 size={11} /></button>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ─── Chat Window ─── */}
      <div className={`${active ? 'flex' : 'hidden md:flex'} flex-col flex-1 min-w-0`}>
        {!active ? (
          <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg3)' }}>
                <MessageCircle size={36} style={{ color: 'var(--text3)' }} />
              </div>
              <p className="font-semibold" style={{ color: 'var(--text3)' }}>Select a chat</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Choose from your conversations</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="h-14 flex items-center px-4 gap-3 shrink-0" style={{ background: 'var(--bg2)', borderBottom: '0.5px solid var(--border)' }}>
              <button onClick={() => setActive(null)} className="md:hidden -ml-1 p-1" style={{ color: 'var(--text2)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
              </button>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
                {active.customer_name?.charAt(0)?.toUpperCase() || active.customer_phone.slice(-2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{active.customer_name || active.customer_phone}</p>
                <p className="text-[11px]" style={{ color: 'var(--text3)' }}>{active.customer_phone}</p>
              </div>
              <button className="p-1.5 rounded-lg transition-colors hover:opacity-70" style={{ color: 'var(--text3)' }}><MoreVertical size={16} /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ background: 'var(--bg)' }}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'var(--bg3)' }}><MessageCircle size={20} style={{ color: 'var(--text3)' }} /></div>
                  <p className="text-sm" style={{ color: 'var(--text3)' }}>No messages yet</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isCustomer = msg.from_customer;
                  const prevMsg = idx > 0 ? messages[idx - 1] : null;
                  const sameSender = prevMsg?.from_customer === isCustomer;
                  const showAvatar = !sameSender;
                  return (
                    <div key={msg.id} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'} items-end gap-2 animate-fade-in`}
                      style={{ marginTop: showAvatar ? 12 : 2 }}>
                      {isCustomer && showAvatar && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mb-0.5" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>
                          {active.customer_name?.charAt(0)?.toUpperCase() || active.customer_phone.slice(-2)}
                        </div>
                      )}
                      {isCustomer && !showAvatar && <div className="w-7 shrink-0" />}
                      <div className="max-w-[75%]">
                        <div className={`px-3.5 py-2 ${isCustomer ? 'rounded-2xl rounded-tl-sm' : 'rounded-2xl rounded-br-sm'}`}
                          style={{ background: isCustomer ? 'var(--bg3)' : 'var(--green-dim)', border: isCustomer ? 'none' : '0.5px solid rgba(37,211,102,0.15)' }}>
                          <p className="text-sm leading-relaxed" style={{ color: isCustomer ? 'var(--text)' : 'var(--text)' }}>{msg.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 ${isCustomer ? '' : 'justify-end'}`}>
                          <span className="text-[10px]" style={{ opacity: 0.4, color: 'var(--text)' }}>{formatTime(msg.created_at)}</span>
                          {!isCustomer && <CheckCheck size={11} style={{ opacity: 0.4, color: 'var(--green)' }} />}
                          {msg.ai_generated && <span className="text-[10px] flex items-center gap-0.5" style={{ opacity: 0.4, color: 'var(--green)' }}><Bot size={9} /></span>}
                        </div>
                      </div>
                      {!isCustomer && showAvatar && <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mb-0.5" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>AI</div>}
                      {!isCustomer && !showAvatar && <div className="w-7 shrink-0" />}
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* AI Suggestion */}
            {aiSuggestion && (
              <div className="mx-3 mb-2 rounded-2xl p-3 animate-slide-up" style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--green-dim)' }}><Bot size={10} style={{ color: 'var(--green)' }} /></span>
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--green)' }}>AI Suggestion</span>
                </div>
                <p className="text-sm mb-2.5" style={{ color: 'var(--text)' }}>{aiSuggestion}</p>
                <div className="flex gap-2">
                  <button onClick={() => sendReply(aiSuggestion)} className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-all" style={{ background: 'var(--green)', color: '#fff' }}>Send</button>
                  <button onClick={() => { setReplyText(aiSuggestion); setAiSuggestion(''); }} className="text-xs font-medium px-4 py-1.5 rounded-lg transition-all" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>Edit</button>
                  <button onClick={() => setAiSuggestion('')} className="text-xs px-2 py-1.5 rounded-lg transition-all" style={{ color: 'var(--text3)' }}>Dismiss</button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-3" style={{ background: 'var(--bg2)', borderTop: '0.5px solid var(--border)' }}>
              <div className="flex items-center gap-2 rounded-2xl px-4 py-1" style={{ background: 'var(--bg3)' }}>
                <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()} placeholder="Type a message..." className="flex-1 bg-transparent border-none outline-none text-sm py-2.5" style={{ color: 'var(--text)' }} />
                <button onClick={() => sendReply()} disabled={sending || !replyText.trim()} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0" style={{ background: replyText.trim() ? 'var(--green)' : 'var(--bg4)', color: replyText.trim() ? '#fff' : 'var(--text3)' }}>
                  <Send size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

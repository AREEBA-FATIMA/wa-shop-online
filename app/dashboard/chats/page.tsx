'use client';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Send, Bot, User2, Search, RefreshCw, MessageCircle, Trash2 } from 'lucide-react';

interface Chat { id: string; customer_phone: string; customer_name: string; last_message: string; last_message_at: string; unread_count: number; status: string; }
interface Message { id: string; content: string; from_customer: boolean; created_at: string; ai_generated: boolean; }

function timeAgo(iso: string) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'abhi';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
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

  function getUserId() {
    try { return JSON.parse(localStorage.getItem('wa_user') || '{}').id || ''; } catch { return ''; }
  }

  async function loadChats() {
    try {
      const r = await api.get('/api/chats');
      setChats(r.data);
    } catch {}
    setLoading(false);
  }

  async function deleteChat(chatId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Yeh chat delete karna chahte hain?')) return;
    try {
      await api.delete(`/api/chats/${chatId}`);
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (active?.id === chatId) { setActive(null); setMessages([]); }
    } catch {}
  }

  async function loadMessages(chatId: string) {
    try {
      const r = await api.get(`/api/chats/${chatId}/messages`);
      setMessages(r.data);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {}
  }

  async function getAiSuggestion(lastMsg: string) {
    const userId = getUserId();
    if (!userId || !lastMsg) return;
    try {
      const user = JSON.parse(localStorage.getItem('wa_user') || '{}');
      const history = messages.slice(-10).map(m => ({
        role: m.from_customer ? 'user' : 'assistant',
        content: m.content
      }));
      const r = await api.post('/api/ai/reply', {
        user_id: userId, customer_phone: active?.customer_phone || '',
        customer_message: lastMsg, language: user.language || 'roman_ur',
        history
      });
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
      setReplyText('');
      setAiSuggestion('');
      await loadMessages(active.id);
      await loadChats();
    } catch {}
    setSending(false);
  }

  function selectChat(chat: Chat) {
    setActive(chat);
    setAiSuggestion('');
    loadMessages(chat.id);
  }

  useEffect(() => {
    loadChats();
    pollRef.current = setInterval(loadChats, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    if (active) {
      const poll = setInterval(() => loadMessages(active.id), 3000);
      return () => clearInterval(poll);
    }
  }, [active]);

  useEffect(() => {
    if (!active || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.from_customer && !last.ai_generated) {
      getAiSuggestion(last.content);
    }
  }, [messages.length]);

  const filtered = chats.filter(c =>
    c.customer_phone.includes(search) || c.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-0px)] md:h-screen overflow-hidden">
      {/* Chat list */}
      <div className={`${active ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 shrink-0 border-r`}
        style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="p-4" style={{ borderBottom: '0.5px solid var(--border)' }}>
          <h2 className="font-bold mb-3" style={{ color: 'var(--text)' }}>Chats</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="field pl-8 py-2" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle size={32} className="mx-auto mb-3" style={{ color: 'var(--text3)' }} />
              <p className="text-sm" style={{ color: 'var(--text3)' }}>Koi chat nahi</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Jab customers message karenge yahan dikhega</p>
            </div>
          ) : (
            filtered.map(chat => (
              <button key={chat.id} onClick={() => selectChat(chat)}
                className={`w-full flex items-start gap-3 p-4 transition-colors text-left`}
                style={{
                  borderBottom: '0.5px solid var(--border)',
                  background: active?.id === chat.id ? 'var(--green-dim)' : 'transparent',
                }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
                  {chat.customer_name?.charAt(0)?.toUpperCase() || chat.customer_phone.slice(-2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                      {chat.customer_name || chat.customer_phone}
                    </span>
                    <span className="text-xs shrink-0 ml-2" style={{ color: 'var(--text3)' }}>{timeAgo(chat.last_message_at)}</span>
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--text3)' }}>{chat.last_message}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {chat.unread_count > 0 && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: 'var(--green)' }}>
                      {chat.unread_count}
                    </div>
                  )}
                  <button
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="p-1 transition-colors rounded hover:opacity-70"
                    style={{ color: 'var(--text3)' }}
                    title="Delete chat">
                    <Trash2 size={12} />
                  </button>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-3" style={{ borderTop: '0.5px solid var(--border)' }}>
          <button onClick={loadChats} className="w-full flex items-center justify-center gap-2 text-xs py-2 transition-colors"
            style={{ color: 'var(--text3)' }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* Chat window */}
      <div className={`${active ? 'flex' : 'hidden md:flex'} flex-col flex-1 min-w-0`}
        style={{ background: 'var(--bg)' }}>
        {!active ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--text3)' }} />
              <p style={{ color: 'var(--text3)' }}>Koi chat select karein</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="h-14 flex items-center px-4 gap-3" style={{ background: 'var(--bg2)', borderBottom: '0.5px solid var(--border)' }}>
              <button onClick={() => setActive(null)} className="md:hidden mr-1" style={{ color: 'var(--text2)' }}>←</button>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
                {active.customer_name?.charAt(0)?.toUpperCase() || active.customer_phone.slice(-2)}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{active.customer_name || active.customer_phone}</p>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>{active.customer_phone}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-sm" style={{ color: 'var(--text3)' }}>Koi message nahi abhi</div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.from_customer ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                    <div className={`max-w-[75%] ${msg.from_customer ? 'wa-bubble-in' : 'wa-bubble-out'} px-3 py-2`}>
                      <p className="text-sm" style={{ color: 'var(--text)' }}>{msg.content}</p>
                      <div className={`flex items-center gap-1 mt-1 ${msg.from_customer ? '' : 'justify-end'}`}>
                        <span className="text-xs" style={{ opacity: 0.5, color: 'var(--text)' }}>
                          {new Date(msg.created_at).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.ai_generated && (
                          <span className="text-xs flex items-center gap-0.5" style={{ opacity: 0.5, color: 'var(--green)' }}>
                            <Bot size={10} /> AI
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* AI suggestion */}
            {aiSuggestion && (
              <div className="mx-4 mb-2 rounded-xl p-3 animate-fade-in" style={{ background: 'var(--green-dim)', border: '0.5px solid rgba(61,186,94,0.2)' }}>
                <div className="flex items-center gap-1 mb-1">
                  <Bot size={12} style={{ color: 'var(--green)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--green)' }}>AI Suggestion</span>
                </div>
                <p className="text-sm mb-2" style={{ color: 'var(--text)' }}>{aiSuggestion}</p>
                <div className="flex gap-2">
                  <button onClick={() => sendReply(aiSuggestion)}
                    className="btn-primary text-xs" style={{ padding: '6px 14px' }}>
                    Send
                  </button>
                  <button onClick={() => { setReplyText(aiSuggestion); setAiSuggestion(''); }}
                    className="btn-ghost text-xs" style={{ padding: '6px 14px' }}>
                    Edit
                  </button>
                  <button onClick={() => setAiSuggestion('')}
                    className="text-xs px-2 transition-colors" style={{ color: 'var(--text3)' }}>
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Reply input */}
            <div className="p-4" style={{ background: 'var(--bg2)', borderTop: '0.5px solid var(--border)' }}>
              <div className="flex gap-2">
                <input value={replyText} onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                  placeholder="Message likhein..."
                  className="field flex-1" />
                <button onClick={() => sendReply()} disabled={sending || !replyText.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0"
                  style={{ background: 'var(--green)', color: '#fff', opacity: sending || !replyText.trim() ? 0.4 : 1 }}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

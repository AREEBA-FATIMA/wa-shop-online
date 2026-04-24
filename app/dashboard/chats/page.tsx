'use client';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Send, Bot, User2, Search, RefreshCw, MessageCircle } from 'lucide-react';

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
      // Build history from current messages for context
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

  // Auto-suggest AI reply when new customer message arrives
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
      <div className={`${active ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-[#111] border-r border-white/8 shrink-0`}>
        <div className="p-4 border-b border-white/8">
          <h2 className="font-bold text-white mb-3">Chats</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#25D366]" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-[#1a1a1a] rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">Koi chat nahi</p>
              <p className="text-gray-700 text-xs mt-1">Jab customers message karenge yahan dikhega</p>
            </div>
          ) : (
            filtered.map(chat => (
              <button key={chat.id} onClick={() => selectChat(chat)}
                className={`w-full flex items-start gap-3 p-4 hover:bg-white/5 transition-colors text-left border-b border-white/5
                  ${active?.id === chat.id ? 'bg-[#25D366]/10' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] font-bold text-sm shrink-0">
                  {chat.customer_name?.charAt(0)?.toUpperCase() || chat.customer_phone.slice(-2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-white text-sm font-medium truncate">
                      {chat.customer_name || chat.customer_phone}
                    </span>
                    <span className="text-gray-600 text-xs shrink-0 ml-2">{timeAgo(chat.last_message_at)}</span>
                  </div>
                  <p className="text-gray-500 text-xs truncate">{chat.last_message}</p>
                </div>
                {chat.unread_count > 0 && (
                  <div className="w-5 h-5 rounded-full bg-[#25D366] text-white text-xs flex items-center justify-center shrink-0">
                    {chat.unread_count}
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        <div className="p-3 border-t border-white/8">
          <button onClick={loadChats} className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-white text-xs py-2 transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* Chat window */}
      <div className={`${active ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-[#0d1117] min-w-0`}>
        {!active ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle size={48} className="text-gray-700 mx-auto mb-4" />
              <p className="text-gray-600">Koi chat select karein</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="h-14 bg-[#111] border-b border-white/8 flex items-center px-4 gap-3">
              <button onClick={() => setActive(null)} className="md:hidden text-gray-400 hover:text-white mr-1">←</button>
              <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] font-bold text-sm">
                {active.customer_name?.charAt(0)?.toUpperCase() || active.customer_phone.slice(-2)}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{active.customer_name || active.customer_phone}</p>
                <p className="text-gray-500 text-xs">{active.customer_phone}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-600 text-sm">Koi message nahi abhi</div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.from_customer ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[75%] ${msg.from_customer ? 'wa-bubble-in' : 'wa-bubble-out'} px-3 py-2`}>
                      <p className={`text-sm ${msg.from_customer ? 'text-gray-100' : 'text-green-50'}`}>
                        {msg.content}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs opacity-50">
                          {new Date(msg.created_at).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.ai_generated && (
                          <span className="text-xs opacity-50 flex items-center gap-0.5">
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
              <div className="mx-4 mb-2 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Bot size={12} className="text-[#25D366]" />
                  <span className="text-[#25D366] text-xs font-medium">AI Suggestion</span>
                </div>
                <p className="text-gray-300 text-sm mb-2">{aiSuggestion}</p>
                <div className="flex gap-2">
                  <button onClick={() => sendReply(aiSuggestion)}
                    className="text-xs bg-[#25D366] text-white px-3 py-1.5 rounded-lg hover:bg-[#1da855] transition-colors">
                    Send
                  </button>
                  <button onClick={() => { setReplyText(aiSuggestion); setAiSuggestion(''); }}
                    className="text-xs border border-white/20 text-gray-300 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => setAiSuggestion('')}
                    className="text-xs text-gray-600 hover:text-gray-400 px-2">
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Reply input */}
            <div className="p-4 bg-[#111] border-t border-white/8">
              <div className="flex gap-2">
                <input value={replyText} onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                  placeholder="Message likhein..."
                  className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#25D366] transition-colors" />
                <button onClick={() => sendReply()} disabled={sending || !replyText.trim()}
                  className="w-10 h-10 bg-[#25D366] hover:bg-[#1da855] disabled:opacity-40 rounded-xl flex items-center justify-center transition-colors shrink-0">
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { MessageCircle, X, ChevronDown, MessageSquare, Send } from 'lucide-react';
import api from '../api/axios';

const AGENTS = [
  { name: 'Support Line 1', number: '250787846344', available: true },
  { name: 'Support Line 2', number: '250734733221', available: true },
];

const WA_URL = (number: string, msg: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;

export default function UnifiedChat() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'wa' | 'ai'>('wa');
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const DEFAULT_MSG = "Hello! I'm visiting EduJobs Scholars and I'd like some help. 👋";

  const sendAI = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages((m) => [...m, { from: 'user', text: msg }]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/ai/chat', { message: msg });
      const reply = res.data?.reply || 'Sorry, no response.';
      setMessages((m) => [...m, { from: 'bot', text: reply }]);
    } catch (err) {
      setMessages((m) => [...m, { from: 'bot', text: 'Failed to reach AI service.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-80 h-96 bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden flex flex-col">
          <div className="p-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white">
                <MessageCircle size={16} />
              </div>
              <div className="flex flex-col leading-tight">
                <div className="font-semibold text-sm">EduJobs Scholars</div>
                <div className="text-xs text-slate-500">Chat on WhatsApp or ask AI</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1"><X size={16} /></button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-2 bg-slate-50 dark:bg-slate-900">
            <button onClick={() => setTab('wa')} className={`flex-1 py-1 rounded ${tab === 'wa' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-500'}`}>
              WhatsApp
            </button>
            <button onClick={() => setTab('ai')} className={`flex-1 py-1 rounded ${tab === 'ai' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-500'}`}>
              AI Chat
            </button>
          </div>

          {tab === 'wa' ? (
            <div className="p-3 flex-1 overflow-auto flex flex-col">
              <div className="mb-2 text-xs text-slate-500">Choose an agent to chat on WhatsApp</div>
              {AGENTS.map((agent) => (
                <a key={agent.number} href={WA_URL(agent.number, DEFAULT_MSG)} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border px-3 py-2 mb-2 hover:bg-slate-50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white"><MessageCircle size={14} /></div>
                  <div className="flex-1 text-sm text-slate-800 dark:text-slate-100">
                    <div className="font-semibold">{agent.name}</div>
                    <div className="text-xs text-slate-500">+{agent.number}</div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-[#25D366] animate-pulse" />
                </a>
              ))}
              <div className="mt-auto text-xs text-slate-400">Or send a general message to support</div>
              <a href={WA_URL(AGENTS[0].number, DEFAULT_MSG)} target="_blank" rel="noreferrer" className="mt-2 btn-primary">Open WhatsApp</a>
            </div>
          ) : (
            <div className="p-3 flex-1 flex flex-col">
              <div className="flex-1 overflow-auto mb-2 space-y-2">
                {messages.length === 0 && <div className="text-sm text-slate-400">Hi! Ask me about jobs, universities, or scholarships.</div>}
                {messages.map((m, i) => (
                  <div key={i} className={`max-w-full ${m.from === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-2 rounded ${m.from === 'user' ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-auto">
                <div className="flex gap-2">
                  <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question..." className="input-field flex-1" onKeyDown={(e) => { if (e.key === 'Enter') sendAI(); }} />
                  <button onClick={sendAI} className="btn-primary flex items-center gap-2" disabled={loading}>{loading ? '...' : <><Send size={14} /> Send</>}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button onClick={() => setOpen(true)} title="Chat with us" className="relative flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg">
          <MessageSquare size={20} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-400">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="4" cy="4" r="4" fill="#10B981"/></svg>
          </span>
        </button>
      )}
    </div>
  );
}

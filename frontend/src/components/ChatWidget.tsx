import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import axios from '../api/axios';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages((m) => [...m, { from: 'user', text: msg }]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post('/ai/chat', { message: msg });
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
            <div className="flex items-center gap-2">
              <MessageSquare size={18} />
              <div className="font-semibold">Ask EduJobs AI</div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1"><X size={16} /></button>
          </div>
          <div className="p-3 flex-1 overflow-auto space-y-2">
            {messages.length === 0 && <div className="text-sm text-slate-400">Hi! Ask me about jobs, universities, or scholarships.</div>}
            {messages.map((m, i) => (
              <div key={i} className={`max-w-full ${m.from === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-2 rounded ${m.from === 'user' ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question..." className="input-field flex-1" onKeyDown={(e) => { if (e.key === 'Enter') send(); }} />
              <button onClick={send} className="btn-primary flex items-center gap-2" disabled={loading}>{loading ? '...' : <><Send size={14} /> Send</>}</button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="w-14 h-14 rounded-full bg-cyan-500 text-white shadow-lg flex items-center justify-center">
          <MessageSquare size={20} />
        </button>
      )}
    </div>
  );
}

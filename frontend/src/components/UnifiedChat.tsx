import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, MessageSquare, Send, Users, ExternalLink, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import api from '../api/axios';

const AGENTS = [
  { name: 'Support Line 1', number: '250787846344', available: true },
  { name: 'Support Line 2', number: '250734733221', available: true },
];

const GROUP_LINK = "https://chat.whatsapp.com/BDEAa9Knxs7J3SCarkhvvE";

const WA_URL = (number: string, msg: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;

const QUICK_QUESTIONS = [
  "Are university applications open?",
  "How can I find scholarships?",
  "Available jobs in Rwanda?",
  "How to track my application?"
];

export default function UnifiedChat() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'wa' | 'ai'>('wa');
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string; time: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom with better logic for "scrollable" requirement
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading, tab, open]);

  const sendAI = async (textOverride?: string) => {
    const msg = textOverride || input.trim();
    if (!msg || loading) return;
    
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { from: 'user' as const, text: msg, time: now };
    
    setMessages((prev) => [...prev, userMsg]);
    if (!textOverride) setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', { 
        message: msg,
        history: messages.slice(-10) // More context for the AI
      });
      
      const reply = response.data?.reply || "I'm processing a lot of data right now. Could you please rephrase your question?";
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setMessages((prev) => [...prev, { from: 'bot', text: reply, time: botTime }]);
    } catch (err) {
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [...prev, { 
        from: 'bot', 
        text: 'Connection lost. 🌐 Please check your internet or join our WhatsApp group for direct support!', 
        time: botTime 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-[22rem] sm:w-[24rem] h-[36rem] bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-[2.5rem] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-popup-in">
          
          {/* Enhanced Header */}
          <div className="p-6 flex items-center justify-between bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xl relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner border border-white/30">
                  <MessageCircle size={26} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 block h-4 w-4 rounded-full bg-green-400 border-2 border-cyan-600 shadow-lg" />
              </div>
              <div className="flex flex-col">
                <div className="font-black text-lg tracking-tight leading-none mb-1">EduJobs Scholars</div>
                <div className="flex items-center gap-1.5 text-[10px] font-black opacity-90 uppercase tracking-widest">
                  <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
                  Online Assistance
                </div>
              </div>
            </div>
            <button 
              onClick={() => setOpen(false)} 
              className="p-2 hover:bg-white/20 rounded-2xl transition-all active:scale-90"
            >
              <X size={24} />
            </button>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => setTab('wa')} 
              className={`flex-1 py-3 text-xs font-black rounded-2xl transition-all flex items-center justify-center gap-2 ${tab === 'wa' ? 'bg-white dark:bg-slate-800 shadow-lg text-cyan-600 dark:text-cyan-400 scale-100 border border-slate-100 dark:border-slate-700' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 scale-95 opacity-70'}`}
            >
              <MessageCircle size={16} className={tab === 'wa' ? 'text-green-500' : ''} />
              WhatsApp
            </button>
            <button 
              onClick={() => setTab('ai')} 
              className={`flex-1 py-3 text-xs font-black rounded-2xl transition-all flex items-center justify-center gap-2 ${tab === 'ai' ? 'bg-white dark:bg-slate-800 shadow-lg text-cyan-600 dark:text-cyan-400 scale-100 border border-slate-100 dark:border-slate-700' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 scale-95 opacity-70'}`}
            >
              <Sparkles size={16} className={tab === 'ai' ? 'text-yellow-500' : ''} />
              AI Scholar
            </button>
          </div>

          {tab === 'wa' ? (
            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6 custom-scrollbar scroll-smooth">
              {/* Join Group Banner */}
              <a 
                href={GROUP_LINK}
                target="_blank"
                rel="noreferrer"
                className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-500 to-green-600 p-6 text-white transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
              >
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
                  <Users size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/20">
                      <Users size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Community Hub</span>
                  </div>
                  <div className="font-black text-2xl mb-1 tracking-tight leading-none">EduJobs Scholars</div>
                  <div className="text-sm font-bold text-green-50 leading-relaxed opacity-90 mt-2">1,200+ members getting daily scholarship & job alerts!</div>
                  <div className="mt-6 flex items-center gap-2 text-xs font-black bg-white text-green-600 w-fit px-6 py-3 rounded-2xl shadow-2xl hover:bg-green-50 transition-colors uppercase tracking-widest">
                    Join the Group <ExternalLink size={14} />
                  </div>
                </div>
              </a>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Direct Help</span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                </div>
                
                <div className="grid gap-4">
                  {AGENTS.map((agent) => (
                    <a 
                      key={agent.number} 
                      href={WA_URL(agent.number, "Hello EduJobs Team! I need help with...")} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-4 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-green-500/30 transition-all group shadow-sm hover:shadow-lg active:scale-[0.98]"
                    >
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-600 group-hover:bg-green-500 group-hover:text-white transition-all duration-500 border border-green-500/20 shadow-inner">
                          <MessageCircle size={26} />
                        </div>
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse shadow-md" />
                      </div>
                      <div className="flex-1 text-sm min-w-0">
                        <div className="font-black text-slate-900 dark:text-white truncate text-base">{agent.name}</div>
                        <div className="text-[11px] font-bold text-slate-400">Ask anything, we reply fast!</div>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 group-hover:bg-green-500/20 group-hover:text-green-500 transition-all">
                        <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden relative">
              {/* Scrollable AI Chat Interface */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar"
                style={{ scrollbarWidth: 'thin' }}
              >
                {messages.length === 0 ? (
                  <div className="space-y-8 animate-fade-in py-2">
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-[2.5rem] p-8 border border-cyan-100/50 dark:border-cyan-900/30 relative overflow-hidden group shadow-inner">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity rotate-12">
                        <Sparkles size={140} className="text-cyan-500" />
                      </div>
                      <div className="relative z-10 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.75rem] bg-cyan-500 text-white mb-6 shadow-2xl shadow-cyan-500/40 border border-white/20 animate-pulse">
                          <Sparkles size={40} />
                        </div>
                        <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-3 tracking-tight leading-none">I'm AI Scholar 🎓</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-bold px-2">
                          Your intelligent guide for Universities, Scholarships, and Jobs in Rwanda. Ask me anything!
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Quick Help</span>
                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                      </div>
                      <div className="flex flex-wrap gap-2.5 justify-center">
                        {QUICK_QUESTIONS.map((q, i) => (
                          <button 
                            key={i} 
                            onClick={() => sendAI(q)}
                            className="text-[11px] font-black px-5 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-600 transition-all border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md active:scale-95 text-center leading-tight"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 pb-4">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex flex-col ${m.from === 'user' ? 'items-end' : 'items-start'} animate-slide-up group`}>
                        <div className={`max-w-[88%] px-6 py-4 rounded-[2rem] text-[13.5px] font-bold leading-relaxed shadow-sm transition-all hover:shadow-md ${
                          m.from === 'user' 
                            ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-none' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                        }`}>
                          {m.text}
                        </div>
                        <div className={`flex items-center gap-2 mt-2 px-3 ${m.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity duration-300">{m.time}</span>
                           {m.from === 'bot' && <div className="h-1.5 w-1.5 rounded-full bg-cyan-500/50 shadow-sm" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {loading && (
                  <div className="flex items-start animate-fade-in pl-1 pb-4">
                    <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-[1.75rem] rounded-tl-none flex gap-2 border border-slate-200 dark:border-slate-700 shadow-inner">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s] shadow-sm" />
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s] shadow-sm" />
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce shadow-sm" />
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Input Area */}
              <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 relative z-20">
                <div className="flex gap-3 items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-inner focus-within:ring-4 focus-within:ring-cyan-500/10 transition-all group">
                  <input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Message AI Scholar..." 
                    className="flex-1 bg-transparent border-none text-[14px] font-black focus:ring-0 px-4 text-slate-900 dark:text-white placeholder-slate-400" 
                    onKeyDown={(e) => { if (e.key === 'Enter') sendAI(); }} 
                  />
                  <button 
                    onClick={() => sendAI()} 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl shadow-cyan-500/30 transition-all active:scale-90 disabled:opacity-50 disabled:grayscale group-hover:scale-105"
                    disabled={loading || !input.trim()}
                  >
                    {loading ? (
                       <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send size={22} className="ml-1" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button 
          onClick={() => setOpen(true)} 
          title="Chat with us" 
          className="group relative flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-cyan-600 to-blue-500 text-white shadow-[0_20px_50px_rgba(6,182,212,0.4)] hover:shadow-cyan-500/60 hover:-translate-y-2 hover:rotate-6 transition-all duration-500"
        >
          <div className="absolute inset-0 rounded-[1.75rem] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
          <MessageSquare size={32} className="relative z-10 transition-transform group-hover:scale-110" />
          
          {/* Active Pulse Status */}
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 border-4 border-white dark:border-slate-900 shadow-2xl z-20">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          </div>
          
          {/* Animated WhatsApp Hint */}
          <div className="absolute inset-0 rounded-[1.75rem] border-4 border-green-500/50 opacity-0 group-hover:animate-ping duration-[1.5s]" />

          {/* Interactive Tooltip */}
          <div className="absolute right-24 top-1/2 -translate-y-1/2 px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-[0.25em] rounded-[2rem] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none shadow-[0_20px_60px_rgba(0,0,0,0.4)] translate-x-8 group-hover:translate-x-0 flex items-center gap-3">
            <Sparkles size={16} className="text-yellow-400 animate-pulse" />
            Chat with AI Scholar
            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-900 dark:bg-white rotate-45 rounded-sm" />
          </div>
        </button>
      )}
    </div>
  );
}

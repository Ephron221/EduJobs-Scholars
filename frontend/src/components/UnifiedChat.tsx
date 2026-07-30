import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, MessageSquare, Send, Users, ExternalLink, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import clsx from 'clsx';

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
        history: messages.slice(-10)
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
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 100, scale: 0.8, rotate: 5 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="w-[22rem] sm:w-[24rem] h-[36rem] bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-[2.5rem] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xl relative z-10">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner border border-white/30">
                    <MessageCircle size={26} />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 block h-4 w-4 rounded-full bg-green-400 border-2 border-cyan-600 shadow-lg" />
                </motion.div>
                <div className="flex flex-col">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="font-black text-lg tracking-tight leading-none mb-1"
                  >
                    EduJobs Scholars
                  </motion.div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black opacity-90 uppercase tracking-widest">
                    <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
                    Online Assistance
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-white/20 rounded-2xl transition-all"
              >
                <X size={24} />
              </motion.button>
            </div>

            {/* Navigation Tabs */}
            <div className="relative flex gap-2 p-2 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setTab('wa')}
                className={clsx(
                  "relative z-10 flex-1 py-3 text-[11px] font-black rounded-2xl transition-all flex items-center justify-center gap-2",
                  tab === 'wa' ? "text-cyan-600 dark:text-cyan-400" : "text-slate-500 opacity-70"
                )}
              >
                {tab === 'wa' && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 rounded-2xl z-[-1]"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <MessageCircle size={16} className={tab === 'wa' ? 'text-green-500' : ''} />
                WhatsApp
              </button>
              <button
                onClick={() => setTab('ai')}
                className={clsx(
                  "relative z-10 flex-1 py-3 text-[11px] font-black rounded-2xl transition-all flex items-center justify-center gap-2",
                  tab === 'ai' ? "text-cyan-600 dark:text-cyan-400" : "text-slate-500 opacity-70"
                )}
              >
                {tab === 'ai' && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 rounded-2xl z-[-1]"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <Sparkles size={16} className={tab === 'ai' ? 'text-yellow-500' : ''} />
                AI Scholar
              </button>
            </div>

            <AnimatePresence mode="wait">
              {tab === 'wa' ? (
                <motion.div
                  key="wa-tab"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="p-5 flex-1 overflow-y-auto flex flex-col gap-6 custom-scrollbar scroll-smooth bg-slate-50/50 dark:bg-slate-950/20"
                >
                  {/* Join Group Banner */}
                  <motion.a
                    href={GROUP_LINK}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 via-green-500 to-green-600 p-6 text-white shadow-2xl shadow-green-500/30 border border-white/20"
                  >
                    <div className="absolute -top-4 -right-4 p-2 opacity-15 group-hover:rotate-12 group-hover:scale-125 transition-all duration-1000">
                      <Users size={140} />
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-white/30 backdrop-blur-md p-2 rounded-xl border border-white/30 shadow-inner">
                          <Users size={18} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">Community Hub</span>
                      </div>

                      <div className="font-black text-xl mb-1 tracking-tight leading-none drop-shadow-md">EduJobs Scholars</div>
                      <p className="text-[11px] font-bold text-green-50 leading-relaxed opacity-95 mt-1 max-w-[80%]">
                        1,200+ members getting daily scholarship & job alerts!
                      </p>

                      <div className="mt-5 flex items-center gap-2 text-[10px] font-black bg-white text-green-600 w-fit px-5 py-3 rounded-2xl shadow-xl group-hover:shadow-green-400/40 transition-all uppercase tracking-widest">
                        Join WhatsApp <ExternalLink size={12} />
                      </div>
                    </div>
                  </motion.a>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 px-2">
                      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">Direct Support</span>
                      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                    </div>
                    
                    <div className="grid gap-3">
                      {AGENTS.map((agent, i) => (
                        <motion.a
                          key={agent.number}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i, type: 'spring' }}
                          href={WA_URL(agent.number, "Hello EduJobs Team! I need help with...")}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-4 rounded-3xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-green-500/30 transition-all group shadow-sm hover:shadow-xl active:scale-[0.98]"
                        >
                          <div className="relative">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-600 group-hover:bg-green-500 group-hover:text-white transition-all duration-500 border border-green-500/20 shadow-inner">
                              <MessageCircle size={24} />
                            </div>
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white dark:border-slate-900 shadow-sm"></span>
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-black text-slate-900 dark:text-white truncate text-[15px] mb-0.5 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                              {agent.name}
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              Fast Response Team
                            </div>
                          </div>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group-hover:bg-green-500 group-hover:text-white group-hover:border-green-400 transition-all shadow-sm">
                            <ArrowRight size={16} />
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="ai-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden relative"
                >
                  {/* Scrollable AI Chat Interface */}
                  <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar"
                    style={{ scrollbarWidth: 'thin' }}
                  >
                    {messages.length === 0 ? (
                      <div className="space-y-8 animate-fade-in py-2">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-[3rem] p-10 border border-cyan-100/50 dark:border-cyan-900/30 relative overflow-hidden group shadow-inner"
                        >
                          <div className="relative z-10 text-center">
                            <motion.div
                              animate={{ y: [0, -10, 0] }}
                              transition={{ repeat: Infinity, duration: 3 }}
                              className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-cyan-500 text-white mb-8 shadow-2xl shadow-cyan-500/40 border border-white/20"
                            >
                              <Sparkles size={48} />
                            </motion.div>
                            <h3 className="font-black text-3xl text-slate-900 dark:text-white mb-3 tracking-tight leading-none">I'm AI Scholar 🎓</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-bold px-2">
                              Your intelligent guide for Universities, Scholarships, and Jobs in Rwanda.
                            </p>
                          </div>
                        </motion.div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Suggestions</span>
                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                          </div>
                          <div className="flex flex-wrap gap-2.5 justify-center">
                            {QUICK_QUESTIONS.map((q, i) => (
                              <motion.button
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * i }}
                                whileHover={{ scale: 1.05, backgroundColor: '#06b6d4', color: '#fff' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => sendAI(q)}
                                className="text-[11px] font-black px-6 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-[1.25rem] transition-all border border-slate-200 dark:border-slate-700 shadow-sm text-center leading-tight"
                              >
                                {q}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 pb-4">
                        {messages.map((m, i) => (
                          <motion.div
                            key={i} 
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex flex-col ${m.from === 'user' ? 'items-end' : 'items-start'}`}
                          >
                            <div className={clsx(
                              "max-w-[85%] px-6 py-4 rounded-[2rem] text-[13.5px] font-bold leading-relaxed shadow-sm",
                              m.from === 'user'
                                ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-none'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                            )}>
                              {m.text}
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1.5 px-3">{m.time}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-start pl-1 pb-4"
                      >
                        <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-[1.75rem] rounded-tl-none flex gap-2 border border-slate-200 dark:border-slate-700">
                          <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-cyan-500 rounded-full shadow-sm" />
                          <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-cyan-500 rounded-full shadow-sm" />
                          <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-cyan-500 rounded-full shadow-sm" />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 relative z-20">
                    <div className="flex gap-3 items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-inner focus-within:ring-4 focus-within:ring-cyan-500/10 transition-all group">
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent border-none text-[14px] font-black focus:ring-0 px-4 text-slate-900 dark:text-white placeholder-slate-400"
                        onKeyDown={(e) => { if (e.key === 'Enter') sendAI(); }}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => sendAI()}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:grayscale"
                        disabled={loading || !input.trim()}
                      >
                        {loading ? (
                          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send size={20} className="ml-1" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.button
            key="chat-trigger"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.1, rotate: 5, y: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(true)}
            className="group relative flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-cyan-600 to-blue-500 text-white shadow-[0_20px_50px_rgba(6,182,212,0.4)] transition-all duration-300"
          >
            <MessageSquare size={32} className="relative z-10" />
            <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 border-4 border-white dark:border-slate-900 shadow-2xl z-20">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            </div>

            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="absolute right-24 top-1/2 -translate-y-1/2 px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-[0.25em] rounded-[2rem] whitespace-nowrap pointer-events-none shadow-[0_20px_60px_rgba(0,0,0,0.4)] hidden sm:flex items-center gap-3"
              >
                <Sparkles size={16} className="text-yellow-400 animate-pulse" />
                Ask AI Scholar
                <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-900 dark:bg-white rotate-45 rounded-sm" />
              </motion.div>
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

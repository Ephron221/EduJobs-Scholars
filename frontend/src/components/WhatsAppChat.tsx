import { useState } from 'react';
import { X, MessageCircle, ChevronDown } from 'lucide-react';

const AGENTS = [
  { name: 'Support Line 1', number: '250787846344', available: true },
  { name: 'Support Line 2', number: '250734733221', available: true },
];

const WA_URL = (number: string, msg: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;

const DEFAULT_MSG = "Hello! I'm visiting EduJobs Scholars and I'd like some help. 👋";

export default function WhatsAppChat() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-20 z-[9997] flex flex-col items-end gap-2">
      {/* Chat panel */}
      {open && (
        <div className="mb-1 w-72 overflow-hidden rounded-2xl border border-white/20 bg-white dark:bg-gray-900 shadow-2xl shadow-black/30 animate-popup-in">
          {/* Header */}
          <div className="flex items-center gap-3 bg-[#25D366] px-4 py-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-white leading-tight">EduJobs Scholars</p>
              <p className="text-[10px] text-white/80 font-medium">Typically replies instantly</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-all"
            >
              <X size={13} />
            </button>
          </div>

          {/* Chat bubble */}
          <div className="bg-[#ECE5DD] dark:bg-gray-800 px-4 py-4">
            <div className="inline-block max-w-[85%] rounded-2xl rounded-tl-none bg-white dark:bg-gray-700 px-4 py-3 shadow-sm">
              <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-200">
                👋 Hi there! Need help with universities, jobs, or scholarships? Chat with us directly on WhatsApp!
              </p>
              <p className="mt-1 text-right text-[9px] text-gray-400">now</p>
            </div>
          </div>

          {/* Agent buttons */}
          <div className="flex flex-col gap-2 p-4 bg-white dark:bg-gray-900">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Choose an agent</p>
            {AGENTS.map((agent) => (
              <a
                key={agent.number}
                href={WA_URL(agent.number, DEFAULT_MSG)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-[#25D366]/30 bg-[#25D366]/5 px-4 py-2.5 hover:bg-[#25D366]/15 hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                  <MessageCircle size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-gray-900 dark:text-white">{agent.name}</p>
                  <p className="text-[10px] text-gray-400">+{agent.number}</p>
                </div>
                <span className="h-2 w-2 rounded-full bg-[#25D366] shrink-0 animate-pulse" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Chat with us on WhatsApp"
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 hover:shadow-[#25D366]/60 hover:scale-110 transition-all"
      >
        {open ? <ChevronDown size={20} /> : <MessageCircle size={22} />}
        {/* Online dot */}
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white">
            <span className="h-2.5 w-2.5 rounded-full bg-[#25D366] animate-pulse" />
          </span>
        )}
      </button>
    </div>
  );
}

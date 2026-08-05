import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ClipboardList, GraduationCap, Briefcase, Info, Activity, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface TrendData {
  month: string;
  users: number;
  studentRecords: number;
  applications: number;
  universities: number;
  jobs: number;
}

interface Props {
  data: TrendData[];
}

const SERIES = [
  { id: 'users', label: 'User Reg.', color: 'bg-green-500', glow: 'shadow-green-500/20', icon: <Users size={12} /> },
  { id: 'studentRecords', label: 'Student Records', color: 'bg-rose-500', glow: 'shadow-rose-500/20', icon: <FileText size={12} /> },
  { id: 'applications', label: 'Assistance', color: 'bg-orange-500', glow: 'shadow-orange-500/20', icon: <ClipboardList size={12} /> },
  { id: 'universities', label: 'Universities', color: 'bg-cyan-500', glow: 'shadow-cyan-500/20', icon: <GraduationCap size={12} /> },
  { id: 'jobs', label: 'Job Listings', color: 'bg-purple-500', glow: 'shadow-purple-500/20', icon: <Briefcase size={12} /> },
];

export default function GrowthChart({ data }: Props) {
  const [activeSeries, setActiveSeries] = useState<string[]>(['users', 'studentRecords', 'applications', 'universities', 'jobs']);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  if (!data || data.length === 0) return (
    <div className="glass-card p-12 text-center text-gray-500 dark:text-gray-400">
      <Activity size={40} className="mx-auto mb-4 opacity-20" />
      <p className="font-bold uppercase tracking-widest text-xs">Waiting for more system data...</p>
    </div>
  );

  // Calculate max value for scaling with a generous buffer for labels
  const rawMax = Math.max(
    ...data.flatMap(d =>
      activeSeries.map(s => (d as any)[s] || 0)
    ),
    10 // Minimum scale
  );

  // We add 30% padding at the top to ensure digits/tooltips are NEVER cut off
  const maxValue = rawMax * 1.3;

  const toggleSeries = (id: string) => {
    setActiveSeries(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="glass-card p-6 md:p-8 overflow-hidden">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-16">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Activity size={24} className="text-cyan-500" />
            </motion.div>
            Growth & Activity Trends
          </h3>
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-[0.2em]">Platform performance timeline</p>
        </div>

        {/* Legend / Toggles */}
        <div className="flex flex-wrap gap-2">
          {SERIES.map(s => (
            <button
              key={s.id}
              onClick={() => toggleSeries(s.id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border shadow-sm",
                activeSeries.includes(s.id)
                  ? `${s.color} text-white border-transparent shadow-lg ${s.glow}`
                  : "bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100"
              )}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[400px] w-full flex items-end justify-between gap-1 md:gap-3 px-4 overflow-x-auto custom-scrollbar pb-6 pt-12 overflow-y-visible">
        {/* Y-Axis lines */}
        <div className="absolute inset-x-0 top-12 bottom-6 flex flex-col justify-between pointer-events-none opacity-[0.05] dark:opacity-[0.1]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full border-t border-dashed border-gray-900 dark:border-white" />
          ))}
          <div className="w-full border-t-2 border-gray-900/10 dark:border-white/10" /> {/* Base line */}
        </div>

        {/* Bars */}
        {data.map((d, idx) => (
          <div
            key={d.month}
            className="flex-1 min-w-[80px] flex flex-col items-center group relative h-full justify-end"
            onMouseEnter={() => setHoveredMonth(idx)}
            onMouseLeave={() => setHoveredMonth(null)}
          >
            <div className="flex items-end gap-1 h-full w-full justify-center px-1 relative z-10 pb-1">
              {activeSeries.map(s => {
                const val = (d as any)[s] || 0;
                const height = (val / maxValue) * 100;
                const config = SERIES.find(ser => ser.id === s)!;

                return (
                  <div key={s} className="relative flex-1 flex flex-col items-center justify-end h-full max-w-[12px]">
                    <AnimatePresence>
                      {hoveredMonth === idx && val > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.5 }}
                          animate={{ opacity: 1, y: -8, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xl z-30 pointer-events-none border border-white/20 dark:border-black/10"
                        >
                          {val}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ type: 'spring', damping: 15, stiffness: 100, delay: idx * 0.05 }}
                      className={clsx(
                        "w-full rounded-t-full relative shadow-inner transition-all duration-300",
                        config.color,
                        hoveredMonth === idx ? "opacity-100 scale-x-110 brightness-110 shadow-lg" : "opacity-60"
                      )}
                    >
                       {/* Subtle inner reflection */}
                       <div className="absolute inset-x-[20%] top-1 h-1/3 bg-white/20 rounded-full blur-[1px]" />
                    </motion.div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Label */}
            <div className={clsx(
              "mt-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
              hoveredMonth === idx ? "text-cyan-500 scale-110" : "text-gray-400"
            )}>
              {d.month}
            </div>

            {/* Hover highlight column */}
            {hoveredMonth === idx && (
              <motion.div
                layoutId="chart-highlight"
                className="absolute inset-0 bg-gradient-to-t from-cyan-500/[0.08] to-transparent -z-0 rounded-[2rem] border-x border-cyan-500/10 pointer-events-none"
              />
            )}
          </div>
        ))}
      </div>

      {/* Info footer */}
      <div className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[2rem] bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/20">
             <Info size={16} />
          </div>
          <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Timeline shows newly created records per month since system inception.
          </p>
        </div>

        <div className="flex items-center gap-4 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Healthy Trends</span>
           </div>
           <div className="h-3 w-px bg-gray-200 dark:bg-white/10" />
           <div className="flex items-center gap-2">
              <Activity size={10} className="text-cyan-500" />
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Live Updates</span>
           </div>
        </div>
      </div>
    </div>
  );
}

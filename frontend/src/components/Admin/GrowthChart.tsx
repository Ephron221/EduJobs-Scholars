import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ClipboardList, GraduationCap, Briefcase, Info, Activity, FileText } from 'lucide-react';
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
  { id: 'users', label: 'User Reg.', color: 'bg-green-500', icon: <Users size={12} /> },
  { id: 'studentRecords', label: 'Student Records', color: 'bg-rose-500', icon: <FileText size={12} /> },
  { id: 'applications', label: 'Assistance', color: 'bg-orange-500', icon: <ClipboardList size={12} /> },
  { id: 'universities', label: 'Universities', color: 'bg-cyan-500', icon: <GraduationCap size={12} /> },
  { id: 'jobs', label: 'Job Listings', color: 'bg-purple-500', icon: <Briefcase size={12} /> },
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

  // Calculate max value for scaling
  const maxValue = Math.max(
    ...data.flatMap(d =>
      activeSeries.map(s => (d as any)[s] || 0)
    ),
    5 // Minimum scale
  );

  const toggleSeries = (id: string) => {
    setActiveSeries(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-12">
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
                "flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                activeSeries.includes(s.id)
                  ? `${s.color} text-white border-transparent shadow-lg shadow-black/10`
                  : "bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100"
              )}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[320px] w-full flex items-end justify-between gap-1 md:gap-2 px-2 overflow-x-auto custom-scrollbar pb-2">
        {/* Y-Axis lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.03] dark:opacity-[0.07]">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-full border-t border-gray-900 dark:border-white" />
          ))}
        </div>

        {/* Bars */}
        {data.map((d, idx) => (
          <div
            key={d.month}
            className="flex-1 min-w-[60px] flex flex-col items-center group relative h-full justify-end"
            onMouseEnter={() => setHoveredMonth(idx)}
            onMouseLeave={() => setHoveredMonth(null)}
          >
            <div className="flex items-end gap-0.5 h-full w-full justify-center px-0.5 relative z-10">
              {activeSeries.map(s => {
                const val = (d as any)[s] || 0;
                const height = (val / maxValue) * 100;
                const config = SERIES.find(ser => ser.id === s)!;

                return (
                  <motion.div
                    key={s}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100, delay: idx * 0.03 }}
                    className={clsx(
                      "w-full max-w-[8px] rounded-t-[4px] relative",
                      config.color,
                      hoveredMonth === idx ? "opacity-100 brightness-110" : "opacity-70"
                    )}
                  >
                    <AnimatePresence>
                      {hoveredMonth === idx && val > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: -25, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 dark:bg-white text-white dark:text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow-2xl z-30 pointer-events-none"
                        >
                          {val}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* X-Axis Label */}
            <div className={clsx(
              "mt-5 text-[9px] font-black uppercase tracking-widest transition-colors whitespace-nowrap",
              hoveredMonth === idx ? "text-cyan-500" : "text-gray-400"
            )}>
              {d.month}
            </div>

            {/* Hover highlight column */}
            {hoveredMonth === idx && (
              <motion.div
                layoutId="chart-highlight"
                className="absolute inset-0 bg-cyan-500/[0.03] dark:bg-cyan-500/[0.07] -z-0 rounded-2xl border-x border-cyan-500/10"
              />
            )}
          </div>
        ))}
      </div>

      {/* Info footer */}
      <div className="mt-10 flex items-center gap-3 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
           <Info size={14} />
        </div>
        Timeline shows newly created records per month since system inception.
      </div>
    </div>
  );
}

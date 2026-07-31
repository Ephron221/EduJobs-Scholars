import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList, GraduationCap, Briefcase, LayoutGrid,
  List, Search, Filter, Clock, Info, CheckCircle2,
  AlertCircle, ChevronRight, Compass, ArrowUpRight,
  X, User as UserIcon, MessageSquare, ShieldCheck, Mail,
  ChevronLeft, FileCheck, Layers, Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { applicationAPI } from '../../api';
import StudentLayout from './StudentLayout';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import { format, formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const STATUSES = ['Interested', 'Applied', 'Submitted', 'In Progress', 'Accepted', 'Rejected', 'Resolved'];

interface Assistant {
  _id: string;
  name: string;
  email: string;
}

interface Application {
  _id: string;
  opportunityName: string;
  opportunityType: 'university' | 'job' | 'service';
  status: string;
  notes?: string;
  assignedAssistantId?: Assistant;
  resolutionProof?: string;
  updatedAt: string;
  createdAt: string;
}

export default function ApplicationTracker() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'university' | 'job' | 'service'>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [activeMobileStatus, setActiveMobileStatus] = useState(STATUSES[0]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      try {
        const res = await applicationAPI.getByStudent(user._id);
        setApplications(res.data.applications);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const filteredApps = useMemo(() => {
    return applications.filter(a => {
      const matchesSearch = a.opportunityName.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'all' || a.opportunityType === filterType;
      return matchesSearch && matchesType;
    });
  }, [applications, search, filterType]);

  const byStatus = (status: string) => filteredApps.filter(a => a.status === status);

  const statusConfig: Record<string, { border: string, bg: string, color: string, icon: any, light: string }> = {
    Interested: { border: 'border-slate-200 dark:border-white/10', bg: 'bg-slate-500/10', color: 'text-slate-500', icon: <Compass size={14} />, light: 'bg-slate-400/20' },
    Applied: { border: 'border-cyan-500/20', bg: 'bg-cyan-500/10', color: 'text-cyan-500', icon: <Info size={14} />, light: 'bg-cyan-400/20' },
    Submitted: { border: 'border-indigo-500/20', bg: 'bg-indigo-500/10', color: 'text-indigo-500', icon: <CheckCircle2 size={14} />, light: 'bg-indigo-400/20' },
    'In Progress': { border: 'border-amber-500/20', bg: 'bg-amber-500/10', color: 'text-amber-500', icon: <Clock size={14} />, light: 'bg-amber-400/20' },
    Accepted: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', color: 'text-emerald-500', icon: <Sparkles size={14} />, light: 'bg-emerald-400/20' },
    Rejected: { border: 'border-red-500/20', bg: 'bg-red-500/10', color: 'text-red-500', icon: <AlertCircle size={14} />, light: 'bg-red-400/20' },
    Resolved: { border: 'border-blue-500/20', bg: 'bg-blue-500/10', color: 'text-blue-500', icon: <FileCheck size={14} />, light: 'bg-blue-400/20' },
  };

  const scrollToStatus = (status: string) => {
    setActiveMobileStatus(status);
    if (scrollRef.current) {
      const el = document.getElementById(`column-${status.replace(/\s+/g, '-')}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  return (
    <StudentLayout title="Journey Tracker">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Global Toolbar */}
        <div className="sticky top-20 z-40 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl p-4 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl shadow-black/5">
          <div className="flex flex-1 w-full gap-3">
             <div className="relative flex-1 max-w-md group">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                <input
                  type="text" value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search applications..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:ring-2 ring-cyan-500/20 transition-all"
                />
             </div>
             <div className="hidden lg:flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-2xl border border-gray-100 dark:border-white/5">
                <Filter size={14} className="text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="bg-transparent border-none text-xs font-black uppercase tracking-widest focus:ring-0 text-gray-600 dark:text-gray-400 outline-none cursor-pointer"
                >
                  <option value="all">All Items</option>
                  <option value="university">Universities</option>
                  <option value="job">Jobs</option>
                  <option value="service">Services</option>
                </select>
             </div>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-200 dark:border-white/5 self-stretch md:self-auto">
            <button
              onClick={() => setView('kanban')}
              className={clsx('flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest', view === 'kanban' ? 'bg-white dark:bg-gray-800 text-cyan-500 shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white')}
            >
              <LayoutGrid size={14} /> Board
            </button>
            <button
              onClick={() => setView('table')}
              className={clsx('flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest', view === 'table' ? 'bg-white dark:bg-gray-800 text-cyan-500 shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white')}
            >
              <List size={14} /> List
            </button>
          </div>
        </div>

        {/* Mobile Status Switcher */}
        {view === 'kanban' && (
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 px-1 no-scrollbar">
            {STATUSES.map(s => (
              <button
                key={s} onClick={() => scrollToStatus(s)}
                className={clsx(
                  "shrink-0 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                  activeMobileStatus === s
                    ? "bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/20 scale-105"
                    : "bg-white dark:bg-gray-900 border-gray-100 dark:border-white/5 text-gray-400"
                )}
              >
                {s} ({byStatus(s).length})
              </button>
            ))}
          </div>
        )}

        {loading ? <div className="py-32 flex flex-col items-center gap-6"><Loader /><p className="text-xs font-black uppercase text-gray-400 animate-pulse tracking-[0.3em]">Syncing Your Journey</p></div> :
         filteredApps.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-32 glass-card border-dashed border-2">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
              <Layers size={80} className="text-gray-200 dark:text-gray-800 relative z-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Your Tracker is Clear</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-md mx-auto font-medium leading-relaxed">
              When you save opportunities or request assistance, they will appear here as organized stages in your progress.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
               <Link to="/universities" className="btn-primary px-10 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 group">
                 Explore Schools <ArrowRight size={16} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
               </Link>
               <Link to="/jobs" className="btn-secondary px-10 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest bg-white dark:bg-white/5 border-gray-100">
                 Browse Jobs
               </Link>
            </div>
          </motion.div>
        ) : view === 'kanban' ? (
          /* MODERN KANBAN VIEW */
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-8 pt-2 px-2 snap-x snap-mandatory lg:snap-none custom-scrollbar min-h-[600px] items-start"
          >
            <AnimatePresence mode="popLayout">
              {STATUSES.map((status) => {
                const apps = byStatus(status);
                const config = statusConfig[status];
                return (
                  <motion.div
                    key={status} layout
                    id={`column-${status.replace(/\s+/g, '-')}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={clsx(
                      'flex flex-col min-w-[320px] w-[320px] shrink-0 rounded-[2.5rem] border bg-gray-50/50 dark:bg-white/[0.02] p-4 transition-all snap-center',
                      activeMobileStatus === status ? 'ring-2 ring-cyan-500/30' : '',
                      config.border
                    )}
                  >
                    <div className={clsx('flex items-center justify-between px-6 py-5 rounded-t-[2.5rem] mb-4 border-b relative overflow-hidden', config.bg, config.color, config.border.replace('dark:', ''))}>
                      <div className="absolute top-0 right-0 w-24 h-24 opacity-10 transform translate-x-8 -translate-y-8">
                         {config.icon}
                      </div>
                      <div className="flex items-center gap-3 relative z-10">
                        <div className={clsx("p-2.5 rounded-2xl shadow-inner backdrop-blur-md", config.light)}>
                          {config.icon}
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.15em]">{status}</span>
                      </div>
                      <span className="text-sm font-black bg-white/20 dark:bg-black/20 px-3 py-1 rounded-xl border border-white/20 backdrop-blur-sm min-w-[32px] text-center">
                        {apps.length}
                      </span>
                    </div>

                    <div className="space-y-4 max-h-[65vh] overflow-y-auto px-2 pb-4 custom-scrollbar">
                      {apps.map((a, idx) => (
                        <motion.div
                          key={a._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
                          onClick={() => setSelectedApp(a)}
                          className="group bg-white dark:bg-[#1a1c20] p-5 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:border-cyan-500/50 transition-all shadow-sm hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer relative overflow-hidden active:scale-[0.97]"
                        >
                          <div className={clsx("absolute top-0 left-0 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity rounded-full", config.color.replace('text-', 'bg-'))} />

                          <div className="flex items-start gap-4 mb-4">
                            <div className={clsx('w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500',
                              a.opportunityType === 'university' ? 'bg-purple-500/10 text-purple-500' :
                              a.opportunityType === 'job' ? 'bg-blue-500/10 text-blue-500' : 'bg-cyan-500/10 text-cyan-500')}>
                              {a.opportunityType === 'university' ? <GraduationCap size={24} /> : <Briefcase size={24} />}
                            </div>
                            <div className="min-w-0 flex-1">
                               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400 mb-1.5 opacity-80">{a.opportunityType}</p>
                               <h4 className="text-[13px] font-black text-gray-900 dark:text-white leading-tight uppercase tracking-tight line-clamp-2 group-hover:text-cyan-500 transition-colors">{a.opportunityName}</h4>
                            </div>
                          </div>

                          {a.notes && (
                            <div className="bg-slate-50 dark:bg-white/[0.03] p-3.5 rounded-2xl mb-4 border border-gray-100/50 dark:border-white/5 relative">
                               <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed font-bold italic">"{a.notes}"</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5 mt-2">
                             <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <Clock size={12} className="text-cyan-500" /> {format(new Date(a.updatedAt), 'MMM dd')}
                             </div>
                             <div className="flex items-center gap-1.5 bg-cyan-500/10 px-3.5 py-2 rounded-xl text-[9px] font-black uppercase text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-sm">
                               Track <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                             </div>
                          </div>
                        </motion.div>
                      ))}
                      {apps.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[2rem] opacity-30 group">
                           <div className="w-16 h-16 rounded-full border-4 border-gray-300 dark:border-gray-700 flex items-center justify-center mb-4 group-hover:border-cyan-500/20 transition-colors">
                              <Layers size={24} className="text-gray-300 dark:text-gray-700" />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Empty Stage</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* MODERN TABLE VIEW */
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl shadow-black/5">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-gray-800/30 border-b border-gray-100 dark:border-white/5">
                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Application Info</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Category</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Current Status</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Sync Date</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {filteredApps.map((a) => (
                    <tr key={a._id} onClick={() => setSelectedApp(a)} className="hover:bg-cyan-50/30 dark:hover:bg-cyan-500/[0.02] transition-all group cursor-pointer">
                      <td className="px-8 py-7">
                        <div className="flex items-center gap-5">
                           <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-110 duration-500", a.opportunityType === 'university' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500')}>
                              {a.opportunityType === 'university' ? <GraduationCap size={24} /> : <Briefcase size={24} />}
                           </div>
                           <div>
                              <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-cyan-500 transition-colors leading-none mb-1.5">{a.opportunityName}</p>
                              <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 uppercase">
                                 <Clock size={10} /> Started {format(new Date(a.createdAt), 'MMM yyyy')}
                              </p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-7 whitespace-nowrap">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
                          {a.opportunityType}
                        </span>
                      </td>
                      <td className="px-8 py-7 whitespace-nowrap">
                        <StatusBadge status={a.status} />
                        {a.status === 'In Progress' && (
                          <span className="ml-2 inline-flex w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        )}
                      </td>
                      <td className="px-8 py-7 whitespace-nowrap">
                        <div className="flex flex-col">
                           <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase">{format(new Date(a.updatedAt), 'MMM dd')}</span>
                           <span className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">{formatDistanceToNow(new Date(a.updatedAt), { addSuffix: true })}</span>
                        </div>
                      </td>
                      <td className="px-8 py-7 text-right whitespace-nowrap">
                         <button className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-cyan-500 group-hover:text-white transition-all flex items-center justify-center shadow-inner group-hover:shadow-cyan-500/30">
                            <ArrowUpRight size={18} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Detailed Case Progress Modal */}
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title="Case Progress Breakdown"
          size="lg"
        >
          {selectedApp && (
            <div className="space-y-10 py-4 animate-fade-in custom-scrollbar max-h-[80vh] overflow-y-auto px-1">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-950 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full -mr-32 -mt-32 blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full -ml-16 -mb-16 blur-[60px]" />

                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 text-center md:text-left">
                  <div className={clsx(
                    "flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] text-3xl font-black text-white shadow-2xl",
                    selectedApp.opportunityType === 'university' ? "bg-gradient-to-br from-purple-500 to-indigo-600" : "bg-gradient-to-br from-blue-500 to-cyan-600"
                  )}>
                    {selectedApp.opportunityName[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-4">
                      <StatusBadge status={selectedApp.status} />
                      <span className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400/80 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                         {selectedApp.opportunityType}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-tight">{selectedApp.opportunityName}</h3>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-1 relative z-10">
                   <p className="text-[9px] font-black uppercase text-gray-500 tracking-[0.3em]">Tracking ID</p>
                   <p className="text-xs font-bold text-white opacity-50 font-mono">#{selectedApp._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-8">
                  <div className="p-8 rounded-[2.5rem] bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 shadow-inner">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 mb-8 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
                      Handling Assistant
                    </h4>
                    {selectedApp.assignedAssistantId ? (
                      <div className="flex items-center gap-5 group">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-500 flex items-center justify-center font-black text-2xl shadow-inner border border-cyan-500/10">
                          {selectedApp.assignedAssistantId.name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">{selectedApp.assignedAssistantId.name}</p>
                          <a href={`mailto:${selectedApp.assignedAssistantId.email}`} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 hover:text-cyan-500 transition-colors font-bold group-hover:translate-x-1 transition-transform">
                             <Mail size={14} className="text-cyan-500" /> {selectedApp.assignedAssistantId.email}
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-6 text-center bg-amber-500/5 rounded-3xl border border-dashed border-amber-500/20">
                        <AlertCircle size={32} className="text-amber-500 mb-3 animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-600">Pending Assignment</span>
                        <p className="text-[10px] text-amber-500/60 mt-2 font-bold max-w-[200px]">A dedicated expert will be assigned to your case shortly.</p>
                      </div>
                    )}
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 shadow-inner">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 mb-8 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
                        Milestone Timeline
                     </h4>
                     <div className="relative pl-8 space-y-10 border-l-2 border-gray-200 dark:border-white/5 ml-2">
                        <div className="relative">
                           <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-cyan-500 border-4 border-white dark:border-gray-900 shadow-xl" />
                           <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Inquiry Opened</p>
                           <p className="text-sm font-black text-gray-900 dark:text-white uppercase">{format(new Date(selectedApp.createdAt), 'MMMM dd, yyyy')}</p>
                           <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase">{format(new Date(selectedApp.createdAt), 'hh:mm aa')}</p>
                        </div>
                        <div className="relative">
                           <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-white dark:bg-gray-800 border-4 border-cyan-500 shadow-xl" />
                           <p className="text-[10px] font-black uppercase text-cyan-500 tracking-widest mb-1">Latest Update</p>
                           <p className="text-sm font-black text-gray-900 dark:text-white uppercase">{format(new Date(selectedApp.updatedAt), 'MMMM dd, yyyy')}</p>
                           <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase">{formatDistanceToNow(new Date(selectedApp.updatedAt), { addSuffix: true })}</p>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 shadow-xl relative min-h-[400px] flex flex-col">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 mb-8 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
                    Official Feedback
                  </h4>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="relative p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 group overflow-hidden">
                      <Quote className="absolute -top-4 -left-4 text-cyan-500/10 group-hover:scale-125 transition-transform duration-700" size={80} />
                      <div className="relative z-10">
                        <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed italic font-medium">
                          "{selectedApp.notes || 'Our team is currently reviewing your documentation and verifying eligibility requirements. Please check back for updates on your submission.'}"
                        </p>
                      </div>
                    </div>

                    <AnimatePresence>
                      {selectedApp.status === 'Resolved' && selectedApp.resolutionProof && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-8 pt-8 border-t-2 border-dashed border-gray-100 dark:border-white/5"
                        >
                          <div className="flex items-center gap-3 mb-6">
                             <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shadow-inner">
                                <ShieldCheck size={20} />
                             </div>
                             <h5 className="text-[11px] font-black uppercase text-emerald-500 tracking-[0.2em]">Final Resolution Evidence</h5>
                          </div>
                          <div className="bg-emerald-50 dark:bg-emerald-500/5 p-6 rounded-[1.8rem] border border-emerald-100 dark:border-emerald-500/20 shadow-inner">
                             <p className="text-sm text-emerald-700 dark:text-emerald-400 font-bold leading-relaxed">{selectedApp.resolutionProof}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!selectedApp.notes && selectedApp.status !== 'Resolved' && (
                       <div className="mt-8 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-white/5 rounded-3xl opacity-50 grayscale">
                          <MessageSquare size={40} className="text-gray-300 dark:text-gray-700 mb-4" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Waiting for Notes</p>
                       </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button className="text-[10px] font-black uppercase text-gray-400 hover:text-cyan-500 transition-colors tracking-widest">
                   Report an Issue
                </button>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="w-full sm:w-auto px-12 py-5 rounded-[1.8rem] bg-gray-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-cyan-500/10"
                >
                  Close Case View
                </button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </StudentLayout>
  );
}

function Quote(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 2.5 1 4.066 2 5" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c1 0 1.25.25 1.25 1.25V15c0 2.5 1 4.066 2 5" />
    </svg>
  );
}

function Send(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

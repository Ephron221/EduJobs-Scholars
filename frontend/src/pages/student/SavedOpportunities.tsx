import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark, GraduationCap, Briefcase, Trash2,
  ExternalLink, MapPin, Globe, Search, Filter,
  ArrowRight, LayoutGrid, List, Star, Clock,
  ChevronRight, Building2, Tag, Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { universityAPI, jobAPI, userAPI } from '../../api';
import StudentLayout from './StudentLayout';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface University {
  _id: string;
  name: string;
  country: string;
  website: string;
  description: string;
  category?: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  type: string;
  location: string;
  link: string;
  deadline: string;
  salary?: string;
}

export default function SavedOpportunities() {
  const { user, updateUser } = useAuth();
  const [savedUnis, setSavedUnis] = useState<University[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'universities' | 'jobs'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      if (!user?.savedOpportunities?.length) { setLoading(false); return; }
      try {
        const uniIds = user.savedOpportunities.filter((o) => o.type === 'university').map((o) => o.id);
        const jobIds = user.savedOpportunities.filter((o) => o.type === 'job').map((o) => o.id);
        const [uniResults, jobResults] = await Promise.all([
          Promise.all(uniIds.map((id) => universityAPI.getById(id).catch(() => null))),
          Promise.all(jobIds.map((id) => jobAPI.getById(id).catch(() => null))),
        ]);
        setSavedUnis(uniResults.filter(Boolean).map((r) => r!.data.university));
        setSavedJobs(jobResults.filter(Boolean).map((r) => r!.data.job));
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleUnsave = async (id: string) => {
    try {
      const res = await userAPI.unsaveOpportunity(id);
      setSavedUnis((prev) => prev.filter((u) => u._id !== id));
      setSavedJobs((prev) => prev.filter((j) => j._id !== id));
      if (user) updateUser({ ...user, savedOpportunities: res.data.savedOpportunities });
      toast.success('Removed from your collection');
    } catch { toast.error('Failed to remove item'); }
  };

  const filteredUnis = savedUnis.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
  const filteredJobs = savedJobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()));

  const tabs = [
    { key: 'all', label: 'All Saved', count: savedUnis.length + savedJobs.length, icon: <LayoutGrid size={14} /> },
    { key: 'universities', label: 'Universities', count: savedUnis.length, icon: <GraduationCap size={14} /> },
    { key: 'jobs', label: 'Jobs & Internships', count: savedJobs.length, icon: <Briefcase size={14} /> },
  ];

  return (
    <StudentLayout title="My Collection">
      <div className="space-y-8">

        {/* Modern Tab & Search Header */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
           <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-900/50 rounded-2xl w-full lg:w-auto border border-gray-200 dark:border-white/5 shadow-inner">
             {tabs.map((t) => (
               <button
                 key={t.key} onClick={() => setTab(t.key as typeof tab)}
                 className={clsx(
                   "flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                   tab === t.key ? "bg-white dark:bg-gray-800 text-cyan-500 shadow-md scale-100" : "text-gray-400 hover:text-gray-600 dark:hover:text-white scale-95"
                 )}
               >
                 {t.icon} {t.label}
                 <span className={clsx("ml-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-black", tab === t.key ? "bg-cyan-500/10 text-cyan-500" : "bg-gray-200 dark:bg-white/5 text-gray-400")}>{t.count}</span>
               </button>
             ))}
           </div>

           <div className="relative w-full lg:w-80 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your collection..."
                className="input-field pl-12 py-3.5 text-sm font-bold bg-white dark:bg-gray-900 shadow-sm"
              />
           </div>
        </div>

        {loading ? <div className="py-20 flex flex-col items-center gap-4"><Loader /><p className="text-xs font-black uppercase text-gray-400 animate-pulse tracking-widest">Organizing Collection...</p></div> :
         (savedUnis.length + savedJobs.length === 0) ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24 glass-card border-dashed">
            <Bookmark size={64} className="text-gray-200 dark:text-gray-800 mx-auto mb-6" />
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Your Collection is Empty</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto font-medium">Click the bookmark icon on any university or job listing to save it for later.</p>
            <div className="mt-10 flex justify-center gap-4">
              <Link to="/universities" className="btn-primary px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20">Explore Schools</Link>
              <Link to="/jobs" className="btn-secondary px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white dark:bg-white/5 border-gray-100">Find Jobs</Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-12">

            {/* Universities Grid */}
            {(tab === 'all' || tab === 'universities') && filteredUnis.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                   <div className="h-px flex-1 bg-gray-100 dark:bg-white/5" />
                   <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                     <GraduationCap size={16} className="text-purple-500" /> Universities
                   </h2>
                   <div className="h-px flex-1 bg-gray-100 dark:bg-white/5" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredUnis.map((u, idx) => (
                      <motion.div
                        key={u._id} layout
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="glass-card p-6 flex flex-col group hover:border-purple-500/30 transition-all shadow-sm hover:shadow-xl relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between mb-6">
                           <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/20">
                              {u.name.charAt(0)}
                           </div>
                           <button onClick={() => handleUnsave(u._id)} className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-red-500 transition-all">
                              <Trash2 size={16} />
                           </button>
                        </div>

                        <h3 className="font-black text-gray-900 dark:text-white text-base leading-tight uppercase tracking-tight mb-2 group-hover:text-purple-500 transition-colors line-clamp-2">{u.name}</h3>

                        <div className="flex items-center gap-3 mb-6">
                           <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[9px] font-black uppercase text-gray-500">
                              <MapPin size={10} className="text-purple-500" /> {u.country}
                           </div>
                           {u.category && (
                             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-[9px] font-black uppercase text-purple-600">
                                <Tag size={10} /> {u.category}
                             </div>
                           )}
                        </div>

                        <div className="mt-auto pt-5 border-t border-gray-100 dark:border-white/5 flex gap-3">
                           <Link to={`/universities/${u._id}`} className="flex-1 btn-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                             View Details <ChevronRight size={14} />
                           </Link>
                           <a href={u.website} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-400 hover:text-purple-500 transition-all shadow-inner">
                              <Globe size={18} />
                           </a>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Jobs Grid */}
            {(tab === 'all' || tab === 'jobs') && filteredJobs.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                   <div className="h-px flex-1 bg-gray-100 dark:bg-white/5" />
                   <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                     <Briefcase size={16} className="text-blue-500" /> Opportunities
                   </h2>
                   <div className="h-px flex-1 bg-gray-100 dark:bg-white/5" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                   <AnimatePresence>
                    {filteredJobs.map((j, idx) => {
                      const isExpired = new Date(j.deadline) < new Date();
                      return (
                        <motion.div
                          key={j._id} layout
                          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="glass-card p-6 flex flex-col group hover:border-blue-500/30 transition-all shadow-sm hover:shadow-xl relative overflow-hidden"
                        >
                          <div className="flex items-start justify-between mb-6">
                             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 uppercase">
                                {j.company.charAt(0)}
                             </div>
                             <button onClick={() => handleUnsave(j._id)} className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-red-500 transition-all">
                                <Trash2 size={16} />
                             </button>
                          </div>

                          <div className="min-w-0 mb-4">
                             <h3 className="font-black text-gray-900 dark:text-white text-base leading-tight uppercase tracking-tight group-hover:text-blue-500 transition-colors truncate">{j.title}</h3>
                             <p className="text-[11px] font-bold text-gray-400 mt-1 flex items-center gap-1.5 uppercase tracking-tighter">
                               <Building2 size={12} className="text-blue-500" /> {j.company}
                             </p>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-8">
                             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[9px] font-black uppercase text-gray-500">
                                <MapPin size={10} className="text-blue-500" /> {j.location}
                             </div>
                             <div className={clsx("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase", isExpired ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-600")}>
                                <Clock size={10} /> {isExpired ? 'Expired' : format(new Date(j.deadline), 'MMM dd')}
                             </div>
                          </div>

                          <div className="mt-auto pt-5 border-t border-gray-100 dark:border-white/5">
                             <a
                               href={j.link} target="_blank" rel="noopener noreferrer"
                               className={clsx(
                                 "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95",
                                 isExpired ? "bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed" : "btn-primary shadow-blue-500/20"
                               )}
                               onClick={(e) => isExpired && e.preventDefault()}
                             >
                               {isExpired ? 'Application Closed' : <>Apply Now <ExternalLink size={14} /></>}
                             </a>
                          </div>
                        </motion.div>
                      );
                    })}
                   </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Combined Search No Results */}
            {search && filteredUnis.length === 0 && filteredJobs.length === 0 && (
              <div className="text-center py-20 bg-gray-50/50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-white/10">
                <Search size={48} className="text-gray-200 dark:text-gray-800 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-xs">No items match your search</p>
                <button onClick={() => setSearch('')} className="text-cyan-500 text-[10px] font-black uppercase tracking-widest mt-4 hover:underline">Clear Search</button>
              </div>
            )}

          </div>
        )}

      </div>
    </StudentLayout>
  );
}

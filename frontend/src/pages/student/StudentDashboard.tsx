import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark, ClipboardList, ArrowRight, GraduationCap,
  Briefcase, TrendingUp, Star, Clock, Compass,
  ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { applicationAPI } from '../../api';
import StudentLayout from './StudentLayout';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const stats = [
    { label: 'Saved Items', value: user?.savedOpportunities?.length || 0, icon: <Bookmark size={20} />, href: '/dashboard/saved', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { label: 'My Applications', value: applications.length, icon: <ClipboardList size={20} />, href: '/dashboard/applications', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'University Interests', value: user?.savedOpportunities?.filter((o) => o.type === 'university').length || 0, icon: <GraduationCap size={20} />, href: '/dashboard/saved', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Job Interests', value: user?.savedOpportunities?.filter((o) => o.type === 'job').length || 0, icon: <Briefcase size={20} />, href: '/dashboard/saved', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <StudentLayout title="Dashboard Overview">
      <div className="space-y-8 pb-10">

        {/* Modern Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden glass-card border-cyan-500/10 p-8 shadow-2xl"
        >
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 text-cyan-500 font-black uppercase tracking-[0.2em] text-[10px] mb-3">
                 <ShieldCheck size={14} /> Account Verified
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3 uppercase tracking-tight">
                {greeting}, <span className="gradient-text">{user?.name.split(' ')[0]}!</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-base max-w-xl leading-relaxed font-medium">
                Your journey to a brighter future continues today. You have <span className="text-cyan-500 font-bold">{applications.filter(a => a.status === 'In Progress').length} tasks in progress</span>.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/universities" className="btn-primary px-8 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-cyan-500/20 active:scale-95 transition-all text-xs font-black uppercase tracking-widest">
                  <GraduationCap size={18} /> Discover Universities
                </Link>
                <Link to="/jobs" className="btn-secondary px-8 py-3 rounded-2xl border-gray-200 dark:border-white/5 flex items-center gap-2 active:scale-95 transition-all text-xs font-black uppercase tracking-widest bg-white dark:bg-white/5">
                  <Briefcase size={18} /> View Job Openings
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6 p-6 rounded-[2.5rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-inner">
               <div className="text-center px-4 border-r border-gray-100 dark:border-white/10">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">XP Level</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white leading-none uppercase">Scholar</p>
               </div>
               <div className="text-center px-4">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Status</p>
                  <p className="text-2xl font-black text-emerald-500 leading-none uppercase">Active</p>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * idx }}
            >
              <Link to={stat.href} className="glass-card p-6 flex flex-col group hover:border-cyan-500/30 transition-all shadow-xl hover:shadow-cyan-500/5 relative overflow-hidden">
                <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-inner transition-transform duration-500 group-hover:rotate-12", stat.bg, stat.color)}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-1">{stat.value}</div>
                <div className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{stat.label}</div>

                <div className="absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 bg-current opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700" />
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          {/* Recent Applications Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-8 border-gray-100 dark:border-white/5"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                <TrendingUp size={22} className="text-cyan-500" />
                Recent Tracking
              </h3>
              <Link to="/dashboard/applications" className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1.5 uppercase tracking-widest bg-cyan-500/10 px-3 py-1.5 rounded-full">
                View Tracker <ArrowUpRight size={14} />
              </Link>
            </div>

            {loading ? <div className="py-20"><Loader /></div> : (
              applications.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-white/10">
                  <Compass size={64} className="text-gray-200 dark:text-gray-800 mx-auto mb-6" />
                  <p className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-xs">No active applications found</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-3 max-w-xs mx-auto font-medium">Save universities or jobs to start your journey. Our team will update your progress here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.slice(0, 5).map((a) => (
                    <div key={a._id} className="flex items-center gap-4 p-5 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-gray-50 dark:border-white/5 hover:border-cyan-500/20 transition-all group shadow-sm hover:shadow-xl">
                      <div className={clsx(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                        a.opportunityType === 'university' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
                      )}>
                        {a.opportunityType === 'university' ? <GraduationCap size={22} /> : <Briefcase size={22} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                           <p className="text-sm font-black text-gray-900 dark:text-white truncate group-hover:text-cyan-500 transition-colors uppercase tracking-tight">{a.opportunityName}</p>
                           <StatusBadge status={a.status} />
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                           <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                             <Clock size={12} /> {formatDistanceToNow(new Date(a.updatedAt), { addSuffix: true })}
                           </span>
                           <span className="text-[10px] text-gray-300 dark:text-gray-700">•</span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{a.opportunityType}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </motion.div>

          {/* Quick Actions Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <div className="glass-card p-6 bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-2xl border-transparent">
               <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-90">
                  <Star size={16} /> Fast Actions
               </h4>
               <div className="space-y-3">
                  <Link to="/dashboard/profile" className="flex items-center justify-between p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all group backdrop-blur-md border border-white/10 shadow-lg">
                     <span className="text-xs font-black uppercase tracking-widest">Update Profile</span>
                     <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/guidance" className="flex items-center justify-between p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all group backdrop-blur-md border border-white/10 shadow-lg">
                     <span className="text-xs font-black uppercase tracking-widest">Study Guides</span>
                     <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>

            <div className="glass-card p-6 border-gray-100 dark:border-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.02] rounded-full -mr-16 -mt-16" />
               <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Need Expert Help?</h4>
               <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-6">
                 Stuck with your application? Reach out to our dedicated support team via WhatsApp for instant guidance.
               </p>
               <a
                 href="https://wa.me/250787846344" target="_blank" rel="noreferrer"
                 className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 font-black uppercase tracking-widest text-[10px] border border-green-500/20 hover:bg-green-500 hover:text-white transition-all shadow-sm"
               >
                 Chat on WhatsApp
               </a>
            </div>
          </motion.div>
        </div>
      </div>
    </StudentLayout>
  );
}

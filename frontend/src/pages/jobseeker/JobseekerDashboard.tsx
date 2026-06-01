import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ClipboardList, Bell, ArrowRight, GraduationCap, Briefcase, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { applicationAPI } from '../../api';
import StudentLayout from './JobseekerLayout';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { formatDistanceToNow } from 'date-fns';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<never[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      try {
        const res = await applicationAPI.getByStudent(user._id);
        setApplications(res.data.applications.slice(0, 5));
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const savedCount = user?.savedOpportunities?.length || 0;

  const stats = [
    { label: 'Saved Opportunities', value: savedCount, icon: <Bookmark size={20} />, href: '/dashboard/saved', color: 'text-cyan-400' },
    { label: 'Applications', value: applications.length, icon: <ClipboardList size={20} />, href: '/dashboard/applications', color: 'text-blue-400' },
    { label: 'Universities', value: user?.savedOpportunities?.filter((o) => o.type === 'university').length || 0, icon: <GraduationCap size={20} />, href: '/dashboard/saved', color: 'text-purple-400' },
    { label: 'Jobs Saved', value: user?.savedOpportunities?.filter((o) => o.type === 'job').length || 0, icon: <Briefcase size={20} />, href: '/dashboard/saved', color: 'text-green-400' },
  ];

  return (
    <StudentLayout title="Overview">
      {/* Welcome banner */}
      <div className="relative overflow-hidden glass-card border-cyan-500/20 p-6 mb-6">
        <div className="absolute right-0 top-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-2xl" />
        <div className="relative">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            Welcome back, <span className="gradient-text">{user?.name.split(' ')[0]}</span>! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Track your applications and explore new opportunities.</p>
          <div className="flex gap-3 mt-4">
            <Link to="/universities" className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
              <GraduationCap size={14} /> Browse Universities
            </Link>
            <Link to="/jobs" className="btn-secondary py-2 px-4 text-sm flex items-center gap-1.5">
              <Briefcase size={14} /> Find Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.href} className="glass-card-hover p-5 group">
            <div className={`${stat.color} mb-3 group-hover:scale-110 transition-transform`}>{stat.icon}</div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan-400" /> Recent Applications
          </h3>
          <Link to="/dashboard/applications" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? <Loader text="Loading applications..." /> : (
          applications.length === 0 ? (
            <div className="text-center py-10">
              <ClipboardList size={40} className="text-gray-700 dark:text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No applications tracked yet.</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Save opportunities and the admin will track your progress here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app: never) => {
                const a = app as {_id: string; opportunityName: string; opportunityType: string; status: string; updatedAt: string};
                return (
                  <div key={a._id} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900/3 hover:bg-white dark:hover:bg-gray-800/50 transition-all border border-gray-100 dark:border-white/5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${a.opportunityType === 'university' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {a.opportunityType === 'university' ? <GraduationCap size={16} /> : <Briefcase size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.opportunityName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDistanceToNow(new Date(a.updatedAt), { addSuffix: true })}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </StudentLayout>
  );
}

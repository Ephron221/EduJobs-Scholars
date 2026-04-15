import { useState, useEffect } from 'react';
import { GraduationCap, Briefcase, Users, ClipboardList, BookOpen, TrendingUp, Activity, CheckCircle, XCircle } from 'lucide-react';
import { statsAPI } from '../../api';
import AdminLayout from './AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

export default function AdminDashboard() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await statsAPI.getDashboard();
        setData(res.data);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <AdminLayout title="Overview"><Loader /></AdminLayout>;

  const stats = data?.stats as Record<string, number> || {};
  const statusBreakdown = data?.statusBreakdown as {status: string; count: number}[] || [];
  const recentApplications = data?.recentApplications as {_id:string; studentName:string; opportunityName:string; status:string; updatedAt:string}[] || [];

  const statCards = [
    { label: 'Universities', value: stats.totalUniversities || 0, icon: <GraduationCap size={22} />, color: 'bg-cyan-500/10 text-cyan-400', border: 'border-cyan-500/20' },
    { label: 'Programs', value: stats.totalPrograms || 0, icon: <BookOpen size={22} />, color: 'bg-blue-500/10 text-blue-400', border: 'border-blue-500/20' },
    { label: 'Job Listings', value: stats.totalJobs || 0, icon: <Briefcase size={22} />, color: 'bg-purple-500/10 text-purple-400', border: 'border-purple-500/20' },
    { label: 'Registered Students', value: stats.totalUsers || 0, icon: <Users size={22} />, color: 'bg-green-500/10 text-green-400', border: 'border-green-500/20' },
    { label: 'Total Applications', value: stats.totalApplications || 0, icon: <ClipboardList size={22} />, color: 'bg-orange-500/10 text-orange-400', border: 'border-orange-500/20' },
    { label: 'Accepted', value: stats.acceptedCount || 0, icon: <CheckCircle size={22} />, color: 'bg-green-500/10 text-green-400', border: 'border-green-500/20' },
    { label: 'Rejected', value: stats.rejectedCount || 0, icon: <XCircle size={22} />, color: 'bg-red-500/10 text-red-400', border: 'border-red-500/20' },
    { label: 'In Progress', value: stats.pendingCount || 0, icon: <Activity size={22} />, color: 'bg-yellow-500/10 text-yellow-400', border: 'border-yellow-500/20' },
  ];

  return (
    <AdminLayout title="Overview">
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className={clsx('glass-card p-5 border', s.border)}>
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3', s.color)}>
              {s.icon}
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{s.value.toLocaleString()}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Status Breakdown */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan-400" /> Application Status
          </h3>
          <div className="space-y-3">
            {statusBreakdown.map((item) => {
              const total = stats.totalApplications || 1;
              const pct = Math.round((item.count / total) * 100);
              const barColors: Record<string, string> = {
                Interested: 'bg-gray-500',
                Applied: 'bg-cyan-500',
                Submitted: 'bg-blue-500',
                Accepted: 'bg-green-500',
                Rejected: 'bg-red-500',
              };
              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{item.status}</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{item.count}</span>
                  </div>
                  <div className="h-2 bg-white dark:bg-gray-900/5 rounded-full overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all duration-700', barColors[item.status] || 'bg-cyan-500')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <Activity size={18} className="text-cyan-400" /> Recent Activity
          </h3>
          {recentApplications.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">No recent activity</div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div key={app._id} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900/3 border border-gray-100 dark:border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-xs shrink-0">
                    {app.studentName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{app.studentName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{app.opportunityName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={app.status} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{formatDistanceToNow(new Date(app.updatedAt), { addSuffix: true })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

import { useState, useEffect } from 'react';
import { ClipboardList, GraduationCap, Briefcase, LayoutGrid, List } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { applicationAPI } from '../../api';
import StudentLayout from './StudentLayout';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { format } from 'date-fns';
import clsx from 'clsx';

const STATUSES = ['Interested', 'Applied', 'Submitted', 'Accepted', 'Rejected'];

export default function ApplicationTracker() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<never[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'table'>('kanban');

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

  type AppType = {_id:string; opportunityName:string; opportunityType:string; status:string; notes:string; updatedAt:string; appliedAt:string};

  const byStatus = (status: string) => applications.filter((a: never) => (a as AppType).status === status);

  const statusColors: Record<string, string> = {
    Interested: 'border-gray-500/30',
    Applied: 'border-cyan-500/30',
    Submitted: 'border-blue-500/30',
    Accepted: 'border-green-500/30',
    Rejected: 'border-red-500/30',
  };

  const statusHeaders: Record<string, string> = {
    Interested: 'bg-gray-500/10 text-gray-700 dark:text-gray-300',
    Applied: 'bg-cyan-500/10 text-cyan-300',
    Submitted: 'bg-blue-500/10 text-blue-300',
    Accepted: 'bg-green-500/10 text-green-300',
    Rejected: 'bg-red-500/10 text-red-300',
  };

  return (
    <StudentLayout title="Application Tracker">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600 dark:text-gray-400 text-sm">{applications.length} application{applications.length !== 1 ? 's' : ''} tracked</p>
        <div className="flex items-center gap-2 glass-card p-1">
          <button onClick={() => setView('kanban')} className={clsx('p-2 rounded-lg transition-all', view === 'kanban' ? 'bg-cyan-500 text-black' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white')}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setView('table')} className={clsx('p-2 rounded-lg transition-all', view === 'table' ? 'bg-cyan-500 text-black' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white')}>
            <List size={16} />
          </button>
        </div>
      </div>

      {loading ? <Loader /> : applications.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <ClipboardList size={48} className="text-gray-700 dark:text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 dark:text-white font-semibold mb-2">No Applications Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Your admin will add application records when you start applying.</p>
        </div>
      ) : view === 'kanban' ? (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto">
          {STATUSES.map((status) => {
            const apps = byStatus(status);
            return (
              <div key={status} className={clsx('min-w-48 rounded-2xl border bg-white dark:bg-gray-900/2 p-3', statusColors[status])}>
                <div className={clsx('flex items-center justify-between px-3 py-2 rounded-xl mb-3', statusHeaders[status])}>
                  <span className="text-xs font-semibold">{status}</span>
                  <span className="text-xs font-black">{apps.length}</span>
                </div>
                <div className="space-y-2">
                  {apps.map((app: never) => {
                    const a = app as AppType;
                    return (
                      <div key={a._id} className="glass-card p-3 group">
                        <div className="flex items-start gap-2 mb-2">
                          <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                            a.opportunityType === 'university' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-500/10 text-blue-400')}>
                            {a.opportunityType === 'university' ? <GraduationCap size={13} /> : <Briefcase size={13} />}
                          </div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2">{a.opportunityName}</p>
                        </div>
                        {a.notes && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{a.notes}</p>}
                        <p className="text-xxs text-gray-600 dark:text-gray-400 text-xs">{format(new Date(a.updatedAt), 'MMM dd')}</p>
                      </div>
                    );
                  })}
                  {apps.length === 0 && <p className="text-xs text-gray-600 dark:text-gray-400 text-center py-3">Empty</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-200 dark:border-white/10">
                <tr>
                  <th className="table-header">Opportunity</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Notes</th>
                  <th className="table-header">Updated</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app: never) => {
                  const a = app as AppType;
                  return (
                    <tr key={a._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border-b border-transparent last:border-0">
                      <td className="table-cell font-medium text-gray-900 dark:text-white">{a.opportunityName}</td>
                      <td className="table-cell">
                        <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                          {a.opportunityType === 'university' ? <GraduationCap size={13} className="text-cyan-500" /> : <Briefcase size={13} className="text-blue-500" />}
                          {a.opportunityType}
                        </span>
                      </td>
                      <td className="table-cell"><StatusBadge status={a.status} /></td>
                      <td className="table-cell max-w-48 truncate text-gray-500 dark:text-gray-400">{a.notes || '—'}</td>
                      <td className="table-cell text-gray-500 dark:text-gray-400">{format(new Date(a.updatedAt), 'MMM dd, yyyy')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, GraduationCap, Briefcase, Trash2, ExternalLink, MapPin, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { universityAPI, jobAPI, userAPI } from '../../api';
import StudentLayout from './StudentLayout';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface University {
  _id: string;
  name: string;
  country: string;
  website: string;
  description: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  type: string;
  location: string;
  link: string;
  deadline: string;
}

export default function SavedOpportunities() {
  const { user, updateUser } = useAuth();
  const [savedUnis, setSavedUnis] = useState<University[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'universities' | 'jobs'>('all');

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
      toast.success('Removed from saved');
    } catch { toast.error('Failed to remove'); }
  };

  const tabs = [
    { key: 'all', label: 'All', count: savedUnis.length + savedJobs.length },
    { key: 'universities', label: 'Universities', count: savedUnis.length },
    { key: 'jobs', label: 'Jobs', count: savedJobs.length },
  ];

  return (
    <StudentLayout title="Saved Opportunities">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.key ? 'bg-cyan-500 text-black' : 'glass-card-hover text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white')}>
            {t.label} <span className={clsx('text-xs px-1.5 py-0.5 rounded', tab === t.key ? 'bg-black/20' : 'bg-white dark:bg-gray-900/10')}>{t.count}</span>
          </button>
        ))}
      </div>

      {loading ? <Loader /> : (savedUnis.length + savedJobs.length === 0) ? (
        <div className="text-center py-20 glass-card">
          <Bookmark size={48} className="text-gray-700 dark:text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-2">No Saved Opportunities</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Browse universities and jobs, then click the bookmark icon to save them here.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/universities" className="btn-primary text-sm">Browse Universities</Link>
            <Link to="/jobs" className="btn-secondary text-sm">Browse Jobs</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Universities */}
          {(tab === 'all' || tab === 'universities') && savedUnis.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <GraduationCap size={18} className="text-cyan-400" /> Saved Universities ({savedUnis.length})
              </h2>
              <div className="space-y-3">
                {savedUnis.map((u) => {
                  return (
                    <div key={u._id} className="glass-card-hover p-4 flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-900 to-gray-900 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{u.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <span className="flex items-center gap-1"><MapPin size={10} className="text-cyan-600" />{u.country}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link to={`/universities/${u._id}`} className="btn-secondary py-1.5 px-3 text-xs">View</Link>
                        <a href={u.website} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-cyan-400 transition-colors">
                          <Globe size={15} />
                        </a>
                        <button onClick={() => handleUnsave(u._id)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Jobs */}
          {(tab === 'all' || tab === 'jobs') && savedJobs.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Briefcase size={18} className="text-cyan-400" /> Saved Jobs ({savedJobs.length})
              </h2>
              <div className="space-y-3">
                {savedJobs.map((j) => {
                  const isExpired = new Date(j.deadline) < new Date();
                  return (
                    <div key={j._id} className="glass-card-hover p-4 flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-200 dark:border-gray-200 dark:border-white/10 flex items-center justify-center text-cyan-400 font-bold shrink-0">
                        {j.company.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{j.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <span>{j.company}</span>
                          <span className="flex items-center gap-1"><MapPin size={10} className="text-cyan-600" />{j.location}</span>
                          {isExpired && <span className="text-red-400">Expired</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a href={j.link} target="_blank" rel="noopener noreferrer"
                          className={clsx('py-1.5 px-3 text-xs font-semibold rounded-lg flex items-center gap-1',
                            isExpired ? 'bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed' : 'btn-primary')}>
                          Apply <ExternalLink size={11} />
                        </a>
                        <button onClick={() => handleUnsave(j._id)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </StudentLayout>
  );
}

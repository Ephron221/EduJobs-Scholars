import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Briefcase, Filter, X } from 'lucide-react';
import { jobAPI } from '../../api';
import JobCard from '../../components/JobCard';
import Loader from '../../components/Loader';
import { useAuth } from '../../contexts/AuthContext';

const TYPES = [
  { value: '', label: 'All Types' },
  { value: 'job', label: 'Full-time Job' },
  { value: 'internship', label: 'Internship' },
  { value: 'volunteering', label: 'Volunteering' },
  { value: 'government', label: 'Government' },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<never[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    if (user) setSavedIds(user.savedOpportunities.filter((o) => o.type === 'job').map((o) => o.id));
  }, [user]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 12 };
      if (search) params.search = search;
      if (type) params.type = type;
      if (location) params.location = location;
      const res = await jobAPI.getAll(params);
      setJobs(res.data.jobs);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch { /* silent */ }
    setLoading(false);
  }, [page, search, type, location]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const clearFilters = () => { setSearch(''); setType(''); setLocation(''); setPage(1); };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        <div className="mb-10">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-2">
            <Briefcase size={16} /> Jobs & Internships
          </div>
          <h1 className="section-title">Find Opportunities</h1>
          <p className="section-subtitle">Entry-level jobs, internships, volunteering & government programs</p>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search jobs, companies, skills..." className="input-field pl-9" />
            </div>
            <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="select-field sm:w-44">
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <div className="relative sm:w-44">
              <input type="text" value={location} onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                placeholder="Location..." className="input-field" />
            </div>
            {(search || type || location) && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 px-3">
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Showing <span className="text-gray-900 dark:text-white font-semibold">{jobs.length}</span> of <span className="text-gray-900 dark:text-white font-semibold">{total}</span> opportunities
          </p>
          {/* Type filter pills */}
          <div className="hidden sm:flex gap-2">
            {TYPES.slice(1).map((t) => (
              <button key={t.value} onClick={() => { setType(type === t.value ? '' : t.value); setPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${type === t.value ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-white dark:bg-gray-900/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-200 dark:border-white/10 hover:text-gray-900 dark:text-white'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? <Loader text="Loading opportunities..." /> : (
          <>
            {jobs.length === 0 ? (
              <div className="text-center py-20 glass-card">
                <Briefcase size={56} className="text-gray-700 dark:text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-2">No Opportunities Found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Try different search terms or filters.</p>
                <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {jobs.map((job: never) => (
                  // @ts-ignore
                  <JobCard key={job._id} job={job}
                    isSaved={savedIds.includes((job as {_id: string})._id)}
                    onSaveToggle={() => {
                      const id = (job as {_id: string})._id;
                      setSavedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
                    }}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="btn-secondary px-4 py-2 text-sm disabled:opacity-30">← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`px-4 py-2 text-sm rounded-lg transition-all ${p === page ? 'btn-primary' : 'btn-secondary'}`}>{p}</button>
                ))}
                <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} className="btn-secondary px-4 py-2 text-sm disabled:opacity-30">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, GraduationCap, X } from 'lucide-react';
import { universityAPI } from '../../api';
import UniversityCard from '../../components/UniversityCard';
import Loader from '../../components/Loader';
import { useAuth } from '../../contexts/AuthContext';

const COUNTRIES = ['Rwanda', 'Kenya', 'Uganda', 'Tanzania', 'South Africa', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'France'];
const FUNDING_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'partial_scholarship', label: 'Partial Scholarship' },
  { value: 'study_loan', label: 'Study Loan' },
  { value: 'self_sponsored', label: 'Self-sponsored' },
];

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<never[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [fundingType, setFundingType] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    if (user) setSavedIds(user.savedOpportunities.filter((o) => o.type === 'university').map((o) => o.id));
  }, [user]);

  const fetchUniversities = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 12 };
      if (search) params.search = search;
      if (country) params.country = country;
      if (fundingType) params.fundingType = fundingType;
      const res = await universityAPI.getAll(params);
      setUniversities(res.data.universities);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch { /* silent */ }
    setLoading(false);
  }, [page, search, country, fundingType]);

  useEffect(() => { fetchUniversities(); }, [fetchUniversities]);

  const clearFilters = () => { setSearch(''); setCountry(''); setFundingType(''); setPage(1); };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-2">
            <GraduationCap size={16} /> Universities
          </div>
          <h1 className="section-title">Explore Universities</h1>
          <p className="section-subtitle">Find your ideal university from Rwanda and around the world</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-card p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search universities..."
                className="input-field pl-9"
              />
            </div>
            <select value={country} onChange={(e) => { setCountry(e.target.value); setPage(1); }} className="select-field sm:w-44">
              <option value="">All Countries</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={fundingType} onChange={(e) => { setFundingType(e.target.value); setPage(1); }} className="select-field sm:w-52">
              {FUNDING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center gap-2 whitespace-nowrap">
              <Filter size={15} /> Filters
            </button>
            {(search || country || fundingType) && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 px-3 transition-colors">
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Showing <span className="text-gray-900 dark:text-white font-semibold">{universities.length}</span> of <span className="text-gray-900 dark:text-white font-semibold">{total}</span> universities
          </p>
          <div className="hidden lg:flex gap-2">
            {FUNDING_TYPES.slice(1).map((t) => (
              <button
                key={t.value}
                onClick={() => { setFundingType(fundingType === t.value ? '' : t.value); setPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  fundingType === t.value
                    ? 'bg-cyan-500 text-black border-cyan-500'
                    : 'bg-white dark:bg-gray-900/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? <Loader text="Loading universities..." /> : (
          <>
            {universities.length === 0 ? (
              <div className="text-center py-20 glass-card">
                <GraduationCap size={56} className="text-gray-700 dark:text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-2">No Universities Found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filters.</p>
                <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {universities.map((uni: never) => (
                  // @ts-ignore
                  <UniversityCard
                    key={(uni as {_id: string})._id}
                    university={uni}
                    isSaved={savedIds.includes((uni as {_id: string})._id)}
                    onSaveToggle={() => {
                      const id = (uni as {_id: string})._id;
                      setSavedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-30">← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`px-4 py-2 text-sm rounded-lg transition-all ${p === page ? 'btn-primary' : 'btn-secondary'}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-30">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

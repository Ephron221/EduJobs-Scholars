import { useState, useEffect } from 'react';
import { BookOpen, Clock, ExternalLink, Search, Tag, ChevronRight, GraduationCap, FileText, Users, Lightbulb, Award } from 'lucide-react';
import { guidanceAPI } from '../../api';
import Loader from '../../components/Loader';
import clsx from 'clsx';

const CATEGORIES = [
  { value: 'all', label: 'All Resources', icon: <BookOpen size={16} /> },
  { value: 'university_applications', label: 'University Applications', icon: <GraduationCap size={16} /> },
  { value: 'cv_writing', label: 'CV Writing', icon: <FileText size={16} /> },
  { value: 'career_development', label: 'Career Development', icon: <Users size={16} /> },
  { value: 'interview_prep', label: 'Interview Prep', icon: <Lightbulb size={16} /> },
  { value: 'scholarships', label: 'Scholarships', icon: <Award size={16} /> },
  { value: 'general', label: 'General', icon: <Tag size={16} /> },
];

export default function GuidancePage() {
  const [guidance, setGuidance] = useState<never[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const params: Record<string, unknown> = {};
        if (activeCategory !== 'all') params.category = activeCategory;
        if (search) params.search = search;
        const res = await guidanceAPI.getAll(params);
        setGuidance(res.data.guidance);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, [activeCategory, search]);

  const filtered = guidance.filter((g: never) =>
    !search || (g as {title: string}).title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        <div className="mb-10">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-2">
            <BookOpen size={16} /> Guidance & Resources
          </div>
          <h1 className="section-title">Career & Study Guidance</h1>
          <p className="section-subtitle">Step-by-step guides, tips, and resources to help you succeed</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guidance articles..." className="input-field pl-10" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Categories */}
          <div className="lg:w-60 shrink-0">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Categories</h3>
            <div className="flex flex-row lg:flex-col gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={clsx('flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    activeCategory === cat.value
                      ? 'bg-cyan-500 text-black'
                      : 'glass-card-hover text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white')}
                >
                  {cat.icon} <span className="hidden lg:block">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {loading ? <Loader /> : (
              <>
                {filtered.length === 0 ? (
                  <div className="text-center py-16 glass-card">
                    <BookOpen size={48} className="text-gray-700 dark:text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No guidance resources found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((g: never) => {
                      const guide = g as {_id: string; title: string; category: string; content: string; readTime: number; resourceLink: string; featured: boolean; tags: string[]};
                      return (
                        <div key={guide._id}
                          className={clsx('glass-card-hover p-5 cursor-pointer group', guide.featured && 'border-cyan-500/30')}
                          onClick={() => setSelected(g as Record<string, unknown>)}>
                          {guide.featured && (
                            <span className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-400 text-black text-xs font-bold px-2 py-0.5 rounded-full mb-2">⭐ Featured</span>
                          )}
                          <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2 group-hover:text-cyan-300 transition-colors line-clamp-2">{guide.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-3">{guide.content.substring(0, 150)}...</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Clock size={11} /> {guide.readTime} min read</span>
                              <span className="text-xs text-cyan-500 capitalize">{guide.category.replace('_', ' ')}</span>
                            </div>
                            <ChevronRight size={15} className="text-gray-500 dark:text-gray-400 group-hover:text-cyan-400 transition-colors" />
                          </div>
                          {guide.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {guide.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-xs bg-white dark:bg-gray-900/5 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-200 dark:border-white/10">#{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Article Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-2xl glass-card border border-white/20 max-h-[85vh] flex flex-col shadow-2xl animate-slide-up">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-200 dark:border-white/10 flex items-start justify-between gap-3 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{(selected as {title: string}).title}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-cyan-400 capitalize">{(selected as {category: string}).category?.replace('_', ' ')}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Clock size={10} /> {(selected as {readTime: number}).readTime} min read</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 shrink-0">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{(selected as {content: string}).content}</div>
              {(selected as {resourceLink: string}).resourceLink && (
                <a href={(selected as {resourceLink: string}).resourceLink} target="_blank" rel="noopener noreferrer"
                  className="btn-primary mt-6 inline-flex items-center gap-2 text-sm">
                  External Resource <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

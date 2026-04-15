import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Globe, MapPin, Calendar, Clock, ExternalLink, GraduationCap, BookOpen } from 'lucide-react';
import { universityAPI, programAPI } from '../../api';
import { format } from 'date-fns';
import Loader from '../../components/Loader';
import clsx from 'clsx';

interface University {
  _id: string;
  name: string;
  country: string;
  website: string;
  description: string;
  logoUrl?: string;
  featured: boolean;
}

interface Program {
  _id: string;
  name: string;
  fieldOfStudy: string;
  duration: string;
  level: string;
  deadline: string;
  requirements: string;
  applicationLink: string;
  tuitionFee: string;
}

export default function UniversityDetailPage() {
  const { id } = useParams();
  const [university, setUniversity] = useState<University | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeField, setActiveField] = useState<string>('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [uRes, pRes] = await Promise.all([
          universityAPI.getById(id!),
          programAPI.getByUniversity(id!),
        ]);
        setUniversity(uRes.data.university);
        setPrograms(pRes.data.programs);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="pt-24"><Loader /></div>;
  if (!university) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center"><p className="text-gray-600 dark:text-gray-400">University not found.</p><Link to="/universities" className="btn-primary mt-4 inline-block">Back to universities</Link></div>
    </div>
  );

  const fields = ['all', ...new Set(programs.map((p) => p.fieldOfStudy))];
  const filtered = activeField === 'all' ? programs : programs.filter((p) => p.fieldOfStudy === activeField);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        <Link to="/universities" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-cyan-400 transition-colors mb-8 text-sm">
          <ArrowLeft size={15} /> Back to universities
        </Link>

        {/* University Header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-900 to-gray-900 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-black text-3xl shrink-0">
              {university.logoUrl ? (
                <img src={university.logoUrl} alt={university.name} className="w-14 h-14 object-contain rounded-xl" />
              ) : university.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{university.name}</h1>
                {university.featured && (
                  <span className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-black text-xs font-bold px-2.5 py-1 rounded-full">⭐ Featured</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 text-sm mb-4">
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-cyan-500" />{university.country}</span>
                <a href={university.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                  <Globe size={14} className="text-cyan-500" /> Official Website <ExternalLink size={12} />
                </a>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{university.description}</p>
            </div>
          </div>
        </div>

        {/* Programs */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <GraduationCap size={20} className="text-cyan-400" />
              Programs Offered <span className="text-gray-500 dark:text-gray-400 text-base font-normal">({programs.length})</span>
            </h2>
          </div>

          {/* Field Filter Tabs */}
          {fields.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {fields.map((f) => (
                <button key={f} onClick={() => setActiveField(f)}
                  className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    activeField === f ? 'bg-cyan-500 text-black' : 'bg-white dark:bg-gray-900/5 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-200 dark:border-white/10')}>
                  {f === 'all' ? 'All Fields' : f}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-12 glass-card">
              <BookOpen size={40} className="text-gray-700 dark:text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No programs available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((prog) => {
                const isDeadlinePast = new Date(prog.deadline) < new Date();
                const daysLeft = Math.ceil((new Date(prog.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={prog._id} className="glass-card-hover p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{prog.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-full">{prog.fieldOfStudy}</span>
                          <span className="text-xs bg-white dark:bg-gray-900/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-200 dark:border-white/10 px-2 py-0.5 rounded-full capitalize">{prog.level}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1"><Clock size={11} className="text-cyan-500" /> {prog.duration}</span>
                      <span className={clsx('flex items-center gap-1', isDeadlinePast ? 'text-red-400' : daysLeft <= 30 ? 'text-yellow-400' : '')}>
                        <Calendar size={11} className="text-cyan-500" />
                        {isDeadlinePast ? 'Expired' : `${daysLeft} days left`} · {format(new Date(prog.deadline), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mb-4 line-clamp-2">{prog.requirements}</p>
                    <a href={prog.applicationLink} target="_blank" rel="noopener noreferrer"
                      className={clsx('w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                        isDeadlinePast ? 'bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed' : 'btn-primary')}>
                      Apply Now <ExternalLink size={13} />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

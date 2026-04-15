import { MapPin, Clock, Building2, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface Job {
  _id: string;
  title: string;
  company: string;
  type: 'job' | 'internship' | 'volunteering' | 'government';
  requirements: string;
  deadline: string;
  link: string;
  location: string;
  salary: string;
  featured: boolean;
  images?: string[];
  documents?: { name: string; url: string; uploadedAt: string }[];
}

interface Props { job: Job; isSaved?: boolean; onSaveToggle?: () => void; }

const typeConfig = {
  job: { label: 'Full-time', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  internship: { label: 'Internship', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  volunteering: { label: 'Volunteering', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  government: { label: 'Government', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
};

export default function JobCard({ job, isSaved, onSaveToggle }: Props) {
  const { isAuthenticated } = useAuth();
  const isExpired = new Date(job.deadline) < new Date();
  const type = typeConfig[job.type] || typeConfig.job;

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to save opportunities'); return; }
    try {
      if (isSaved) {
        await userAPI.unsaveOpportunity(job._id);
        toast.success('Removed from saved');
      } else {
        await userAPI.saveOpportunity({ id: job._id, type: 'job' });
        toast.success('Job saved!');
      }
      onSaveToggle?.();
    } catch { toast.error('Failed to update saved list'); }
  };

  return (
    <div className={clsx('glass-card-hover group relative flex flex-col', job.featured && 'border-cyan-500/30')}>
      {job.featured && (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
          ⭐ Featured
        </div>
      )}
      {isExpired && (
        <div className="absolute top-3 right-3 bg-red-500/20 text-red-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-red-500/30">
          Expired
        </div>
      )}

      {/* Cover Image if available */}
      {job.images && job.images.length > 0 && (
        <div className="h-28 w-full overflow-hidden relative">
          <img src={job.images[0]} alt={job.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
        </div>
      )}

      {/* Docs Badge */}
      {job.documents && job.documents.length > 0 && (
        <div className="absolute top-3 right-12 z-10">
          <span className="bg-gray-900/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded border border-white/10 flex items-center gap-1">
            <Bookmark size={10} className="text-cyan-400"/> {job.documents.length} Doc(s)
          </span>
        </div>
      )}

      <div className={clsx("p-5", job.images && job.images.length > 0 ? "pt-3" : "")}>
        {/* Company icon & Title */}
        <div className="flex items-start gap-3 mb-3 relative">
          {!(job.images && job.images.length > 0) && (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-200 dark:border-white/10 flex items-center justify-center text-cyan-400 font-black shrink-0 shadow-lg">
              {job.company.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight group-hover:text-cyan-300 transition-colors line-clamp-2">
              {job.title}
            </h3>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs mt-1">
              <Building2 size={12} className="text-cyan-600" />
              <span className="font-medium">{job.company}</span>
            </div>
          </div>
          
          {job.images && job.images.length > 0 && (
             <div className="absolute -top-10 right-0 w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-white/20 p-0.5 flex items-center justify-center shrink-0 shadow-xl z-10">
                <span className="text-cyan-600 dark:text-cyan-400 font-black text-xs">{job.company.charAt(0).toUpperCase()}</span>
             </div>
          )}
          <button onClick={handleSave} className={clsx(
            'absolute top-3 right-3 p-1.5 rounded-lg transition-all z-10 shrink-0',
            isSaved ? 'bg-cyan-500/20 text-cyan-400' : 'bg-black/40 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-cyan-400'
          )}>
            {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={clsx('text-xs px-2.5 py-1 rounded-full border font-medium', type.color)}>
            {type.label}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <MapPin size={11} className="text-cyan-600" /> {job.location}
          </span>
          {job.salary && job.salary !== 'Not specified' && (
            <span className="text-xs text-green-400 font-medium">💰 {job.salary}</span>
          )}
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{job.requirements}</p>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
        <div className={clsx('flex items-center gap-1 text-xs', isExpired ? 'text-red-400' : 'text-gray-500 dark:text-gray-400')}>
          <Clock size={11} />
          {isExpired ? 'Expired ' : 'Deadline: '}
          {format(new Date(job.deadline), 'MMM dd, yyyy')}
        </div>
        <a
          href={job.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={clsx('flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all',
            isExpired
              ? 'bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
              : 'btn-primary'
          )}
        >
          Apply <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}

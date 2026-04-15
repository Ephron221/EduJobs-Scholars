import { Link } from 'react-router-dom';
import { MapPin, Globe, GraduationCap, Bookmark, BookmarkCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface University {
  _id: string;
  name: string;
  country: string;
  website: string;
  description: string;
  logoUrl: string;
  featured: boolean;
  images?: string[];
  documents?: { name: string; url: string; uploadedAt: string }[];
}

interface Props {
  university: University;
  programCount?: number;
  isSaved?: boolean;
  onSaveToggle?: () => void;
}

export default function UniversityCard({ university, programCount, isSaved, onSaveToggle }: Props) {
  const { isAuthenticated } = useAuth();

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to save opportunities'); return; }
    try {
      if (isSaved) {
        await userAPI.unsaveOpportunity(university._id);
        toast.success('Removed from saved');
      } else {
        await userAPI.saveOpportunity({ id: university._id, type: 'university' });
        toast.success('University saved!');
      }
      onSaveToggle?.();
    } catch { toast.error('Failed to update saved list'); }
  };

  const initials = university.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  return (
    <div className={clsx(
      'glass-card-hover group relative overflow-hidden flex flex-col',
      university.featured && 'border-cyan-500/30'
    )}>
      {university.featured && (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black text-xs font-bold px-2 py-0.5 rounded-full z-10">
          ⭐ Featured
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={clsx(
          'absolute top-3 right-3 p-1.5 rounded-lg transition-all z-10',
          isSaved
            ? 'bg-cyan-500/20 text-cyan-400'
            : 'bg-black/40 text-gray-600 dark:text-gray-400 opacity-0 group-hover:opacity-100 hover:text-cyan-400'
        )}
      >
        {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
      </button>

      {/* Cover Image if available */}
      {university.images && university.images.length > 0 ? (
        <div className="h-32 w-full overflow-hidden relative">
          <img src={university.images[0]} alt={university.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent"></div>
          
          <div className="absolute bottom-3 left-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 border border-white/20 p-1 flex items-center justify-center shrink-0 shadow-lg">
              {university.logoUrl ? (
                <img src={university.logoUrl} alt={university.name} className="w-full h-full object-contain rounded-lg" />
              ) : (
                <span className="text-cyan-600 dark:text-cyan-400 font-black text-sm">{initials}</span>
              )}
            </div>
            <div>
               <h3 className="font-bold text-white text-base leading-tight group-hover:text-cyan-300 transition-colors line-clamp-1">
                {university.name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5 text-gray-300 text-xs">
                <MapPin size={11} className="text-cyan-400" />
                {university.country}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 pb-0">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-900 to-gray-900 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-black text-lg mb-4 group-hover:border-cyan-500/40 transition-all shadow-lg">
            {university.logoUrl ? (
              <img src={university.logoUrl} alt={university.name} className="w-10 h-10 object-contain rounded text-xs" />
            ) : initials}
          </div>

          <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight group-hover:text-cyan-300 transition-colors line-clamp-2">
            {university.name}
          </h3>

          <div className="flex items-center gap-1 mt-1.5 text-gray-600 dark:text-gray-400 text-xs">
            <MapPin size={12} className="text-cyan-500" />
            {university.country}
          </div>
        </div>
      )}

      {/* Docs Badge */}
      {university.documents && university.documents.length > 0 && (
        <div className="absolute top-3 right-12 z-10">
          <span className="bg-gray-900/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded border border-white/10 flex items-center gap-1">
            <Bookmark size={10} className="text-cyan-400"/> {university.documents.length} Doc(s)
          </span>
        </div>
      )}

      <div className="px-5 py-3 flex-1">
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">{university.description}</p>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
        {programCount !== undefined && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <GraduationCap size={13} className="text-cyan-600" />
            {programCount} program{programCount !== 1 ? 's' : ''}
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <a href={university.website} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-1">
            <Globe size={12} /> Website
          </a>
          <Link
            to={`/universities/${university._id}`}
            className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1"
          >
            View <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

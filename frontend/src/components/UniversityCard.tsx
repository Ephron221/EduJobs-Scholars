import {
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  ExternalLink,
  FileText,
  GraduationCap,
  HelpCircle,
  MapPin,
  Send,
  X,
  Clock,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { applicationAPI, userAPI } from '../api';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { getAssetUrl } from '../utils/assetUrl';
import { Link } from 'react-router-dom';

interface University {
  _id: string;
  name: string;
  country: string;
  website: string;
  description: string;
  logoUrl: string;
  phone?: string;
  deadline?: string;
  intake?: string;
  academicYear?: string;
  category: string;
  featured: boolean;
  createdAt?: string;
  images?: string[];
  documents?: { name: string; url: string; uploadedAt: string }[];
}

interface Props {
  university: University;
  programCount?: number;
  isSaved?: boolean;
  onSaveToggle?: () => void;
}

const Countdown = ({ deadline }: { deadline: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const target = new Date(deadline).getTime();
    if (isNaN(target)) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(interval);
      } else {
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (!timeLeft) return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold">
      <AlertCircle size={16} />
      <span>Deadline Reached</span>
    </div>
  );

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm w-fit">
      <span className="text-white font-medium px-2 py-0.5 bg-blue-700 rounded-sm">Time remaining:</span>
      <div className="flex gap-2 font-bold text-orange-400 text-lg">
        <span>{timeLeft.d}d</span>
        <span>{timeLeft.h}h</span>
        <span>{timeLeft.m}m</span>
        <span>{timeLeft.s}s</span>
      </div>
    </div>
  );
};

export default function UniversityCard({ university, programCount, isSaved, onSaveToggle }: Props) {
  const { isAuthenticated } = useAuth();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [helpStep, setHelpStep] = useState<'eligibility' | 'form'>('eligibility');
  const [assistanceForm, setAssistanceForm] = useState({ fullName: '', phone: '', email: '' });
  const initials = university.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const detailsUrl = `/universities/${university._id}`;
  const applicationUrl = getAssetUrl(university.documents?.[0]?.url) || university.website || detailsUrl;
  const postedDate = university.createdAt
    ? new Date(university.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Recently posted';

  const isExpired = useMemo(() => {
    if (!university.deadline) return false;
    return new Date(university.deadline).getTime() < new Date().getTime();
  }, [university.deadline]);

  const openHelpModal = () => {
    setHelpStep('eligibility');
    setShowHelpModal(true);
  };

  const closeHelpModal = () => {
    setShowHelpModal(false);
    setHelpStep('eligibility');
  };

  const handleAssistanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(assistanceForm.email.trim());
    const phoneOk = /^\+\d{7,15}$/.test(assistanceForm.phone.trim());

    if (!emailOk) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!phoneOk) {
      toast.error('Phone number must start with country code, for example +250786823101');
      return;
    }

    try {
      await applicationAPI.createPublic({
        studentName: assistanceForm.fullName.trim(),
        studentEmail: assistanceForm.email.trim(),
        studentPhone: assistanceForm.phone.trim(),
        opportunityId: university._id,
        opportunityType: 'university',
        opportunityName: university.name,
        notes: `Assistance request for ${university.name} in ${university.country}`,
      });
      toast.success('Application assistance request submitted!');
      setAssistanceForm({ fullName: '', phone: '', email: '' });
      closeHelpModal();
    } catch {
      toast.error('Failed to submit assistance request');
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to save opportunities');
      return;
    }

    try {
      if (isSaved) {
        await userAPI.unsaveOpportunity(university._id);
        toast.success('Removed from saved');
      } else {
        await userAPI.saveOpportunity({ id: university._id, type: 'university' });
        toast.success('University saved!');
      }
      onSaveToggle?.();
    } catch {
      toast.error('Failed to update saved list');
    }
  };

  return (
    <div className={clsx(
      'glass-card-hover group relative flex flex-col overflow-hidden rounded-2xl',
      university.featured && 'border-cyan-500/30',
    )}>
      {university.featured && (
        <div className="absolute left-3 top-3 z-20 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 px-2 py-0.5 text-xs font-bold text-black">
          Featured
        </div>
      )}

      {/* Category Badge on Card */}
      <div className="absolute left-3 top-10 z-20">
        <span className="flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[10px] font-bold text-cyan-400 backdrop-blur-md uppercase tracking-wider">
          <Tag size={10} /> {university.category}
        </span>
      </div>

      {university.documents && university.documents.length > 0 && (
        <div className="absolute right-12 top-3 z-20">
          <span className="flex items-center gap-1 rounded border border-white/10 bg-gray-900/60 px-2 py-1 text-[10px] text-white backdrop-blur-md">
            <Bookmark size={10} className="text-cyan-400" /> {university.documents.length} Doc(s)
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        className={clsx(
          'absolute right-3 top-3 z-20 rounded-lg p-2 backdrop-blur-md transition-all',
          isSaved
            ? 'bg-cyan-500 text-black'
            : 'bg-black/45 text-white hover:bg-cyan-500 hover:text-black',
        )}
        aria-label={isSaved ? 'Remove saved university' : 'Save university'}
      >
        {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
      </button>

      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-cyan-50 to-gray-100 dark:from-cyan-950/40 dark:to-gray-950">
        {university.images && university.images.length > 0 ? (
          <img
            src={getAssetUrl(university.images[0])}
            alt={university.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-xl font-black text-cyan-600 dark:text-cyan-300">
                {university.logoUrl ? (
                  <img src={getAssetUrl(university.logoUrl)} alt={university.name} className="h-12 w-12 rounded object-contain" />
                ) : initials}
              </div>
              <p className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-200">{university.country}</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/25 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white p-1 shadow-lg dark:bg-gray-800">
            {university.logoUrl ? (
              <img src={getAssetUrl(university.logoUrl)} alt={university.name} className="h-full w-full rounded-lg object-contain" />
            ) : (
              <span className="text-sm font-black text-cyan-600 dark:text-cyan-400">{initials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-lg font-bold leading-tight text-white transition-colors group-hover:text-cyan-300">
              {university.name}
            </h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-200">
              <MapPin size={12} className="text-cyan-400" />
              {university.country}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="mb-5 line-clamp-3 flex-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
          {university.description}
        </p>

        <div className="mt-auto flex flex-col gap-4 border-t border-gray-100 pt-4 dark:border-white/5">
          {programCount !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <GraduationCap size={17} className="text-cyan-600 dark:text-cyan-400" />
              {programCount} program{programCount !== 1 ? 's' : ''}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={openHelpModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-cyan-700 dark:bg-cyan-500 dark:text-black dark:hover:bg-cyan-400"
            >
              <HelpCircle size={16} /> Ask Help
            </button>
            <button
              type="button"
              onClick={() => setShowDetailsModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-cyan-600 px-4 py-3 text-sm font-semibold text-gray-900 transition-all hover:bg-cyan-50 dark:border-cyan-400 dark:text-white dark:hover:bg-cyan-500/10"
            >
              Read More <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>

      {showHelpModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={closeHelpModal} />
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-cyan-500/20 bg-white shadow-2xl shadow-black/40 dark:bg-gray-950">
            <div className="flex items-center justify-between bg-gradient-to-r from-cyan-700 to-cyan-950 px-5 py-6 text-white dark:from-cyan-600 dark:to-cyan-900 sm:px-7">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                  <HelpCircle size={28} />
                </div>
                <h2 className="text-xl font-black text-white sm:text-2xl">Check Your Eligibility</h2>
              </div>
              <button
                type="button"
                onClick={closeHelpModal}
                className="ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white transition-all hover:bg-white/25"
                aria-label="Close eligibility dialog"
              >
                <X size={22} />
              </button>
            </div>

            {helpStep === 'eligibility' ? (
              <>
                <div className="overflow-y-auto px-5 py-8 text-center sm:px-9">
                  <h3 className="mx-auto max-w-2xl text-2xl font-black leading-snug text-gray-900 dark:text-white sm:text-3xl">
                    Have you checked your eligibility for this application?
                  </h3>
                  <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-600 dark:text-gray-300 sm:text-lg">
                    Please make sure you meet all the requirements before proceeding with the application assistance request.
                  </p>
                </div>

                <div className="grid gap-3 border-t border-gray-200 bg-gray-50 px-5 py-5 dark:border-white/10 dark:bg-white/5 sm:px-7">
                  <button
                    type="button"
                    onClick={() => setHelpStep('form')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-950 px-5 py-4 text-base font-bold text-white transition-all hover:from-cyan-500 hover:to-cyan-800 dark:from-cyan-500 dark:to-cyan-700 dark:text-black"
                  >
                    <CheckCircle size={22} /> Proceed
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowHelpModal(false);
                      setShowDetailsModal(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-cyan-600 bg-white px-5 py-4 text-base font-bold text-cyan-700 transition-all hover:bg-cyan-50 dark:border-cyan-400 dark:bg-transparent dark:text-cyan-300 dark:hover:bg-cyan-500/10"
                  >
                    <FileText size={21} /> Read Application
                  </button>
                  <button
                    type="button"
                    onClick={closeHelpModal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-200 px-5 py-4 text-base font-bold text-gray-600 transition-all hover:bg-gray-300 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15"
                  >
                    <X size={21} /> Close
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleAssistanceSubmit} className="space-y-5 overflow-y-auto px-5 py-6 sm:px-7">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">Application Assistance Form</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                    Fill in your personal information so the team can contact you about this scholarship.
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name *</label>
                  <input
                    type="text"
                    value={assistanceForm.fullName}
                    onChange={(e) => setAssistanceForm({ ...assistanceForm, fullName: e.target.value })}
                    className="input-field"
                    placeholder="Esron TUYISHIMIRE"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Phone Number *</label>
                    <input
                      type="tel"
                      value={assistanceForm.phone}
                      onChange={(e) => setAssistanceForm({ ...assistanceForm, phone: e.target.value })}
                      className="input-field"
                      placeholder="+250786823101"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Email *</label>
                    <input
                      type="email"
                      value={assistanceForm.email}
                      onChange={(e) => setAssistanceForm({ ...assistanceForm, email: e.target.value })}
                      className="input-field"
                      placeholder="esron@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-3 border-t border-gray-200 pt-5 dark:border-white/10 sm:grid-cols-2">
                  <button type="button" onClick={() => setHelpStep('eligibility')} className="btn-secondary justify-center">
                    Back
                  </button>
                  <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2">
                    <Send size={18} /> Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body,
      )}

      {showDetailsModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)} />
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-cyan-500/20 bg-white shadow-2xl shadow-black/40 dark:bg-gray-950">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 bg-gray-50 px-5 py-6 dark:border-white/10 dark:bg-white/5 sm:px-7">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
                    {university.category}
                  </span>
                  {university.deadline && (
                    <span className={clsx(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                      isExpired ? "bg-red-500/20 text-red-500 border border-red-500/30" : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    )}>
                      <Clock size={12} />
                      {isExpired ? "EXPIRED" : "OPEN"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Posted {postedDate}</p>
                <h2 className="mt-2 text-2xl font-black uppercase leading-tight text-gray-900 dark:text-white sm:text-3xl truncate">
                  {university.name}
                </h2>
                <p className="mt-2 font-semibold text-cyan-700 dark:text-cyan-300">{university.country}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-200 text-gray-700 transition-all hover:bg-gray-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                aria-label="Close scholarship details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-6 sm:px-7">
              {/* Refined Header with Intake Info */}
              <div className="mb-6">
                {(university.intake || university.academicYear) && (
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {university.intake} {university.academicYear && `[${university.academicYear}]`} Intake
                  </h4>
                )}
                
                {university.deadline && (
                  <div className="mt-2">
                    <Countdown deadline={university.deadline} />
                    {!isExpired && (
                      <p className="text-[10px] text-gray-400 mt-2 ml-1 italic">
                        Ends on: {new Date(university.deadline).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-6 grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm dark:border-white/10 dark:bg-white/5 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">Phone:</p>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">{university.phone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">Country:</p>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">{university.country}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">Documents:</p>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">{university.documents?.length || 0} available</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">Funding:</p>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">{university.category}</p>
                </div>
              </div>

              {isExpired && (
                <div className="mb-8 p-6 rounded-2xl bg-red-500/10 border-2 border-dashed border-red-500/30 text-center animate-pulse">
                  <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
                  <h4 className="text-lg font-black text-red-500 mb-2 uppercase tracking-tight">Application Period Ended</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    This scholarship application is now closed. Don't worry, there are many other great opportunities waiting for you!
                  </p>
                  <Link 
                    to="/universities" 
                    onClick={() => setShowDetailsModal(false)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                  >
                    Explore Other Universities <ExternalLink size={16}/>
                  </Link>
                </div>
              )}

              <section className="mb-6">
                <h3 className="mb-3 text-lg font-black text-gray-900 dark:text-white">About this Opportunity</h3>
                <p className="whitespace-pre-line text-sm leading-7 text-gray-700 dark:text-gray-300">{university.description}</p>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-black text-gray-900 dark:text-white">Qualification Criteria</h3>
                <p className="text-sm leading-7 text-gray-700 dark:text-gray-300">
                  Review the official requirements and attached application documents before requesting help or applying by yourself.
                </p>
              </section>
            </div>

            <div className="grid gap-3 border-t border-gray-200 bg-gray-50 px-5 py-5 dark:border-white/10 dark:bg-white/5 sm:grid-cols-2 sm:px-7">
              <a
                href={university.website || applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  "inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all",
                  isExpired 
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-white/5 dark:text-gray-400" 
                    : "btn-primary"
                )}
                onClick={(e) => isExpired && e.preventDefault()}
              >
                {isExpired ? "Closed" : "Self Apply"} <ExternalLink size={18} />
              </a>
              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  openHelpModal();
                }}
                disabled={isExpired}
                className={clsx(
                  "inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all",
                  isExpired
                    ? "border-2 border-gray-200 text-gray-400 cursor-not-allowed dark:border-white/5"
                    : "btn-secondary"
                )}
              >
                <HelpCircle size={18} /> Ask Help
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

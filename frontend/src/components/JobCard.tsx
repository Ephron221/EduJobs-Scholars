import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Bookmark,
  BookmarkCheck,
  Building2,
  Calendar,
  CheckCircle,
  ExternalLink,
  FileText,
  HelpCircle,
  MapPin,
  Send,
  UserRound,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { applicationAPI, userAPI } from '../api';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { getAssetUrl } from '../utils/assetUrl';

interface Job {
  _id: string;
  title: string;
  company: string;
  type: 'job' | 'internship' | 'volunteering' | 'government';
  requirements: string;
  description?: string;
  deadline: string;
  link: string;
  location: string;
  salary: string;
  featured: boolean;
  postedAt?: string;
  images?: string[];
  documents?: { name: string; url: string; uploadedAt: string }[];
}

interface Assistant {
  _id: string;
  name: string;
  email: string;
}

interface Props {
  job: Job;
  isSaved?: boolean;
  onSaveToggle?: () => void;
}

const typeConfig = {
  job: { label: 'Full-time', color: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30' },
  internship: { label: 'Internship', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30' },
  volunteering: { label: 'Volunteering', color: 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30' },
  government: { label: 'Government', color: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30' },
};

const initialsFrom = (value: string) => value.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    <span className="max-w-[62%] text-right text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
  </div>
);

const InfoSection = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div>
    <h4 className="mb-3 flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-bold text-gray-900 dark:border-white/10 dark:text-white">
      <span className="text-cyan-500">{icon}</span>
      {title}
    </h4>
    <div className="space-y-3">{children}</div>
  </div>
);

export default function JobCard({ job, isSaved, onSaveToggle }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [helpStep, setHelpStep] = useState<'eligibility' | 'assistant' | 'form'>('eligibility');
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [assistanceForm, setAssistanceForm] = useState({ fullName: '', phone: '', email: '' });

  const isExpired = new Date(job.deadline) < new Date();
  const type = typeConfig[job.type] || typeConfig.job;
  const applicationUrl = getAssetUrl(job.documents?.[0]?.url) || job.link;
  const overview = job.description || job.requirements;
  const postedDate = job.postedAt ? format(new Date(job.postedAt), 'dd MMM yyyy') : 'Recently posted';
  const avatarText = initialsFrom(job.company || job.title) || 'OP';

  useEffect(() => {
    if (helpStep === 'assistant') {
      const fetchAssistants = async () => {
        try {
          const res = await userAPI.getAssistants();
          setAssistants(res.data.users);
        } catch {
          toast.error('Failed to load assistants');
        }
      };
      fetchAssistants();
    }
  }, [helpStep]);

  const openHelpModal = () => {
    if (isAuthenticated && user) {
      setAssistanceForm({
        fullName: user.name,
        email: user.email,
        phone: ''
      });
    }
    setHelpStep('eligibility');
    setShowHelpModal(true);
  };

  const closeHelpModal = () => {
    setShowHelpModal(false);
    setHelpStep('eligibility');
    setSelectedAssistant(null);
  };

  const handleAssistanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssistant) {
      toast.error('Please select an assistant');
      return;
    }

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
        opportunityId: job._id,
        opportunityType: 'job',
        opportunityName: job.title,
        assignedAssistantId: selectedAssistant._id,
        notes: `Assistance request for ${job.title} at ${job.company} assigned to ${selectedAssistant.name}`,
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
        await userAPI.unsaveOpportunity(job._id);
        toast.success('Removed from saved');
      } else {
        await userAPI.saveOpportunity({ id: job._id, type: 'job' });
        toast.success('Job saved!');
      }
      onSaveToggle?.();
    } catch {
      toast.error('Failed to update saved list');
    }
  };

  return (
    <div className={clsx('glass-card-hover group relative flex flex-col overflow-hidden rounded-2xl', job.featured && 'border-cyan-500/30')}>
      {job.featured && (
        <div className="absolute left-3 top-3 z-20 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 px-2 py-0.5 text-xs font-bold text-black">
          Featured
        </div>
      )}

      {isExpired && (
        <div className="absolute right-3 top-3 z-20 rounded-full border border-red-500/30 bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">
          Expired
        </div>
      )}

      {job.documents && job.documents.length > 0 && (
        <div className="absolute right-12 top-3 z-20">
          <span className="flex items-center gap-1 rounded border border-white/10 bg-gray-900/60 px-2 py-1 text-[10px] text-white backdrop-blur-md">
            <Bookmark size={10} className="text-cyan-400" /> {job.documents.length} Doc(s)
          </span>
        </div>
      )}

      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-cyan-50 to-gray-100 dark:from-cyan-950/40 dark:to-gray-950">
        {job.images && job.images.length > 0 ? (
          <img
            src={getAssetUrl(job.images[0])}
            alt={job.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <div>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-xl font-black text-cyan-600 dark:text-cyan-300">
                {job.company.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-200">{job.company}</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <button
          type="button"
          onClick={handleSave}
          className={clsx(
            'absolute bottom-3 right-3 z-10 rounded-lg p-2 text-white backdrop-blur-md transition-all',
            isSaved ? 'bg-cyan-500 text-black' : 'bg-black/45 hover:bg-cyan-500 hover:text-black',
          )}
          aria-label={isSaved ? 'Remove saved job' : 'Save job'}
        >
          {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-xl font-bold leading-tight text-gray-900 transition-colors group-hover:text-cyan-600 dark:text-white dark:group-hover:text-cyan-300">
              {job.title}
            </h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <Building2 size={12} className="text-cyan-600 dark:text-cyan-400" />
              <span className="font-medium">{job.company}</span>
            </div>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={clsx('rounded-full border px-2.5 py-1 text-xs font-medium', type.color)}>
            {type.label}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <MapPin size={11} className="text-cyan-600 dark:text-cyan-400" /> {job.location}
          </span>
          {job.salary && job.salary !== 'Not specified' && (
            <span className="text-xs font-medium text-green-600 dark:text-green-400">{job.salary}</span>
          )}
        </div>

        <p className="mb-5 line-clamp-3 flex-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
          {job.requirements}
        </p>

        <div className="mt-auto flex flex-col gap-4 border-t border-gray-100 pt-4 dark:border-white/5">
          <div className={clsx('flex items-center gap-2 text-sm', isExpired ? 'text-red-400' : 'text-gray-600 dark:text-gray-400')}>
            <Calendar size={17} />
            {format(new Date(job.deadline), 'yyyy-MM-dd')}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={openHelpModal}
              disabled={isExpired}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:bg-cyan-500 dark:text-black dark:hover:bg-cyan-400 dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
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
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeHelpModal} />
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-black dark:bg-[#111214]">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-white/10">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                {helpStep === 'eligibility' ? 'Eligibility Check' :
                 helpStep === 'assistant' ? 'Select Assistance' : 'Application Help'}
              </h2>
              <button
                type="button"
                onClick={closeHelpModal}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close dialog"
              >
                <X size={22} />
              </button>
            </div>

            {helpStep === 'eligibility' ? (
              <>
                <div className="overflow-y-auto px-6 py-7">
                  <div className="mb-8 flex items-center gap-5">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-3xl font-black text-black shadow-lg shadow-cyan-500/20">
                      {avatarText}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">{job.title}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300">{job.company}</span>
                        <span className={clsx('rounded-full border px-3 py-1 text-sm font-bold', type.color)}>{type.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <InfoSection icon={<CheckCircle size={15} />} title="Eligibility">
                      <InfoRow label="Status" value="Confirm before requesting help" />
                      <InfoRow label="Deadline" value={format(new Date(job.deadline), 'yyyy-MM-dd')} />
                      <InfoRow label="Location" value={job.location} />
                    </InfoSection>
                    <InfoSection icon={<FileText size={15} />} title="Application Note">
                      <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                        Please make sure you meet all the requirements before proceeding with the application assistance request.
                      </p>
                    </InfoSection>
                  </div>
                </div>

                <div className="grid gap-3 border-t border-gray-200 bg-gray-50 px-6 py-5 dark:border-white/10 dark:bg-[#15171a] sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setHelpStep('assistant')}
                    className="btn-primary inline-flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={22} /> Proceed
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowHelpModal(false);
                      setShowDetailsModal(true);
                    }}
                    className="btn-secondary inline-flex items-center justify-center gap-2"
                  >
                    <FileText size={21} /> Read Application
                  </button>
                  <button
                    type="button"
                    onClick={closeHelpModal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-200 px-5 py-3 text-base font-bold text-gray-600 transition-all hover:bg-gray-300 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15"
                  >
                    <X size={21} /> Close
                  </button>
                </div>
              </>
            ) : helpStep === 'assistant' ? (
                <div className="space-y-6 overflow-y-auto px-6 py-7">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">Choose Your Assistant</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Select an expert to help guide your application process.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {assistants.length === 0 ? (
                      <div className="col-span-2 py-8 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
                        <UserRound size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500">No assistants available at the moment.</p>
                      </div>
                    ) : assistants.map((as) => (
                      <button
                        key={as._id}
                        type="button"
                        onClick={() => {
                          setSelectedAssistant(as);
                          setHelpStep('form');
                        }}
                        className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 dark:border-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-left group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 font-bold">
                          {as.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate">{as.name}</p>
                          <p className="text-xs text-gray-500 truncate">{as.email}</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setHelpStep('eligibility')}
                    className="w-full mt-4 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    Back
                  </button>
                </div>
            ) : (
              <form onSubmit={handleAssistanceSubmit} className="space-y-6 overflow-y-auto px-6 py-7">
                <div className="mb-4 flex items-center gap-3 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500 font-bold shrink-0">
                    {selectedAssistant?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-cyan-600 dark:text-cyan-400">Assigned To</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedAssistant?.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHelpStep('assistant')}
                    className="ml-auto text-xs font-bold text-cyan-500 hover:underline"
                  >
                    Change
                  </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <InfoSection icon={<UserRound size={15} />} title="Personal Information">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Full Name *
                      <input
                        type="text"
                        value={assistanceForm.fullName}
                        onChange={(e) => setAssistanceForm({ ...assistanceForm, fullName: e.target.value })}
                        className="input-field mt-2"
                        placeholder="Esron TUYISHIMIRE"
                        required
                      />
                    </label>
                  </InfoSection>
                  <InfoSection icon={<FileText size={15} />} title="Opportunity">
                    <InfoRow label="Title" value={job.title} />
                    <InfoRow label="Company" value={job.company} />
                    <InfoRow label="Type" value={type.label} />
                  </InfoSection>
                </div>
                <InfoSection icon={<HelpCircle size={15} />} title="Contact Info">
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
                </InfoSection>
                <div className="grid gap-3 border-t border-gray-200 pt-5 dark:border-white/10 sm:grid-cols-2">
                  <button type="button" onClick={() => setHelpStep('assistant')} className="btn-secondary justify-center">
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
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)} />
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-black dark:bg-[#111214]">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-white/10">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Opportunity Profile</h2>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close opportunity details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-7">
              <div className="mb-8 flex items-center gap-5">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-3xl font-black text-black shadow-lg shadow-cyan-500/20">
                  {avatarText}
                </div>
                <div className="min-w-0">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">{job.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300">{job.company}</span>
                    <span className={clsx('rounded-full border px-3 py-1 text-sm font-bold', type.color)}>{type.label}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <InfoSection icon={<FileText size={15} />} title="Opportunity Detail">
                  <InfoRow label="Posted" value={postedDate} />
                  <InfoRow label="Deadline" value={format(new Date(job.deadline), 'yyyy-MM-dd')} />
                  <InfoRow label="Location" value={job.location} />
                  <InfoRow label="Salary" value={job.salary || 'Not specified'} />
                </InfoSection>
                <InfoSection icon={<HelpCircle size={15} />} title="Contact Info">
                  <InfoRow label="Phone" value="0786823101" />
                  <InfoRow label="Company" value={job.company} />
                  <InfoRow label="Documents" value={`${job.documents?.length || 0} available`} />
                </InfoSection>
                <div className="md:col-span-2">
                  <InfoSection icon={<CheckCircle size={15} />} title="About this Opportunity">
                    <p className="whitespace-pre-line text-sm leading-7 text-gray-600 dark:text-gray-300">{overview}</p>
                  </InfoSection>
                </div>
                <div className="md:col-span-2">
                  <InfoSection icon={<FileText size={15} />} title="Qualification Criteria">
                    <p className="whitespace-pre-line text-sm leading-7 text-gray-600 dark:text-gray-300">{job.requirements}</p>
                  </InfoSection>
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-t border-gray-200 bg-gray-50 px-6 py-5 dark:border-white/10 dark:bg-[#15171a] sm:grid-cols-2">
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                Self Apply <ExternalLink size={18} />
              </a>
              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  openHelpModal();
                }}
                className="btn-secondary inline-flex items-center justify-center gap-2"
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

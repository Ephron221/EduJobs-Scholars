import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  GraduationCap, Landmark, FileEdit, Compass,
  Palette, Code, ArrowRight, CheckCircle2,
  X, Send, CheckCircle, ChevronRight,
  User as UserIcon, HelpCircle, Briefcase, Info, List, Mail
} from 'lucide-react';
import { userAPI, applicationAPI, serviceAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../../components/Loader';

interface Assistant {
  _id: string;
  name: string;
  email: string;
}

interface Service {
  _id: string;
  title: string;
  iconName: string;
  features: string[];
  order: number;
}

const ICON_MAP: Record<string, any> = {
  GraduationCap, Landmark, FileEdit, Compass,
  Palette, Code, Briefcase, Info, List
};

export default function ServicesPage() {
  const { user, isAuthenticated } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpStep, setHelpStep] = useState<'eligibility' | 'assistant' | 'form'>('eligibility');
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [assistanceForm, setAssistanceForm] = useState({ fullName: '', phone: '', email: '' });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceAPI.getAll();
        setServices(res.data.services);
      } catch {
        toast.error('Failed to load services');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

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

  const openHelpModal = (service: Service) => {
    if (isAuthenticated && user) {
      setAssistanceForm({
        fullName: user.name,
        email: user.email,
        phone: ''
      });
    }
    setSelectedService(service);
    setHelpStep('eligibility');
    setShowHelpModal(true);
  };

  const closeHelpModal = () => {
    setShowHelpModal(false);
    setHelpStep('eligibility');
    setSelectedAssistant(null);
    setSelectedService(null);
  };

  const handleAssistanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssistant || !selectedService) {
      toast.error('Missing required information');
      return;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(assistanceForm.email.trim());
    const phoneOk = /^\+\d{7,15}$/.test(assistanceForm.phone.trim());

    if (!emailOk) { toast.error('Please enter a valid email address'); return; }
    if (!phoneOk) { toast.error('Phone number must start with country code, for example +250786823101'); return; }

    try {
      await applicationAPI.createPublic({
        studentName: assistanceForm.fullName.trim(),
        studentEmail: assistanceForm.email.trim(),
        studentPhone: assistanceForm.phone.trim(),
        opportunityId: "service-" + selectedService.title.toLowerCase().replace(/\s+/g, '-'),
        opportunityType: 'service',
        opportunityName: selectedService.title,
        assignedAssistantId: selectedAssistant._id,
        notes: `Service request for ${selectedService.title} assigned to ${selectedAssistant.name}`,
      });
      toast.success('Service assistance request submitted!');
      setAssistanceForm({ fullName: '', phone: '', email: '' });
      closeHelpModal();
    } catch {
      toast.error('Failed to submit assistance request');
    }
  };

  const renderIcon = (name: string) => {
    const Icon = ICON_MAP[name] || Info;
    return <Icon size={36} />;
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">
            Our <span className="gradient-text">Services</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            We provide a holistic ecosystem designed to empower students and professionals alike. From university discovery to expert design and development, we have the tools you need.
          </p>
        </motion.div>

        {loading ? <div className="py-20"><Loader /></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {services.map((s, i) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 flex flex-col h-full group hover:border-cyan-500/50 transition-all shadow-xl hover:shadow-cyan-500/5"
              >
                <div className="text-cyan-500 dark:text-cyan-400 mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  {renderIcon(s.iconName)}
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">{s.title}</h2>
                <ul className="space-y-3.5 flex-1 mb-8">
                  {s.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400 font-medium">
                      <CheckCircle2 size={18} className="text-cyan-500 mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => openHelpModal(s)}
                  className="mt-auto inline-flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black uppercase tracking-widest text-[11px] hover:gap-3 transition-all hover:text-cyan-500 group-hover:underline"
                >
                  Request Service <ArrowRight size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
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
                <h2 className="text-xl font-black text-white sm:text-2xl uppercase tracking-tight">
                  {helpStep === 'eligibility' ? 'Service Overview' :
                   helpStep === 'assistant' ? 'Select Assistant' : 'Request Information'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeHelpModal}
                className="ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white transition-all hover:bg-white/25"
                aria-label="Close dialog"
              >
                <X size={22} />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-8 sm:px-9">
              {helpStep === 'eligibility' && selectedService && (
                <div className="text-center animate-fade-in">
                  <h3 className="mx-auto max-w-2xl text-2xl font-black leading-snug text-gray-900 dark:text-white sm:text-3xl uppercase tracking-tight">
                    Request Assistance for <span className="text-cyan-500">{selectedService.title}</span>?
                  </h3>
                  <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-600 dark:text-gray-300 font-bold uppercase tracking-widest text-[11px]">
                    Our team will help you with:
                  </p>
                  <ul className="mt-4 text-left max-w-md mx-auto space-y-3">
                    {selectedService.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 font-bold">
                        <CheckCircle size={16} className="text-cyan-500" /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="grid gap-3 mt-8 border-t border-gray-200 bg-gray-50 dark:bg-white/5 pt-6 -mx-5 px-5 sm:-mx-9 sm:px-9">
                    <button
                      type="button"
                      onClick={() => setHelpStep('assistant')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-950 px-5 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:from-cyan-500 hover:to-cyan-800 dark:from-cyan-500 dark:to-cyan-700 dark:text-black shadow-xl shadow-cyan-500/20"
                    >
                      <CheckCircle size={20} /> Proceed to Assistant
                    </button>
                  </div>
                </div>
              )}

              {helpStep === 'assistant' && (
                <div className="space-y-6 animate-slide-up">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Choose Your Assistant</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm font-bold">Select an expert to handle your request.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {assistants.length === 0 ? (
                      <div className="col-span-2 py-8 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
                        <UserIcon size={32} className="mx-auto text-gray-300 mb-2" />
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
                        className="flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 dark:border-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-left group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 font-black">
                          {as.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-gray-900 dark:text-white truncate uppercase text-sm tracking-tight">{as.name}</p>
                          <p className="text-xs text-gray-500 truncate">{as.email}</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setHelpStep('eligibility')}
                    className="w-full mt-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-white transition-colors"
                  >
                    ← Back to Overview
                  </button>
                </div>
              )}

              {helpStep === 'form' && (
                <form onSubmit={handleAssistanceSubmit} className="space-y-6 animate-slide-up">
                  <div className="mb-4 flex items-center gap-4 p-5 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 shadow-inner">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 font-black">
                      {selectedAssistant?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] uppercase font-black tracking-widest text-cyan-600 dark:text-cyan-400">Assigned To Expert</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{selectedAssistant?.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHelpStep('assistant')}
                      className="text-[10px] font-black uppercase text-cyan-500 hover:underline px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                    >
                      Change
                    </button>
                  </div>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Full Name *</label>
                      <div className="relative group">
                        <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                        <input
                          type="text"
                          value={assistanceForm.fullName}
                          onChange={(e) => setAssistanceForm({ ...assistanceForm, fullName: e.target.value })}
                          className="input-field pl-12 py-4 text-sm font-bold"
                          placeholder="e.g. John Doe"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Phone Number *</label>
                        <div className="relative group">
                           <Send size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                           <input
                             type="tel"
                             value={assistanceForm.phone}
                             onChange={(e) => setAssistanceForm({ ...assistanceForm, phone: e.target.value })}
                             className="input-field pl-12 py-4 text-sm font-bold"
                             placeholder="+250 787 ..."
                             required
                           />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Email Address *</label>
                        <div className="relative group">
                           <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                           <input
                             type="email"
                             value={assistanceForm.email}
                             onChange={(e) => setAssistanceForm({ ...assistanceForm, email: e.target.value })}
                             className="input-field pl-12 py-4 text-sm font-bold"
                             placeholder="example@mail.com"
                             required
                           />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 border-t border-gray-200 dark:border-white/10 pt-8 mt-4 sm:grid-cols-2">
                    <button type="button" onClick={() => setHelpStep('assistant')} className="btn-secondary justify-center py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                      ← Back
                    </button>
                    <button type="submit" className="btn-primary inline-flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-cyan-500/20">
                      <Send size={18} /> Send Request
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

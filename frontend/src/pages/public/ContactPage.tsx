import { useState } from 'react';
import { Mail, MapPin, Phone, Send, MessageCircle, Users, ChevronDown, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { contactAPI } from '../../api';
import clsx from 'clsx';

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const INITIAL: FormState = { name: '', email: '', phone: '', subject: '', message: '' };

const FAQS = [
  { q: "How do I apply for a university scholarship?", a: "Browse our 'Universities' page, find a featured scholarship, and click 'Ask Help' or 'Self Apply'. We provide guides for both Rwanda and International applications." },
  { q: "Are the job listings for professionals or students?", a: "We feature opportunities for everyone! From internships and entry-level roles for graduates to specialized professional jobs in Rwanda." },
  { q: "Can I get help with my CV preparation?", a: "Yes! Check our 'Guidance' section for templates and tips, or use the 'Contact' form to request personalized assistance from our expert team." },
  { q: "Is the WhatsApp group free to join?", a: "Absolutely. Our WhatsApp community is a free space where we share daily updates on scholarships, jobs, and system announcements." }
];

const isValidPhone = (v: string) => /^\+?[\d\s\-().]{7,20}$/.test(v.trim()) && v.replace(/\D/g, '').length >= 7;

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isSent, setIsSent] = useState(false);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
    if (field === 'phone') {
      if (!val) setPhoneError('');
      else if (!isValidPhone(val)) setPhoneError('Enter a valid phone number (e.g. +250 787 846 344)');
      else setPhoneError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone) { toast.error('Phone number is required'); return; }
    if (!isValidPhone(form.phone)) {
      setPhoneError('Enter a valid phone number');
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await contactAPI.create(form);
      setIsSent(true);
      toast.success('Message sent! We\'ll be in touch. ✨');
      setTimeout(() => {
        setIsSent(false);
        setForm(INITIAL);
        setPhoneError('');
      }, 3000);
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500">
      {/* Background Decorative Blurs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] -ml-64 -mb-64" />

      <div className="page-container relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-500 text-xs font-black uppercase tracking-widest mb-6">
              <Sparkles size={14} className="animate-pulse" /> Support Hub
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
              Let's <span className="gradient-text">Connect.</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Have questions about scholarships, jobs, or need technical help?
              Our team of experts is ready to guide you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Sidebar Cards (4 cols) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-4 space-y-6"
            >
              {/* WhatsApp Card */}
              <motion.a
                href="https://chat.whatsapp.com/BDEAa9Knxs7J3SCarkhvvE"
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="block glass-card p-8 border-green-500/20 bg-green-500/[0.03] dark:bg-green-500/[0.05] relative overflow-hidden group shadow-xl shadow-green-500/5"
              >
                <div className="absolute -top-4 -right-4 p-2 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-1000">
                  <MessageCircle size={160} className="text-green-500" />
                </div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-green-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-green-500/40 relative">
                     <Users size={28} />
                     <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white dark:border-slate-900 shadow-sm"></span>
                     </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Community Hub</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed font-medium">Join 1,200+ members for real-time scholarship & job alerts.</p>
                  <div className="flex items-center gap-3 text-xs font-black bg-green-500 text-white w-fit px-6 py-3.5 rounded-2xl shadow-lg uppercase tracking-widest group-hover:bg-green-600 transition-colors">
                    Join Group <Send size={14} />
                  </div>
                </div>
              </motion.a>

              {/* Email Card */}
              <motion.div
                whileHover={{ y: -5 }}
                className="glass-card p-8 border-cyan-500/10 hover:border-cyan-500/30 transition-all shadow-xl shadow-slate-900/5"
              >
                <div className="w-14 h-14 bg-cyan-500/10 text-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <Mail size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Email Inquiries</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-4">esront21@gmail.com</p>
                <a href="mailto:esront21@gmail.com" className="text-[10px] font-black uppercase text-cyan-500 hover:underline tracking-[0.2em]">Launch Mail App</a>
              </motion.div>

              {/* Call Card */}
              <motion.div
                whileHover={{ y: -5 }}
                className="glass-card p-8 border-blue-500/10 hover:border-blue-500/30 transition-all shadow-xl shadow-slate-900/5"
              >
                <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <Phone size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Direct Call</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-1">+250 787 846 344</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-6">Mon–Fri, 8am–5pm CAT</p>
                <div className="flex gap-3">
                   <a href="tel:+250787846344" className="flex-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl text-center shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors">Call Now</a>
                   <a href="https://wa.me/250787846344" target="_blank" rel="noreferrer" className="flex-1 border border-green-500/30 text-green-600 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl text-center hover:bg-green-500/5 transition-all">WhatsApp</a>
                </div>
              </motion.div>
            </motion.div>

            {/* Form Section (8 cols) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-8 glass-card p-8 md:p-12 border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-600" />
              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Send a Message</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium italic">We usually respond within 24 hours.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Your Full Name</label>
                    <div className="relative group">
                      <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                      <input type="text" value={form.name} onChange={set('name')} className="input-field pl-12 py-4 text-sm font-bold bg-white/50 dark:bg-slate-900/50" required placeholder="Esron Tuyishime" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                      <input type="email" value={form.email} onChange={set('email')} className="input-field pl-12 py-4 text-sm font-bold bg-white/50 dark:bg-slate-900/50" required placeholder="example@mail.com" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                      <input
                        type="tel" value={form.phone} onChange={set('phone')}
                        className={clsx(
                          "input-field pl-12 py-4 text-sm font-bold bg-white/50 dark:bg-slate-900/50 transition-all",
                          phoneError ? "border-red-500" : form.phone && !phoneError ? "border-green-500" : ""
                        )}
                        required placeholder="+250 787 ..."
                      />
                    </div>
                    <AnimatePresence>
                      {phoneError && (
                        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-[10px] font-bold uppercase flex items-center gap-1.5 ml-1">
                          <AlertCircle size={10} /> {phoneError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Message Subject</label>
                    <input type="text" value={form.subject} onChange={set('subject')} className="input-field py-4 text-sm font-bold bg-white/50 dark:bg-slate-900/50" required placeholder="Scholarship help..." />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Detailed Message</label>
                  <textarea rows={5} value={form.message} onChange={set('message')} className="input-field resize-none py-4 text-sm font-bold bg-white/50 dark:bg-slate-900/50" required placeholder="Tell us what you need help with..." />
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !!phoneError || isSent}
                  className={clsx(
                    "w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black uppercase tracking-[0.25em] text-sm shadow-2xl transition-all",
                    isSent ? "bg-green-500 text-white" : "btn-primary shadow-cyan-500/20"
                  )}
                >
                  {loading ? (
                    <><div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" /> Processing...</>
                  ) : isSent ? (
                    <><CheckCircle2 size={20} /> Message Received</>
                  ) : (
                    <><Send size={18} /> Send Message</>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32 max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
               <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Common Questions</h2>
               <p className="text-slate-500 dark:text-slate-400 font-medium">Quick answers to help you get started faster.</p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="glass-card overflow-hidden border-slate-200 dark:border-white/5 hover:border-cyan-500/30 transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left group"
                  >
                    <span className="font-bold text-slate-900 dark:text-white pr-4">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: activeFaq === idx ? 180 : 0 }}
                      className={clsx("w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-inner", activeFaq === idx ? "bg-cyan-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-cyan-500")}
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {activeFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="px-8 pb-8 text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

function UserIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

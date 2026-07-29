import { useState } from 'react';
import { Mail, MapPin, Phone, Send, MessageCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { contactAPI } from '../../api';

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const INITIAL: FormState = { name: '', email: '', phone: '', subject: '', message: '' };

/** Validates international phone numbers: optional +, then 7–15 digits, spaces/dashes allowed */
const isValidPhone = (v: string) => /^\+?[\d\s\-().]{7,20}$/.test(v.trim()) && v.replace(/\D/g, '').length >= 7;

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);

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

    // Final phone validation before submit
    if (!form.phone) { toast.error('Phone number is required'); return; }
    if (!isValidPhone(form.phone)) {
      setPhoneError('Enter a valid phone number (e.g. +250 787 846 344)');
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await contactAPI.create(form);
      toast.success('Your message has been sent! We will get back to you soon.', { duration: 5000 });
      setForm(INITIAL);
      setPhoneError('');
    } catch (error) {
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Have questions about our platform, partnership opportunities, or need support? We are here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Info Sidebar */}
            <div className="space-y-6">
              {/* WhatsApp Group Card */}
              <div className="glass-card p-6 border-green-500/30 bg-green-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <MessageCircle size={80} className="text-green-500" />
                </div>
                <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
                  <Users size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Join EduJobs Scholars Community</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Join our WhatsApp group for instant updates and networking.</p>
                <a 
                  href="https://chat.whatsapp.com/BDEAa9Knxs7J3SCarkhvvE" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn-primary w-full !bg-green-500 hover:!bg-green-600 !text-black flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} /> Join Group
                </a>
              </div>

              <div className="glass-card p-6">
                <div className="w-12 h-12 bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 rounded-xl flex items-center justify-center mb-4">
                  <Mail size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Email Us</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">esront21@gmail.com</p>
              </div>

              <div className="glass-card p-6">
                <div className="w-12 h-12 bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 rounded-xl flex items-center justify-center mb-4">
                  <Phone size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Call Us</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">+250 787 846 344<br/>Mon–Fri, 8am–5pm CAT</p>
                <div className="mt-3 flex flex-col gap-2">
                  <a href="tel:+250787846344" className="btn-secondary text-center">Call Now</a>
                  <a href="https://wa.me/250787846344" target="_blank" rel="noreferrer" className="btn-ghost text-center border-green-500/30 text-green-500">Chat on WhatsApp</a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2 glass-card p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={set('name')}
                      className="input-field"
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      className="input-field"
                      required
                      placeholder="esron@gmail.com"
                    />
                  </div>
                </div>

                {/* Phone + Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={set('phone')}
                        className={`input-field pl-10 ${phoneError ? 'border-red-500 focus:ring-red-500/20' : form.phone && !phoneError ? 'border-green-500 focus:ring-green-500/20' : ''}`}
                        placeholder="+250 780 123 456"
                        required
                      />
                    </div>
                    {phoneError && (
                      <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                        <span>⚠</span> {phoneError}
                      </p>
                    )}
                    {form.phone && !phoneError && (
                      <p className="text-green-400 text-xs mt-1.5 flex items-center gap-1">
                        <span>✓</span> Valid phone number
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject *</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={set('subject')}
                      className="input-field"
                      required
                      placeholder="How can we help?"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message *</label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={set('message')}
                    className="input-field resize-none"
                    required
                    placeholder="Write your message here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !!phoneError}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <><Send size={16} /> Send Message</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

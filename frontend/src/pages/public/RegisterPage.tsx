import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, CheckCircle2, Briefcase, ShieldCheck, Sparkles } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<'student' | 'jobseeker'>('student');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Please fill in all fields'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      toast.success(res.data.status === 'pending' || res.data.needsVerification 
        ? 'Account created! Please verify your email.' 
        : 'Account created! Welcome to EduJobs Scholars 🎓');
        
      if (res.data.needsVerification) {
        navigate(`/verify-account?email=${encodeURIComponent(email)}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const msg = (err as {response?: {data?: {message?: string}}})?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/google-login', { 
        idToken: credentialResponse.credential,
        role: role
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.success(`Account linked with Google! Selected Role: ${role} 🎓`);
      navigate('/dashboard');
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Google registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = [
    { check: password.length >= 6, label: '6+ chars' },
    { check: /[A-Z]/.test(password), label: 'Uppercase' },
    { check: /[0-9]/.test(password), label: 'Number' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#030303] flex flex-col selection:bg-cyan-500/30">
      <Navbar />
      <main className="flex-grow flex flex-col lg:flex-row relative">
        {/* Left Section - Hero/Info */}
        <div className="hidden lg:flex lg:w-[45%] sticky top-0 h-screen bg-gray-50 dark:bg-zinc-950 items-center justify-center border-r border-gray-100 dark:border-zinc-900">
          <div className="relative z-10 p-16 max-w-xl">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-cyan-500/20 mb-12"
            >
              EJ
            </motion.div>
            
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-8 tracking-tight leading-tight">
              Gateway to <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent italic font-serif">Global Opportunities</span>
            </h2>
            
            <div className="space-y-8">
              {[
                { icon: <GraduationCap />, title: "Scholarships", desc: "Access 150+ top universities globally" },
                { icon: <Briefcase />, title: "Career Path", desc: "Discover 500+ premium graduate jobs" },
                { icon: <ShieldCheck />, title: "Verified Guidance", desc: "Direct mentorship from industry experts" }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  className="flex gap-6 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 dark:text-white text-lg">{item.title}</h4>
                    <p className="text-gray-500 dark:text-zinc-500 font-medium">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 pt-16 border-t border-gray-100 dark:border-zinc-900">
              <div className="flex items-center gap-4 text-cyan-500 font-black tracking-widest text-xs uppercase">
                <Sparkles size={16} /> Empowering Digital Generations
              </div>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] -mr-40 -mt-40" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] -ml-40 -mb-40" />
        </div>

        {/* Right Section - Form */}
        <div className="w-full lg:w-[55%] flex items-center justify-center p-8 md:p-12 lg:p-24 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            <div className="mb-12 text-center lg:text-left">
              <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Create Account</h1>
              <p className="text-gray-500 dark:text-zinc-500 font-bold">Select your profile type to get started</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`relative group flex flex-col items-center gap-4 py-6 px-4 rounded-3xl border-2 transition-all duration-300 ${
                  role === 'student'
                    ? 'border-cyan-500 bg-cyan-500/5 ring-4 ring-cyan-500/10'
                    : 'border-gray-100 dark:border-zinc-800 hover:border-cyan-500/30 text-gray-400'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${role === 'student' ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-zinc-800'}`}>
                  <GraduationCap size={24} />
                </div>
                <div className="text-center">
                  <span className={`block font-black text-xs uppercase tracking-tight ${role === 'student' ? 'text-cyan-600' : 'text-gray-500'}`}>Scholarship</span>
                  <span className={`block font-bold text-[10px] whitespace-nowrap ${role === 'student' ? 'text-cyan-500/70' : 'text-gray-400'}`}>Seeking Student</span>
                </div>
                {role === 'student' && (
                  <motion.div layoutId="role-check" className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center shadow-lg"><CheckCircle2 size={14} /></motion.div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setRole('jobseeker')}
                className={`relative group flex flex-col items-center gap-4 py-6 px-4 rounded-3xl border-2 transition-all duration-300 ${
                  role === 'jobseeker'
                    ? 'border-blue-500 bg-blue-500/5 ring-4 ring-blue-500/10'
                    : 'border-gray-100 dark:border-zinc-800 hover:border-blue-500/30 text-gray-400'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${role === 'jobseeker' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-zinc-800'}`}>
                  <Briefcase size={24} />
                </div>
                <div className="text-center">
                  <span className={`block font-black text-xs uppercase tracking-tight ${role === 'jobseeker' ? 'text-blue-600' : 'text-gray-500'}`}>Career</span>
                  <span className={`block font-bold text-[10px] whitespace-nowrap ${role === 'jobseeker' ? 'text-blue-500/70' : 'text-gray-400'}`}>Job Seeker</span>
                </div>
                {role === 'jobseeker' && (
                  <motion.div layoutId="role-check" className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg"><CheckCircle2 size={14} /></motion.div>
                )}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 ml-1">Full Name</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                      placeholder="Jane Doe" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 text-gray-900 dark:text-white pl-12 pr-4 py-4 rounded-2xl outline-none transition-all duration-300 font-bold" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                      placeholder="jane@example.com" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 text-gray-900 dark:text-white pl-12 pr-4 py-4 rounded-2xl outline-none transition-all duration-300 font-bold" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 ml-1">Password</label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                      placeholder="••••••••" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 text-gray-900 dark:text-white pl-12 pr-12 py-4 rounded-2xl outline-none transition-all duration-300 font-bold" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-500">
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="flex gap-1.5 mt-2 px-1">
                    {strength.map((s, i) => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-500 ${s.check ? 'bg-cyan-500' : 'bg-gray-100 dark:bg-zinc-800'}`} />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 ml-1">Confirm</label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                    <input type={showPw ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                      placeholder="••••••••" className={`w-full bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 text-gray-900 dark:text-white pl-12 pr-4 py-4 rounded-2xl outline-none transition-all duration-300 font-bold ${confirm && confirm !== password ? 'border-red-500/50' : ''}`} />
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4.5 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-cyan-500/30 flex items-center justify-center gap-3 mt-6 shadow-xl shadow-cyan-500/10 transition-all"
              >
                {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <>Complete Enrollment <ArrowRight size={22} /></>}
              </motion.button>
            </form>

            <div className="mt-10">
              <div className="relative mb-8 text-center px-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100 dark:border-zinc-900"></div>
                </div>
                <span className="relative bg-white dark:bg-[#030303] px-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-zinc-500">Fast Enrollment</span>
              </div>

              <div className="flex justify-center min-h-[50px]">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google Sign-Up failed')}
                  theme="outline"
                  shape="pill"
                  logo_alignment="left"
                  text="signup_with"
                />
              </div>
            </div>

            <p className="text-center text-gray-500 dark:text-zinc-500 font-bold mt-12">
              Already a member?{' '}
              <Link to="/login" className="text-cyan-500 hover:text-cyan-600 font-black transition-colors">Sign in to your portal</Link>
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

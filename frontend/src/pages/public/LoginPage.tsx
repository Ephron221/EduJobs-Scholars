import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      const userRole = res.data.user.role;
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}! 👋`);
      
      setTimeout(() => {
        navigate(userRole === 'admin' ? '/admin' : '/dashboard');
        window.location.reload(); 
      }, 500);
    } catch (err: any) {
      if (err.response?.data?.needsVerification) {
        toast.error(err.response.data.message);
        navigate(`/verify-account?email=${encodeURIComponent(email)}`);
      } else {
        setError(err.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/google-login', { 
        idToken: credentialResponse.credential,
        role: 'student' 
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.success('Signed in with Google! 🚀');
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#030303] flex flex-col selection:bg-cyan-500/30">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-6 py-24 relative overflow-hidden">
        {/* Modern Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px]" 
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full relative z-10"
        >
          <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border border-gray-200/50 dark:border-zinc-800/50 rounded-[2.5rem] p-10 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-2xl">
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white mb-6 shadow-lg shadow-cyan-500/20"
              >
                <LogIn size={32} />
              </motion.div>
              <h2 className="text-4xl font-black mb-3 text-gray-900 dark:text-white tracking-tight">
                Welcome <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Back</span>
              </h2>
              <p className="text-gray-500 dark:text-zinc-400 font-medium tracking-tight">
                Continue your journey with EduJobs Scholars
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-8 flex items-center gap-3 overflow-hidden"
                >
                  <AlertCircle size={20} />
                  <span className="text-sm font-bold">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-gray-700 dark:text-zinc-300 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 text-gray-900 dark:text-white pl-12 pr-4 py-4 rounded-2xl outline-none transition-all duration-300 font-bold"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-gray-700 dark:text-zinc-300">Password</label>
                  <Link to="/forgot-password" 
                    className="text-xs font-black text-cyan-500 hover:text-cyan-600 transition-colors tracking-wide uppercase">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 text-gray-900 dark:text-white pl-12 pr-12 py-4 rounded-2xl outline-none transition-all duration-300 font-bold"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4.5 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    Sign In <ArrowRight size={22} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8">
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100 dark:border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 dark:text-zinc-500">
                  <span className="bg-white dark:bg-zinc-900 px-4">Secure Social Access</span>
                </div>
              </div>

              <div className="flex justify-center min-h-[50px]">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google Sign-In failed')}
                  useOneTap
                  theme="filled_black"
                  shape="pill"
                  width="100%"
                />
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100 dark:border-zinc-800 text-center">
              <p className="text-gray-500 dark:text-zinc-500 font-bold tracking-tight">
                New to the platform?{' '}
                <Link to="/register" className="text-cyan-500 font-black hover:text-cyan-600 transition-colors">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;

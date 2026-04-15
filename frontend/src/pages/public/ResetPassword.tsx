import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || '';
  const code = queryParams.get('code') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email || !code) {
      navigate('/forgot-password');
    }
  }, [email, code, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { email, otp: code, password });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-6 py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-md w-full relative z-10">
          <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
            
            {!success ? (
              <>
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/10 text-cyan-500 rounded-2xl mb-6">
                    <Lock size={32} />
                  </div>
                  <h2 className="text-3xl font-black mb-3 text-gray-900 dark:text-white tracking-tight">
                    Set New <span className="text-cyan-500">Password</span>
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    Create a strong password for your EduJobs Scholars account.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={20} />
                    <span className="text-sm font-semibold">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">New Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="w-full bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-zinc-800 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 text-gray-900 dark:text-white pl-12 pr-12 py-4 rounded-2xl outline-none transition-all duration-300 font-medium"
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

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="w-full bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-zinc-800 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 text-gray-900 dark:text-white pl-12 pr-4 py-4 rounded-2xl outline-none transition-all duration-300 font-medium"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cyan-500 text-white py-4.5 rounded-2xl font-black text-lg hover:bg-cyan-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/25"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : 'Reset Password'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6 animate-in zoom-in-95 duration-500">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 text-green-500 rounded-full mb-6">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Password Reset!</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
                  Your password has been successfully updated. Redirecting to login...
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-cyan-500 font-bold hover:underline"
                >
                  <ArrowLeft size={18} /> Return to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;

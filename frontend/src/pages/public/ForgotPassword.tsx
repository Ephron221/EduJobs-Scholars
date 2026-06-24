import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message || 'Reset code sent to your email.');
      navigate(`/verify-otp?email=${encodeURIComponent(email)}&type=reset`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset code');
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
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/10 text-cyan-500 rounded-2xl mb-6">
                <Mail size={32} />
              </div>
              <h2 className="text-3xl font-black mb-3 text-gray-900 dark:text-white tracking-tight">Forgot <span className="text-cyan-500">Password?</span></h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Enter your email and we'll send you a 6-character verification code.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={20} />
                <span className="text-sm font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-zinc-800 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 text-gray-900 dark:text-white pl-12 pr-4 py-4 rounded-2xl outline-none transition-all duration-300 font-medium"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 text-white py-4.5 rounded-2xl font-black text-lg hover:bg-cyan-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/25"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : 'Send Code'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-zinc-900 text-center">
              <Link to="/login" className="text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-500 transition-colors flex items-center justify-center gap-2 font-bold">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;

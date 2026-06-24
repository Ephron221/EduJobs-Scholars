import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || '';
  const type = queryParams.get('type') || 'reset'; // 'reset' or 'verification'

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    setError('');
    setLoading(true);

    try {
      if (type === 'reset') {
        const res = await api.post('/auth/verify-reset-code', { email, otp });
        if (res.data.success) {
          navigate(`/reset-password?email=${encodeURIComponent(email)}&code=${otp}`);
        }
      } else {
        const res = await api.post('/auth/verify-account', { email, code: otp });
        toast.success('Account verified successfully!');
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    setResending(true);
    setError('');
    try {
      const res = await api.post('/auth/resend-otp', { email, type });
      setTimer(60);
      toast.success(res.data.message || 'New code sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-6 py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-md w-full relative z-10">
          <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 text-green-500 rounded-2xl mb-6">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-3xl font-black mb-3 text-gray-900 dark:text-white tracking-tight">
                Verify <span className="text-cyan-500">Code</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                We've sent a 6-character code to <span className="text-gray-900 dark:text-white font-bold">{email}</span>
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={20} />
                <span className="text-sm font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 text-center block">Enter 6-Character Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="w-full bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-zinc-800 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 text-gray-900 dark:text-white px-4 py-4 rounded-2xl outline-none transition-all duration-300 font-black text-center text-3xl tracking-[0.5em]"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                />
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-cyan-500 text-white py-4.5 rounded-2xl font-black text-lg hover:bg-cyan-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/25 disabled:opacity-50 disabled:active:scale-100"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : 'Verify Code'}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={timer > 0 || resending}
                    className="inline-flex items-center gap-2 text-cyan-500 font-bold hover:text-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resending ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                    {timer > 0 ? `Resend code in ${timer}s` : 'Resend Code Now'}
                  </button>
                </div>
              </div>
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

export default VerifyOTP;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      window.location.reload(); // Quick fix to update Navbar
    } catch (err: any) {
      setError(err.response?.data?.msg || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-zinc-950 border border-gray-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Welcome <span className="text-cyan">Back</span></h2>
          <p className="text-gray-500 dark:text-gray-400">Sign in to your EduJobs Scholars account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" size={18} />
              <input
                type="email"
                required
                className="w-full bg-gray-50 dark:bg-black border border-gray-800 focus:border-cyan text-gray-900 dark:text-white pl-12 pr-4 py-3 rounded-xl outline-none transition-all"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" size={18} />
              <input
                type="password"
                required
                className="w-full bg-gray-50 dark:bg-black border border-gray-800 focus:border-cyan text-gray-900 dark:text-white pl-12 pr-4 py-3 rounded-xl outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-gray-500 dark:text-gray-400">
              <input type="checkbox" className="w-4 h-4 accent-cyan" />
              <span>Remember me</span>
            </label>
            <a href="#" className="text-cyan hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan text-black py-4 rounded-xl font-bold hover:bg-white dark:bg-gray-900 dark:hover:bg-gray-800 dark:hover:text-white transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in...' : (
              <>
                Sign In <LogIn size={20} />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan font-bold hover:underline">Register Now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

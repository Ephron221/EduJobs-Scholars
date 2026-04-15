import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, AlertCircle, GraduationCap } from 'lucide-react';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const { name, email, password, role } = formData;
      const res = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.msg || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full bg-zinc-950 border border-gray-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-cyan rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="text-black" size={24} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Create <span className="text-cyan">Account</span></h2>
          <p className="text-gray-500 dark:text-gray-400">Join the EduJobs Scholars community</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" size={18} />
              <input
                type="text"
                name="name"
                required
                className="w-full bg-gray-50 dark:bg-black border border-gray-800 focus:border-cyan text-gray-900 dark:text-white pl-12 pr-4 py-3 rounded-xl outline-none transition-all"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                required
                className="w-full bg-gray-50 dark:bg-black border border-gray-800 focus:border-cyan text-gray-900 dark:text-white pl-12 pr-4 py-3 rounded-xl outline-none transition-all"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" size={18} />
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full bg-gray-50 dark:bg-black border border-gray-800 focus:border-cyan text-gray-900 dark:text-white pl-12 pr-4 py-3 rounded-xl outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">Confirm</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" size={18} />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="w-full bg-gray-50 dark:bg-black border border-gray-800 focus:border-cyan text-gray-900 dark:text-white pl-12 pr-4 py-3 rounded-xl outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan text-black py-4 rounded-xl font-bold hover:bg-white dark:bg-gray-900 dark:hover:bg-gray-800 dark:hover:text-white transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Creating Account...' : (
              <>
                Register <UserPlus size={20} />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

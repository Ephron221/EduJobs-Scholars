import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface GoogleButtonProps {
  onSuccess: (user: any) => void;
  role?: string;
  text?: string;
}

const GoogleButton: React.FC<GoogleButtonProps> = ({ onSuccess, role = 'student', text = 'Continue with Google' }) => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const loadingToast = toast.loading('Authenticating with Google...');
      try {
        // In useGoogleLogin (implicit flow), we get an access_token. 
        // We need to fetch user info from Google or send the token to our backend.
        // Our backend is currently expecting an idToken (Auth Code flow).
        // Let's use the 'auth-code' flow for consistency with the backend.
        
        // Actually, let's keep it simple. If we want to use the backend's verifyIdToken, 
        // we should ideally use the standard GoogleLogin component. 
        // But since that's failing, we'll use a better-styled version of it.
      } catch (error) {
        toast.error('Google Auth Failed');
      } finally {
        toast.dismiss(loadingToast);
      }
    },
    flow: 'auth-code', // This gives us a code to exchange on the backend
  });

  return (
    <motion.button
      whileHover={{ scale: 1.02, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => login()}
      className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 py-3.5 rounded-2xl font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {text}
    </motion.button>
  );
};

export default GoogleButton;

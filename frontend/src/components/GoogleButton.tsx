import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';
import toast from 'react-hot-toast';

interface GoogleButtonProps {
  onSuccess: (user: any) => void;
  role?: string;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}

const GoogleButton: React.FC<GoogleButtonProps> = ({ onSuccess, role = 'student', text = 'continue_with' }) => {
  const handleSuccess = async (credentialResponse: any) => {
    const loadingToast = toast.loading('Authenticating with Google...');
    try {
      const res = await api.post('/auth/google-login', {
        idToken: credentialResponse.credential,
        role,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Signed in with Google! 🚀');
      onSuccess(res.data.user);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Google Auth Failed');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => toast.error('Google Sign-In failed')}
      theme="filled_black"
      shape="pill"
      logo_alignment="left"
      text={text}
    />
  );
};

export default GoogleButton;

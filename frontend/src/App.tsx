import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Public Pages
import HomePage from './pages/public/HomePage';
import UniversitiesPage from './pages/public/UniversitiesPage';
import UniversityDetailPage from './pages/public/UniversityDetailPage';
import JobsPage from './pages/public/JobsPage';
import GuidancePage from './pages/public/GuidancePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import AboutPage from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';
import ContactPage from './pages/public/ContactPage';
import ForgotPassword from './pages/public/ForgotPassword';
import VerifyOTP from './pages/public/VerifyOTP';
import ResetPassword from './pages/public/ResetPassword';
import VerifyAccount from './pages/public/VerifyAccount';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import SavedOpportunities from './pages/student/SavedOpportunities';
import ApplicationTracker from './pages/student/ApplicationTracker';
import StudentNotifications from './pages/student/StudentNotifications';
import StudentProfile from './pages/student/StudentProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUniversities from './pages/admin/ManageUniversities';
import ManagePrograms from './pages/admin/ManagePrograms';
import ManageJobs from './pages/admin/ManageJobs';
import StudentRecords from './pages/admin/StudentRecords';
import AssistanceRequests from './pages/admin/AssistanceRequests';
import ManageUsers from './pages/admin/ManageUsers';
import GuidanceAdmin from './pages/admin/GuidanceAdmin';
import Announcements from './pages/admin/Announcements';
import ManageServices from './pages/admin/ManageServices';
import ContactMessages from './pages/admin/ContactMessages';
import AdminProfile from './pages/admin/AdminProfile';
import HeroImages from './pages/admin/HeroImages';
import SuccessStories from './pages/admin/SuccessStories';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import UnifiedChat from './components/UnifiedChat';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const ProtectedRoute = ({ children, adminOnly = false, assistantAllowed = false }: { children: React.ReactNode; adminOnly?: boolean; assistantAllowed?: boolean }) => {
  const { isAuthenticated, isAdmin, isAssistant, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const isStaff = isAdmin || isAssistant;

  if (adminOnly) {
    if (isAdmin) return <>{children}</>;
    if (assistantAllowed && isAssistant) return <>{children}</>;
    return <Navigate to="/dashboard" replace />;
  }

  // Prevent staff from accessing student dashboard
  if (!adminOnly && isStaff && window.location.pathname.startsWith('/dashboard')) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/universities" element={<PublicLayout><UniversitiesPage /></PublicLayout>} />
      <Route path="/universities/:id" element={<PublicLayout><UniversityDetailPage /></PublicLayout>} />
      <Route path="/jobs" element={<PublicLayout><JobsPage /></PublicLayout>} />
      <Route path="/guidance" element={<PublicLayout><GuidancePage /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-account" element={<VerifyAccount />} />

      {/* Student Dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/saved" element={<ProtectedRoute><SavedOpportunities /></ProtectedRoute>} />
      <Route path="/dashboard/applications" element={<ProtectedRoute><ApplicationTracker /></ProtectedRoute>} />
      <Route path="/dashboard/notifications" element={<ProtectedRoute><StudentNotifications /></ProtectedRoute>} />
      <Route path="/dashboard/profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />

      {/* Admin & Assistant Shared Routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly assistantAllowed><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute adminOnly assistantAllowed><AdminProfile /></ProtectedRoute>} />
      <Route path="/admin/assistance-requests" element={<ProtectedRoute adminOnly assistantAllowed><AssistanceRequests /></ProtectedRoute>} />
      <Route path="/admin/student-records" element={<ProtectedRoute adminOnly assistantAllowed><StudentRecords /></ProtectedRoute>} />
      <Route path="/admin/universities" element={<ProtectedRoute adminOnly assistantAllowed><ManageUniversities /></ProtectedRoute>} />
      <Route path="/admin/jobs" element={<ProtectedRoute adminOnly assistantAllowed><ManageJobs /></ProtectedRoute>} />
      <Route path="/admin/messages" element={<ProtectedRoute adminOnly assistantAllowed><ContactMessages /></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute adminOnly assistantAllowed><Announcements /></ProtectedRoute>} />

      {/* Pure Admin Routes */}
      <Route path="/admin/services" element={<ProtectedRoute adminOnly><ManageServices /></ProtectedRoute>} />
      <Route path="/admin/programs" element={<ProtectedRoute adminOnly><ManagePrograms /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>} />
      <Route path="/admin/guidance" element={<ProtectedRoute adminOnly><GuidanceAdmin /></ProtectedRoute>} />
      <Route path="/admin/hero-images" element={<ProtectedRoute adminOnly><HeroImages /></ProtectedRoute>} />
      <Route path="/admin/success-stories" element={<ProtectedRoute adminOnly><SuccessStories /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <NotificationProvider>
              <div id="app-root" className="min-h-screen transition-colors duration-300">
                <AppRoutes />
                <UnifiedChat />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#1f2937',
                      color: '#f9fafb',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '14px',
                    },
                    success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                  }}
                />
              </div>
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

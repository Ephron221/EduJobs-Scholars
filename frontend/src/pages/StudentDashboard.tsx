import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Bookmark, 
  ClipboardList, 
  Bell, 
  User as UserIcon, 
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Application {
  _id: string;
  opportunityId: any;
  opportunityType: string;
  status: string;
  updatedAt: string;
}

const StudentDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const fetchApplications = async () => {
      try {
        const res = await api.get('/applications');
        setApplications(res.data);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted': return 'text-success bg-success/10 border-success/20';
      case 'Rejected': return 'text-danger bg-danger/10 border-danger/20';
      case 'Applied': return 'text-cyan bg-cyan/10 border-cyan/20';
      case 'Submitted': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 hidden md:flex flex-col p-6 sticky top-[73px] h-[calc(100vh-73px)]">
        <div className="space-y-2 flex-grow">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-cyan text-black' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-zinc-900'}`}
          >
            <LayoutDashboard size={20} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'saved' ? 'bg-cyan text-black' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-zinc-900'}`}
          >
            <Bookmark size={20} /> Saved Opportunities
          </button>
          <button 
            onClick={() => setActiveTab('applications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'applications' ? 'bg-cyan text-black' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-zinc-900'}`}
          >
            <ClipboardList size={20} /> Application Tracker
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'notifications' ? 'bg-cyan text-black' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-zinc-900'}`}
          >
            <Bell size={20} /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-cyan text-black' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-zinc-900'}`}
          >
            <UserIcon size={20} /> Profile
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all mt-auto"
        >
          <LogOut size={20} /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Hello, <span className="text-cyan">{user?.name}</span></h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back to your scholar dashboard.</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="bg-zinc-900 p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-cyan cursor-pointer transition-colors relative">
                 <Bell size={20} />
                 <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-black"></span>
               </div>
               <div className="w-10 h-10 bg-cyan rounded-full flex items-center justify-center font-bold text-black uppercase">
                 {user?.name?.charAt(0)}
               </div>
            </div>
          </header>

          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-950 border border-gray-800 p-6 rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-cyan/10 rounded-xl flex items-center justify-center">
                      <Bookmark className="text-cyan" size={24} />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Saved</span>
                  </div>
                  <div className="text-3xl font-bold">12</div>
                </div>
                <div className="bg-zinc-950 border border-gray-800 p-6 rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <Clock className="text-blue-500" size={24} />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Applied</span>
                  </div>
                  <div className="text-3xl font-bold">{applications.length}</div>
                </div>
                <div className="bg-zinc-950 border border-gray-800 p-6 rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="text-success" size={24} />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Success</span>
                  </div>
                  <div className="text-3xl font-bold">2</div>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-zinc-950 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                  <h3 className="font-bold">Recent Applications</h3>
                  <button onClick={() => setActiveTab('applications')} className="text-cyan text-sm font-bold flex items-center gap-1 hover:underline">
                    View Tracker <ChevronRight size={16} />
                  </button>
                </div>
                <div className="divide-y divide-gray-900">
                  {loading ? (
                    <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading...</div>
                  ) : applications.length > 0 ? (
                    applications.slice(0, 5).map(app => (
                      <div key={app._id} className="p-6 flex items-center justify-between hover:bg-zinc-900/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${app.opportunityType === 'Program' ? 'bg-cyan/10 text-cyan' : 'bg-purple-500/10 text-purple-500'}`}>
                            {app.opportunityType === 'Program' ? <GraduationCap size={20} /> : <Briefcase size={20} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{app.opportunityId?.name || app.opportunityId?.title || 'Unknown Opportunity'}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Last updated: {new Date(app.updatedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-gray-500 dark:text-gray-400">No applications yet. Start exploring!</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Application Tracker</h2>
              <div className="bg-zinc-950 border border-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-zinc-900/50 border-b border-gray-800">
                    <tr>
                      <th className="p-6 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Opportunity</th>
                      <th className="p-6 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Type</th>
                      <th className="p-6 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                      <th className="p-6 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Last Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900">
                    {applications.map(app => (
                      <tr key={app._id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="p-6">
                          <span className="font-bold text-sm">{app.opportunityId?.name || app.opportunityId?.title || 'Unknown'}</span>
                        </td>
                        <td className="p-6">
                          <span className="text-xs text-gray-600 dark:text-gray-400">{app.opportunityType}</span>
                        </td>
                        <td className="p-6">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-6">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(app.updatedAt).toLocaleDateString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Other tabs can be implemented similarly */}
          {(activeTab === 'saved' || activeTab === 'notifications' || activeTab === 'profile') && (
            <div className="flex flex-col items-center justify-center py-20 bg-zinc-950 border border-dashed border-gray-800 rounded-3xl">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="text-gray-600 dark:text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Under Development</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">The {activeTab} section is coming soon in Version 1.1</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Simple icon wrapper to avoid import errors if not already imported
const GraduationCap = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
);

const Briefcase = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
);

export default StudentDashboard;

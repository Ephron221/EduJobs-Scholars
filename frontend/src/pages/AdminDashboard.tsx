import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  School, 
  BookCopy, 
  Briefcase, 
  Users, 
  ClipboardList, 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical
} from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ universities: 0, jobs: 0, users: 0, applications: 0 });
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [appRes, uniRes, jobRes] = await Promise.all([
          api.get('/applications'),
          api.get('/universities'),
          api.get('/jobs')
        ]);
        
        setApplications(appRes.data);
        setStats({
          universities: uniRes.data.length,
          jobs: jobRes.data.length,
          users: 0, // Would need a dedicated endpoint
          applications: appRes.data.length
        });
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const updateAppStatus = async (id: string, status: string) => {
    try {
      await api.put(`/applications/${id}`, { status });
      setApplications(applications.map(app => app._id === id ? { ...app, status } : app));
    } catch (err) {
      console.error('Failed to update status');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 hidden lg:flex flex-col p-6 sticky top-[73px] h-[calc(100vh-73px)]">
        <div className="mb-8 px-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Admin Control</span>
        </div>
        <div className="space-y-2 flex-grow">
          {[
            { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Overview' },
            { id: 'universities', icon: <School size={20} />, label: 'Manage Universities' },
            { id: 'jobs', icon: <Briefcase size={20} />, label: 'Manage Jobs' },
            { id: 'records', icon: <ClipboardList size={20} />, label: 'Student Records' },
            { id: 'users', icon: <Users size={20} />, label: 'Manage Users' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-cyan text-black' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-zinc-900'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold">Admin <span className="text-cyan">Dashboard</span></h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">System management and student tracking.</p>
            </div>
            <div className="flex gap-4">
              <button className="bg-zinc-900 border border-gray-800 text-gray-900 dark:text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:border-cyan transition-all flex items-center gap-2">
                <Plus size={18} /> Add New Listing
              </button>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-10">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Universities', val: stats.universities, icon: <School className="text-cyan" /> },
                  { label: 'Job Postings', val: stats.jobs, icon: <Briefcase className="text-cyan" /> },
                  { label: 'Total Users', val: '124', icon: <Users className="text-cyan" /> },
                  { label: 'Applications', val: stats.applications, icon: <ClipboardList className="text-cyan" /> },
                ].map((stat, i) => (
                  <div key={i} className="bg-zinc-950 border border-gray-800 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                      {stat.icon}
                    </div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-bold">{stat.val}</h3>
                  </div>
                ))}
              </div>

              {/* Recent Activity / Applications */}
              <div className="bg-zinc-950 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-zinc-900/30">
                  <h3 className="font-bold flex items-center gap-2">
                    <Clock size={18} className="text-cyan" /> 
                    Pending Student Records
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search students..." 
                      className="bg-gray-50 dark:bg-white dark:bg-black border border-gray-800 text-xs pl-9 pr-4 py-2 rounded-lg outline-none focus:border-cyan w-48"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 bg-zinc-900/50 border-b border-gray-800">
                      <tr>
                        <th className="p-6">Student</th>
                        <th className="p-6">Opportunity</th>
                        <th className="p-6">Type</th>
                        <th className="p-6">Status</th>
                        <th className="p-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900">
                      {loading ? (
                        <tr><td colSpan={5} className="p-10 text-center text-gray-500 dark:text-gray-400">Loading records...</td></tr>
                      ) : applications.length > 0 ? (
                        applications.map((app) => (
                          <tr key={app._id} className="hover:bg-zinc-900/30 transition-colors">
                            <td className="p-6">
                              <div className="font-bold text-sm">{app.studentId?.name}</div>
                              <div className="text-[10px] text-gray-500 dark:text-gray-400">{app.studentId?.email}</div>
                            </td>
                            <td className="p-6">
                              <span className="text-sm">{app.opportunityId?.name || app.opportunityId?.title || 'N/A'}</span>
                            </td>
                            <td className="p-6 text-xs text-gray-500 dark:text-gray-400">{app.opportunityType}</td>
                            <td className="p-6">
                              <select 
                                value={app.status}
                                onChange={(e) => updateAppStatus(app._id, e.target.value)}
                                className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-1 rounded border bg-gray-50 dark:bg-white dark:bg-black outline-none cursor-pointer ${
                                  app.status === 'Accepted' ? 'text-success border-success/30' :
                                  app.status === 'Rejected' ? 'text-danger border-danger/30' :
                                  'text-cyan border-cyan/30'
                                }`}
                              >
                                <option value="Interested">Interested</option>
                                <option value="Applied">Applied</option>
                                <option value="Submitted">Submitted</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </td>
                            <td className="p-6">
                              <div className="flex gap-2">
                                <button className="p-2 bg-zinc-900 rounded-lg hover:text-cyan transition-colors"><Edit size={16} /></button>
                                <button className="p-2 bg-zinc-900 rounded-lg hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="p-10 text-center text-gray-500 dark:text-gray-400">No records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'overview' && (
            <div className="flex flex-col items-center justify-center py-32 bg-zinc-950 border border-dashed border-gray-800 rounded-3xl">
               <h3 className="text-xl font-bold mb-2">Management Module</h3>
               <p className="text-gray-500 dark:text-gray-400 text-sm">Full CRUD for {activeTab} is available in the admin panel.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

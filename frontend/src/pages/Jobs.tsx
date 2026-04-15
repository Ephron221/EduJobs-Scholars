import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Calendar, ExternalLink, Filter, Tag, Bookmark, BookmarkCheck } from 'lucide-react';
import api from '../services/api';

interface Job {
  _id: string;
  title: string;
  company: string;
  type: 'job' | 'internship' | 'volunteering';
  requirements: string;
  deadline: string;
  link: string;
  location: string;
  postedAt: string;
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const fetchData = async () => {
      try {
        const [jobsRes, savedRes] = await Promise.all([
          api.get('/jobs'),
          token ? api.get('/users/saved') : Promise.resolve({ data: [] })
        ]);
        
        setJobs(jobsRes.data);
        if (token) {
          setSavedIds(savedRes.data.map((item: any) => item.opportunityId?._id));
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleSave = async (jobId: string) => {
    if (!isLoggedIn) {
      alert('Please login to save opportunities');
      return;
    }

    try {
      if (savedIds.includes(jobId)) {
        await api.delete(`/users/save/${jobId}`);
        setSavedIds(prev => prev.filter(id => id !== jobId));
      } else {
        await api.post('/users/save', { opportunityId: jobId, opportunityType: 'Job' });
        setSavedIds(prev => [...prev, jobId]);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.requirements.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || job.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'job': return 'text-cyan border-cyan/30 bg-cyan/5';
      case 'internship': return 'text-gray-900 dark:text-white border-white/30 bg-white dark:bg-gray-900/5';
      case 'volunteering': return 'text-gray-600 dark:text-gray-400 border-gray-400/30 bg-gray-400/5';
      default: return 'text-gray-600 dark:text-gray-400 border-gray-400/30 bg-gray-400/5';
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-white dark:bg-black min-h-screen pt-12 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Career <span className="text-cyan">Opportunities</span></h1>
          <p className="text-gray-600 dark:text-gray-400">Discover internships, entry-level roles, and volunteering positions across the region.</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-zinc-950 border border-gray-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search job titles, companies, or skills..."
              className="w-full bg-gray-50 dark:bg-white dark:bg-black border border-gray-800 focus:border-cyan text-gray-900 dark:text-white pl-12 pr-4 py-3 rounded-xl outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="text-gray-500 dark:text-gray-400" size={20} />
            <select 
              className="bg-gray-50 dark:bg-white dark:bg-black border border-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:border-cyan"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="job">Jobs</option>
              <option value="internship">Internships</option>
              <option value="volunteering">Volunteering</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <div key={job._id} className="group bg-zinc-950 border border-gray-800 p-6 rounded-2xl hover:border-cyan transition-all duration-300 relative">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center border border-gray-800 group-hover:border-cyan/50 transition-colors shrink-0">
                        <Briefcase className="text-cyan" size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold group-hover:text-cyan transition-colors">{job.title}</h3>
                          <button 
                            onClick={() => toggleSave(job._id)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              savedIds.includes(job._id) 
                              ? 'bg-cyan border-cyan text-black' 
                              : 'bg-black/40 border-gray-700 text-gray-900 dark:text-white hover:border-cyan'
                            }`}
                          >
                            {savedIds.includes(job._id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1.5"><Tag size={14} className="text-cyan" /> {job.company}</span>
                          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-cyan" /> {job.location}</span>
                          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getTypeColor(job.type)}`}>
                            {job.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="hidden lg:block">
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Deadline</div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Calendar size={14} className="text-red-500" />
                          {new Date(job.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      <a 
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-50 dark:bg-white dark:bg-black border border-cyan text-cyan hover:bg-cyan hover:text-black px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                      >
                        Apply Now <ExternalLink size={18} />
                      </a>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-900">
                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                      {job.requirements}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-zinc-950 rounded-2xl border border-dashed border-gray-800">
                <p className="text-gray-500 dark:text-gray-400">No opportunities found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;

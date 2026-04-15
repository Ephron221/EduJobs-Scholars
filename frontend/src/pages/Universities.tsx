import React, { useState, useEffect } from 'react';
import { Search, MapPin, ExternalLink, GraduationCap, Filter, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react';
import api from '../services/api';

interface University {
  _id: string;
  name: string;
  country: string;
  website: string;
  description: string;
  logoUrl?: string;
}

const Universities = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('All');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const fetchData = async () => {
      try {
        const [uniRes, savedRes] = await Promise.all([
          api.get('/universities'),
          token ? api.get('/users/saved') : Promise.resolve({ data: [] })
        ]);
        
        setUniversities(uniRes.data);
        if (token) {
          setSavedIds(savedRes.data.map((item: any) => item.opportunityId?._id));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleSave = async (uniId: string) => {
    if (!isLoggedIn) {
      alert('Please login to save opportunities');
      return;
    }

    try {
      if (savedIds.includes(uniId)) {
        await api.delete(`/users/save/${uniId}`);
        setSavedIds(prev => prev.filter(id => id !== uniId));
      } else {
        await api.post('/users/save', { opportunityId: uniId, opportunityType: 'University' });
        setSavedIds(prev => [...prev, uniId]);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const filteredUniversities = universities.filter(uni => {
    const matchesSearch = uni.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          uni.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCountry === 'All' || uni.country === filterCountry;
    return matchesSearch && matchesFilter;
  });

  const countries = ['All', ...Array.from(new Set(universities.map(uni => uni.country)))];

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen pt-12 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-4">Explore <span className="text-cyan">Universities</span></h1>
            <p className="text-gray-600 dark:text-gray-400">Discover academic programs and institutions that match your career goals.</p>
          </div>
          <div className="bg-cyan/10 border border-cyan/20 px-4 py-2 rounded-xl text-cyan text-xs font-bold">
            {filteredUniversities.length} Institutions Found
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-zinc-950 border border-gray-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or keyword..."
              className="w-full bg-gray-50 dark:bg-black border border-gray-800 focus:border-cyan text-gray-900 dark:text-white pl-12 pr-4 py-3 rounded-xl outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="text-gray-500 dark:text-gray-400" size={20} />
            <select 
              className="bg-gray-50 dark:bg-black border border-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:border-cyan"
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
            >
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredUniversities.length > 0 ? (
              filteredUniversities.map(uni => (
                <div key={uni._id} className="group bg-zinc-950 border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan transition-all duration-300 flex flex-col">
                  <div className="h-48 bg-zinc-900 flex items-center justify-center p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {uni.logoUrl ? (
                      <img src={uni.logoUrl} alt={uni.name} className="max-h-full max-w-full object-contain relative z-10" />
                    ) : (
                      <GraduationCap size={60} className="text-gray-700 dark:text-gray-300 relative z-10" />
                    )}
                    <div className="absolute top-4 left-4 z-20">
                      <button 
                        onClick={() => toggleSave(uni._id)}
                        className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                          savedIds.includes(uni._id) 
                          ? 'bg-cyan border-cyan text-black' 
                          : 'bg-black/40 border-gray-700 text-gray-900 dark:text-white hover:border-cyan'
                        }`}
                      >
                        {savedIds.includes(uni._id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                      </button>
                    </div>
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-gray-800 text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1 z-20">
                      <MapPin size={12} /> {uni.country}
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-cyan transition-colors">{uni.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-6 flex-grow">
                      {uni.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-900">
                      <a 
                        href={uni.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 text-sm font-medium transition-colors"
                      >
                        Visit Website <ExternalLink size={14} />
                      </a>
                      <button className="bg-cyan text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-white dark:bg-gray-900 dark:hover:bg-gray-800 dark:hover:text-white transition-all flex items-center gap-1">
                        View Programs <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-zinc-950 rounded-2xl border border-dashed border-gray-800">
                <p className="text-gray-500 dark:text-gray-400">No universities found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Universities;

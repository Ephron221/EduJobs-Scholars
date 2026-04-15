import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, Briefcase, ArrowRight, CheckCircle, Globe, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ universities: 0, jobs: 0, users: 0 });

  useEffect(() => {
    // In a real app, these would come from an API endpoint
    setStats({ universities: 15, jobs: 42, users: 150 });
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-black text-gray-900 dark:text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cyan/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-cyan/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-cyan/30 bg-cyan/5 text-cyan text-sm font-medium mb-8">
            <Zap size={16} className="mr-2" />
            <span>Empowering Rwanda's Next Generation</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-tight">
            Your Future <span className="text-cyan">Starts Here.</span>
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
            The centralized platform connecting Rwandan graduates with global university admissions and career-defining job opportunities.
          </p>

          <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-4 mb-16">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search universities, jobs, or programs..."
                className="w-full bg-gray-900/50 border border-gray-800 focus:border-cyan text-gray-900 dark:text-white pl-12 pr-4 py-4 rounded-xl outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-cyan text-black px-8 py-4 rounded-xl font-bold hover:bg-white dark:bg-gray-900 dark:hover:bg-gray-800 dark:hover:text-white transition-all flex items-center justify-center gap-2">
              Explore Now <ArrowRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto border-t border-gray-900 pt-12">
            <div>
              <div className="text-3xl font-bold text-cyan">{stats.universities}+</div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">Partner Universities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan">{stats.jobs}+</div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">Active Job Listings</div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="text-3xl font-bold text-cyan">{stats.users}+</div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">Registered Scholars</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories / Modules Section */}
      <section className="py-20 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-4">Choose Your Path</h2>
              <p className="text-gray-600 dark:text-gray-400">Whether you're looking for higher education or your first career step.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* University Card */}
            <div className="group relative bg-gray-50 dark:bg-black border border-gray-800 p-8 rounded-2xl hover:border-cyan transition-all duration-500 overflow-hidden">
              <div className="absolute -right-8 -bottom-8 text-gray-900 dark:text-white opacity-20 group-hover:text-cyan group-hover:opacity-10 transition-all duration-500">
                <GraduationCap size={200} />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-cyan/10 text-cyan rounded-xl flex items-center justify-center mb-6">
                  <GraduationCap size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">University Admissions</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                  Browse local and international universities, check entry requirements, and never miss an application deadline.
                </p>
                <Link to="/universities" className="inline-flex items-center text-cyan font-bold group-hover:gap-3 transition-all">
                  Find Universities <ArrowRight size={18} className="ml-2" />
                </Link>
              </div>
            </div>

            {/* Job Card */}
            <div className="group relative bg-gray-50 dark:bg-black border border-gray-800 p-8 rounded-2xl hover:border-cyan transition-all duration-500 overflow-hidden">
              <div className="absolute -right-8 -bottom-8 text-gray-900 dark:text-white opacity-20 group-hover:text-cyan group-hover:opacity-10 transition-all duration-500">
                <Briefcase size={200} />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-cyan/10 text-cyan rounded-xl flex items-center justify-center mb-6">
                  <Briefcase size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Career Opportunities</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                  Discover entry-level jobs, internships, and volunteering placements tailored for secondary school and university graduates.
                </p>
                <Link to="/jobs" className="inline-flex items-center text-cyan font-bold group-hover:gap-3 transition-all">
                  Find Opportunities <ArrowRight size={18} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why EduJobs Scholars?</h2>
            <div className="h-1 w-20 bg-cyan mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
                <CheckCircle className="text-cyan" size={30} />
              </div>
              <h4 className="text-xl font-bold mb-3">Accurate Data</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Verified information direct from institutions and employers.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
                <Globe className="text-cyan" size={30} />
              </div>
              <h4 className="text-xl font-bold mb-3">Centralized Access</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Everything you need in one digital dashboard, accessible anywhere.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
                <Search className="text-cyan" size={30} />
              </div>
              <h4 className="text-xl font-bold mb-3">Expert Guidance</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Professional advice and step-by-step application walkthroughs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-cyan to-blue-500 rounded-3xl p-12 text-center text-black">
          <h2 className="text-4xl font-black mb-6">Ready to secure your future?</h2>
          <p className="text-black/80 text-xl font-medium mb-10 max-w-xl mx-auto">
            Join thousands of Rwandan students already using EduJobs to find their next big opportunity.
          </p>
          <Link to="/register" className="inline-block bg-gray-50 dark:bg-black text-gray-900 dark:text-white px-10 py-4 rounded-xl font-bold hover:scale-105 transition-all">
            Create Your Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

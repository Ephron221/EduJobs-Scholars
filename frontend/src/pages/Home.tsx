import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, Briefcase, ArrowRight, CheckCircle, Globe, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ universities: 0, jobs: 0, users: 0 });
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);

  const services = [
    {
      title: 'Job Opportunities',
      icon: Briefcase,
      description: 'Discover entry-level jobs, internships, and career opportunities tailored for graduates.',
      color: 'from-blue-500 to-cyan',
      link: '/jobs'
    },
    {
      title: 'Scholarship Applications',
      icon: GraduationCap,
      description: 'Access local and international scholarship opportunities with personalized guidance.',
      color: 'from-purple-500 to-pink-500',
      link: '/universities'
    },
    {
      title: 'Online Services',
      icon: Globe,
      description: 'Complete all your applications and services through our centralized digital platform.',
      color: 'from-green-500 to-emerald-500',
      link: '/services'
    }
  ];

  useEffect(() => {
    setStats({ universities: 150, jobs: 500, users: 10000 });
  }, []);

  useEffect(() => {
    const numServices = 3;
    const interval = setInterval(() => {
      setCurrentServiceIndex((prev) => (prev + 1) % numServices);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-black text-gray-900 dark:text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-32 px-6 overflow-hidden min-h-screen flex items-center">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cyan/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-cyan/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Rotating Service Content */}
            <div className="h-full flex flex-col justify-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-cyan/30 bg-cyan/5 text-cyan text-sm font-medium mb-8 w-fit">
                <Zap size={16} className="mr-2" />
                <span>Gateway to Opportunities</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-6 leading-tight">
                Welcome to <span className="text-cyan">EduJobs Scholars 🚀</span>
              </h1>

              {/* Rotating Service Display */}
              <div className="relative h-48 mb-8">
                {services.map((service, index) => {
                  const ServiceIcon = service.icon;
                  const isActive = index === currentServiceIndex;
                  
                  return (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-700 ${
                        isActive
                          ? 'opacity-100 translate-y-0 visible'
                          : 'opacity-0 translate-y-10 invisible'
                      }`}
                    >
                      <div className={`bg-gradient-to-br ${service.color} rounded-2xl p-8 text-white shadow-lg`}>
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <ServiceIcon size={40} />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold mb-2">{service.title}</h2>
                            <p className="text-white/90">{service.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Carousel Indicators */}
              <div className="flex gap-2 mb-8">
                {services.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentServiceIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentServiceIndex
                        ? 'bg-cyan w-8'
                        : 'bg-gray-400 dark:bg-gray-600 w-2'
                    }`}
                    aria-label={`Go to service ${index + 1}`}
                  />
                ))}
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-lg">
                The centralized platform connecting Rwandan graduates with global university admissions and career-defining opportunities.
              </p>

              <div className="max-w-lg flex flex-col sm:flex-row gap-4">
                <Link
                  to={services[currentServiceIndex].link}
                  className="bg-cyan text-black px-8 py-4 rounded-xl font-bold hover:bg-white transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none"
                >
                  Explore <ArrowRight size={20} />
                </Link>
                <Link
                  to="/register"
                  className="border-2 border-cyan text-cyan px-8 py-4 rounded-xl font-bold hover:bg-cyan/10 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none"
                >
                  Get Started
                </Link>
              </div>
            </div>

            {/* Right Side - Large Rotating Icon Display */}
            <div className="hidden md:flex items-center justify-center relative h-full">
              <div className="relative w-full aspect-square max-w-md">
                {/* Background circle */}
                <div className="absolute inset-0 rounded-full border-4 border-cyan/20 flex items-center justify-center">
                  {/* Inner rotating service icons */}
                  {services.map((service, index) => {
                    const ServiceIcon = service.icon;
                    const angle = (index * 360) / services.length;
                    const distance = 140;
                    const x = distance * Math.cos((angle * Math.PI) / 180);
                    const y = distance * Math.sin((angle * Math.PI) / 180);
                    const isActive = index === currentServiceIndex;

                    return (
                      <div
                        key={index}
                        className="absolute w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-700"
                        style={{
                          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                          left: '50%',
                          top: '50%',
                        }}
                      >
                        <div
                          className={`w-full h-full rounded-2xl flex items-center justify-center font-bold text-white text-2xl transition-all duration-700 ${
                            isActive
                              ? `bg-gradient-to-br ${service.color} scale-110 shadow-lg`
                              : 'bg-gray-700/50 scale-90 opacity-60'
                          }`}
                        >
                          <ServiceIcon size={48} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Center circle with main icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-cyan to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
                    <span className="text-white font-extrabold text-3xl">EJ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl border-t border-gray-900 pt-12 mt-12">
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

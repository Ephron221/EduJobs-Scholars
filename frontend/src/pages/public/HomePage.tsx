import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Briefcase, Users, Search, BookOpen, ChevronDown, Star, Globe, Zap } from 'lucide-react';
import { universityAPI, jobAPI } from '../../api';
import UniversityCard from '../../components/UniversityCard';
import JobCard from '../../components/JobCard';
import Loader from '../../components/Loader';

const Counter = ({ end, suffix = '' }: { end: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = end / 50;
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 30);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>;
};

export default function HomePage() {
  const [universities, setUniversities] = useState<never[]>([]);
  const [jobs, setJobs] = useState<never[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState('all');
  const particlesRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, jRes] = await Promise.all([
          universityAPI.getAll({ featured: 'true', limit: 6 }),
          jobAPI.getAll({ featured: 'true', limit: 6 }),
        ]);
        setUniversities(uRes.data.universities);
        setJobs(jRes.data.jobs);
      } catch { /* show empty */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Particle canvas animation
  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6,182,212,${p.opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    if (searchType === 'universities' || searchType === 'all') {
      window.location.href = `/universities?search=${encodeURIComponent(search)}`;
    } else {
      window.location.href = `/jobs?search=${encodeURIComponent(search)}`;
    }
  };

  const stats = [
    { icon: <GraduationCap size={24} />, label: 'Universities', value: 150, suffix: '+' },
    { icon: <Briefcase size={24} />, label: 'Opportunities', value: 500, suffix: '+' },
    { icon: <Users size={24} />, label: 'Students Helped', value: 10000, suffix: '+' },
    { icon: <Globe size={24} />, label: 'Countries', value: 20, suffix: '+' },
  ];

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Particle canvas background */}
        <canvas ref={particlesRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-40" />

        {/* Radial gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/50 via-gray-50 to-gray-50 dark:from-cyan-950/20 dark:via-black dark:to-black pointer-events-none transition-colors duration-500" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 page-container text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-8 animate-fade-in">
            <Star size={14} className="animate-pulse" />
            Connecting Rwanda's Best Students to Global Opportunities
            <Star size={14} className="animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-none animate-slide-up">
            Your Future
            <br />
            <span className="gradient-text">Starts Here</span>
          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up animation-delay-200">
            Discover universities, scholarships, and career opportunities. 
            We connect Rwandan school graduates with opportunities across Africa and beyond.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10 animate-slide-up animation-delay-300">
            <div className="flex flex-col sm:flex-row gap-2 glass-card p-2 border-cyan-500/20">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="bg-white dark:bg-gray-900/50 dark:bg-white dark:bg-gray-900/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="all">All</option>
                <option value="universities">Universities</option>
                <option value="jobs">Jobs</option>
              </select>
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search universities, programs, jobs..."
                  className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pl-9 pr-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
              <button type="submit" className="btn-primary whitespace-nowrap flex items-center gap-2 py-2.5">
                <Search size={14} /> Search
              </button>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-slide-up animation-delay-500">
            <Link to="/universities" className="btn-primary flex items-center gap-2 text-base px-8 py-3.5">
              <GraduationCap size={18} /> Explore Universities
            </Link>
            <Link to="/jobs" className="btn-secondary flex items-center gap-2 text-base px-8 py-3.5">
              <Briefcase size={18} /> Find Opportunities
            </Link>
          </div>

          {/* Scroll down hint */}
          <div className="mt-20 flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400 animate-bounce">
            <span className="text-xs">Scroll to explore</span>
            <ChevronDown size={16} />
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/10 via-transparent to-cyan-950/10 pointer-events-none" />
        <div className="page-container">
          <div className="glass-card border-cyan-500/20 p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto mb-3 group-hover:bg-cyan-500/20 transition-all group-hover:scale-110 duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-black text-gray-900 dark:text-white mb-1 gradient-text">
                    <Counter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED UNIVERSITIES */}
      <section className="py-16">
        <div className="page-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-2">
                <GraduationCap size={16} /> Featured Universities
              </div>
              <h2 className="section-title">Top Institutions</h2>
              <p className="section-subtitle">Explore leading universities from Rwanda and around the world</p>
            </div>
            <Link to="/universities" className="btn-secondary text-sm flex items-center gap-2 hidden sm:flex">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? <Loader /> : (
            <>
              {universities.length === 0 ? (
                <div className="text-center py-16 glass-card">
                  <GraduationCap size={48} className="text-gray-700 dark:text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No universities added yet. Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {universities.map((uni: never) => (
                    // @ts-ignore
                    <UniversityCard key={uni._id} university={uni} />
                  ))}
                </div>
              )}
              <div className="text-center mt-8 sm:hidden">
                <Link to="/universities" className="btn-secondary">View All Universities →</Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-16">
        <div className="page-container">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm font-medium mb-2">
              <Zap size={16} /> Why EduJobs Scholars?
            </div>
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle mx-auto">A complete platform to guide your journey from school to career</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <GraduationCap size={28} />, title: 'University Discovery', desc: 'Browse hundreds of universities in Rwanda and internationally with complete program details, requirements, and deadlines.' },
              { icon: <Briefcase size={28} />, title: 'Job Opportunities', desc: 'Find entry-level jobs, internships, volunteering, and government programs tailored for recent school graduates.' },
              { icon: <BookOpen size={28} />, title: 'Career Guidance', desc: 'Access CV writing guides, interview tips, university application tutorials, and expert career development resources.' },
              { icon: <Search size={28} />, title: 'Smart Search', desc: 'Quickly find what you need with real-time search and powerful filters by country, field, type, and more.' },
              { icon: <Star size={28} />, title: 'Application Tracking', desc: 'Save opportunities to your personal shortlist and track every application from Interest to Acceptance.' },
              { icon: <Users size={28} />, title: 'Admin-Supported', desc: 'Dedicated admins keep all information accurate and up-to-date, and personally track your application progress.' },
            ].map((feature, i) => (
              <div key={i} className="glass-card-hover p-6 group">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST JOBS */}
      <section className="py-16">
        <div className="page-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-2">
                <Briefcase size={16} /> Latest Opportunities
              </div>
              <h2 className="section-title">Jobs & Internships</h2>
              <p className="section-subtitle">Fresh opportunities posted by our admin team</p>
            </div>
            <Link to="/jobs" className="btn-secondary text-sm flex items-center gap-2 hidden sm:flex">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? <Loader /> : (
            <>
              {jobs.length === 0 ? (
                <div className="text-center py-16 glass-card">
                  <Briefcase size={48} className="text-gray-700 dark:text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No job listings yet. Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {jobs.map((job: never) => (
                    // @ts-ignore
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16">
        <div className="page-container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-50 to-gray-100 dark:from-cyan-950 dark:to-gray-950 border border-cyan-200 dark:border-cyan-500/20 p-12 text-center transition-colors duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
                Ready to Shape Your Future?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of students using EduJobs Scholars to find their path to success.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/register" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2">
                  <Users size={18} /> Create Free Account
                </Link>
                <Link to="/guidance" className="btn-secondary text-base px-8 py-3.5 flex items-center gap-2">
                  <BookOpen size={18} /> Explore Guidance
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

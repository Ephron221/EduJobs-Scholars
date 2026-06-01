import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Briefcase, Users, Search, BookOpen, ChevronDown, Star, Globe, Zap, Calendar, MapPin, Clock } from 'lucide-react';
import { universityAPI, jobAPI, programAPI, heroImageAPI, successStoryAPI } from '../../api';
import UniversityCard from '../../components/UniversityCard';
import JobCard from '../../components/JobCard';
import Loader from '../../components/Loader';

type HeroImage = {
  imageUrl: string;
  altText?: string;
};

const TypewriterHeadline = () => {
  const lines = ['Your Future', 'Starts Here'];
  const fullText = lines.join('\n');
  const [visibleText, setVisibleText] = useState('');

  useEffect(() => {
    let index = 0;
    let pauseTicks = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setVisibleText(fullText.slice(0, index));
        index += 1;
        return;
      }

      pauseTicks += 1;
      if (pauseTicks > 16) {
        index = 0;
        pauseTicks = 0;
        setVisibleText('');
      }
    }, 95);

    return () => clearInterval(timer);
  }, [fullText]);

  const [firstLine = '', secondLine = ''] = visibleText.split('\n');

  return (
    <h1 className="text-5xl font-black leading-none tracking-normal text-gray-900 sm:text-6xl lg:text-7xl dark:text-white animate-slide-up" aria-label="Your Future Starts Here">
      <span className="hero-type-highlight">{firstLine || '\u00A0'}</span>
      <br />
      <span className="hero-type-highlight">{secondLine || '\u00A0'}</span>
      <span className="hero-type-cursor" aria-hidden="true" />
    </h1>
  );
};

const Counter = ({ end, suffix = '', repeat = false }: { end: number; suffix?: string; repeat?: boolean }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let restartTimer: ReturnType<typeof setTimeout> | undefined;

    const runCounter = () => {
      let start = 0;
      setCount(0);
      const step = Math.max(1, end / 50);
      timer = setInterval(() => {
        start += step;
        if (start >= end) {
          setCount(end);
          if (timer) clearInterval(timer);
          if (repeat) {
            restartTimer = setTimeout(() => runCounter(), 1800);
          }
        } else {
          setCount(Math.floor(start));
        }
      }, 30);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        runCounter();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (timer) clearInterval(timer);
      if (restartTimer) clearTimeout(restartTimer);
    };
  }, [end, repeat]);

  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>;
};

export default function HomePage() {
  const [universities, setUniversities] = useState<never[]>([]);
  const [jobs, setJobs] = useState<never[]>([]);
  const [programs, setPrograms] = useState<never[]>([]);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [successStories, setSuccessStories] = useState<never[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const particlesRef = useRef<HTMLCanvasElement>(null);
  const heroIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, jRes, pRes, hRes, sRes] = await Promise.all([
          universityAPI.getAll({ featured: 'true', limit: 6 }),
          jobAPI.getAll({ featured: 'true', limit: 6 }),
          programAPI.getAll({ limit: 8 }),
          heroImageAPI.getAll(),
          successStoryAPI.getAll(),
        ]);
        setUniversities(uRes.data.universities);
        setJobs(jRes.data.jobs);
        setPrograms(pRes.data.programs);
        setHeroImages(hRes.data.images);
        setSuccessStories(sRes.data.stories);
      } catch { /* show empty */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Hero image carousel
  useEffect(() => {
    if (heroImages.length > 1) {
      heroIntervalRef.current = setInterval(() => {
        setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
      }, 5000);
    }
    return () => {
      if (heroIntervalRef.current) clearInterval(heroIntervalRef.current);
    };
  }, [heroImages.length]);
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
  ];

  const heroServices = [
    {
      label: 'Universities',
      description: 'Find institutions',
      icon: <GraduationCap size={34} />,
      className: 'hero-service-universities',
    },
    {
      label: 'Guidance',
      description: 'Career planning',
      icon: <BookOpen size={34} />,
      className: 'hero-service-guidance',
    },
    {
      label: 'Jobs',
      description: 'Career access',
      icon: <Briefcase size={34} />,
      className: 'hero-service-jobs',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-gray-50 pt-24 text-gray-900 dark:bg-black dark:text-white">
        {/* Hero Images Background */}
        {heroImages.length > 0 && (
          <div className="absolute inset-0">
            <img
              src={heroImages[currentHeroImage]?.imageUrl}
              alt={heroImages[currentHeroImage]?.altText || 'Hero Image'}
              className="w-full h-full object-cover opacity-10 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gray-50/90 dark:bg-black/90" />
          </div>
        )}

        {/* Particle canvas background */}
        <canvas ref={particlesRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-20" />

        <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/60 via-gray-50 to-gray-50 dark:from-cyan-950/20 dark:via-black dark:to-black pointer-events-none" />
        <div className="absolute left-1/2 top-24 h-[580px] w-[580px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white dark:to-gray-950 pointer-events-none" />

        <div className="relative z-10 page-container">
          <div className="grid min-h-[calc(100vh-120px)] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex justify-center lg:justify-start">
              <div className="hero-service-orbit" aria-label="EduJobs Scholars services">
                <div className="hero-service-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Welcome to</p>
                  <p className="mt-3 text-2xl font-black leading-tight text-gray-800">EduJobs Scholars</p>
                  <p className="mt-4 text-sm font-semibold leading-relaxed text-gray-600">
                    Your gateway to universities, guidance, jobs, and opportunities.
                  </p>
                </div>
                <div className="hero-service-path">
                  {heroServices.map((service) => (
                    <div key={service.label} className={`hero-service-node ${service.className}`}>
                      <div className="hero-service-node-inner">
                        {service.icon}
                        <span>{service.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pb-20 pt-4 text-center lg:text-left">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-700 backdrop-blur-sm animate-fade-in dark:text-cyan-300">
                <Star size={14} className="text-cyan-500" />
                Connecting Rwanda's best students to global opportunities
              </div>

              <TypewriterHeadline />

              <p className="mx-auto mt-8 max-w-2xl text-lg leading-9 text-gray-600 md:text-xl lg:mx-0 dark:text-gray-400 animate-slide-up animation-delay-200">
                Discover universities, scholarships, career opportunities, and practical guidance designed to help school graduates choose a path, prepare well, and move forward with confidence.
              </p>

              <form onSubmit={handleSearch} className="mx-auto mt-9 max-w-2xl animate-slide-up animation-delay-300 lg:mx-0">
                <div className="flex flex-col gap-2 rounded-2xl border border-cyan-500/20 bg-white p-2 shadow-xl shadow-cyan-100 sm:flex-row dark:bg-gray-900/80 dark:shadow-cyan-950/20">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">All</option>
                    <option value="universities">Universities</option>
                    <option value="jobs">Jobs</option>
                  </select>
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search universities, programs, jobs..."
                      className="w-full rounded-xl bg-transparent py-3 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="btn-primary flex items-center justify-center gap-2 rounded-xl py-3">
                    <Search size={14} /> Search
                  </button>
                </div>
              </form>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 animate-slide-up animation-delay-500 lg:justify-start">
                <Link to="/universities" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5">
                  <GraduationCap size={18} /> Explore Universities
                </Link>
                <Link to="/jobs" className="btn-secondary inline-flex items-center gap-2 px-7 py-3.5">
                  <Briefcase size={18} /> Find Opportunities
                </Link>
              </div>

              <div className="mt-14 grid grid-cols-3 gap-4 text-left sm:gap-8">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-black leading-none text-gray-900 md:text-5xl dark:text-white">
                      <Counter end={stat.value} suffix={stat.suffix} repeat />
                    </div>
                    <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500 sm:text-sm dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll down hint */}
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-gray-500 dark:text-gray-400 animate-bounce">
            <span className="text-xs">Scroll to explore</span>
            <ChevronDown size={16} />
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

      {/* SUCCESS STORIES */}
      <section className="py-16">
        <div className="page-container">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm font-medium mb-2">
              <Star size={16} /> Success Stories
            </div>
            <h2 className="section-title">Real Stories, Real Success</h2>
            <p className="section-subtitle mx-auto">Hear from students and workers who found their path through EduJobs Scholars</p>
          </div>
          {loading ? <Loader /> : (
            <>
              {successStories.length === 0 ? (
                <div className="text-center py-16 glass-card">
                  <Users size={48} className="text-gray-700 dark:text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Success stories coming soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {successStories.slice(0, 6).map((story: any) => (
                    <div key={story._id} className="glass-card-hover p-6 group">
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={story.profileImage}
                          alt={story.fullName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/20"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-base">{story.fullName}</h3>
                          <p className="text-cyan-400 text-sm">{story.type === 'student' ? 'Student' : 'Worker'}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 italic">
                        "{story.howTheyKnow}"
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {story.howHelped}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* AVAILABLE OPPORTUNITIES */}
      <section className="py-16">
        <div className="page-container">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm font-medium mb-2">
              <Calendar size={16} /> Available Opportunities
            </div>
            <h2 className="section-title">Scholarships & Programs</h2>
            <p className="section-subtitle mx-auto">Latest scholarships, internships, and programs with application deadlines</p>
          </div>
          {loading ? <Loader /> : (
            <>
              {programs.length === 0 ? (
                <div className="text-center py-16 glass-card">
                  <BookOpen size={48} className="text-gray-700 dark:text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No programs available yet. Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {programs.slice(0, 6).map((program: any) => (
                    <div key={program._id} className="glass-card-hover p-6 group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{program.title}</h3>
                          <p className="text-cyan-400 text-sm mb-2">{program.university?.name || 'Various Universities'}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              {program.location || 'Multiple Locations'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              {program.deadline ? new Date(program.deadline).toLocaleDateString() : 'Ongoing'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            program.type === 'scholarship' ? 'bg-green-500/10 text-green-400' :
                            program.type === 'internship' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-purple-500/10 text-purple-400'
                          }`}>
                            {program.type}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {program.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {program.fundingType === 'full' ? 'Full Scholarship' :
                           program.fundingType === 'partial' ? 'Partial Support' : 'Self-funded'}
                        </span>
                        <Link to={`/programs/${program._id}`} className="btn-secondary text-sm">
                          Learn More
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-center mt-8">
                <Link to="/programs" className="btn-primary">View All Opportunities →</Link>
              </div>
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

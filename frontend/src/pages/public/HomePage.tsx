import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, GraduationCap, Briefcase, Users, Search, BookOpen, ChevronDown, Star, Zap, Calendar, MapPin, Clock, X, ExternalLink, Code2, BookMarked, ChevronLeft, ChevronRight, Sparkles, MessageSquare, Heart, User, Quote, MessageCircle, Compass, Play, Pause, Maximize2, ZoomIn, ZoomOut, Eye, Globe } from 'lucide-react';
import { universityAPI, jobAPI, programAPI, heroImageAPI, successStoryAPI } from '../../api';
import UniversityCard from '../../components/UniversityCard';
import JobCard from '../../components/JobCard';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import { HeroImageItem } from '../../components/HeroCinemaShowcase';
import HeroImageMarquee from '../../components/HeroImageMarquee';
import { getAssetUrl } from '../../utils/assetUrl';
import clsx from 'clsx';

export type HeroImage = HeroImageItem;

interface SuccessStory {
  _id: string;
  fullName: string;
  type: string;
  profileImage: string;
  howTheyKnow: string;
  howHelped: string;
  createdAt: string;
}

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
    <h1 className="text-5xl font-black leading-none tracking-normal text-white sm:text-6xl lg:text-7xl animate-slide-up drop-shadow-2xl" aria-label="Your Future Starts Here">
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
  const [universities, setUniversities] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [showAmategekoPopup, setShowAmategekoPopup] = useState(false);
  const [showDevCard, setShowDevCard] = useState(false);
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);
  const [adSlide, setAdSlide] = useState(0);
  const adTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ads = [
    {
      id: 'portfolio',
      badge: 'Meet the Developer',
      title: "Ephron's Portfolio",
      desc: 'Explore the projects, skills, and story of the developer who built this platform.',
      cta: 'View Portfolio',
      href: 'https://ephron-protifolio.vercel.app/',
      accent: 'cyan' as const,
      icon: <Code2 size={28} />,
      label: 'EP',
      tags: ['Web Dev', 'Full Stack', 'React', 'Node.js'],
    },
    {
      id: 'amategeko',
      badge: 'Road Safety Platform',
      title: "Amategeko y'umuhanda",
      desc: 'Master Rwanda road laws, traffic signs, and ace your driving test with free practice tests.',
      cta: 'Visit Amategeko Hub',
      href: 'https://amategekohub.vercel.app',
      accent: 'orange' as const,
      icon: <BookMarked size={28} />,
      label: null,
      tags: ['Road Signs', 'Traffic Rules', 'Practice Tests', 'Free'],
    },
  ];

  useEffect(() => {
    adTimerRef.current = setInterval(() => setAdSlide((p) => (p + 1) % ads.length), 5000);
    return () => { if (adTimerRef.current) clearInterval(adTimerRef.current); };
  }, [ads.length]);

  const nextAd = () => { setAdSlide((p) => (p + 1) % ads.length); if (adTimerRef.current) { clearInterval(adTimerRef.current); adTimerRef.current = setInterval(() => setAdSlide((p) => (p + 1) % ads.length), 5000); } };
  const prevAd = () => { setAdSlide((p) => (p - 1 + ads.length) % ads.length); if (adTimerRef.current) { clearInterval(adTimerRef.current); adTimerRef.current = setInterval(() => setAdSlide((p) => (p + 1) % ads.length), 5000); } };

  useEffect(() => {
    const t = setTimeout(() => setShowAmategekoPopup(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const particlesRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, jRes, pRes, hRes, sRes] = await Promise.all([
          universityAPI.getAll({ limit: 50 }),
          jobAPI.getAll({ limit: 50 }),
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

  // Full-bleed video sliding background states
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [heroDirection, setHeroDirection] = useState(1);
  const [isHeroPlaying, setIsHeroPlaying] = useState(true);
  const [heroProgress, setHeroProgress] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [heroLightboxOpen, setHeroLightboxOpen] = useState(false);
  const [heroLightboxZoom, setHeroLightboxZoom] = useState(1);

  const defaultHeroSlides: HeroImageItem[] = [
    {
      _id: 'default-1',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=85',
      altText: 'Graduates Celebrating On Campus',
      category: 'Graduation',
      university: 'University of Rwanda',
      country: 'Rwanda',
    },
    {
      _id: 'default-2',
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=85',
      altText: 'University Campus & Academic Admissions',
      category: 'Application Open',
      university: 'East Africa University',
      country: 'Rwanda',
    },
    {
      _id: 'default-3',
      imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1920&q=85',
      altText: 'Career Guidance & Professional Opportunities',
      category: 'Opportunities',
      university: 'EduJobs Scholars',
      country: 'Global',
    },
  ];

  const activeHeroSlides = heroImages.length > 0 ? heroImages : defaultHeroSlides;

  // Auto-advance video-style sliding right to left
  const heroSlideDuration = 6500;
  const heroIntervalMs = 50;

  useEffect(() => {
    if (!isHeroPlaying || isHeroHovered || heroLightboxOpen || activeHeroSlides.length <= 1) {
      return;
    }

    const step = (heroIntervalMs / heroSlideDuration) * 100;
    const timer = setInterval(() => {
      setHeroProgress((prev) => {
        if (prev >= 100) {
          setHeroDirection(1); // Right to Left progression
          setCurrentHeroIndex((idx) => (idx + 1) % activeHeroSlides.length);
          return 0;
        }
        return prev + step;
      });
    }, heroIntervalMs);

    return () => clearInterval(timer);
  }, [isHeroPlaying, isHeroHovered, heroLightboxOpen, activeHeroSlides.length]);

  const nextHeroSlide = () => {
    setHeroDirection(1);
    setHeroProgress(0);
    setCurrentHeroIndex((prev) => (prev + 1) % activeHeroSlides.length);
  };

  const prevHeroSlide = () => {
    setHeroDirection(-1);
    setHeroProgress(0);
    setCurrentHeroIndex((prev) => (prev - 1 + activeHeroSlides.length) % activeHeroSlides.length);
  };

  const goToHeroSlide = (idx: number) => {
    setHeroDirection(idx > currentHeroIndex ? 1 : -1);
    setHeroProgress(0);
    setCurrentHeroIndex(idx);
  };

  const currentHeroSlide = activeHeroSlides[currentHeroIndex] || activeHeroSlides[0];

  // Smooth full-bleed slide animation from right to left
  const fullBleedSlideVariants: any = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 1,
    }),
    center: {
      x: '0%',
      opacity: 1,
      transition: {
        x: { duration: 1.3, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.3 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 1,
      transition: {
        x: { duration: 1.3, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.3 },
      },
    }),
  };

  const heroServices = [
    {
      label: 'Universities',
      description: 'Find institutions',
      icon: <GraduationCap size={34} />,
      className: 'hero-service-universities',
      path: '/universities',
    },
    {
      label: 'Guidance',
      description: 'Career planning',
      icon: <BookOpen size={34} />,
      className: 'hero-service-guidance',
      path: '/guidance',
    },
    {
      label: 'Jobs',
      description: 'Career access',
      icon: <Briefcase size={34} />,
      className: 'hero-service-jobs',
      path: '/jobs',
    },
  ];

  // Filter ONLY currently opened university and job applications based on valid deadlines
  const openedOpportunities = useMemo(() => {
    const now = new Date().getTime();
    const items: Array<{
      id: string;
      kind: 'university' | 'job';
      badge: string;
      organization: string;
      title: string;
      deadlineText: string;
      link: string;
    }> = [];

    // 1. Only Currently Opened Universities (Deadline is in the future or ongoing)
    if (universities && universities.length > 0) {
      universities.forEach((u: any) => {
        const hasDeadline = u.deadline && typeof u.deadline === 'string' && u.deadline.trim() !== '';
        const deadlineTime = hasDeadline ? new Date(u.deadline).getTime() : NaN;
        // Exclude expired deadlines
        const isOpen = !hasDeadline || (!isNaN(deadlineTime) && deadlineTime > now);

        if (isOpen) {
          let deadlineText = '';
          if (!isNaN(deadlineTime)) {
            try {
              deadlineText = `Deadline: ${new Date(u.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
            } catch {
              deadlineText = `Deadline: ${u.deadline}`;
            }
          } else if (u.intake) {
            deadlineText = `${u.intake} Intake`;
          } else {
            deadlineText = 'Admissions Open';
          }

          items.push({
            id: `uni-${u._id}`,
            kind: 'university',
            badge: u.category ? `🎓 ${u.category}` : '🎓 University',
            organization: u.name,
            title: u.intake ? `${u.intake}` : (u.country ? `Admissions in ${u.country}` : 'Applications Open'),
            deadlineText,
            link: `/universities/${u._id}`,
          });
        }
      });
    }

    // 2. Only Currently Opened Jobs & Internships (Deadline is in the future or active)
    if (jobs && jobs.length > 0) {
      jobs.forEach((j: any) => {
        const hasDeadline = j.deadline && j.deadline !== '';
        const deadlineTime = hasDeadline ? new Date(j.deadline).getTime() : NaN;
        // Exclude expired jobs
        const isOpen = !hasDeadline || (!isNaN(deadlineTime) && deadlineTime > now);

        if (isOpen) {
          let deadlineText = '';
          if (!isNaN(deadlineTime)) {
            try {
              deadlineText = `Deadline: ${new Date(j.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
            } catch {
              deadlineText = `Deadline: ${j.deadline}`;
            }
          } else {
            deadlineText = 'Applications Open';
          }

          const badgeText = j.type === 'internship' ? '💼 Internship' : j.type === 'government' ? '🏛️ Gov Job' : '💼 Job';

          items.push({
            id: `job-${j._id}`,
            kind: 'job',
            badge: badgeText,
            organization: j.company || 'Hiring Organization',
            title: `${j.title} (${j.location || 'Rwanda'})`,
            deadlineText,
            link: '/jobs',
          });
        }
      });
    }

    return items;
  }, [universities, jobs]);

  return (
    <div className="min-h-screen">

      {/* Small Hero Ad Popup — shows on every refresh */}
      {showAmategekoPopup && (
        <div className="fixed bottom-24 left-4 z-[9998] w-72 animate-popup-in sm:left-6" role="dialog" aria-label="Quick links">
          <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/95 dark:bg-gray-900/95 shadow-2xl shadow-black/30 backdrop-blur-md">
            {/* Top bar */}
            <div className="flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-orange-500/10 px-4 py-2.5 border-b border-gray-100 dark:border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">👋 Also check out</span>
              <button
                onClick={() => setShowAmategekoPopup(false)}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
              >
                <X size={11} />
              </button>
            </div>
            {/* Portfolio link */}
            <a
              href="https://ephron-protifolio.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors group border-b border-gray-100 dark:border-white/5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-400 text-black font-black text-[10px] shadow-sm shadow-cyan-500/20">
                EP
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-gray-900 dark:text-white">Ephron's Portfolio</p>
                <p className="text-[10px] text-gray-400 truncate">Full Stack Developer</p>
              </div>
              <ExternalLink size={12} className="shrink-0 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            {/* Amategeko link */}
            <a
              href="https://amategekohub.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-sm shadow-orange-500/20">
                <BookMarked size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-gray-900 dark:text-white">Amategeko Hub</p>
                <p className="text-[10px] text-gray-400 truncate">Rwanda Road Laws & Tests</p>
              </div>
              <ExternalLink size={12} className="shrink-0 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      )}


      {/* FULL-BLEED VIDEO HERO SECTION (Fulfilling the entire hero section with right-to-left video sliding images) */}
      <section
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
        className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-gray-950 pt-20 pb-16 text-white flex flex-col justify-between"
      >
        {/* FULL-WIDTH FULL-BLEED SLIDING VIDEO REEL BACKGROUND (Moving smoothly from right to left like video) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence initial={false} custom={heroDirection}>
            <motion.div
              key={currentHeroSlide._id || currentHeroSlide.imageUrl || currentHeroIndex}
              custom={heroDirection}
              variants={fullBleedSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full"
            >
              {/* Ken Burns video camera gliding pan from right to left */}
              <motion.div
                initial={{ x: '2.5%', scale: 1.02 }}
                animate={{ x: '-2.5%', scale: 1.06 }}
                transition={{ duration: 7, ease: 'linear' }}
                className="w-full h-full"
              >
                <img
                  src={getAssetUrl(currentHeroSlide.imageUrl)}
                  alt={currentHeroSlide.altText || 'Hero Background'}
                  className="w-full h-full object-cover brightness-[1.05] contrast-[1.04]"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Clean Film-Grade Contrast Overlays: Keeps background clearly visible while ensuring perfect text readability */}
          <div className="absolute inset-0 bg-black/35 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/70 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/70 via-transparent to-gray-950/50 pointer-events-none" />
        </div>

        {/* Particle canvas background */}
        <canvas ref={particlesRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-25 z-1" />

        {/* CONTINUOUSLY MOVING INTERACTIVE TICKER: ONLY CURRENTLY OPENED UNIVERSITY & JOB APPLICATIONS */}
        {openedOpportunities.length > 0 && (
          <div className="relative z-20 w-full border-b border-cyan-500/20 bg-black/65 backdrop-blur-xl py-2 overflow-hidden shadow-lg shadow-black/40">
            <div className="page-container flex items-center gap-3">
              {/* Live Indicator Beacon */}
              <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider shrink-0 shadow-md shadow-red-500/30">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>Open Applications ({openedOpportunities.length})</span>
              </div>

              {/* Continuous Moving Track with Only Opened Universities & Jobs */}
              <div className="overflow-hidden whitespace-nowrap flex-1">
                <div className="flex gap-4 sm:gap-6 items-center animate-hero-marquee hover:[animation-play-state:paused] w-max">
                  {[...openedOpportunities, ...openedOpportunities, ...openedOpportunities].map((item, idx) => (
                    <Link
                      key={`${item.id}-${idx}`}
                      to={item.link}
                      className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-white/10 hover:bg-cyan-500 hover:text-black border border-white/20 hover:border-cyan-400 text-xs font-bold text-gray-100 hover:text-black transition-all group shrink-0 shadow-sm"
                      title={`Click to view open application for ${item.organization}`}
                    >
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/15 text-cyan-300 group-hover:bg-black/20 group-hover:text-black">
                        {item.badge}
                      </span>
                      <span className="text-white group-hover:text-black font-extrabold">{item.organization}:</span>
                      <span className="text-gray-200 group-hover:text-black font-medium">{item.title}</span>
                      <span className="text-amber-300 group-hover:text-black text-[11px] font-semibold">
                        • {item.deadlineText}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-cyan-400/20 group-hover:bg-black/20 text-cyan-200 group-hover:text-black text-[10px] uppercase font-black tracking-wider flex items-center gap-1">
                        Apply Now <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOREGROUND HERO CONTENT (Matching the deployed layout with the Orbit on the left and Headline on the right) */}
        <div className="relative z-10 page-container w-full my-auto py-6">
          <div className="grid min-h-[calc(100vh-220px)] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            
            {/* Left: EduJobs Scholars Orbit */}
            <div className="flex justify-center lg:justify-start">
              <div className="hero-service-orbit" aria-label="EduJobs Scholars services">
                <div className="hero-service-center !bg-white/95 dark:!bg-gray-900/95 backdrop-blur-md shadow-[0_20px_50px_-12px_rgba(6,182,212,0.4)] border border-white/60">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">Welcome to</p>
                  <p className="mt-3 text-2xl font-black leading-tight text-gray-900 dark:text-white">EduJobs Scholars</p>
                  <p className="mt-4 text-sm font-semibold leading-relaxed text-gray-500 dark:text-gray-300">
                    Your gateway to universities, guidance, jobs, and opportunities.
                  </p>
                </div>
                <div className="hero-service-path">
                  {heroServices.map((service) => (
                    <Link
                      to={service.path}
                      key={service.label}
                      className={`hero-service-node ${service.className} hover:scale-110 transition-transform`}
                      title={`Go to ${service.label}`}
                    >
                      <div className="hero-service-node-inner !bg-white/95 dark:!bg-gray-800/95 backdrop-blur-sm shadow-[0_10px_30px_-5px_rgba(6,182,212,0.3)] border border-gray-100 dark:border-cyan-500/20">
                        <div className="text-cyan-600 dark:text-cyan-400">{service.icon}</div>
                        <span className="text-gray-900 dark:text-white font-bold">{service.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Headline, Search, Buttons, Counters */}
            <div className="pb-8 pt-4 text-center lg:text-left relative">
              <Link
                to="/universities"
                className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-cyan-400/40 bg-black/60 hover:bg-cyan-500 hover:text-black px-4 py-2 text-xs sm:text-sm font-bold text-cyan-200 hover:text-black backdrop-blur-md animate-fade-in shadow-lg transition-all group"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span>🔥 <strong className="text-white group-hover:text-black">Open University & Job Applications:</strong> View All & Apply</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <TypewriterHeadline />

              <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-gray-100 md:text-xl lg:mx-0 animate-slide-up animation-delay-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-medium">
                Discover universities, scholarships, career opportunities, and practical guidance designed to help school graduates choose a path, prepare well, and move forward with confidence.
              </p>

              {/* Universal Search Form */}
              <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-2xl animate-slide-up animation-delay-300 lg:mx-0">
                <div className="flex flex-col gap-2 rounded-2xl border border-white/25 bg-black/60 backdrop-blur-xl p-2 shadow-2xl sm:flex-row">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/10 px-3.5 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all" className="bg-gray-900">All</option>
                    <option value="universities" className="bg-gray-900">Universities</option>
                    <option value="jobs" className="bg-gray-900">Jobs</option>
                  </select>
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search universities, programs, jobs..."
                      className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-white placeholder-white/70 focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="btn-primary flex items-center justify-center gap-2 rounded-xl py-3 px-6 shadow-lg shadow-cyan-500/30 font-black text-xs uppercase tracking-wider">
                    <Search size={14} /> Search
                  </button>
                </div>
              </form>

              {/* Trending Searches */}
              <div className="mt-3 flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Trending:</span>
                {['University of Rwanda', 'Computer Science', 'Scholarship', 'Internship'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearch(tag);
                      window.location.href = `/universities?search=${encodeURIComponent(tag)}`;
                    }}
                    className="px-2.5 py-1 rounded-lg bg-black/50 hover:bg-cyan-500/20 text-gray-200 hover:text-cyan-300 border border-white/15 backdrop-blur-sm transition-colors text-[11px] font-medium"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-4 animate-slide-up animation-delay-500 lg:justify-start">
                <Link to="/universities" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 shadow-lg shadow-cyan-500/30 text-sm font-black rounded-xl">
                  <GraduationCap size={18} /> Explore Universities
                </Link>
                <a 
                  href="https://chat.whatsapp.com/BDEAa9Knxs7J3SCarkhvvE" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn-secondary !bg-emerald-500/20 !text-emerald-300 !border-emerald-500/40 backdrop-blur-md inline-flex items-center gap-2 px-7 py-3.5 hover:!bg-emerald-500/30 text-sm font-black rounded-xl"
                >
                  <MessageCircle size={18} /> Join WhatsApp Group
                </a>
              </div>

              {/* Live Statistics Counters */}
              <div className="mt-12 grid grid-cols-3 gap-4 text-left sm:gap-8 border-t border-white/10 pt-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-black leading-none text-white md:text-5xl drop-shadow-lg">
                      <Counter end={stat.value} suffix={stat.suffix} repeat />
                    </div>
                    <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-200 sm:text-sm drop-shadow-sm">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM VIDEO PLAYER CONTROLS & TIMELINE DOCK (Smooth Right-to-Left Slide Controls) */}
        <div className="relative z-20 w-full page-container pb-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-2xl">
            {/* Active Image Tag & Caption */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-400 text-black shadow-md shrink-0">
                {currentHeroSlide.category || 'Featured'}
              </span>
              <p className="text-xs sm:text-sm font-black text-white uppercase tracking-tight truncate max-w-xs sm:max-w-md">
                {currentHeroSlide.altText || 'EduJobs Scholars'}
              </p>
              {currentHeroSlide.university && (
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300">
                  <GraduationCap size={12} /> {currentHeroSlide.university}
                </span>
              )}
            </div>

            {/* Video Controls & Indicators */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Play / Pause Toggle */}
              <button
                onClick={() => setIsHeroPlaying(!isHeroPlaying)}
                className="p-2 rounded-xl bg-white/10 hover:bg-cyan-500 hover:text-black text-white border border-white/20 backdrop-blur-md transition-all active:scale-95"
                title={isHeroPlaying ? 'Pause video slide' : 'Play video slide'}
              >
                {isHeroPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>

              {/* Prev / Next slide */}
              <button
                onClick={prevHeroSlide}
                className="p-2 rounded-xl bg-white/10 hover:bg-cyan-500 hover:text-black text-white border border-white/20 backdrop-blur-md transition-all active:scale-95"
                title="Previous slide (Right to Left)"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={nextHeroSlide}
                className="p-2 rounded-xl bg-white/10 hover:bg-cyan-500 hover:text-black text-white border border-white/20 backdrop-blur-md transition-all active:scale-95"
                title="Next slide (Right to Left)"
              >
                <ChevronRight size={15} />
              </button>

              {/* Interactive Thumbnail / Slide Dots */}
              <div className="flex items-center gap-1.5 px-2">
                {activeHeroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToHeroSlide(idx)}
                    className={clsx(
                      'h-2 rounded-full transition-all duration-300',
                      currentHeroIndex === idx
                        ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                        : 'w-2 bg-white/30 hover:bg-white/60'
                    )}
                    title={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Fullscreen HD Clear Inspect Modal Button */}
              <button
                onClick={() => {
                  setHeroLightboxZoom(1);
                  setHeroLightboxOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-400/30 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg"
                title="View full image in HD clarity"
              >
                <Maximize2 size={13} />
                <span className="hidden sm:inline">HD Clear</span>
              </button>
            </div>
          </div>

          {/* Running Video Timeline Progress Bar */}
          <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
              style={{ width: `${heroProgress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
        </div>

        {/* FULLSCREEN HD LIGHTBOX MODAL */}
        <AnimatePresence>
          {heroLightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHeroLightboxOpen(false)}
              className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8"
            >
              <div
                className="flex items-center justify-between z-20 pb-4 border-b border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-400 text-black">
                    {currentHeroSlide.category || 'Hero Image'}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                    {currentHeroSlide.altText}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHeroLightboxZoom((z) => Math.max(0.7, z - 0.25))}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                    title="Zoom Out"
                  >
                    <ZoomOut size={18} />
                  </button>
                  <button
                    onClick={() => setHeroLightboxZoom((z) => Math.min(2.5, z + 0.25))}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                    title="Zoom In"
                  >
                    <ZoomIn size={18} />
                  </button>
                  <button
                    onClick={() => setHeroLightboxOpen(false)}
                    className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-white transition-all ml-2"
                    title="Close Preview (ESC)"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div
                className="relative flex-1 flex items-center justify-center overflow-auto py-4"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.img
                  src={getAssetUrl(currentHeroSlide.imageUrl)}
                  alt={currentHeroSlide.altText}
                  style={{ transform: `scale(${heroLightboxZoom})` }}
                  className="max-h-[82vh] max-w-full object-contain rounded-2xl shadow-2xl transition-transform duration-200 select-none cursor-grab active:cursor-grabbing"
                />

                {activeHeroSlides.length > 1 && (
                  <>
                    <button
                      onClick={prevHeroSlide}
                      className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-2xl bg-black/60 hover:bg-cyan-500 hover:text-black text-white border border-white/20 backdrop-blur-md transition-all shadow-2xl"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextHeroSlide}
                      className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-2xl bg-black/60 hover:bg-cyan-500 hover:text-black text-white border border-white/20 backdrop-blur-md transition-all shadow-2xl"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              <div
                className="z-20 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-300"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-4">
                  {currentHeroSlide.university && (
                    <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                      <GraduationCap size={15} /> Source: {currentHeroSlide.university}
                    </span>
                  )}
                  {currentHeroSlide.country && (
                    <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                      <Globe size={15} /> Region: {currentHeroSlide.country}
                    </span>
                  )}
                </div>
                <span className="text-gray-400">
                  Image {currentHeroIndex + 1} of {activeHeroSlides.length}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* CONTINUOUS VIDEO-LIKE MARQUEE REEL OF ALL UPLOADED HERO IMAGES */}
      <HeroImageMarquee images={heroImages} onSelectImage={(idx) => goToHeroSlide(idx)} />

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
                  {(universities.filter((u: any) => u.featured).length > 0
                    ? universities.filter((u: any) => u.featured).slice(0, 6)
                    : universities.slice(0, 6)
                  ).map((uni: any) => (
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

      {/* COMMUNITY / WHATSAPP SECTION */}
      <section className="py-24 bg-slate-50 dark:bg-black/20 transition-colors duration-500">
        <div className="page-container">
          <div className="relative overflow-hidden rounded-[3rem] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-cyan-500/20 p-8 md:p-20 text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-2xl dark:shadow-black/50 transition-all duration-500">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-[120px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-[120px] -ml-64 -mb-64" />

            <div className="relative z-10 max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-cyan-500 to-blue-600 text-white mb-10 shadow-[0_20px_40px_-8px_rgba(6,182,212,0.3)] animate-bounce-slow text-3xl font-black">
                <MessageCircle size={52} />
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-8 tracking-tight leading-tight">
                Step into the Circle of <span className="gradient-text text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">EduJobs Scholars</span>
              </h2>
              
              <p className="text-gray-700 dark:text-gray-400 text-xl md:text-2xl mb-12 leading-relaxed font-medium">
                Join EduJobs Scholars and stay connected with new opportunities. Get scholarship updates, job alerts, and guidance to help you achieve your education and career goals.

              </p>
              
              <div className="flex flex-col items-center justify-center gap-12">
                <a 
                  href="https://chat.whatsapp.com/BDEAa9Knxs7J3SCarkhvvE" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full sm:w-auto px-16 py-7 rounded-[2.5rem] bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-2xl hover:shadow-[0_20px_40px_-8px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-700 ease-in-out -skew-x-12 -translate-x-full" />
                  Join the Network <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
                </a>
                
                <div className="flex flex-col items-center gap-6">
                  <div className="flex items-center">
                    <div className="flex -space-x-5">
                      {successStories.length > 0 ? successStories.slice(0, 6).map((story, i) => (
                        <div key={story._id} className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-xl transition-all duration-300 hover:scale-125 hover:z-30 hover:-translate-y-2 group/avatar">
                          <img 
                            src={getAssetUrl(story.profileImage)} 
                            alt={story.fullName} 
                            className="w-full h-full object-cover transition-transform group-hover/avatar:scale-110" 
                            title={story.fullName} 
                          />
                        </div>
                      )) : [1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-xl">
                          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
                        </div>
                      ))}
                      <div className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-900 bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-2xl relative z-20 hover:scale-110 transition-transform cursor-default">
                        <span className="animate-pulse">+1.2k</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-6 py-2.5 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 transition-all hover:border-cyan-500/50">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm font-bold uppercase tracking-[0.2em]">
                      Helping Rwanda's Future Talent
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                  {successStories.slice(0, 6).map((story: SuccessStory) => (
                    <div key={story._id} className="glass-card-hover p-6 group flex flex-col transition-all hover:shadow-2xl hover:shadow-cyan-500/10 border border-gray-100 dark:border-white/5">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                          <img
                            src={getAssetUrl(story.profileImage)}
                            alt={story.fullName}
                            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-500/20"
                          />
                          <div className={clsx(
                            "absolute -bottom-1 -right-1 p-1.5 rounded-lg shadow-lg",
                            story.type.toLowerCase().includes('student') || story.type.toLowerCase().includes('graduate') ? "bg-blue-500" : "bg-purple-500"
                          )}>
                            {story.type.toLowerCase().includes('student') || story.type.toLowerCase().includes('graduate') ? <User size={12} className="text-white" /> : <Briefcase size={12} className="text-white" />}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-black text-gray-900 dark:text-white text-lg leading-tight truncate">{story.fullName}</h3>
                          <p className="text-xs font-bold text-cyan-500 uppercase tracking-widest mt-1 truncate">
                            {story.type}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 flex-1">
                        <div className="flex gap-3 relative">
                          <Quote size={20} className="text-cyan-500/20 absolute -left-2 -top-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic line-clamp-2 pl-4">
                            {story.howTheyKnow}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Heart size={16} className="text-cyan-500 shrink-0 mt-1" />
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4 leading-relaxed">
                            {story.howHelped}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedStory(story)}
                        className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-bold text-xs hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all group/btn"
                      >
                        Read Full Journey <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Success Story Detail Modal */}
      <Modal
        isOpen={!!selectedStory}
        onClose={() => setSelectedStory(null)}
        title="Success Story"
        size="lg"
      >
        {selectedStory && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <img
                src={getAssetUrl(selectedStory.profileImage)}
                alt={selectedStory.fullName}
                className="w-28 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-cyan-500/20 shadow-2xl"
              />
              <div className="flex-1">
                <div className="mb-4">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">{selectedStory.fullName}</h2>
                  <p className="text-cyan-500 font-bold uppercase tracking-widest text-xs flex items-center justify-center sm:justify-start gap-2">
                    {selectedStory.type.toLowerCase().includes('student') || selectedStory.type.toLowerCase().includes('graduate') ? <User size={14} /> : <Briefcase size={14} />}
                    {selectedStory.type}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center justify-center sm:justify-start gap-3 text-gray-600 dark:text-gray-400">
                    <span className="font-bold text-gray-900 dark:text-white shrink-0">Discovery:</span>
                    <span className="truncate">{selectedStory.howTheyKnow.slice(0, 40)}...</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {/* Sidebar Info */}
              <div className="md:col-span-2 space-y-6">
                <div className="p-6 rounded-3xl bg-cyan-500/5 border border-cyan-500/10">
                  <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Users size={14} className="text-cyan-500" />
                    Quick Profile
                  </h3>
                  <ul className="space-y-4">
                    <li>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedStory.fullName}</p>
                    </li>
                    <li>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Type</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedStory.type}</p>
                    </li>
                    <li>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">How I Discovered Us</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
                        "{selectedStory.howTheyKnow}"
                      </p>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Main Content */}
              <div className="md:col-span-3 space-y-6">
                <section>
                  <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Sparkles size={14} className="text-cyan-500" />
                    My Journey
                  </h3>
                  <div className="relative">
                    <Quote size={40} className="text-cyan-500/5 absolute -left-4 -top-4 -z-0" />
                    <p className="relative z-10 text-gray-700 dark:text-gray-300 leading-8 text-base whitespace-pre-line">
                      {selectedStory.howHelped}
                    </p>
                  </div>
                </section>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-white/10 flex justify-center sm:justify-end">
              <button
                onClick={() => setSelectedStory(null)}
                className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black font-black text-sm hover:scale-105 transition-all shadow-xl shadow-black/10 dark:shadow-white/10"
              >
                Done Reading
              </button>
            </div>
          </div>
        )}
      </Modal>

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

      {/* AD CAROUSEL SECTION */}
      <section className="pb-20 pt-4">
        <div className="page-container">

          {/* Section label */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-500/30" />
            <div className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-4 py-1.5">
              <Sparkles size={13} className="text-cyan-400" />
              <span className="text-xs font-black uppercase tracking-widest text-cyan-500">Also From Us</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-500/30" />
          </div>

          {/* Ticker strip — always visible, scrolling */}
          <div className="mb-6 overflow-hidden rounded-xl border border-cyan-500/20 bg-cyan-500/5">
            <div className="ad-ticker flex items-center gap-0 whitespace-nowrap">
              {[...Array(3)].map((_, ri) => (
                <span key={ri} className="inline-flex items-center gap-6 px-6 py-2.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                  <span className="flex items-center gap-2"><Code2 size={12} />Ephron's Portfolio — Full Stack Developer</span>
                  <span className="text-cyan-500/40">◆</span>
                  <span className="flex items-center gap-2"><BookMarked size={12} />Amategeko y'umuhanda — Learn Rwanda Road Laws Free</span>
                  <span className="text-cyan-500/40">◆</span>
                  <span className="flex items-center gap-2"><ExternalLink size={12} />ephron-protifolio.vercel.app</span>
                  <span className="text-cyan-500/40">◆</span>
                  <span className="flex items-center gap-2"><ExternalLink size={12} />amategekohub.vercel.app</span>
                  <span className="text-cyan-500/40">◆</span>
                </span>
              ))}
            </div>
          </div>

          {/* Main ad card carousel */}
          <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-white dark:bg-gray-950 shadow-xl shadow-cyan-500/5">

            {/* Slides */}
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ transform: `translateX(-${adSlide * 100}%)` }}
            >
              {ads.map((ad) => (
                <div key={ad.id} className="w-full shrink-0">
                  <div className={`relative overflow-hidden ${
                    ad.accent === 'cyan'
                      ? 'bg-gradient-to-br from-cyan-50 via-white to-gray-50 dark:from-cyan-950/40 dark:via-gray-950 dark:to-gray-950'
                      : 'bg-gradient-to-br from-orange-50 via-white to-gray-50 dark:from-orange-950/30 dark:via-gray-950 dark:to-gray-950'
                  }`}>

                    {/* Decorative blobs */}
                    <div className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl ${
                      ad.accent === 'cyan' ? 'bg-cyan-400/10' : 'bg-orange-400/10'
                    }`} />
                    <div className={`pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full blur-3xl ${
                      ad.accent === 'cyan' ? 'bg-cyan-500/8' : 'bg-orange-500/8'
                    }`} />

                    {/* Top accent bar */}
                    <div className={`h-1 w-full ${
                      ad.accent === 'cyan'
                        ? 'bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-400'
                        : 'bg-gradient-to-r from-orange-400 via-red-500 to-orange-400'
                    }`} />

                    <div className="flex flex-col gap-8 p-8 md:flex-row md:items-center md:p-12">

                      {/* Icon */}
                      <div className={`flex h-24 w-24 shrink-0 items-center justify-center self-center rounded-3xl text-white shadow-2xl ${
                        ad.accent === 'cyan'
                          ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-cyan-500/30'
                          : 'bg-gradient-to-br from-orange-400 to-red-500 shadow-orange-500/30'
                      } ad-icon-pulse`}>
                        {ad.label
                          ? <span className="text-3xl font-black">{ad.label}</span>
                          : ad.icon
                        }
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                          ad.accent === 'cyan'
                            ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                            : 'border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                        }`}>
                          <Sparkles size={10} /> {ad.badge}
                        </div>
                        <h3 className="mb-3 text-2xl font-black text-gray-900 dark:text-white md:text-3xl">{ad.title}</h3>
                        <p className="mb-5 max-w-lg text-sm leading-relaxed text-gray-600 dark:text-gray-400 md:text-base">{ad.desc}</p>
                        <div className="mb-6 flex flex-wrap gap-2">
                          {ad.tags.map((tag) => (
                            <span key={tag} className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              ad.accent === 'cyan'
                                ? 'border-cyan-200 dark:border-cyan-500/30 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
                                : 'border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300'
                            }`}>{tag}</span>
                          ))}
                        </div>
                        <a
                          href={ad.href}
                          target="_blank"
                          rel="noreferrer"
                          className={`inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-black shadow-lg transition-all hover:-translate-y-0.5 ${
                            ad.accent === 'cyan'
                              ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-black shadow-cyan-500/25 hover:shadow-cyan-500/40'
                              : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-500/25 hover:shadow-orange-500/40'
                          }`}
                        >
                          <ExternalLink size={16} /> {ad.cta}
                        </a>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Prev / Next controls */}
            <button
              onClick={prevAd}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-cyan-500/30 bg-white/80 dark:bg-gray-900/80 text-cyan-500 backdrop-blur-sm hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all shadow-md"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextAd}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-cyan-500/30 bg-white/80 dark:bg-gray-900/80 text-cyan-500 backdrop-blur-sm hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all shadow-md"
            >
              <ChevronRight size={18} />
            </button>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-2 pb-5 pt-2">
              {ads.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setAdSlide(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === adSlide
                      ? 'w-6 h-2 bg-cyan-500'
                      : 'w-2 h-2 bg-gray-300 dark:bg-gray-700 hover:bg-cyan-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Two compact quick-link cards below carousel */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="https://ephron-protifolio.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-transparent p-4 hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:-translate-y-0.5 transition-all"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-400 text-black font-black text-xs shadow-md shadow-cyan-500/20">
                EP
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-cyan-500">Portfolio</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">ephron-protifolio.vercel.app</p>
              </div>
              <ExternalLink size={15} className="shrink-0 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a
              href="https://amategekohub.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/5 to-transparent p-4 hover:border-orange-500/40 hover:bg-orange-500/10 hover:-translate-y-0.5 transition-all"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md shadow-orange-500/20">
                <BookMarked size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-orange-500">Road Safety</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">amategekohub.vercel.app</p>
              </div>
              <ExternalLink size={15} className="shrink-0 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

        </div>
      </section>

    </div>
  );
}

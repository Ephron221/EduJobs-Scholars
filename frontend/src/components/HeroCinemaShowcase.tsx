import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  GraduationCap,
  Globe,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  Calendar,
  Eye,
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react';
import { getAssetUrl } from '../utils/assetUrl';
import clsx from 'clsx';

export interface HeroImageItem {
  _id?: string;
  imageUrl: string;
  altText?: string;
  category?: string;
  university?: string;
  country?: string;
  order?: number;
  createdAt?: string;
}

interface HeroCinemaShowcaseProps {
  images: HeroImageItem[];
  onSelectImage?: (index: number) => void;
  className?: string;
}

export default function HeroCinemaShowcase({
  images,
  onSelectImage,
  className = '',
}: HeroCinemaShowcaseProps) {
  // Curated high-resolution fallback slides if database images are loading or empty
  const defaultSlides: HeroImageItem[] = [
    {
      _id: 'default-1',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80',
      altText: 'Graduates Celebrating On Campus',
      category: 'Graduation',
      university: 'University of Rwanda',
      country: 'Rwanda',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'default-2',
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80',
      altText: 'University Campus & Academic Admissions',
      category: 'Application Open',
      university: 'East Africa University',
      country: 'Rwanda',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'default-3',
      imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
      altText: 'Career Guidance & Professional Opportunities',
      category: 'Opportunities',
      university: 'EduJobs Scholars',
      country: 'Global',
      createdAt: new Date().toISOString(),
    },
  ];

  const displayImages = images && images.length > 0 ? images : defaultSlides;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  // Video progress state (0 to 100)
  const [progress, setProgress] = useState(0);
  const slideDurationMs = 6000; // 6 seconds per slide
  const progressIntervalMs = 50;

  // Track slide transition direction (always +1 for right-to-left progression)
  const [direction, setDirection] = useState<number>(1);

  // Maintain index within bounds if images array changes
  useEffect(() => {
    if (currentIndex >= displayImages.length) {
      setCurrentIndex(0);
    }
  }, [displayImages.length, currentIndex]);

  // Video-like progress timer and right-to-left slide advance
  useEffect(() => {
    if (!isPlaying || isHovered || lightboxOpen || displayImages.length <= 1) {
      return;
    }

    const step = (progressIntervalMs / slideDurationMs) * 100;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Slide to next from right to left
          setDirection(1);
          setCurrentIndex((idx) => (idx + 1) % displayImages.length);
          return 0;
        }
        return prev + step;
      });
    }, progressIntervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, isHovered, lightboxOpen, displayImages.length]);

  const goToNext = () => {
    setDirection(1);
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const goToPrev = () => {
    setDirection(-1);
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const jumpToSlide = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setProgress(0);
    setCurrentIndex(idx);
    if (onSelectImage) onSelectImage(idx);
  };

  const activeImage = displayImages[currentIndex] || displayImages[0];

  // Framer Motion slide variants for smooth, continuous video sliding from right to left
  const slideVariants: any = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 1,
    }),
    center: {
      x: '0%',
      opacity: 1,
      transition: {
        x: { duration: 1.25, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.3 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 1,
      transition: {
        x: { duration: 1.25, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.3 },
      },
    }),
  };

  return (
    <div className={clsx('relative w-full select-none', className)}>
      {/* Synchronized Ambient Colorful Glow behind the player */}
      <div
        className="absolute -inset-4 sm:-inset-8 rounded-[2.5rem] sm:rounded-[3.5rem] opacity-30 dark:opacity-40 blur-2xl sm:blur-3xl transition-all duration-1000 -z-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 60% 50%, rgba(6, 182, 212, 0.45), rgba(59, 130, 246, 0.3), rgba(15, 23, 42, 0.9))`,
        }}
      />

      {/* MAIN CINEMATIC FRAME */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-white/20 dark:border-cyan-500/30 bg-gray-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(6,182,212,0.15)] transition-all duration-500"
      >
        {/* Top Video Header Bar with Status and Actions */}
        <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-3.5 sm:p-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
          {/* Category Tag & Live Reel Indicator */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-cyan-400 text-black shadow-lg shadow-cyan-400/25">
              <Sparkles size={12} className="animate-spin-slow" />
              {activeImage.category || 'Featured'}
            </span>

            {/* Video-Style Reel Status */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-[10px] font-bold text-gray-300 backdrop-blur-md">
              <span
                className={clsx(
                  'w-2 h-2 rounded-full',
                  isPlaying && !isHovered
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-amber-400'
                )}
              />
              {isPlaying && !isHovered ? 'Cinematic Reel' : 'Reel Paused'}
            </div>
          </div>

          {/* Top Right Controls: Fit Toggle & Fullscreen Expand */}
          <div className="flex items-center gap-2">
            {/* Fit mode toggle (Cover vs Contain) */}
            <button
              onClick={() => setFitMode((m) => (m === 'cover' ? 'contain' : 'cover'))}
              title={fitMode === 'cover' ? 'Switch to Fit (Show full uncropped flyer)' : 'Switch to Fill (Cinematic cover)'}
              className="p-2 sm:p-2.5 rounded-xl bg-black/60 hover:bg-white/20 text-white/90 hover:text-white border border-white/15 backdrop-blur-md transition-all active:scale-95 text-[11px] font-semibold flex items-center gap-1.5"
            >
              <Layers size={14} className="text-cyan-400" />
              <span className="hidden md:inline">{fitMode === 'cover' ? 'Full View' : 'Fill'}</span>
            </button>

            {/* Inspect / Fullscreen Lightbox Button */}
            <button
              onClick={() => {
                setLightboxZoom(1);
                setLightboxOpen(true);
              }}
              title="Inspect image in Full HD Clarity"
              className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-400/30 backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 text-[11px] font-bold shadow-lg"
            >
              <Maximize2 size={14} />
              <span className="hidden sm:inline">HD Clear</span>
            </button>
          </div>
        </div>

        {/* CINEMATIC VIEWPORT / IMAGE CANVAS */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-[16/10] bg-gray-950 overflow-hidden cursor-pointer"
             onClick={() => setLightboxOpen(true)}>
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={activeImage._id || activeImage.imageUrl || currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full"
            >
              {/* Ken Burns video gliding camera motion from right to left */}
              <motion.div
                initial={{ x: '2.5%', scale: 1.02 }}
                animate={{ x: '-2.5%', scale: 1.06 }}
                transition={{ duration: 6.5, ease: 'linear' }}
                className="w-full h-full flex items-center justify-center bg-gray-950"
              >
                <img
                  src={getAssetUrl(activeImage.imageUrl)}
                  alt={activeImage.altText || 'EduJobs Scholars Hero'}
                  className={clsx(
                    'w-full h-full transition-all duration-300',
                    fitMode === 'cover' ? 'object-cover' : 'object-contain p-2 sm:p-4'
                  )}
                  loading="eager"
                />
              </motion.div>

              {/* Minimal crystal-clear gradient overlay strictly at the bottom for readability */}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
            </motion.div>
          </AnimatePresence>

          {/* Quick Click-to-Zoom Hover Hint */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="px-4 py-2 rounded-2xl bg-black/75 border border-white/20 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 shadow-2xl">
              <Eye size={15} className="text-cyan-400" /> Click to View Full Image in High Definition
            </div>
          </div>
        </div>

        {/* Bottom Metadata & Video Controls Bar */}
        <div className="absolute bottom-0 inset-x-0 z-30 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
          {/* Caption & Institutional Source Details */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
            <div className="space-y-1.5 max-w-xl">
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight drop-shadow-md tracking-tight uppercase line-clamp-1">
                {activeImage.altText || 'EduJobs Scholars Opportunity'}
              </h2>

              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-300">
                {activeImage.university && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-cyan-300">
                    <GraduationCap size={13} />
                    {activeImage.university}
                  </span>
                )}
                {activeImage.country && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-emerald-300">
                    <Globe size={13} />
                    {activeImage.country}
                  </span>
                )}
                {activeImage.createdAt && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-gray-400">
                    <Calendar size={12} />
                    {new Date(activeImage.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Video Controls & Slide Counter */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {/* Play / Pause Toggle Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(!isPlaying);
                }}
                title={isPlaying ? 'Pause video slideshow' : 'Play video slideshow'}
                className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-cyan-500 hover:text-black text-white border border-white/20 backdrop-blur-md transition-all active:scale-90"
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
              </button>

              {/* Prev Slide Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
                title="Previous slide (Right to Left)"
                className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-cyan-500 hover:text-black text-white border border-white/20 backdrop-blur-md transition-all active:scale-90"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Next Slide Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                title="Next slide (Right to Left)"
                className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-cyan-500 hover:text-black text-white border border-white/20 backdrop-blur-md transition-all active:scale-90"
              >
                <ChevronRight size={16} />
              </button>

              {/* Slide Counter (e.g., 01 / 04) */}
              <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-black text-white backdrop-blur-md tracking-wider">
                <span className="text-cyan-400">{String(currentIndex + 1).padStart(2, '0')}</span>
                <span className="text-gray-500 mx-1">/</span>
                <span>{String(displayImages.length).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          {/* VIDEO TIMELINE / PROGRESS BAR (Runs from 0% to 100%) */}
          <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden backdrop-blur-sm relative">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
        </div>
      </div>

      {/* ALL UPLOADED HERO IMAGES MINI-FILMSTRIP / THUMBNAILS (Shows all images clearly) */}
      {displayImages.length > 1 && (
        <div className="mt-4 sm:mt-5 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-gray-400">
            <ImageIcon size={14} className="text-cyan-400" />
            <span>All Hero Images ({displayImages.length})</span>
          </div>

          {/* Interactive Slide Dots / Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {displayImages.map((img, idx) => (
              <button
                key={img._id || idx}
                onClick={() => jumpToSlide(idx)}
                className={clsx(
                  'group relative h-9 rounded-xl transition-all duration-300 overflow-hidden flex items-center border',
                  currentIndex === idx
                    ? 'w-20 sm:w-28 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg shadow-cyan-500/20'
                    : 'w-10 sm:w-12 border-white/20 opacity-60 hover:opacity-100 hover:border-white/40'
                )}
                title={img.altText || `Slide ${idx + 1}`}
              >
                <img
                  src={getAssetUrl(img.imageUrl)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div
                  className={clsx(
                    'absolute inset-0 transition-opacity',
                    currentIndex === idx
                      ? 'bg-cyan-500/20'
                      : 'bg-black/40 group-hover:bg-transparent'
                  )}
                />
                {currentIndex === idx && (
                  <span className="absolute bottom-1 right-1.5 text-[9px] font-black text-white bg-black/70 px-1 rounded">
                    {idx + 1}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FULLSCREEN HIGH-DEFINITION LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8"
          >
            {/* Lightbox Top Bar */}
            <div
              className="flex items-center justify-between z-20 pb-4 border-b border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-400 text-black">
                  {activeImage.category || 'Hero Image'}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                  {activeImage.altText}
                </h3>
              </div>

              {/* Zoom In, Zoom Out, Reset, and Close */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLightboxZoom((z) => Math.max(0.7, z - 0.25))}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  onClick={() => setLightboxZoom((z) => Math.min(2.5, z + 0.25))}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  onClick={() => setLightboxZoom(1)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all"
                >
                  {Math.round(lightboxZoom * 100)}%
                </button>
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-white transition-all ml-2"
                  title="Close Preview (ESC)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Lightbox Image Stage with Zoom */}
            <div
              className="relative flex-1 flex items-center justify-center overflow-auto py-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                src={getAssetUrl(activeImage.imageUrl)}
                alt={activeImage.altText}
                style={{ transform: `scale(${lightboxZoom})` }}
                className="max-h-[82vh] max-w-full object-contain rounded-2xl shadow-2xl transition-transform duration-200 select-none cursor-grab active:cursor-grabbing"
              />

              {/* Prev / Next Buttons inside Lightbox */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={goToPrev}
                    className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-2xl bg-black/60 hover:bg-cyan-500 hover:text-black text-white border border-white/20 backdrop-blur-md transition-all shadow-2xl"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-2xl bg-black/60 hover:bg-cyan-500 hover:text-black text-white border border-white/20 backdrop-blur-md transition-all shadow-2xl"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Bottom Footer with Full Metadata */}
            <div
              className="z-20 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                {activeImage.university && (
                  <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                    <GraduationCap size={15} /> Source: {activeImage.university}
                  </span>
                )}
                {activeImage.country && (
                  <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                    <Globe size={15} /> Region: {activeImage.country}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-400">
                  Image {currentIndex + 1} of {displayImages.length}
                </span>
                <a
                  href={getAssetUrl(activeImage.imageUrl)}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-black uppercase text-[11px] tracking-wider hover:bg-cyan-400 transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                >
                  Open Original <ArrowRight size={13} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

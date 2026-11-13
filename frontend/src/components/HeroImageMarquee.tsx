import React from 'react';
import { HeroImageItem } from './HeroCinemaShowcase';
import { getAssetUrl } from '../utils/assetUrl';
import { Sparkles, GraduationCap, Globe, Eye } from 'lucide-react';

interface HeroImageMarqueeProps {
  images: HeroImageItem[];
  onSelectImage?: (index: number) => void;
}

export default function HeroImageMarquee({ images, onSelectImage }: HeroImageMarqueeProps) {
  if (!images || images.length === 0) return null;

  // Duplicate list to create a seamless infinite right-to-left loop
  const marqueeList = [...images, ...images, ...images];

  return (
    <div className="relative w-full overflow-hidden py-6 border-y border-white/10 bg-black/40 backdrop-blur-xl">
      {/* Header Label */}
      <div className="page-container mb-3 flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-400">
        <span className="flex items-center gap-2">
          <Sparkles size={14} className="text-cyan-400" />
          Featured Announcements & Campus Highlights
        </span>
        <span className="hidden sm:inline text-[11px] text-cyan-400/80 font-bold">
          All {images.length} Uploaded Hero Images • Hover to Pause
        </span>
      </div>

      {/* Marquee Track with Smooth Right-to-Left Infinite Animation */}
      <div className="flex gap-4 sm:gap-6 animate-hero-marquee hover:[animation-play-state:paused] cursor-pointer w-max">
        {marqueeList.map((item, index) => {
          const originalIndex = index % images.length;
          return (
            <div
              key={`${item._id || index}-${index}`}
              onClick={() => onSelectImage && onSelectImage(originalIndex)}
              className="group relative w-64 sm:w-72 h-36 rounded-2xl overflow-hidden border border-white/15 hover:border-cyan-400 bg-gray-900 shadow-xl transition-all duration-300 hover:scale-[1.03] shrink-0"
            >
              <img
                src={getAssetUrl(item.imageUrl)}
                alt={item.altText || 'Hero image'}
                className="w-full h-full object-cover brightness-[0.95] group-hover:brightness-105 group-hover:scale-105 transition-all duration-500"
              />

              {/* Bottom gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Category pill */}
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-400 text-black shadow-md">
                  {item.category || 'Featured'}
                </span>
              </div>

              {/* Caption and institution */}
              <div className="absolute bottom-2.5 inset-x-2.5 space-y-1">
                <p className="text-xs font-black text-white uppercase tracking-tight truncate drop-shadow">
                  {item.altText}
                </p>
                <div className="flex items-center justify-between text-[10px] text-gray-300 font-bold">
                  <span className="flex items-center gap-1 text-cyan-300 truncate">
                    <GraduationCap size={11} /> {item.university || 'EduJobs Scholars'}
                  </span>
                  {item.country && (
                    <span className="flex items-center gap-1 text-emerald-300">
                      <Globe size={11} /> {item.country}
                    </span>
                  )}
                </div>
              </div>

              {/* Hover view badge */}
              <div className="absolute inset-0 flex items-center justify-center bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-3 py-1 rounded-xl bg-black/80 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                  <Eye size={12} className="text-cyan-400" /> Focus in Cinema
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

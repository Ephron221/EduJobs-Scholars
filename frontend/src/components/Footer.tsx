import { Link } from 'react-router-dom';
import { GraduationCap, Mail, MapPin, Twitter, ExternalLink, Code2, BookMarked, Instagram, Facebook, Youtube } from 'lucide-react';

interface IconProps {
  size?: number | string;
  className?: string;
}

const WhatsAppIcon = ({ size = 16, className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
    <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
  </svg>
);

const socialLinks = [
  { icon: Twitter, href: 'https://x.com/Esron221', label: 'X (Twitter)', color: 'hover:text-gray-900 dark:hover:text-white hover:border-gray-900/30 dark:hover:border-white/30 hover:bg-gray-100 dark:hover:bg-white/10' },
  { icon: Instagram, href: 'https://www.instagram.com/esront2/?hl=en', label: 'Instagram', color: 'hover:text-pink-500 hover:border-pink-500/30 hover:bg-pink-50 dark:hover:bg-pink-500/10' },
  { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61593053824561', label: 'Facebook', color: 'hover:text-blue-500 hover:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10' },
  { icon: Youtube, href: 'https://www.youtube.com/@EduJosScholars', label: 'YouTube', color: 'hover:text-red-500 hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10' },
  { icon: WhatsAppIcon, href: 'https://chat.whatsapp.com/BDEAa9Knxs7J3SCarkhvvE', label: 'WhatsApp', color: 'hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-gray-200 dark:border-gray-200 dark:border-white/10 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/10 to-transparent pointer-events-none" />

      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center text-black font-black">
                EJ
              </div>
              <div>
                <div className="font-bold text-lg text-gray-900 dark:text-white">EduJobs Scholars</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Version 1.0 · 2025</div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
              Connecting school graduates with university and career opportunities across Rwanda and beyond. Your future starts here.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`group relative w-10 h-10 rounded-xl bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${social.color}`}
                >
                  <social.icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 px-2.5 py-1 text-[11px] font-medium rounded-md bg-gray-900 text-white dark:bg-white dark:text-gray-900 pointer-events-none whitespace-nowrap shadow-sm z-10">
                    {social.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/universities', label: 'Universities' },
                { href: '/jobs', label: 'Job Opportunities' },
                { href: '/guidance', label: 'Career Guidance' },
                { href: '/register', label: 'Create Account' },
                { href: '/login', label: 'Student Login' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-gray-600 dark:text-gray-400 hover:text-cyan-400 text-sm transition-colors flex items-center gap-1 group">
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400 text-sm">
                <MapPin size={15} className="text-cyan-400 mt-0.5 shrink-0" />
                South, Nyanza
              </li>
              <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400 text-sm">
                <Mail size={15} className="text-cyan-400 mt-0.5 shrink-0" />
                esront21@gmail.com
              </li>
              <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400 text-sm">
                <GraduationCap size={15} className="text-cyan-400 mt-0.5 shrink-0" />
                Serving Rwanda & Beyond
              </li>
            </ul>

            <div className="mt-6 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <p className="text-xs text-cyan-300 font-medium">🎓 For Students</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Free access to all resources and opportunities.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {year} EduJobs Scholars. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <a
              href="https://ephron-protifolio.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors group"
            >
              <Code2 size={13} className="group-hover:text-cyan-400" />
              Built by Ephron
            </a>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <a
              href="https://amategekohub.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-orange-400 transition-colors group"
            >
              <BookMarked size={13} className="group-hover:text-orange-400" />
              Amategeko y'umuhanda
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

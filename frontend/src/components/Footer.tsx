import { Link } from 'react-router-dom';
import { GraduationCap, Mail, MapPin, Twitter, Linkedin, Github, ExternalLink } from 'lucide-react';

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
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="w-9 h-9 rounded-lg bg-white dark:bg-gray-900/5 border border-gray-200 dark:border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white dark:bg-gray-900/5 border border-gray-200 dark:border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                <Linkedin size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white dark:bg-gray-900/5 border border-gray-200 dark:border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                <Github size={16} />
              </a>
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
                Kigali, Rwanda
              </li>
              <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400 text-sm">
                <Mail size={15} className="text-cyan-400 mt-0.5 shrink-0" />
                info@edujobsscholars.rw
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
          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

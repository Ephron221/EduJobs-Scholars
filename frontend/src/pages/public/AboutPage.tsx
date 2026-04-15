import { Link } from 'react-router-dom';
import { ArrowRight, Target, Users, Globe2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Empowering Rwandan Students for <span className="gradient-text">Global Success</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              EduJobs Scholars is a dedicated platform bridging the gap between talent and opportunity. We connect ambitious students with top-tier academic programs, scholarships, and career paths across Africa and beyond.
            </p>
          </div>

          {/* Mission Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: <Target size={30} />, title: "Our Mission", desc: "To democratize access to global educational resources for every Rwandan student." },
              { icon: <Globe2 size={30} />, title: "Our Vision", desc: "A future where geography does not limit a student's academic or professional trajectory." },
              { icon: <Users size={30} />, title: "Our Community", desc: "A thriving network of scholars, mentors, and institutions collaborating for excellence." }
            ].map((item, idx) => (
              <div key={idx} className="glass-card-hover p-6 text-center">
                <div className="w-14 h-14 bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Story */}
          <div className="glass-card p-8 md:p-12 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Story Behind EduJobs</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Navigating the complex landscape of university applications, international scholarships, and early-career opportunities is DAUNTING. This challenge is acutely felt by many talented graduates in Rwanda who possess the aptitude but lack centralized, actionable guidance.
              </p>
              <p>
                EduJobs Scholars was born out of this necessity. We built a unified ecosystem that doesn't just list opportunities—it guides students through them. From tracking application deadlines to receiving personalized alerts and reading curated career advice, our platform is designed to be the ultimate companion for academic advancement.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/register" className="btn-primary inline-flex items-center gap-2">
              Join Our Community <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

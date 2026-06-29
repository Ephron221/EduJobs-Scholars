import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Landmark, 
  FileEdit, 
  Compass, 
  Palette, 
  Code,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function ServicesPage() {
  const services = [
    {
      icon: <GraduationCap size={36} />,
      title: "Application Support Services",
      features: [
        "University and college applications (Rwanda and international)",
        "Scholarship, Loan applications and self-sponsored",
        "Mifotra applications and other government applications",
      ]
    },
    {
      icon: <Landmark size={36} />,
      title: "Irembo Services Assistance",
      features: [
        "Birth, marriage, and death certificates",
        "Criminal record (police clearance)",
        "Passport application guidance",
        "Driving test registration",
        "Other government e-services support"
      ]
    },
    {
      icon: <FileEdit size={36} />,
      title: "Document Services",
      features: [
        "Writing formal letters",
        "CV preparation",
        "Document editing & proofreading",
        "Formatting documents for submission"
      ]
    },
    {
      icon: <Compass size={36} />,
      title: "Opportunities & Guidance",
      features: [
        "Job and scholarship updates",
        "Guidance through WhatsApp community",
        "Step-by-step application support"
      ]
    },
    {
      icon: <Palette size={36} />,
      title: "Design Services",
      features: [
        "Posters and flyers design",
        "Event and announcement designs",
        "Social media graphics",
        "Best branding for businesses"
      ]
    },
    {
      icon: <Code size={36} />,
      title: "Web & Mobile Development",
      features: [
        "Websites for e-commerce, business and more",
        "Mobile App development",
        "Google Forms for data collection and correction"
      ]
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
            Our <span className="gradient-text">Services</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            We provide a holistic ecosystem designed to empower students and professionals alike. From university discovery to expert design and development, we have the tools you need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((s, i) => (
            <div key={i} className="glass-card p-8 flex flex-col h-full hover:border-cyan-500/50 transition-colors">
              <div className="text-cyan-500 dark:text-cyan-400 mb-5">{s.icon}</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{s.title}</h2>
              <ul className="space-y-3 flex-1 mb-6">
                {s.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 size={16} className="text-cyan-500 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="mt-auto inline-flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-semibold hover:gap-3 transition-all hover:text-cyan-500 text-sm">
                Request Service <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

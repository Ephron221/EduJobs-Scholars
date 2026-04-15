import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, FileText, Compass, ArrowRight, Lightbulb, Search } from 'lucide-react';
import api from '../services/api';

interface GuidanceItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  steps: string[];
}

const Guidance = () => {
  const [guidanceItems, setGuidanceItems] = useState<GuidanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchGuidance = async () => {
      try {
        const res = await api.get('/guidance');
        setGuidanceItems(res.data);
      } catch (err) {
        console.error('Error fetching guidance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuidance();
  }, []);

  const categories = ['All', 'University Applications', 'CV Writing', 'Career Development'];

  const filteredItems = activeCategory === 'All' 
    ? guidanceItems 
    : guidanceItems.filter(item => item.category === activeCategory);

  const getIcon = (category: string) => {
    switch (category) {
      case 'University Applications': return <Compass className="text-cyan" size={32} />;
      case 'CV Writing': return <FileText className="text-cyan" size={32} />;
      case 'Career Development': return <CheckCircle2 className="text-cyan" size={32} />;
      default: return <BookOpen className="text-cyan" size={32} />;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen pt-12 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl font-bold mb-4">Guidance <span className="text-cyan">& Resources</span></h1>
          <p className="text-gray-600 dark:text-gray-400">Everything you need to navigate your path from school to university and career.</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-4 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full border font-bold text-sm transition-all ${
                activeCategory === cat 
                ? 'bg-cyan text-black border-cyan' 
                : 'bg-gray-50 dark:bg-black text-gray-500 dark:text-gray-400 border-gray-800 hover:border-cyan hover:text-cyan'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div key={item._id} className="bg-zinc-950 border border-gray-800 rounded-2xl p-8 hover:border-cyan transition-all group">
                  <div className="w-16 h-16 bg-cyan/10 rounded-xl flex items-center justify-center mb-6">
                    {getIcon(item.category)}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                    {item.description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {item.steps.map((step, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 bg-cyan rounded-full"></div>
                        {step}
                      </li>
                    ))}
                  </ul>
                  <button className="flex items-center gap-2 text-cyan font-bold text-sm group-hover:gap-3 transition-all">
                    Read Guide <ArrowRight size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-zinc-950 rounded-2xl border border-dashed border-gray-800">
                <p className="text-gray-500 dark:text-gray-400">No guidance resources found for this category.</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-zinc-950 border border-gray-800 rounded-3xl p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Lightbulb size={120} className="text-cyan" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Need Personalized Career Advice?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Our expert counselors are here to help you make the best decisions for your future. Book a 15-minute introductory session to discuss your options.
            </p>
            <button className="bg-cyan text-black px-8 py-3 rounded-xl font-bold hover:bg-white dark:bg-gray-900 dark:hover:bg-gray-800 dark:hover:text-white transition-all">
              Schedule a Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guidance;

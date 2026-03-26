import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Database, Layers, Zap, Shield, LogOut, ExternalLink, Heart, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { User } from "../../types";
import { useTheme } from "../ThemeContext";
import { TemplatePart } from "../TemplatePart";

export const Home = ({ currentUser, onLogout, settings }: { currentUser: User | null, onLogout: () => void, settings: Record<string, any> }) => {
  const { get_posts, get_meta, get_header, get_footer } = useTheme();
  
  const featuredElements = get_posts({ limit: 6 });
  const header = get_header();
  const footer = get_footer();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Database size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">Modern Catalog</span>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Resources</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
          </div>
          
          <div className="h-6 w-px bg-slate-200 hidden md:block" />
          
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-4">
                <Link to="/admin" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors">Dashboard</Link>
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link 
                to="/admin" 
                className="px-5 py-2 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Header Template Part (Optional) */}
      {header && (
        <div className="bg-indigo-900 text-white px-8 py-2 text-center text-xs font-bold uppercase tracking-widest">
          <TemplatePart element={header} />
        </div>
      )}

      {/* Hero */}
      <main>
        <section className="px-8 pt-24 pb-32">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold tracking-wider uppercase mb-8">
                The Modern Data Catalog
              </span>
              <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8">
                Organize your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">digital universe.</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
                A flexible, modular CMS designed for the modern web. Connect your content, manage relationships, and scale without limits.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to="/admin" 
                  className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>
                <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                  Book a Demo
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Bento */}
        <section className="px-8 py-24 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 bg-slate-50 rounded-[2.5rem] p-12 border border-slate-100">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mb-6">
                  <Layers size={24} />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">Modular Hierarchy</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Build complex relationships between your data points. From publications to scenes, everything is connected in a rich, navigable graph.
                </p>
              </div>
              <div className="md:col-span-4 bg-indigo-600 rounded-[2.5rem] p-12 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white mb-6">
                  <Zap size={24} />
                </div>
                <h3 className="text-3xl font-bold mb-4">Fast API</h3>
                <p className="text-lg text-indigo-100 leading-relaxed">
                  Lightning fast responses for your headless applications.
                </p>
              </div>
              <div className="md:col-span-4 bg-slate-900 rounded-[2.5rem] p-12 text-white">
                 <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white mb-6">
                  <Shield size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Secure by Design</h3>
                <p className="text-slate-400">
                  Granular RBAC controls for every type.
                </p>
              </div>
              <div className="md:col-span-8 bg-slate-50 rounded-[2.5rem] p-12 border border-slate-100">
                <h3 className="text-3xl font-bold text-slate-900 mb-4">Real-time Collaboration</h3>
                <p className="text-lg text-slate-600">
                  Work together with your team in real-time. Changes are synced instantly across all devices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Preview */}
        <section className="px-8 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-slate-900">Featured Catalog Elements</h2>
              <Link to="/admin" className="text-indigo-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                Manage Catalog <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredElements.map(el => (
                <Link 
                  key={el.id} 
                  to={`/e/${el.slug}`}
                  className="group bg-white border border-slate-200 rounded-3xl p-8 hover:border-indigo-600 transition-all hover:shadow-2xl hover:shadow-indigo-600/5 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {el.type_name}
                    </div>
                    <ExternalLink size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{el.name}</h4>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-3 flex-grow">
                    {get_meta(el, 'body') || `Explore the details of this ${el.type_name.toLowerCase()} in our catalog.`}
                  </p>
                  <div className="h-px w-full bg-slate-100 mb-6" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-indigo-600">
                      View Details
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                        <Heart size={14} className="text-rose-500" />
                        {el.interactions?.filter((i: any) => i.type_name === 'Like').length || 0}
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                        <MessageSquare size={14} className="text-indigo-500" />
                        {el.interactions?.filter((i: any) => i.type_name === 'Comment').length || 0}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer Template Part (Optional) */}
      {footer ? (
        <div className="bg-slate-900 text-white px-8 py-12">
          <TemplatePart element={footer} />
        </div>
      ) : (
        <footer className="px-8 py-16 border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white">
                <Database size={14} />
              </div>
              <span className="font-bold text-slate-900">Modern Catalog</span>
            </div>
            <p className="text-sm text-slate-500">© 2026 Modern Catalog. Built with Theme Helpers.</p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><Zap size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><Shield size={20} /></a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

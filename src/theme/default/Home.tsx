import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Database, Layers, Zap, Shield, LogOut, User as UserIcon } from "lucide-react";
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-marine rounded-xl flex items-center justify-center text-brand-yellow shadow-lg">
            <Database size={24} />
          </div>
          <span className="text-xl font-black tracking-tight text-marine">Catalog</span>
        </div>
        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-6">
              <Link to="/admin" className="text-sm font-bold text-zinc-500 hover:text-marine transition-colors">Dashboard</Link>
              <div className="flex items-center gap-3 pl-6 border-l border-zinc-100">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Logged in as</p>
                  <p className="text-sm font-bold text-marine">{currentUser.username}</p>
                </div>
                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
                  <UserIcon size={20} />
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-red-500 transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/admin" className="text-sm font-bold text-zinc-500 hover:text-marine transition-colors">Admin Login</Link>
              <Link to="/admin" className="px-6 py-2.5 bg-marine text-brand-yellow rounded-full font-bold hover:bg-marine-light transition-all shadow-md">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Header Template Part (Optional) */}
      {header && (
        <div className="bg-marine text-brand-yellow px-6 py-2 text-center text-xs font-bold uppercase tracking-widest">
          <TemplatePart element={header} />
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-marine leading-[0.9] mb-8">
                The Future of <span className="text-zinc-400">Catalog</span> Management.
              </h1>
              <p className="text-xl text-zinc-500 font-medium leading-relaxed mb-12">
                A modular, flexible, and powerful system to manage your data graph with ease. Built for speed, security, and scalability.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to="/admin" 
                  className="w-full sm:w-auto px-10 py-5 bg-marine text-brand-yellow rounded-2xl font-bold text-lg hover:bg-marine-light transition-all shadow-2xl flex items-center justify-center gap-3"
                >
                  Explore Dashboard
                  <ArrowRight size={20} />
                </Link>
                <button className="w-full sm:w-auto px-10 py-5 bg-zinc-100 text-zinc-600 rounded-2xl font-bold text-lg hover:bg-zinc-200 transition-all">
                  View Documentation
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-yellow/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-marine/5 blur-[120px] rounded-full" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-marine border border-zinc-100">
                <Layers size={32} />
              </div>
              <h3 className="text-2xl font-bold text-marine">Modular Architecture</h3>
              <p className="text-zinc-500 leading-relaxed">
                Define your own schema types and modular tables. Every element is a node in a rich, connected graph.
              </p>
            </div>
            <div className="space-y-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-marine border border-zinc-100">
                <Zap size={32} />
              </div>
              <h3 className="text-2xl font-bold text-marine">Real-time Sync</h3>
              <p className="text-zinc-500 leading-relaxed">
                Experience instantaneous updates across all clients. Your data is always fresh and always available.
              </p>
            </div>
            <div className="space-y-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-marine border border-zinc-100">
                <Shield size={32} />
              </div>
              <h3 className="text-2xl font-bold text-marine">Granular Security</h3>
              <p className="text-zinc-500 leading-relaxed">
                Powerful RBAC system with type-level permissions. Control exactly who can view, create, or edit any data point.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Elements */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-4xl font-black text-marine tracking-tight">Featured Catalog Elements</h2>
              <p className="text-zinc-500 mt-2">Discover the latest additions to our catalog.</p>
            </div>
            <Link to="/admin" className="text-marine font-bold hover:underline flex items-center gap-2">
              Manage Catalog <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredElements.map((el) => (
              <Link 
                key={el.id} 
                to={`/e/${el.slug}`}
                className="group bg-white border border-zinc-100 rounded-3xl p-8 hover:shadow-2xl hover:border-marine/10 transition-all flex flex-col"
              >
                <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 mb-6 group-hover:bg-marine group-hover:text-brand-yellow transition-colors">
                  <Database size={24} />
                </div>
                <h4 className="text-xl font-bold text-marine mb-2">{el.name}</h4>
                <p className="text-zinc-500 text-sm line-clamp-3 mb-6 flex-grow">
                  {get_meta(el, 'body') || `Explore the details and relationships of this ${el.type_name.toLowerCase()}.`}
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-marine group-hover:gap-4 transition-all mt-auto">
                  Learn More <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      {footer ? (
        <div className="bg-marine text-white px-6 py-20">
          <TemplatePart element={footer} />
        </div>
      ) : (
        <footer className="bg-marine py-20 text-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-marine-light rounded-xl flex items-center justify-center text-brand-yellow">
                  <Database size={24} />
                </div>
                <span className="text-xl font-black tracking-tight">Catalog</span>
              </div>
              <div className="flex gap-12 text-sm font-bold text-white/60">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Contact Us</a>
              </div>
              <p className="text-sm text-white/40">© 2026 Catalog. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

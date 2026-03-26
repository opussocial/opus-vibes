import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  Layout, 
  BookOpen, 
  Home as HomeIcon, 
  Zap, 
  Palette, 
  Layers,
  ExternalLink
} from "lucide-react";
import { User } from "../types";

const THEMES = [
  {
    id: "hostel-magazine",
    name: "Nomad Edition",
    description: "The hybrid experience. Editorial magazine meets boutique hostel management.",
    color: "#FF6321",
    icon: BookOpen,
    image: "https://images.unsplash.com/photo-1555854811-8af2177efd05?auto=format&fit=crop&q=80&w=800",
    vibe: "Sophisticated / Editorial"
  },
  {
    id: "hostel",
    name: "Brutalist Hostel",
    description: "High-contrast, data-dense management interface for the modern hostel operator.",
    color: "#00FF00",
    icon: HomeIcon,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
    vibe: "Technical / Bold"
  },
  {
    id: "magazine",
    name: "The Magazine",
    description: "A dark, immersive editorial experience focused on high-impact storytelling.",
    color: "#F27D26",
    icon: BookOpen,
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800",
    vibe: "Cinematic / Dark"
  },
  {
    id: "tailwind",
    name: "Tailwind Minimal",
    description: "Clean, functional, and trustworthy. The standard for modern utility apps.",
    color: "#38B2AC",
    icon: Layout,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    vibe: "Clean / Utility"
  },
  {
    id: "bootstrap",
    name: "Bootstrap Classic",
    description: "Familiar, reliable, and accessible. Built on the foundations of the web.",
    color: "#7952B3",
    icon: Layers,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
    vibe: "Reliable / Standard"
  }
];

export const Portal = ({ currentUser }: { currentUser: User | null }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-white selection:text-black">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <header className="relative z-10 p-8 md:p-12 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white text-black flex items-center justify-center rounded-lg font-black italic">T</div>
          <span className="text-xl font-black tracking-tighter uppercase">Theme_Engine</span>
        </div>
        <Link to="/admin" className="px-6 py-2 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
          Admin Dashboard
        </Link>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-32"
        >
          <span className="text-blue-500 font-mono text-sm mb-4 block tracking-widest uppercase">System Initialization // 2026</span>
          <h1 className="text-[12vw] md:text-[8vw] font-black leading-[0.85] tracking-tighter uppercase mb-12">
            CHOOSE YOUR <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">INTERFACE.</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/60 max-w-2xl leading-relaxed">
            One CMS, multiple realities. Explore our curated collection of theme architectures designed for different content strategies.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {THEMES.map((theme, idx) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#111] border border-white/5 hover:border-white/20 transition-all"
            >
              <img 
                src={theme.image} 
                alt={theme.name}
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="mb-4 flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <theme.icon size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest py-1 px-3 bg-white/5 rounded-full border border-white/10">
                    {theme.vibe}
                  </span>
                </div>
                
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">{theme.name}</h3>
                <p className="text-sm text-white/60 mb-8 line-clamp-2 leading-relaxed">
                  {theme.description}
                </p>
                
                <button 
                  onClick={() => {
                    // In a real app, we'd update the setting. 
                    // For this demo, we can just navigate or use a query param.
                    window.location.href = `/?theme=${theme.id}`;
                  }}
                  className="flex items-center justify-between w-full p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 group-hover:bg-white group-hover:text-black transition-all"
                >
                  <span className="text-xs font-black uppercase tracking-widest">Launch Experience</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 p-12 border-t border-white/5 mt-32">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <span className="text-xl font-black tracking-tighter uppercase">Theme_Engine</span>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">v2.5.0-stable</span>
          </div>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-white/40">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">API Reference</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
};

export default Portal;

import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  User as UserIcon, 
  Share2, 
  Bookmark,
  MessageSquare,
  Heart,
  Menu,
  Search
} from "lucide-react";
import { useTheme } from "../ThemeContext";
import { User } from "../../types";

export const ElementPage = ({ currentUser, onLogout, settings }: { currentUser: User | null, onLogout: () => void, settings: Record<string, any> }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { elements, types } = useTheme();
  const element = elements.find(e => e.slug === slug);

  if (!element) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-black mb-4">404</h2>
          <p className="text-[#1A1A1A]/60 mb-8">The story you're looking for has vanished.</p>
          <Link to="/" className="px-8 py-3 bg-[#1A1A1A] text-white rounded-full font-bold uppercase tracking-widest text-xs">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-serif selection:bg-[#FF6321] selection:text-white">
      {/* Editorial Header */}
      <header className="border-b border-[#1A1A1A]/10 sticky top-0 bg-[#F5F2ED]/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-[#1A1A1A]/5 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </button>
            <nav className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-[0.2em] font-sans font-semibold">
              <Link to="/" className="hover:opacity-50 transition-opacity">Home</Link>
              <Link to="/explore" className="hover:opacity-50 transition-opacity">Magazine</Link>
              <Link to="/explore" className="hover:opacity-50 transition-opacity">Rooms</Link>
            </nav>
          </div>

          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-3xl font-black tracking-tighter uppercase font-sans">NOMAD_EDITION</h1>
          </Link>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-[#1A1A1A]/5 rounded-full transition-colors">
              <Search size={20} />
            </button>
            {currentUser ? (
              <Link to="/admin" className="w-10 h-10 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                <UserIcon size={20} />
              </Link>
            ) : (
              <Link to="/admin" className="px-5 py-2 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-widest font-sans font-bold rounded-full hover:opacity-80 transition-opacity">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Article Hero */}
      <article className="max-w-4xl mx-auto py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="px-3 py-1 bg-[#FF6321] text-white text-[10px] uppercase tracking-widest font-sans font-bold">{element.type_name}</span>
            <span className="text-[#1A1A1A]/40 text-[10px] uppercase tracking-widest font-sans font-bold">{new Date(element.created_at).toLocaleDateString()}</span>
          </div>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase font-sans mb-8 leading-[0.9]">
            {element.name}
          </h2>
          <div className="flex items-center justify-center gap-4 text-[#1A1A1A]/60 italic">
            <span>By Nomad Edition Staff</span>
            <span className="w-1 h-1 bg-[#FF6321] rounded-full" />
            <span>5 Min Read</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="aspect-[16/9] bg-zinc-200 mb-16 overflow-hidden rounded-3xl"
        >
          <img 
            src={`https://picsum.photos/seed/${element.slug}/1600/900`} 
            alt={element.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-12">
          {/* Social Sidebar */}
          <aside className="hidden md:flex flex-col gap-6 sticky top-32 h-fit">
            <button className="w-12 h-12 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#FF6321] hover:text-white transition-all">
              <Heart size={20} />
            </button>
            <button className="w-12 h-12 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#FF6321] hover:text-white transition-all">
              <MessageSquare size={20} />
            </button>
            <button className="w-12 h-12 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#FF6321] hover:text-white transition-all">
              <Bookmark size={20} />
            </button>
            <button className="w-12 h-12 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#FF6321] hover:text-white transition-all">
              <Share2 size={20} />
            </button>
          </aside>

          {/* Content Body */}
          <div className="prose prose-xl prose-zinc max-w-none">
            <p className="text-2xl leading-relaxed mb-8 first-letter:text-7xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-[#FF6321] first-letter:font-sans">
              This is where the story begins. A journey through the modular architecture of the Nomad Edition. Every element is a node in a larger graph of experiences.
            </p>
            <p className="text-xl leading-relaxed mb-8 text-[#1A1A1A]/80">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <div className="bg-[#1A1A1A] text-white p-12 rounded-3xl my-16">
              <h4 className="text-3xl font-black uppercase font-sans mb-4 tracking-tighter">A Note from the Editor</h4>
              <p className="text-white/60 italic text-lg leading-relaxed">
                "Travel is more than just movement. It's about the connections we make along the way. Our hostel serves as the physical manifestation of these digital stories."
              </p>
            </div>
            <p className="text-xl leading-relaxed mb-8 text-[#1A1A1A]/80">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-[#1A1A1A]/10">
        <div className="max-w-7xl mx-auto text-center">
          <h4 className="text-2xl font-black tracking-tighter font-sans mb-8 uppercase">NOMAD_EDITION</h4>
          <div className="flex justify-center gap-8 text-[10px] uppercase tracking-widest font-sans font-bold text-[#1A1A1A]/40">
            <Link to="/" className="hover:text-[#1A1A1A] transition-colors">Home</Link>
            <Link to="/explore" className="hover:text-[#1A1A1A] transition-colors">Magazine</Link>
            <Link to="/explore" className="hover:text-[#1A1A1A] transition-colors">Rooms</Link>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap');
        
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
};

export default ElementPage;

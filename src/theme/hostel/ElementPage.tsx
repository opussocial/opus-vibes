import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  MessageSquare, 
  ChevronRight,
  ExternalLink,
  Menu,
  Database,
  Calendar,
  Users,
  MapPin,
  Clock,
  Zap,
  CheckCircle2
} from "lucide-react";
import { ElementDetail, User } from "../../types";
import { useTheme } from "../ThemeContext";
import { TemplatePart } from "../TemplatePart";

export const ElementPage = ({ currentUser, onLogout, settings }: { currentUser: User | null, onLogout: () => void, settings: Record<string, any> }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { get_element, get_meta, get_children, get_related, get_header, get_footer } = useTheme();
  const [element, setElement] = useState<ElementDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadElement = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/elements/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setElement(data);
        }
      } catch (error) {
        console.error("Error loading element:", error);
      } finally {
        setLoading(false);
      }
    };
    loadElement();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gallery-white flex items-center justify-center">
        <div className="w-16 h-16 border-8 border-brutal-black border-t-neon-green animate-spin" />
      </div>
    );
  }

  if (!element) {
    return (
      <div className="min-h-screen bg-gallery-white flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-9xl font-display uppercase tracking-tighter mb-8">404</h1>
        <p className="text-2xl font-black uppercase mb-12">Lost in the grid.</p>
        <Link to="/" className="px-12 py-6 bg-brutal-black text-neon-green font-black uppercase tracking-widest border-4 border-brutal-black hover:bg-neon-green hover:text-brutal-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          Back to Base
        </Link>
      </div>
    );
  }

  const children = get_children(element.id);
  const related = get_related(element.id);
  const header = get_header();
  const footer = get_footer();

  return (
    <div className="min-h-screen bg-gallery-white text-brutal-black font-hostel selection:bg-neon-green selection:text-brutal-black">
      {/* Brutalist Nav */}
      <nav className="border-b-4 border-brutal-black sticky top-0 bg-gallery-white z-50">
        <div className="flex items-center justify-between h-20 px-8">
          <div className="flex items-center gap-8">
            <button onClick={() => navigate(-1)} className="w-12 h-12 border-4 border-brutal-black flex items-center justify-center hover:bg-neon-green transition-colors">
              <ArrowLeft size={24} strokeWidth={3} />
            </button>
            <Link to="/" className="hidden md:flex items-center gap-3 group">
              <div className="w-8 h-8 bg-brutal-black text-neon-green flex items-center justify-center border-2 border-brutal-black group-hover:bg-neon-green group-hover:text-brutal-black transition-colors">
                <Database size={18} strokeWidth={3} />
              </div>
              <span className="text-2xl font-display uppercase tracking-tighter">HOSTEL_X</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="w-12 h-12 border-4 border-brutal-black flex items-center justify-center hover:bg-neon-green transition-colors">
              <Share2 size={20} strokeWidth={3} />
            </button>
            {currentUser ? (
              <Link to="/admin" className="w-12 h-12 border-4 border-brutal-black flex items-center justify-center hover:bg-neon-green transition-colors">
                <Users size={20} strokeWidth={3} />
              </Link>
            ) : (
              <Link to="/admin" className="px-6 py-2 bg-brutal-black text-neon-green font-black uppercase text-[10px] tracking-widest border-4 border-brutal-black hover:bg-neon-green hover:text-brutal-black transition-all">
                Book Now
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section: Brutalist Grid */}
      <header className="border-b-4 border-brutal-black">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-8 lg:p-20 border-b-4 lg:border-b-0 lg:border-r-4 border-brutal-black">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <span className="px-4 py-1 bg-neon-green border-2 border-brutal-black text-[10px] font-black uppercase tracking-widest">{element.type_name}</span>
                <span className="font-mono text-xs font-bold opacity-40">#{element.id}</span>
              </div>
              
              <h1 className="text-7xl md:text-9xl font-display leading-[0.85] uppercase mb-12 tracking-tighter">
                {element.name}
              </h1>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t-4 border-brutal-black">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Status</p>
                  <p className="font-black uppercase text-lg">{element.status || 'Available'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Capacity</p>
                  <p className="font-black uppercase text-lg">2-4 People</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Price</p>
                  <p className="font-black uppercase text-lg">$45/NT</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Rating</p>
                  <p className="font-black uppercase text-lg">4.9/5</p>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="lg:col-span-5 relative bg-brutal-black overflow-hidden group">
            <img 
              src={`https://picsum.photos/seed/${element.slug}/1200/1200`} 
              alt={element.name}
              className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000 grayscale hover:grayscale-0"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-8 right-8">
              <button className="w-16 h-16 bg-neon-green border-4 border-brutal-black flex items-center justify-center hover:scale-110 transition-transform shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <Heart size={32} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="grid grid-cols-1 lg:grid-cols-12 border-b-4 border-brutal-black">
        {/* Left Sidebar: Info */}
        <aside className="lg:col-span-3 p-8 border-b-4 lg:border-b-0 lg:border-r-4 border-brutal-black space-y-12">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-neon-green bg-brutal-black px-4 py-1 inline-block">Location</h4>
            <div className="flex items-start gap-4">
              <MapPin size={24} strokeWidth={3} className="mt-1" />
              <p className="font-bold text-lg leading-tight">Berlin / Kreuzberg <br/> Reichenberger Str. 123</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-neon-green bg-brutal-black px-4 py-1 inline-block">Amenities</h4>
            <ul className="space-y-4">
              {['High-Speed Wifi', 'Community Kitchen', 'Rooftop Access', '24/7 Security', 'Linen Included'].map(amenity => (
                <li key={amenity} className="flex items-center gap-3 font-bold">
                  <CheckCircle2 size={18} strokeWidth={3} className="text-neon-green" />
                  {amenity}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-8 bg-neon-green border-4 border-brutal-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h5 className="text-2xl font-display uppercase mb-4">Book Now</h5>
            <p className="font-bold text-sm mb-6">Secure your modular space in the heart of the city.</p>
            <button className="w-full py-4 bg-brutal-black text-neon-green font-black uppercase text-xs tracking-widest hover:translate-x-1 hover:-translate-y-1 transition-transform">
              Check Availability
            </button>
          </div>
        </aside>

        {/* Center: Body Content */}
        <div className="lg:col-span-6 p-8 lg:p-20 border-b-4 lg:border-b-0 lg:border-r-4 border-brutal-black">
          <div className="prose prose-brutal max-w-none">
            <p className="text-3xl font-black leading-tight mb-12 uppercase tracking-tighter">
              {get_meta(element, 'body', "Experience the perfect blend of privacy and community in our modular living spaces.")}
            </p>
            
            <div className="space-y-10 text-xl font-bold leading-relaxed opacity-80">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              
              {/* Modular Content Injection */}
              {element.content && (
                <div className="my-16 p-12 bg-neon-green border-4 border-brutal-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-4 mb-6">
                    <Zap size={24} strokeWidth={3} />
                    <span className="font-black uppercase tracking-[0.2em] text-xs">Modular Insight</span>
                  </div>
                  <p className="text-2xl font-black uppercase leading-none">
                    {element.content.body}
                  </p>
                </div>
              )}
              
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </div>
          
          {/* Tags */}
          <div className="mt-20 flex flex-wrap gap-4">
            {['Modular', 'Nomad', 'Berlin', 'Design'].map(tag => (
              <span key={tag} className="px-6 py-2 border-4 border-brutal-black font-black uppercase text-[10px] tracking-widest hover:bg-neon-green transition-colors cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Related/Children */}
        <aside className="lg:col-span-3 p-8 space-y-20">
          {children.length > 0 && (
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-10 border-b-4 border-brutal-black pb-4">Sub-Spaces</h4>
              <div className="space-y-6">
                {children.map(child => (
                  <Link key={child.id} to={`/e/${child.slug}`} className="group block p-6 border-4 border-brutal-black hover:bg-neon-green transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">{child.type_name}</span>
                    <h5 className="text-xl font-display uppercase leading-none">{child.name}</h5>
                    <ChevronRight size={20} className="mt-4 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {related.length > 0 && (
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-10 border-b-4 border-brutal-black pb-4">Related Vibes</h4>
              <div className="space-y-10">
                {related.slice(0, 4).map(rel => (
                  <Link key={rel.id} to={`/e/${rel.slug}`} className="flex gap-6 group">
                    <div className="w-20 h-20 border-4 border-brutal-black overflow-hidden flex-shrink-0">
                      <img src={`https://picsum.photos/seed/${rel.slug}/200/200`} alt={rel.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h5 className="font-black uppercase leading-none group-hover:text-neon-green transition-colors">{rel.name}</h5>
                      <span className="text-[10px] font-bold uppercase opacity-40 tracking-widest">{rel.type_name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>

      {/* Footer */}
      <footer className="bg-brutal-black text-gallery-white p-20 text-center">
        <span className="text-6xl font-display uppercase tracking-tighter block mb-8 text-neon-green">HOSTEL_X</span>
        <p className="font-mono text-xs opacity-40 uppercase tracking-[0.4em]">© 2026 HOSTEL_X EDITORIAL GROUP / ALL RIGHTS RESERVED</p>
      </footer>

      <style>{`
        .prose-brutal p {
          margin-bottom: 2rem;
        }
      `}</style>
    </div>
  );
};

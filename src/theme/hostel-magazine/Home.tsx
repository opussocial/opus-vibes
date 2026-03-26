import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Menu, 
  Instagram, 
  Twitter, 
  Facebook,
  Search,
  User as UserIcon
} from "lucide-react";
import { useTheme } from "../ThemeContext";
import { User } from "../../types";

export const Home = ({ currentUser, onLogout, settings }: { currentUser: User | null, onLogout: () => void, settings: Record<string, any> }) => {
  const { elements, types } = useTheme();

  // Filter elements for the "Magazine" section (e.g., articles, stories)
  const magazineElements = elements.filter(e => 
    e.type_name.toLowerCase().includes("article") || 
    e.type_name.toLowerCase().includes("story") ||
    e.type_name.toLowerCase().includes("post")
  ).slice(0, 3);

  // Filter elements for the "Hostel" section (e.g., rooms, amenities)
  const hostelElements = elements.filter(e => 
    e.type_name.toLowerCase().includes("room") || 
    e.type_name.toLowerCase().includes("amenity") ||
    e.type_name.toLowerCase().includes("service")
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-serif selection:bg-[#FF6321] selection:text-white">
      {/* Editorial Header */}
      <header className="border-b border-[#1A1A1A]/10 sticky top-0 bg-[#F5F2ED]/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button className="p-2 -ml-2 hover:bg-[#1A1A1A]/5 rounded-full transition-colors">
              <Menu size={24} />
            </button>
            <nav className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-[0.2em] font-sans font-semibold">
              <Link to="/" className="hover:opacity-50 transition-opacity text-[#FF6321]">Portal</Link>
              <Link to="/home" className="hover:opacity-50 transition-opacity">Home</Link>
              <Link to="/explore" className="hover:opacity-50 transition-opacity">Magazine</Link>
              <Link to="/explore" className="hover:opacity-50 transition-opacity">Rooms</Link>
              <Link to="/explore" className="hover:opacity-50 transition-opacity">About</Link>
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

      {/* Hero Section: Editorial Impact */}
      <section className="relative h-[90vh] overflow-hidden border-b border-[#1A1A1A]">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1555854811-8af2177efd05?auto=format&fit=crop&q=80&w=2000" 
            alt="Hostel Life" 
            className="w-full h-full object-cover grayscale-[0.2] brightness-[0.8]"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-transparent to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-20 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-[#FF6321] text-white text-[10px] uppercase tracking-widest font-sans font-bold">Issue No. 12</span>
              <span className="text-white/60 text-[10px] uppercase tracking-widest font-sans font-bold">Spring 2026</span>
            </div>
            <h2 className="text-[12vw] md:text-[8vw] leading-[0.85] text-white font-black tracking-tighter uppercase font-sans mb-8">
              THE ART OF <br /> <span className="italic font-serif font-light">Wandering</span>
            </h2>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <p className="text-white/80 text-lg md:text-xl max-w-xl leading-relaxed">
                Exploring the intersection of community, culture, and the open road. Our hostel isn't just a place to sleep—it's a living magazine of human stories.
              </p>
              <Link to="/explore" className="group flex items-center gap-4 text-white">
                <div className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-[#1A1A1A] transition-all duration-500">
                  <ArrowRight size={24} />
                </div>
                <span className="text-[11px] uppercase tracking-[0.3em] font-sans font-bold">Read the Story</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Magazine Grid: The Stories */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <span className="text-[#FF6321] text-[11px] uppercase tracking-[0.3em] font-sans font-bold block mb-4">Latest from the Press</span>
            <h3 className="text-6xl font-black tracking-tighter uppercase font-sans">THE_JOURNAL</h3>
          </div>
          <Link to="/explore" className="text-[11px] uppercase tracking-[0.2em] font-sans font-bold border-b border-[#1A1A1A] pb-1 hover:opacity-50 transition-opacity">
            View All Stories
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {magazineElements.length > 0 ? magazineElements.map((article, idx) => (
            <motion.div 
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[3/4] overflow-hidden mb-6 bg-zinc-200">
                <img 
                  src={`https://picsum.photos/seed/${article.slug}/800/1200`} 
                  alt={article.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center gap-3 mb-3 text-[10px] uppercase tracking-widest font-sans font-bold text-[#1A1A1A]/40">
                <span>{article.type_name}</span>
                <span className="w-1 h-1 bg-[#FF6321] rounded-full" />
                <span>{new Date(article.created_at).toLocaleDateString()}</span>
              </div>
              <h4 className="text-2xl font-bold leading-tight mb-4 group-hover:text-[#FF6321] transition-colors">
                {article.name}
              </h4>
              <Link to={`/e/${article.slug}`} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-sans font-bold group-hover:translate-x-2 transition-transform">
                Read More <ArrowRight size={14} />
              </Link>
            </motion.div>
          )) : (
            <div className="col-span-3 py-20 text-center border border-dashed border-[#1A1A1A]/20 rounded-3xl">
              <p className="text-[#1A1A1A]/40 uppercase tracking-widest text-sm font-sans font-bold">No stories published yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Hostel Section: The Space */}
      <section className="bg-[#1A1A1A] text-white py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="aspect-square rounded-full overflow-hidden border-[20px] border-white/5"
              >
                <img 
                  src="https://images.unsplash.com/photo-1520277739336-7bf67edfa768?auto=format&fit=crop&q=80&w=1000" 
                  alt="Hostel Interior" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#FF6321] rounded-full flex items-center justify-center p-8 text-center rotate-12">
                <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold leading-tight">
                  Voted Best Community Space 2025
                </span>
              </div>
            </div>

            <div>
              <span className="text-[#FF6321] text-[11px] uppercase tracking-[0.3em] font-sans font-bold block mb-6">Stay with Us</span>
              <h3 className="text-7xl font-black tracking-tighter uppercase font-sans mb-8 leading-[0.9]">
                MORE THAN <br /> A BED.
              </h3>
              <p className="text-white/60 text-lg mb-12 leading-relaxed">
                Our rooms are designed for the modern nomad. Minimalist, functional, and deeply rooted in the local aesthetic. Whether you're here for a night or a month, you're part of the story.
              </p>
              
              <div className="grid grid-cols-2 gap-8 mb-12">
                {hostelElements.map(item => (
                  <Link key={item.id} to={`/e/${item.slug}`} className="group">
                    <div className="text-[10px] uppercase tracking-widest font-sans font-bold text-white/40 mb-1">{item.type_name}</div>
                    <div className="text-xl font-bold group-hover:text-[#FF6321] transition-colors">{item.name}</div>
                  </Link>
                ))}
              </div>

              <Link to="/explore" className="inline-flex items-center gap-6 px-10 py-5 bg-white text-[#1A1A1A] font-sans font-black uppercase tracking-widest rounded-full hover:bg-[#FF6321] hover:text-white transition-all duration-500">
                Book Your Stay <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter / Footer */}
      <footer className="py-24 px-6 border-t border-[#1A1A1A]/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-4xl font-black tracking-tighter uppercase font-sans mb-8">Subscribe to <br /> THE_NOMAD_EDITION</h4>
              <p className="text-[#1A1A1A]/60 mb-8 max-w-md">
                Get the latest stories, travel tips, and exclusive offers delivered to your inbox every month.
              </p>
              <form className="flex gap-4 max-w-md">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-1 bg-transparent border-b border-[#1A1A1A] py-3 focus:outline-none focus:border-[#FF6321] transition-colors font-sans text-sm"
                />
                <button className="text-[11px] uppercase tracking-widest font-sans font-bold hover:text-[#FF6321] transition-colors">
                  Join
                </button>
              </form>
            </div>

            <div>
              <h5 className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold mb-8 text-[#1A1A1A]/40">Navigation</h5>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link to="/" className="hover:text-[#FF6321] transition-colors">Home</Link></li>
                <li><Link to="/explore" className="hover:text-[#FF6321] transition-colors">Magazine</Link></li>
                <li><Link to="/explore" className="hover:text-[#FF6321] transition-colors">Rooms</Link></li>
                <li><Link to="/explore" className="hover:text-[#FF6321] transition-colors">About</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold mb-8 text-[#1A1A1A]/40">Connect</h5>
              <ul className="space-y-4 text-sm font-bold">
                <li><a href="#" className="hover:text-[#FF6321] transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-[#FF6321] transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-[#FF6321] transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-[#FF6321] transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-[#1A1A1A]/10 gap-8">
            <div className="flex items-center gap-8">
              <span className="text-2xl font-black tracking-tighter font-sans">NOMAD_EDITION</span>
              <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-[#1A1A1A]/40">© 2026 All Rights Reserved</span>
            </div>
            <div className="flex items-center gap-8 text-[10px] uppercase tracking-widest font-sans font-bold text-[#1A1A1A]/40">
              <Link to="/admin" className="hover:text-[#1A1A1A] transition-colors">Admin Dashboard</Link>
              <a href="#" className="hover:text-[#1A1A1A] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#1A1A1A] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap');
        
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #F5F2ED;
        }
        ::-webkit-scrollbar-thumb {
          background: #1A1A1A;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #FF6321;
        }
      `}</style>
    </div>
  );
};

export default Home;

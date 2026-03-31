import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  Menu, 
  Search, 
  User as UserIcon, 
  Zap, 
  Layers, 
  Database, 
  Shield,
  Plus,
  ArrowUpRight
} from "lucide-react";
import { useTheme } from "../ThemeContext";
import { User } from "../../types";

export const Home = ({ currentUser, onLogout, settings }: { currentUser: User | null, onLogout: () => void, settings: Record<string, any> }) => {
  const { elements, types } = useTheme();

  // Filter some elements to show
  const featured = elements.slice(0, 4);
  const recent = elements.slice(4, 10);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#00FF00] selection:text-black">
      {/* Header */}
      <header className="border-b-4 border-black sticky top-0 bg-white z-50">
        <div className="flex justify-between items-center px-6 py-4">
          <Link to="/" className="text-3xl font-black uppercase tracking-tighter hover:skew-x-[-10deg] transition-transform">
            BRUTAL.SYS
          </Link>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex gap-6 font-bold uppercase text-sm">
              <Link to="/explore" className="hover:underline underline-offset-4">Explore</Link>
              <Link to="/home" className="hover:underline underline-offset-4">Index</Link>
              {currentUser?.role_name === 'admin' && (
                <a href="/admin" className="hover:underline underline-offset-4">Admin</a>
              )}
            </nav>
            <div className="flex items-center gap-4">
              {currentUser ? (
                <button onClick={onLogout} className="bg-black text-white px-4 py-2 font-bold uppercase text-xs hover:bg-[#00FF00] hover:text-black transition-colors">
                  Logout
                </button>
              ) : (
                <Link to="/login" className="bg-black text-white px-4 py-2 font-bold uppercase text-xs hover:bg-[#00FF00] hover:text-black transition-colors">
                  Login
                </Link>
              )}
              <Menu className="w-8 h-8 cursor-pointer" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b-4 border-black grid grid-cols-1 lg:grid-cols-2">
        <div className="p-8 lg:p-16 flex flex-col justify-center border-b-4 lg:border-b-0 lg:border-r-4 border-black">
          <h1 className="text-7xl md:text-9xl font-black uppercase leading-[0.85] tracking-tighter mb-8">
            RAW<br />DATA<br />FLOW
          </h1>
          <p className="text-xl font-bold max-w-md mb-8 uppercase">
            A systematic approach to content management. No fluff. Just structure.
          </p>
          <Link to="/explore" className="inline-flex items-center gap-4 bg-[#00FF00] border-4 border-black p-6 text-2xl font-black uppercase hover:translate-x-2 hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
            Enter the System <ArrowRight className="w-8 h-8" />
          </Link>
        </div>
        <div className="bg-black text-[#00FF00] p-8 lg:p-16 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Database className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <div className="text-sm font-mono mb-4 uppercase tracking-widest">[ SYSTEM_STATUS: ACTIVE ]</div>
            <div className="text-4xl font-black uppercase mb-8 leading-tight">
              {elements.length} Elements Indexed<br />
              {types.length} Types Defined<br />
              100% Brutalist
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {types.slice(0, 4).map((type, i) => (
              <div key={type.id} className="border-2 border-[#00FF00] p-4 hover:bg-[#00FF00] hover:text-black transition-colors cursor-pointer group">
                <div className="text-xs font-mono mb-2">0{i + 1}</div>
                <div className="font-black uppercase">{type.name}</div>
                <div className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity uppercase mt-2">View Type _</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-black text-white py-4 overflow-hidden border-b-4 border-black whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="inline-block text-4xl font-black uppercase italic tracking-widest"
        >
          &nbsp; SYSTEM ARCHITECTURE • DATA INTEGRITY • BRUTALIST DESIGN • OPEN SOURCE • SCALABLE INFRASTRUCTURE • SYSTEM ARCHITECTURE • DATA INTEGRITY • BRUTALIST DESIGN • OPEN SOURCE • SCALABLE INFRASTRUCTURE •
        </motion.div>
      </div>

      {/* Featured Grid */}
      <section className="p-6 md:p-12">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-6xl font-black uppercase tracking-tighter">Featured</h2>
          <div className="text-sm font-bold uppercase underline underline-offset-8 cursor-pointer">View All Elements</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map((el, i) => (
            <Link key={el.id} to={`/e/${el.slug}`} className="group relative border-4 border-black p-6 hover:bg-black hover:text-white transition-all hover:translate-x-2 hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,255,0,1)]">
              <div className="absolute top-4 right-4 text-xs font-mono">[{el.type_slug.toUpperCase()}]</div>
              <div className="text-4xl font-black mb-4 mt-8 uppercase leading-none">{el.name}</div>
              <div className="h-1 w-12 bg-black group-hover:bg-[#00FF00] mb-4"></div>
              <p className="text-sm font-bold uppercase opacity-70 mb-8 line-clamp-2">
                {el.content?.body || "No description provided for this element."}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono">{new Date(el.created_at).toLocaleDateString()}</span>
                <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* List Section */}
      <section className="border-t-4 border-black bg-[#F0F0F0]">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="p-8 lg:p-12 border-b-4 lg:border-b-0 lg:border-r-4 border-black">
            <h3 className="text-4xl font-black uppercase mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recent.map((el) => (
                <Link key={el.id} to={`/e/${el.slug}`} className="block border-2 border-black p-4 hover:bg-white transition-colors group">
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase">{el.name}</span>
                    <span className="text-[10px] font-mono bg-black text-white px-2 py-1 group-hover:bg-[#00FF00] group-hover:text-black transition-colors">{el.type_slug}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="p-8 lg:p-12 border-b-4 lg:border-b-0 lg:border-r-4 border-black col-span-2">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-4xl font-black uppercase">System Specs</h3>
              <Plus className="w-8 h-8" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-4 border-black p-8 bg-white">
                <Zap className="w-12 h-12 mb-4" />
                <h4 className="text-2xl font-black uppercase mb-2">Performance</h4>
                <p className="font-bold uppercase text-sm">Optimized for high-speed data retrieval and rendering.</p>
              </div>
              <div className="border-4 border-black p-8 bg-white">
                <Shield className="w-12 h-12 mb-4" />
                <h4 className="text-2xl font-black uppercase mb-2">Security</h4>
                <p className="font-bold uppercase text-sm">Robust validation and access control built-in.</p>
              </div>
              <div className="border-4 border-black p-8 bg-white">
                <Layers className="w-12 h-12 mb-4" />
                <h4 className="text-2xl font-black uppercase mb-2">Modularity</h4>
                <p className="font-bold uppercase text-sm">Flexible schema that grows with your needs.</p>
              </div>
              <div className="border-4 border-black p-8 bg-white">
                <Database className="w-12 h-12 mb-4" />
                <h4 className="text-2xl font-black uppercase mb-2">Integrity</h4>
                <p className="font-bold uppercase text-sm">ACID compliant data structures for reliability.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white p-12 border-t-4 border-black">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="text-2xl font-black uppercase mb-6 tracking-tighter">BRUTAL.SYS</div>
            <p className="text-xs font-mono opacity-60 leading-relaxed uppercase">
              A minimalist, high-performance content management system built for the modern web. 
              Designed with raw aesthetics and systematic precision.
            </p>
          </div>
          <div>
            <div className="font-black uppercase mb-6">Navigation</div>
            <ul className="space-y-2 text-sm font-bold uppercase">
              <li><Link to="/home" className="hover:text-[#00FF00]">Home</Link></li>
              <li><Link to="/explore" className="hover:text-[#00FF00]">Explore</Link></li>
              <li><Link to="/e/about" className="hover:text-[#00FF00]">About</Link></li>
              <li><Link to="/e/contact" className="hover:text-[#00FF00]">Contact</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-black uppercase mb-6">Connect</div>
            <ul className="space-y-2 text-sm font-bold uppercase">
              <li><a href="#" className="hover:text-[#00FF00]">Twitter</a></li>
              <li><a href="#" className="hover:text-[#00FF00]">GitHub</a></li>
              <li><a href="#" className="hover:text-[#00FF00]">Discord</a></li>
              <li><a href="#" className="hover:text-[#00FF00]">LinkedIn</a></li>
            </ul>
          </div>
          <div>
            <div className="font-black uppercase mb-6">Newsletter</div>
            <div className="flex border-2 border-white">
              <input type="text" placeholder="EMAIL" className="bg-transparent p-2 text-xs font-mono focus:outline-none w-full" />
              <button className="bg-white text-black px-4 font-black text-xs uppercase hover:bg-[#00FF00] transition-colors">Join</button>
            </div>
          </div>
        </div>
        <div className="pt-12 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] font-mono opacity-40 uppercase">© 2026 BRUTAL.SYS _ ALL RIGHTS RESERVED</div>
          <div className="flex gap-8 text-[10px] font-mono opacity-40 uppercase">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

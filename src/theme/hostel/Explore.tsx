import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Search, 
  Filter, 
  ArrowRight, 
  Database,
  Grid,
  List as ListIcon,
  Tag,
  Calendar,
  MapPin,
  Package,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Element, ElementType, User } from "../../types";
import { useTheme } from "../ThemeContext";

export const Explore = ({ currentUser, onLogout, settings }: { currentUser: User | null, onLogout: () => void, settings: Record<string, any> }) => {
  const { elements, types } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredElements = elements.filter(el => {
    const matchesSearch = el.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         el.type_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || el.type_slug === selectedType;
    return matchesSearch && matchesType;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "FileText": return <FileText size={18} />;
      case "Image": return <ImageIcon size={18} />;
      case "Music": return <Music size={18} />;
      case "Video": return <Video size={18} />;
      case "MapPin": return <MapPin size={18} />;
      case "Package": return <Package size={18} />;
      case "Tag": return <Tag size={18} />;
      case "Calendar": return <Calendar size={18} />;
      default: return <Database size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-gallery-white text-brutal-black font-hostel selection:bg-neon-green selection:text-brutal-black">
      {/* Brutalist Header */}
      <header className="border-b-4 border-brutal-black sticky top-0 bg-gallery-white z-50">
        <div className="flex items-center justify-between h-24 px-8">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-brutal-black text-neon-green flex items-center justify-center border-2 border-brutal-black group-hover:bg-neon-green group-hover:text-brutal-black transition-colors">
              <Database size={28} strokeWidth={3} />
            </div>
            <span className="text-4xl font-display uppercase tracking-tighter">EXPLORE_X</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/admin" className="px-8 py-3 bg-brutal-black text-neon-green font-black uppercase text-xs tracking-widest border-4 border-brutal-black hover:bg-neon-green hover:text-brutal-black transition-all">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="p-8 lg:p-24">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-20">
          <div className="max-w-2xl">
            <span className="text-6xl font-display uppercase leading-none block text-neon-green">01</span>
            <h1 className="text-8xl font-display uppercase leading-none tracking-tighter mb-8">CONTENT_HUB</h1>
            <p className="text-2xl font-bold leading-tight">
              Browse through all modular elements in the system. Filter by type or search for specific items.
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brutal-black" size={24} strokeWidth={3} />
              <input 
                type="text"
                placeholder="SEARCH_SYSTEM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-96 pl-14 pr-6 py-5 bg-white border-4 border-brutal-black font-black uppercase tracking-widest focus:bg-neon-green focus:outline-none transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-8 mb-12 border-b-4 border-brutal-black pb-8">
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setSelectedType("all")}
              className={`px-6 py-3 border-4 border-brutal-black font-black uppercase text-xs tracking-widest transition-all ${
                selectedType === "all" ? "bg-brutal-black text-neon-green" : "bg-white text-brutal-black hover:bg-zinc-100"
              }`}
            >
              ALL_TYPES
            </button>
            {types.map(type => (
              <button 
                key={type.id}
                onClick={() => setSelectedType(type.slug)}
                className={`px-6 py-3 border-4 border-brutal-black font-black uppercase text-xs tracking-widest transition-all flex items-center gap-2 ${
                  selectedType === type.slug ? "bg-brutal-black text-neon-green" : "bg-white text-brutal-black hover:bg-zinc-100"
                }`}
              >
                <span style={{ color: selectedType === type.slug ? "inherit" : type.color }}>
                  {getIcon(type.icon)}
                </span>
                {type.name}
              </button>
            ))}
          </div>

          <div className="flex border-4 border-brutal-black">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-4 border-r-4 border-brutal-black transition-all ${viewMode === "grid" ? "bg-brutal-black text-neon-green" : "bg-white text-brutal-black hover:bg-zinc-100"}`}
            >
              <Grid size={24} strokeWidth={3} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-4 transition-all ${viewMode === "list" ? "bg-brutal-black text-neon-green" : "bg-white text-brutal-black hover:bg-zinc-100"}`}
            >
              <ListIcon size={24} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Results */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {filteredElements.map((el, idx) => (
              <motion.div
                key={el.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group border-4 border-brutal-black bg-white hover:bg-neon-green transition-colors shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
              >
                <Link to={`/e/${el.slug}`} className="block">
                  <div className="aspect-video border-b-4 border-brutal-black overflow-hidden bg-zinc-100">
                    <img 
                      src={`https://picsum.photos/seed/${el.slug}/800/450`} 
                      alt={el.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-brutal-black bg-white">
                        {el.type_name}
                      </span>
                      <span className="font-mono text-[10px] opacity-40">ID: {el.id}</span>
                    </div>
                    <h3 className="text-3xl font-display uppercase leading-none mb-6 group-hover:translate-x-2 transition-transform">{el.name}</h3>
                    <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
                      VIEW_DETAILS <ArrowRight size={14} strokeWidth={3} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredElements.map((el, idx) => (
              <motion.div
                key={el.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group border-4 border-brutal-black bg-white hover:bg-neon-green transition-colors p-6 flex items-center justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 border-4 border-brutal-black overflow-hidden shrink-0">
                    <img 
                      src={`https://picsum.photos/seed/${el.slug}/100/100`} 
                      alt={el.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{el.type_name}</span>
                      <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                      <span className="text-[10px] font-mono text-zinc-400">{new Date(el.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-2xl font-display uppercase">{el.name}</h3>
                  </div>
                </div>
                <Link to={`/e/${el.slug}`} className="w-12 h-12 bg-brutal-black text-neon-green flex items-center justify-center border-2 border-brutal-black group-hover:bg-white group-hover:text-brutal-black transition-colors">
                  <ChevronRight size={24} strokeWidth={3} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {filteredElements.length === 0 && (
          <div className="py-40 text-center border-4 border-brutal-black border-dashed">
            <h3 className="text-4xl font-display uppercase mb-4">NO_RESULTS_FOUND</h3>
            <p className="font-bold opacity-60">Try adjusting your search or filters.</p>
            <button 
              onClick={() => { setSearchTerm(""); setSelectedType("all"); }}
              className="mt-8 px-8 py-4 bg-brutal-black text-neon-green font-black uppercase tracking-widest hover:bg-neon-green hover:text-brutal-black transition-all"
            >
              RESET_FILTERS
            </button>
          </div>
        )}
      </main>

      <footer className="border-t-4 border-brutal-black bg-gallery-white p-8 lg:p-24">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="text-2xl font-display uppercase">EXPLORE_X © 2026</span>
          <span className="font-mono text-xs opacity-40 uppercase tracking-widest">Designed for the modular web</span>
        </div>
      </footer>
    </div>
  );
};

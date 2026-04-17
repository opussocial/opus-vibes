import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Database, Globe, Layers, Zap } from "lucide-react";

export const get_header = (settings: any) => (
  <header className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">
    <Link to="/" className="flex items-center gap-2 group">
      <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
        <Database size={18} />
      </div>
      <span className="font-bold text-zinc-900 tracking-tight text-lg">
        {settings.site_name || "FlexCatalog"}
      </span>
    </Link>
    <div className="hidden md:flex items-center gap-8">
      <Link to="/explore" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Explore</Link>
      <Link to="/admin" className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10">
        Admin Portal
      </Link>
    </div>
  </header>
);

export const get_footer = (settings: any) => (
  <footer className="border-t border-zinc-100 py-12 px-6 bg-zinc-50 mt-20">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center text-white">
          <Database size={14} />
        </div>
        <span className="font-bold text-zinc-900 text-sm">{settings.site_name || "FlexCatalog"} System</span>
      </div>
      <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest">
        © 2026 {settings.site_name || "FlexCatalog"} • Built with Template Engine
      </p>
      <div className="flex items-center gap-6">
        <a href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors text-xs font-bold uppercase tracking-wider">Twitter</a>
        <a href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors text-xs font-bold uppercase tracking-wider">GitHub</a>
      </div>
    </div>
  </footer>
);

export const the_title = (element: any) => (
  <motion.h1 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter mb-4 leading-[1.1]"
  >
    {element.name}
  </motion.h1>
);

export const the_content = (element: any) => {
  const content = element.content?.body || element.description || "";
  if (!content) return null;
  return (
    <div className="prose prose-zinc max-w-none mb-12 text-zinc-600 leading-relaxed text-lg">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export const the_children = (element: any) => {
  if (!element.children?.length) return null;
  return (
    <section className="mt-16">
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-8 flex items-center gap-2">
        <Layers size={14} />
        Contained Elements
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {element.children.map((child: any) => (
          <Link 
            key={child.id} 
            to={`/element/${child.type_slug || 'default'}/${child.slug}`}
            className="group block p-6 bg-white border border-zinc-100 rounded-2xl hover:border-zinc-900 transition-all hover:shadow-xl hover:shadow-zinc-200/50"
          >
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center justify-between">
              {child.type_name || 'Item'}
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
            </div>
            <div className="text-xl font-bold text-zinc-900 group-hover:text-black transition-colors">{child.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export const the_neighbors = (element: any) => {
  if (!element.neighbors?.length) return null;
  return (
    <section className="mt-16 pt-16 border-t border-zinc-100">
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-8 flex items-center gap-2">
        <Globe size={14} />
        Related Elements
      </h3>
      <div className="flex flex-wrap gap-4">
        {element.neighbors.map((n: any) => (
          <Link 
            key={n.id} 
            to={`/element/${n.type_slug || 'default'}/${n.slug}`}
            className="px-6 py-3 bg-zinc-50 border border-zinc-200 rounded-full text-zinc-600 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all text-sm font-medium"
          >
            {n.name}
            <span className="ml-2 text-[10px] opacity-50 uppercase tracking-widest font-bold">({n.rel_name || 'Link'})</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export const the_parent = (element: any) => {
  if (!element.parent) return null;
  return (
    <Link 
      to={`/element/${element.parent.type_slug || 'default'}/${element.parent.slug}`}
      className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-8 text-sm font-medium group"
    >
      <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
      Back to {element.parent.name}
    </Link>
  );
};

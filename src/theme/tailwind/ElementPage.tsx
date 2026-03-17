import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Database, Calendar, Tag, Share2, MoreHorizontal, ChevronRight, ArrowRight, Heart, MessageSquare, Eye, User as UserIcon } from "lucide-react";
import { ElementDetail, User } from "../../types";
import { themeUtils } from "./utils";

export const ElementPage = ({ currentUser, onLogout }: { currentUser: User | null, onLogout: () => void }) => {
  const { slug } = useParams<{ slug: string }>();
  const [element, setElement] = useState<ElementDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!slug) return;
      setLoading(true);
      const data = await themeUtils.getElementBySlug(slug);
      setElement(data);
      setLoading(false);
    };
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!element) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Element Not Found</h1>
        <Link to="/" className="text-indigo-600 font-bold hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Simple Nav */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 text-slate-900 font-bold">
          <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white">
            <Database size={14} />
          </div>
          FlexCatalog
        </Link>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Share2 size={18} /></button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><MoreHorizontal size={18} /></button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Catalog</Link>
            <ChevronRight size={12} />
            <span className="text-slate-600">{element.type_name}</span>
          </div>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-6">{element.name}</h1>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-slate-500">
                <Tag size={18} className="text-indigo-600" />
                <span className="text-sm font-medium">{element.type_name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar size={18} className="text-indigo-600" />
                <span className="text-sm font-medium">{new Date(element.created_at).toLocaleDateString()}</span>
              </div>
              {element.interactions && (
                <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Heart size={16} className="text-rose-500" />
                    <span className="text-sm font-bold">{element.interactions.filter(i => i.type_name === 'Like').length}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MessageSquare size={16} className="text-indigo-500" />
                    <span className="text-sm font-bold">{element.interactions.filter(i => i.type_name === 'Comment').length}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Tags from Graph */}
            {element.graph && element.graph.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {element.graph.map(edge => {
                  const isSource = edge.source_el_id === element.id;
                  const otherName = isSource ? edge.target_name : edge.source_name;
                  const otherSlug = isSource ? edge.target_slug : edge.source_slug;
                  return (
                    <Link 
                      key={edge.id}
                      to={`/e/${otherSlug}`}
                      className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2"
                    >
                      <span className="opacity-50 font-medium">{edge.rel_name}:</span>
                      {otherName}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              {/* Properties Section */}
              <section className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                  <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                  Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {element.properties.map(prop => (
                    <div key={prop.id} className="group">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-600 transition-colors">
                        {prop.key}
                      </p>
                      <p className="text-lg font-semibold text-slate-800">
                        {prop.value || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Interactions Section */}
              {element.interactions && element.interactions.length > 0 && (
                <section className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                    Interactions
                  </h3>
                  <div className="space-y-6">
                    {element.interactions.filter(i => i.content).map(interaction => (
                      <div key={interaction.id} className="flex gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                          <UserIcon size={20} />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900">{interaction.username}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(interaction.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{interaction.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Relationships */}
              {element.children && element.children.length > 0 && (
                <section>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Sub-elements</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {element.children.map((child) => (
                      <Link 
                        key={child.id} 
                        to={`/e/${child.slug}`}
                        className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Database size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{child.name}</p>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{child.type_name}</p>
                          </div>
                        </div>
                        <ArrowRight size={20} className="text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl">
                <h4 className="text-lg font-bold mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-all">Download Report</button>
                  <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all">Share Element</button>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-8 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Metadata</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Internal ID</p>
                    <p className="text-sm font-mono text-slate-600">{element.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Slug</p>
                    <p className="text-sm font-mono text-slate-600">{element.slug}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="max-w-5xl mx-auto px-8 py-12 border-t border-slate-200 mt-12">
        <div className="flex items-center justify-between text-slate-400 text-sm">
          <p>© 2026 FlexCatalog</p>
          <Link to="/" className="hover:text-indigo-600 transition-colors">Back to Home</Link>
        </div>
      </footer>
    </div>
  );
};

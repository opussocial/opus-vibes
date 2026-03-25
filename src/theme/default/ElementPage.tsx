import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Database, Globe, Share2, Info, Zap, LogOut, User as UserIcon } from "lucide-react";
import { ElementDetail, User } from "../../types";
import { themeUtils } from "./utils";

export const ElementPage = ({ currentUser, onLogout }: { currentUser: User | null, onLogout: () => void }) => {
  const { slug } = useParams<{ slug: string }>();
  const [element, setElement] = useState<ElementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadElement = async () => {
      if (!slug) return;
      setLoading(true);
      const data = await themeUtils.getElementBySlug(slug);
      setElement(data);
      setLoading(false);
    };
    loadElement();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-zinc-100 border-t-marine rounded-full animate-spin" />
      </div>
    );
  }

  if (!element) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center text-zinc-300 mb-8">
          <Database size={40} />
        </div>
        <h1 className="text-3xl font-black text-marine mb-4">Element Not Found</h1>
        <p className="text-zinc-500 max-w-md mb-8">
          The element you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="px-8 py-4 bg-marine text-brand-yellow rounded-2xl font-bold shadow-xl">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-6">
          <Link to="/" className="p-2 hover:bg-zinc-50 rounded-xl text-zinc-400 hover:text-marine transition-all">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-marine rounded-lg flex items-center justify-center text-brand-yellow">
              <Database size={18} />
            </div>
            <span className="text-lg font-black tracking-tight text-marine">Catalog</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-zinc-50 rounded-xl text-zinc-400 hover:text-marine transition-all">
            <Share2 size={20} />
          </button>
          {currentUser ? (
            <div className="flex items-center gap-4 pl-4 border-l border-zinc-100">
              <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
                <UserIcon size={16} />
              </div>
              <button 
                onClick={onLogout}
                className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-red-500 transition-all"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/admin" className="text-sm font-bold text-marine hover:underline">Admin Login</Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-16"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-1.5 bg-marine/5 text-marine text-xs font-bold uppercase tracking-[0.2em] rounded-full">
                  {element.type_name}
                </span>
                {element.status && (
                  <span className="px-4 py-1.5 bg-zinc-100 text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] rounded-full">
                    {element.status}
                  </span>
                )}
              </div>
              <h1 className="text-6xl font-black tracking-tight text-marine mb-8 leading-[0.9]">
                {element.name}
              </h1>
              
              {element.content && (
                <div className="text-xl text-zinc-600 leading-relaxed whitespace-pre-wrap">
                  {element.content.body}
                </div>
              )}
            </div>

            {element.file && element.file.url && (
              <div className="rounded-[3rem] overflow-hidden shadow-2xl border border-zinc-100">
                <img 
                  src={element.file.url} 
                  alt={element.file.filename || element.name}
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Modular Tables Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {element.product_info && (
                <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-100">
                  <div className="flex items-center gap-3 mb-6 text-zinc-400">
                    <Zap size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Product Info</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-zinc-400 text-sm">Price</span>
                      <span className="text-3xl font-black text-marine">
                        {element.product_info.currency} {element.product_info.price}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400 text-sm">SKU</span>
                      <span className="font-bold text-zinc-600">{element.product_info.sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400 text-sm">Stock</span>
                      <span className={`font-bold ${element.product_info.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                        {element.product_info.stock > 0 ? `${element.product_info.stock} Available` : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {element.place && (
                <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-100">
                  <div className="flex items-center gap-3 mb-6 text-zinc-400">
                    <Globe size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Location</span>
                  </div>
                  <p className="text-xl font-bold text-marine mb-2">{element.place.address}</p>
                  <p className="text-sm text-zinc-400 font-medium">
                    {element.place.latitude}, {element.place.longitude}
                  </p>
                </div>
              )}
            </div>

            {element.urls_embeds && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-3">
                  <Share2 size={18} />
                  External Resources
                </h3>
                <a 
                  href={element.urls_embeds.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-8 bg-white border border-zinc-100 rounded-3xl hover:border-marine/20 hover:shadow-xl transition-all group"
                >
                  <h4 className="text-xl font-bold text-marine group-hover:text-marine-light transition-colors mb-2">
                    {element.urls_embeds.title || "Visit Resource"}
                  </h4>
                  <p className="text-zinc-400 truncate">{element.urls_embeds.url}</p>
                </a>
                {element.urls_embeds.embed_code && (
                  <div 
                    className="rounded-3xl overflow-hidden shadow-lg"
                    dangerouslySetInnerHTML={{ __html: element.urls_embeds.embed_code }} 
                  />
                )}
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-12">
            <div className="p-8 bg-marine rounded-[2.5rem] text-white shadow-2xl">
              <h4 className="text-xs font-bold text-brand-yellow uppercase tracking-[0.2em] mb-6">Metadata</h4>
              <div className="space-y-6">
                <div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Last Updated</p>
                  <p className="font-bold">{new Date(element.updated_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Element ID</p>
                  <p className="font-mono text-xs opacity-60">#{element.id}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Slug</p>
                  <p className="font-mono text-xs opacity-60">{element.slug}</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
              <div className="flex items-center gap-3 mb-6 text-zinc-400">
                <Info size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">About this Catalog</span>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                This element is part of a modular data graph. All relationships and data points are dynamically linked.
              </p>
              <Link to="/admin" className="text-sm font-bold text-marine hover:underline">
                Learn more about our system
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-zinc-100 py-20 bg-zinc-50/30">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-marine rounded-lg flex items-center justify-center text-brand-yellow">
              <Database size={18} />
            </div>
            <span className="text-lg font-black tracking-tight text-marine">Catalog</span>
          </div>
          <p className="text-sm text-zinc-400 font-medium">© 2026 Catalog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { Element, ElementDetail, ElementType } from "../../types";
import { themeUtils } from "./utils";
import { motion } from "motion/react";
import { Database, ArrowLeft, ExternalLink, MapPin, Package, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ElementRendererProps {
  slug: string;
  isHome?: boolean;
}

export const ElementRenderer = ({ slug, isHome = false }: ElementRendererProps) => {
  const [element, setElement] = useState<ElementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElement = async () => {
      setLoading(true);
      const data = await themeUtils.getElementBySlug(slug);
      setElement(data);
      setLoading(false);
    };
    fetchElement();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!element) {
    return (
      <div className="text-center p-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
        <Database size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Element Not Found</h2>
        <p className="text-slate-500 mt-2">The requested element "{slug}" could not be found.</p>
        {!isHome && (
          <button 
            onClick={() => navigate(-1)}
            className="mt-8 flex items-center gap-2 text-indigo-600 font-bold hover:underline mx-auto"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-12 px-6 space-y-12"
    >
      <header>
        <div className="flex items-center gap-3 mb-6">
          <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
            {element.type_name}
          </span>
          {element.status && (
            <span className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-full">
              {element.status}
            </span>
          )}
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          {element.name}
        </h1>
        <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full" />
            <span>Updated {new Date(element.updated_at).toLocaleDateString()}</span>
          </div>
          <span>•</span>
          <span>ID: {element.id}</span>
        </div>
      </header>

      <div className="space-y-16">
        {/* Main Content */}
        {element.content && (
          <section className="prose prose-slate max-w-none">
            <div className="text-xl text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
              {element.content.body}
            </div>
          </section>
        )}

        {/* Media */}
        {element.file && element.file.url && (
          <section>
            <div className="relative group">
              <div className="absolute -inset-4 bg-indigo-600/5 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <img 
                src={element.file.url} 
                alt={element.file.filename || element.name}
                className="relative w-full h-auto rounded-[2.5rem] shadow-2xl border border-slate-200"
                referrerPolicy="no-referrer"
              />
            </div>
          </section>
        )}

        {/* Data Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {element.product_info && (
            <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                  <Package size={20} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Product Info</p>
                <p className="text-sm text-slate-500 font-medium">SKU: {element.product_info.sku}</p>
              </div>
              <div className="mt-8">
                <p className="text-4xl font-extrabold text-slate-900">
                  <span className="text-lg text-slate-400 mr-1">{element.product_info.currency}</span>
                  {element.product_info.price}
                </p>
                <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  element.product_info.stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                }`}>
                  {element.product_info.stock > 0 ? `${element.product_info.stock} available` : "Out of stock"}
                </div>
              </div>
            </section>
          )}

          {element.place && (
            <section className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white mb-6">
                  <MapPin size={20} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                <p className="text-xl font-bold leading-tight">{element.place.address}</p>
              </div>
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-sm text-slate-400 font-mono">
                  {element.place.latitude}, {element.place.longitude}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Links & Embeds */}
        {element.urls_embeds && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <ExternalLink size={20} className="text-indigo-600" />
              <h3 className="text-xl font-bold text-slate-900">Resources</h3>
            </div>
            <a 
              href={element.urls_embeds.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-8 bg-white border border-slate-200 rounded-[2rem] hover:border-indigo-600 hover:shadow-xl transition-all group"
            >
              <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
                {element.urls_embeds.title || "External Resource"}
              </h4>
              <p className="text-sm text-slate-500 truncate">{element.urls_embeds.url}</p>
            </a>
            {element.urls_embeds.embed_code && (
              <div 
                className="mt-8 rounded-[2rem] overflow-hidden border border-slate-200 shadow-lg"
                dangerouslySetInnerHTML={{ __html: element.urls_embeds.embed_code }} 
              />
            )}
          </section>
        )}
      </div>
    </motion.div>
  );
};

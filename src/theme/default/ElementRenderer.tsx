import React, { useState, useEffect } from "react";
import { Element, ElementDetail, ElementType } from "../../types";
import { themeUtils } from "./utils";
import { motion } from "motion/react";
import { Database, ArrowLeft } from "lucide-react";
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
        <div className="w-8 h-8 border-4 border-zinc-100 border-t-marine rounded-full animate-spin" />
      </div>
    );
  }

  if (!element) {
    return (
      <div className="text-center p-20 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
        <Database size={48} className="mx-auto text-zinc-300 mb-4" />
        <h2 className="text-xl font-bold text-zinc-900">Element Not Found</h2>
        <p className="text-zinc-500 mt-2">The requested element "{slug}" could not be found.</p>
        {!isHome && (
          <button 
            onClick={() => navigate(-1)}
            className="mt-6 flex items-center gap-2 text-marine font-bold hover:underline mx-auto"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        )}
      </div>
    );
  }

  // Default Template Rendering
  // In a real theme system, we would look for a specific template component based on type_slug
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-12 px-6"
    >
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-marine/5 text-marine text-[10px] font-bold uppercase tracking-widest rounded-full">
            {element.type_name}
          </span>
          {element.status && (
            <span className="px-3 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-bold uppercase tracking-widest rounded-full">
              {element.status}
            </span>
          )}
        </div>
        <h1 className="text-5xl font-black tracking-tight text-marine mb-4 leading-tight">
          {element.name}
        </h1>
        <p className="text-zinc-400 text-sm font-medium">
          Last updated {new Date(element.updated_at).toLocaleDateString()}
        </p>
      </header>

      <div className="space-y-12">
        {/* Render Modular Data based on properties */}
        {element.content && (
          <section className="prose prose-zinc max-w-none">
            <div className="text-xl text-zinc-600 leading-relaxed whitespace-pre-wrap">
              {element.content.body}
            </div>
          </section>
        )}

        {element.file && element.file.url && (
          <section>
            <img 
              src={element.file.url} 
              alt={element.file.filename || element.name}
              className="w-full h-auto rounded-[2rem] shadow-2xl border border-zinc-100"
              referrerPolicy="no-referrer"
            />
          </section>
        )}

        {element.product_info && (
          <section className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Product Details</p>
              <p className="text-sm text-zinc-500 font-medium">SKU: {element.product_info.sku}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-marine">
                {element.product_info.currency} {element.product_info.price}
              </p>
              <p className="text-sm text-zinc-400 font-medium mt-1">
                {element.product_info.stock > 0 ? `${element.product_info.stock} in stock` : "Out of stock"}
              </p>
            </div>
          </section>
        )}

        {element.place && (
          <section className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Location</p>
            <p className="text-lg font-bold text-marine mb-2">{element.place.address}</p>
            <p className="text-sm text-zinc-500">
              {element.place.latitude}, {element.place.longitude}
            </p>
          </section>
        )}

        {element.urls_embeds && (
          <section className="space-y-4">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Related Links</p>
            <a 
              href={element.urls_embeds.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-6 bg-white border border-zinc-100 rounded-2xl hover:border-marine/20 hover:shadow-md transition-all group"
            >
              <h3 className="font-bold text-marine group-hover:text-marine-light transition-colors">{element.urls_embeds.title || element.urls_embeds.url}</h3>
              <p className="text-sm text-zinc-400 mt-1 truncate">{element.urls_embeds.url}</p>
            </a>
            {element.urls_embeds.embed_code && (
              <div 
                className="mt-6 rounded-2xl overflow-hidden"
                dangerouslySetInnerHTML={{ __html: element.urls_embeds.embed_code }} 
              />
            )}
          </section>
        )}
      </div>
    </motion.div>
  );
};

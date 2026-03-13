import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowLeft, Globe, Package, MapPin, Link as LinkIcon, 
  Clock, FileText, Database, Palette, ChevronRight 
} from "lucide-react";
import { Badge } from "./common/Badge";

export const ThemeRenderer = ({ mode = "element" }: { mode?: "home" | "element" }) => {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = mode === "home" ? "/api/theme/home" : `/api/theme/element/${slug}`;
        const res = await fetch(url);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch theme data");
        }
        setData(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [mode, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-200 border-t-marine rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium">Loading theme...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Globe size={32} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Theme Error</h2>
          <p className="text-zinc-500 mb-8">{error}</p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-marine text-brand-yellow rounded-xl font-bold hover:bg-marine-light transition-all"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // If it's the default homepage
  if (data.type === "default") {
    return (
      <div className="min-h-screen bg-zinc-50">
        <header className="bg-white border-b border-zinc-100 p-6 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-marine rounded-xl flex items-center justify-center text-brand-yellow">
                <Globe size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-marine">Public Portal</h1>
            </div>
            <Link to="/" className="text-sm font-bold text-zinc-500 hover:text-marine transition-colors">
              Admin Dashboard
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-900 mb-6">
              Welcome to the <span className="text-marine">Public Portal</span>
            </h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              This is the default homepage view. You can customize this by setting a 
              <code className="bg-zinc-100 px-2 py-1 rounded mx-1 text-marine">home_element</code> 
              in your settings.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Package size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Modular Data</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Every element in FlexCatalog is built from modular properties like content, location, and files.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Graph Relationships</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Connect elements together using typed relationships to build complex data structures.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Palette size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Themed Rendering</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Render your data using custom templates and themes for a unique public experience.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If it's an element (either home_element or a specific element)
  const element = data.element || data.data;
  const children = data.children || [];
  const related = data.related || [];

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-100 p-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/public" className="w-10 h-10 bg-marine rounded-xl flex items-center justify-center text-brand-yellow">
              <Globe size={24} />
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-marine">{element.name}</h1>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/public" className="text-sm font-bold text-zinc-500 hover:text-marine transition-colors">
              Home
            </Link>
            <Link to="/" className="text-sm font-bold text-zinc-500 hover:text-marine transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl overflow-hidden"
        >
          {/* Hero Section */}
          <div className="p-12 bg-zinc-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Package size={200} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Badge color="blue">{element.type_name}</Badge>
                {element.status && <Badge color="zinc">{element.status}</Badge>}
              </div>
              <h2 className="text-5xl font-bold tracking-tighter mb-4">{element.name}</h2>
              <p className="text-zinc-400 text-lg max-w-xl">
                Exploring the modular details of this {element.type_name.toLowerCase()}.
              </p>
            </div>
          </div>

          {/* Content Sections */}
          <div className="p-12 space-y-12">
            {/* Body Content */}
            {element.content?.body && (
              <div className="prose prose-zinc max-w-none">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-marine" />
                  About
                </h3>
                <div className="text-zinc-600 leading-relaxed text-lg whitespace-pre-wrap">
                  {element.content.body}
                </div>
              </div>
            )}

            {/* Product Info */}
            {element.product_info && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Price</p>
                  <p className="text-2xl font-bold text-marine">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: element.product_info.currency || 'USD' }).format(element.product_info.price || 0)}
                  </p>
                </div>
                <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">SKU</p>
                  <p className="text-2xl font-bold text-zinc-900">{element.product_info.sku || 'N/A'}</p>
                </div>
                <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Stock</p>
                  <p className="text-2xl font-bold text-zinc-900">{element.product_info.stock || 0} units</p>
                </div>
              </div>
            )}

            {/* Location */}
            {element.place?.address && (
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-red-500" />
                  Location
                </h3>
                <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-zinc-900">{element.place.address}</p>
                    <p className="text-sm text-zinc-500">
                      {element.place.latitude}, {element.place.longitude}
                    </p>
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${element.place.latitude},${element.place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all text-zinc-600"
                  >
                    <ChevronRight size={20} />
                  </a>
                </div>
              </div>
            )}

            {/* Links */}
            {element.urls_embeds?.url && (
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <LinkIcon size={20} className="text-purple-500" />
                  Resources
                </h3>
                <a 
                  href={element.urls_embeds.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-zinc-50 p-6 rounded-3xl border border-zinc-100 hover:border-purple-200 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-zinc-900 group-hover:text-purple-600 transition-colors">
                        {element.urls_embeds.title || "Visit Link"}
                      </p>
                      <p className="text-sm text-zinc-500 truncate max-w-md">{element.urls_embeds.url}</p>
                    </div>
                    <LinkIcon size={20} className="text-zinc-300 group-hover:text-purple-500 transition-colors" />
                  </div>
                </a>
              </div>
            )}

            {/* Children */}
            {children.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Database size={20} className="text-orange-500" />
                  Sub-Elements
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {children.map((child: any) => (
                    <Link 
                      key={child.id}
                      to={`/public/element/${child.slug}`}
                      className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl hover:shadow-md transition-all flex items-center justify-between group"
                    >
                      <span className="font-bold text-zinc-700 group-hover:text-marine transition-colors">{child.name}</span>
                      <ChevronRight size={16} className="text-zinc-300 group-hover:text-marine transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related */}
            {related.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <LinkIcon size={20} className="text-green-500" />
                  Related Elements
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {related.map((rel: any) => (
                    <Link 
                      key={rel.id}
                      to={`/public/element/${rel.slug}`}
                      className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl hover:shadow-md transition-all flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{rel.rel_name}</p>
                        <p className="font-bold text-zinc-700 group-hover:text-marine transition-colors">{rel.name}</p>
                      </div>
                      <ChevronRight size={16} className="text-zinc-300 group-hover:text-marine transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

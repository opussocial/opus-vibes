import React from "react";
import { ElementDetail } from "../types";
import { motion } from "motion/react";
import { ArrowRight, Database, Globe, Layers, Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface DefaultThemeProps {
  element: ElementDetail;
  isHome?: boolean;
}

export const DefaultTheme = ({ element, isHome = false }: DefaultThemeProps) => {
  if (isHome) {
    return <HeroTemplate element={element} />;
  }
  return <ElementTemplate element={element} />;
};

const HeroTemplate = ({ element }: { element: ElementDetail }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
            <Database size={18} />
          </div>
          <span className="font-bold text-zinc-900 tracking-tight">My Catalog</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Features</a>
          <a href="#" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Solutions</a>
          <a href="#" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Pricing</a>
        </div>
        <Link 
          to="/admin" 
          className="px-4 py-2 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
        >
          Admin Dashboard
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-24 md:py-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-zinc-600 text-xs font-bold mb-6">
              <Zap size={14} className="text-zinc-900" />
              <span>Powered by our system</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tight text-zinc-900 mb-8 leading-[1.1]">
              {element.name}
            </h1>
            <p className="text-xl text-zinc-500 mb-10 leading-relaxed max-w-xl">
              {element.content?.body || "Experience the future of modular data management. Flexible, powerful, and designed for modern workflows."}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-900/20">
                Get Started
                <ArrowRight size={20} />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-white border border-zinc-200 text-zinc-900 font-bold rounded-2xl hover:bg-zinc-50 transition-all">
                View Documentation
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square bg-zinc-50 rounded-[3rem] border border-zinc-100 overflow-hidden shadow-2xl relative z-10">
              {element.file?.url ? (
                <img 
                  src={element.file.url} 
                  alt={element.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-200">
                  <Globe size={120} />
                </div>
              )}
            </div>
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-zinc-900/5 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-zinc-900/5 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-zinc-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">Modular Capabilities</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">Our system allows you to define any data structure and manage it with ease.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Layers className="text-zinc-900" />}
              title="Schema Driven"
              description="Define your own types and properties without touching the code."
            />
            <FeatureCard 
              icon={<Globe className="text-zinc-900" />}
              title="Relationship Graph"
              description="Connect elements with meaningful relationships and browse them visually."
            />
            <FeatureCard 
              icon={<Zap className="text-zinc-900" />}
              title="Real-time Updates"
              description="Changes are reflected instantly across the entire system."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center text-white">
              <Database size={14} />
            </div>
            <span className="font-bold text-zinc-900 text-sm">My Catalog</span>
          </div>
          <p className="text-zinc-400 text-sm">© 2026 My Catalog. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors text-sm">Twitter</a>
            <a href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors text-sm">GitHub</a>
            <a href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors text-sm">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ElementTemplate = ({ element }: { element: ElementDetail }) => {
  return (
    <div className="min-h-screen bg-zinc-50/50 flex flex-col">
      <nav className="bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
            <Database size={18} />
          </div>
          <span className="font-bold text-zinc-900 tracking-tight">My Catalog</span>
        </Link>
        <Link to="/admin" className="text-sm font-bold text-zinc-500 hover:text-zinc-900">Admin</Link>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full py-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden"
        >
          <div className="p-8 md:p-12 border-b border-zinc-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
                {element.type_name}
              </span>
              {element.status && (
                <span className="px-3 py-1 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {element.status}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight mb-4">
              {element.name}
            </h1>
            <p className="text-zinc-400 text-sm">
              Slug: <span className="font-mono">{element.slug}</span>
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            {element.content && (
              <div className="text-lg text-zinc-600 leading-relaxed whitespace-pre-wrap">
                {element.content.body}
              </div>
            )}

            {element.file?.url && (
              <div className="rounded-3xl overflow-hidden border border-zinc-100">
                <img 
                  src={element.file.url} 
                  alt={element.name}
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Modular Tables Section */}
            <div className="space-y-8">
              <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                <Layers size={20} />
                Modular Data
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {element.product_info && (
                  <ModularTable 
                    title="Product Info"
                    data={[
                      { label: "Price", value: `${element.product_info.currency} ${element.product_info.price}` },
                      { label: "SKU", value: element.product_info.sku },
                      { label: "Stock", value: element.product_info.stock }
                    ]}
                  />
                )}
                
                {element.place && (
                  <ModularTable 
                    title="Location"
                    data={[
                      { label: "Address", value: element.place.address },
                      { label: "Latitude", value: element.place.latitude },
                      { label: "Longitude", value: element.place.longitude }
                    ]}
                  />
                )}

                {element.urls_embeds && (
                  <ModularTable 
                    title="Links & Media"
                    data={[
                      { label: "Title", value: element.urls_embeds.title || "N/A" },
                      { label: "URL", value: element.urls_embeds.url, isLink: true }
                    ]}
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-8 bg-white border border-zinc-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-zinc-900 mb-3">{title}</h3>
    <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
  </div>
);

const ModularTable = ({ title, data }: { title: string, data: { label: string, value: any, isLink?: boolean }[] }) => (
  <div className="bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden">
    <div className="px-5 py-3 bg-zinc-100/50 border-b border-zinc-100">
      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{title}</span>
    </div>
    <div className="divide-y divide-zinc-100">
      {data.map((item, i) => (
        <div key={i} className="px-5 py-3 flex items-center justify-between gap-4">
          <span className="text-xs font-medium text-zinc-400">{item.label}</span>
          {item.isLink ? (
            <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-zinc-900 hover:underline truncate max-w-[150px]">
              {item.value}
            </a>
          ) : (
            <span className="text-xs font-bold text-zinc-900">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  </div>
);

import React, { useEffect, useState } from "react";
import { get_header, get_footer } from "./TemplateTags";
import { DefaultTemplate, PageTemplate } from "./templates/Default";

const TEMPLATE_MAP: Record<string, React.ComponentType<any>> = {
  "page": PageTemplate,
  // Add other mappings if needed
};

export const Home = ({ settings, currentUser }: any) => {
  const [homeData, setHomeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const res = await fetch("/api/theme/home");
        const data = await res.json();
        setHomeData(data);
      } catch (err) {
        console.error("Failed to fetch home data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHome();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Homepage...</div>;

  // If there is a specific home element, render it using its template
  if (homeData?.type === "element" && homeData.data) {
    const element = homeData.data;
    const Template = TEMPLATE_MAP[element.type_slug] || DefaultTemplate;
    return (
      <div className="min-h-screen bg-white">
        {get_header(settings)}
        <main className="max-w-7xl mx-auto p-8">
          <Template element={element} settings={settings} />
        </main>
        {get_footer(settings)}
      </div>
    );
  }

  // Fallback to default welcome page
  return (
    <div className="min-h-screen bg-gray-50">
      {get_header(settings)}
      <main className="max-w-7xl mx-auto p-8 lg:p-16">
        <div className="bg-white p-12 lg:p-24 rounded-3xl shadow-xl shadow-gray-200/50 border text-center">
          <h1 className="text-6xl font-black mb-8 tracking-tight text-gray-900 leading-tight">
            Welcome to {settings.site_name || "FlexCatalog"}
          </h1>
          <p className="text-2xl text-gray-500 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Discover a new way to explore our modular content catalog. Fast, flexible, and fully customizable.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg">
              Explore Catalog
            </button>
            <button className="px-8 py-4 bg-white border border-gray-200 text-gray-900 font-bold rounded-2xl hover:bg-gray-50 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </main>
      {get_footer(settings)}
    </div>
  );
};

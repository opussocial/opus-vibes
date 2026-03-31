import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  User as UserIcon, 
  Share2, 
  Bookmark,
  MessageSquare,
  Heart,
  Menu,
  Search,
  ArrowUpRight,
  Database,
  Plus,
  ChevronRight
} from "lucide-react";
import { useTheme } from "../ThemeContext";
import { User } from "../../types";

export const ElementPage = ({ currentUser, onLogout, settings }: { currentUser: User | null, onLogout: () => void, settings: Record<string, any> }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { elements, types } = useTheme();
  const element = elements.find(e => e.slug === slug);

  if (!element) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-12">
        <div className="border-8 border-black p-16 text-center max-w-2xl">
          <h2 className="text-9xl font-black mb-8 uppercase tracking-tighter">404</h2>
          <p className="text-2xl font-bold mb-12 uppercase">The element you seek does not exist in this system.</p>
          <button 
            onClick={() => navigate(-1)} 
            className="bg-black text-white px-12 py-6 text-2xl font-black uppercase hover:bg-[#00FF00] hover:text-black transition-all hover:translate-x-2 hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const related = elements.filter(e => e.type_id === element.type_id && e.id !== element.id).slice(0, 3);

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
            </nav>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="bg-black text-white px-4 py-2 font-bold uppercase text-xs hover:bg-[#00FF00] hover:text-black transition-colors">
                Back
              </button>
              <Menu className="w-8 h-8 cursor-pointer" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-80px)]">
        {/* Left Sidebar - Meta */}
        <aside className="lg:col-span-3 border-b-4 lg:border-b-0 lg:border-r-4 border-black p-8 bg-[#F0F0F0]">
          <div className="sticky top-28">
            <div className="text-xs font-mono mb-8 uppercase tracking-widest">[ ELEMENT_METADATA ]</div>
            
            <div className="space-y-12">
              <div>
                <div className="text-[10px] font-mono uppercase opacity-50 mb-2">Type</div>
                <div className="text-2xl font-black uppercase bg-black text-white px-4 py-2 inline-block">
                  {element.type_slug}
                </div>
              </div>
              
              <div>
                <div className="text-[10px] font-mono uppercase opacity-50 mb-2">Created</div>
                <div className="text-xl font-black uppercase">
                  {new Date(element.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase opacity-50 mb-2">Status</div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#00FF00] border-2 border-black"></div>
                  <div className="text-xl font-black uppercase">{element.status || 'ACTIVE'}</div>
                </div>
              </div>

              <div className="pt-12 border-t-2 border-black/10">
                <div className="flex gap-4">
                  <button className="border-4 border-black p-4 hover:bg-black hover:text-white transition-colors">
                    <Heart className="w-6 h-6" />
                  </button>
                  <button className="border-4 border-black p-4 hover:bg-black hover:text-white transition-colors">
                    <Share2 className="w-6 h-6" />
                  </button>
                  <button className="border-4 border-black p-4 hover:bg-black hover:text-white transition-colors">
                    <Bookmark className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Center - Content */}
        <article className="lg:col-span-6 border-b-4 lg:border-b-0 lg:border-r-4 border-black p-8 md:p-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-sm font-mono mb-4 uppercase tracking-widest text-[#00FF00] bg-black px-2 py-1 inline-block">
              ID: {element.id.toString().padStart(6, '0')}
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter mb-12">
              {element.name}
            </h1>
            
            <div className="h-2 w-full bg-black mb-12"></div>
            
            <div className="prose prose-xl max-w-none font-bold uppercase leading-relaxed">
              {element.content?.body ? (
                <div className="whitespace-pre-wrap">{element.content.body}</div>
              ) : (
                <div className="opacity-30 italic">No content body indexed for this element. System requires additional data input.</div>
              )}
            </div>

            {/* Placeholder for images if any */}
            <div className="mt-16 border-8 border-black overflow-hidden bg-[#F0F0F0] aspect-video flex items-center justify-center">
              <Database className="w-32 h-32 opacity-10" />
            </div>
          </div>
        </article>

        {/* Right Sidebar - Related */}
        <aside className="lg:col-span-3 p-8 bg-white">
          <div className="sticky top-28">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Related</h3>
              <Plus className="w-6 h-6" />
            </div>
            
            <div className="space-y-8">
              {related.map((rel) => (
                <Link key={rel.id} to={`/e/${rel.slug}`} className="block border-4 border-black p-6 hover:bg-black hover:text-white transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,255,0,1)] group">
                  <div className="text-[10px] font-mono mb-2 uppercase opacity-50 group-hover:opacity-100 transition-opacity">[{rel.type_slug}]</div>
                  <div className="text-xl font-black uppercase mb-4 leading-none">{rel.name}</div>
                  <div className="flex justify-end">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </Link>
              ))}
              
              {related.length === 0 && (
                <div className="border-4 border-black border-dashed p-12 text-center">
                  <div className="text-xs font-mono uppercase opacity-30 italic">No related elements found in current scope.</div>
                </div>
              )}
            </div>

            <div className="mt-16 p-8 bg-black text-[#00FF00] border-4 border-black">
              <div className="text-xs font-mono mb-4 uppercase">System Note:</div>
              <p className="text-xs font-bold uppercase leading-relaxed">
                All data is processed through the Brutalist engine. Integrity is maintained via strict schema validation.
              </p>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white p-12 border-t-4 border-black">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-black uppercase tracking-tighter">BRUTAL.SYS</div>
          <div className="text-[10px] font-mono opacity-40 uppercase">© 2026 BRUTAL.SYS _ ALL RIGHTS RESERVED</div>
          <div className="flex gap-8 text-[10px] font-mono opacity-40 uppercase">
            <Link to="/home" className="hover:text-[#00FF00]">Home</Link>
            <Link to="/explore" className="hover:text-[#00FF00]">Explore</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

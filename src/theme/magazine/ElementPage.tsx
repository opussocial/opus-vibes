import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Clock, 
  User as UserIcon,
  ChevronRight,
  ExternalLink,
  Menu,
  Search
} from "lucide-react";
import { ElementDetail, User } from "../../types";
import { useTheme } from "../ThemeContext";
import { TemplatePart } from "../TemplatePart";

export const ElementPage = ({ currentUser, onLogout }: { currentUser: User | null, onLogout: () => void }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { get_element, get_meta, get_children, get_related, get_header, get_footer } = useTheme();
  const [element, setElement] = useState<ElementDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadElement = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/elements/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setElement(data);
        }
      } catch (error) {
        console.error("Error loading element:", error);
      } finally {
        setLoading(false);
      }
    };
    loadElement();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-[#F27D26] rounded-full animate-spin" />
      </div>
    );
  }

  if (!element) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-6xl font-black uppercase mb-8">404 / NOT FOUND</h1>
        <p className="text-xl opacity-50 mb-12 italic">The piece you are looking for has been lost in the digital void.</p>
        <Link to="/" className="text-[11px] font-bold uppercase tracking-[0.3em] bg-white text-black px-10 py-5 rounded-full hover:bg-[#F27D26] transition-all">
          Return Home
        </Link>
      </div>
    );
  }

  const children = get_children(element.id);
  const related = get_related(element.id);
  const header = get_header();
  const footer = get_footer();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-magazine selection:bg-[#F27D26] selection:text-black">
      {/* Editorial Navigation */}
      <nav className="border-b border-white/10 px-8 py-6 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-2xl z-50">
        <div className="flex items-center gap-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter uppercase italic">THE MAGAZINE</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Search size={20} />
          </button>
          {currentUser ? (
            <Link to="/admin" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#F27D26] hover:text-black transition-all">
              <UserIcon size={20} />
            </Link>
          ) : (
            <Link to="/admin" className="text-[11px] font-bold uppercase tracking-[0.2em] border border-white/20 px-6 py-2.5 rounded-full hover:bg-white hover:text-black transition-all">
              Subscribe
            </Link>
          )}
        </div>
      </nav>

      {/* Article Header */}
      <header className="relative pt-32 pb-20 px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="px-3 py-1 bg-[#F27D26] text-black text-[10px] font-black uppercase tracking-widest">{element.type_name}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-2">
                <Clock size={12} /> 8 MIN READ
              </span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-display leading-[0.85] uppercase mb-12 tracking-tighter">
              {element.name}
            </h1>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 pt-10 border-t border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center overflow-hidden">
                  <UserIcon size={24} className="opacity-40" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Written By</p>
                  <p className="font-bold text-lg">Editorial Staff</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-[#F27D26] transition-colors">
                  <Heart size={16} /> 124
                </button>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-[#F27D26] transition-colors">
                  <MessageSquare size={16} /> 18
                </button>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-[#F27D26] transition-colors">
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-8 pb-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-8">
            {/* Featured Image */}
            <div className="aspect-video bg-white/5 mb-20 overflow-hidden rounded-3xl">
              <img 
                src={`https://picsum.photos/seed/${element.slug}/1200/800`} 
                alt={element.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Article Body */}
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-invert prose-lg max-w-none">
                <p className="text-2xl font-serif leading-relaxed mb-10 italic opacity-80 first-letter:text-7xl first-letter:font-display first-letter:float-left first-letter:mr-4 first-letter:mt-2 first-letter:text-[#F27D26]">
                  {get_meta(element, 'body', "The digital landscape is shifting beneath our feet, demanding a new vocabulary for creativity and connection in an age of unprecedented technological acceleration.")}
                </p>
                
                <div className="space-y-8 text-xl font-serif leading-[1.6] opacity-70">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  
                  {/* Modular Content Injection */}
                  {element.content && (
                    <div className="my-16 p-10 bg-white/5 border-l-4 border-[#F27D26] italic">
                      {element.content.body}
                    </div>
                  )}
                  
                  <p>
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                  </p>
                </div>
              </div>
              
              {/* Tags/Keywords */}
              <div className="mt-20 flex flex-wrap gap-3">
                {['Future', 'Technology', 'Design', 'Culture'].map(tag => (
                  <span key={tag} className="px-4 py-2 bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-[#F27D26] hover:text-black transition-all cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-20">
              {/* Children Elements */}
              {children.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] mb-10 border-b border-white/10 pb-4">Inside this piece</h4>
                  <div className="space-y-6">
                    {children.map(child => (
                      <Link key={child.id} to={`/e/${child.slug}`} className="group block p-6 bg-white/5 rounded-2xl hover:bg-[#F27D26] hover:text-black transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 mb-2 block">{child.type_name}</span>
                        <h5 className="text-lg font-bold leading-tight">{child.name}</h5>
                        <ChevronRight size={16} className="mt-4 opacity-0 group-hover:opacity-100 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Related Elements */}
              {related.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] mb-10 border-b border-white/10 pb-4">Related Reading</h4>
                  <div className="space-y-10">
                    {related.slice(0, 4).map(rel => (
                      <Link key={rel.id} to={`/e/${rel.slug}`} className="flex gap-6 group">
                        <div className="w-20 h-20 bg-white/10 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={`https://picsum.photos/seed/${rel.slug}/200/200`} alt={rel.name} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <h5 className="font-bold leading-tight group-hover:text-[#F27D26] transition-colors">{rel.name}</h5>
                          <span className="text-[10px] font-bold uppercase opacity-40 tracking-widest">{rel.type_name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Ad/Promo */}
              <div className="bg-[#F27D26] p-10 text-black rounded-3xl">
                <h4 className="text-3xl font-black uppercase leading-none mb-6">Join the <br/>Inner Circle</h4>
                <p className="text-sm font-bold mb-8 opacity-80">Support independent editorial and get exclusive access to our digital archives.</p>
                <button className="w-full py-4 bg-black text-white font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-colors">
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      {footer ? (
        <div className="bg-black text-white px-8 py-32">
          <TemplatePart element={footer} />
        </div>
      ) : (
        <footer className="bg-[#050505] px-8 py-32 border-t border-white/10">
          <div className="max-w-7xl mx-auto text-center">
            <span className="text-4xl font-black tracking-tighter uppercase italic block mb-10">THE MAGAZINE</span>
            <p className="text-sm opacity-30 uppercase tracking-[0.3em]">© 2026 THE MAGAZINE EDITORIAL GROUP</p>
          </div>
        </footer>
      )}
    </div>
  );
};

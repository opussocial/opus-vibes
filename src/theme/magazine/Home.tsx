import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Menu, Search, User as UserIcon, Heart, MessageSquare, Share2, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { User } from "../../types";
import { useTheme } from "../ThemeContext";
import { TemplatePart } from "../TemplatePart";

export const Home = ({ currentUser, onLogout, settings }: { currentUser: User | null, onLogout: () => void, settings: Record<string, any> }) => {
  const { get_posts, get_meta, get_header, get_footer, get_setting, get_element } = useTheme();
  
  // Magazine-specific data fetching
  const homeSlug = get_setting("home_element", "home");
  const homeElement = get_element(homeSlug);
  
  // Featured posts (e.g., of type 'article' or 'post')
  const featuredPosts = get_posts({ limit: 4, status: 'published' });
  const latestPosts = get_posts({ limit: 8, offset: 4, status: 'published' });
  
  const header = get_header();
  const footer = get_footer();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-magazine selection:bg-[#F27D26] selection:text-black">
      {/* Editorial Navigation */}
      <nav className="border-b border-white/10 px-8 py-6 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-2xl z-50">
        <div className="flex items-center gap-8">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter uppercase italic">THE MAGAZINE</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-10">
          <a href="#" className="text-[11px] font-bold uppercase tracking-[0.2em] hover:text-[#F27D26] transition-colors">Culture</a>
          <a href="#" className="text-[11px] font-bold uppercase tracking-[0.2em] hover:text-[#F27D26] transition-colors">Technology</a>
          <a href="#" className="text-[11px] font-bold uppercase tracking-[0.2em] hover:text-[#F27D26] transition-colors">Design</a>
          <a href="#" className="text-[11px] font-bold uppercase tracking-[0.2em] hover:text-[#F27D26] transition-colors">Future</a>
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

      {/* Hero Section - Recipe 2: Editorial / Magazine Hero */}
      <section className="relative min-h-[90vh] flex flex-col justify-end px-8 pb-20 overflow-hidden">
        {homeElement && (
          <div className="absolute inset-0 z-0">
            <img 
              src={get_meta(homeElement, 'image_url', `https://picsum.photos/seed/${homeElement.slug}/1920/1080`)} 
              alt={homeElement.name}
              className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
          </div>
        )}
        
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-[#F27D26] text-black text-[10px] font-black uppercase tracking-widest">Featured Story</span>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">March 2026 Issue</span>
            </div>
            
            <h1 className="text-[18vw] lg:text-[14vw] font-display leading-[0.82] tracking-[-0.04em] uppercase mb-10 skew-x-[-10deg]">
              {homeElement?.name || "THE FUTURE"}
            </h1>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
              <p className="text-xl md:text-2xl max-w-2xl font-serif leading-tight opacity-80 italic">
                {get_meta(homeElement, 'body', "Exploring the intersection of human creativity and artificial intelligence in the next decade of digital evolution.")}
              </p>
              
              <Link 
                to={homeElement ? `/e/${homeElement.slug}` : "#"}
                className="group flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em] bg-white text-black px-10 py-5 rounded-full hover:bg-[#F27D26] transition-all"
              >
                Read Article
                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Grid */}
      <section className="px-8 py-32 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-20">
            <h2 className="text-4xl font-display uppercase italic tracking-tighter">The Latest</h2>
            <div className="h-px flex-grow mx-10 bg-white/10" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-40">Scroll to explore</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
            {featuredPosts.map((post, idx) => (
              <Link 
                key={post.id} 
                to={`/e/${post.slug}`}
                className="group bg-[#050505] p-10 hover:bg-[#111] transition-all flex flex-col h-full"
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#F27D26] mb-6">0{idx + 1} / {post.type_name}</div>
                <h3 className="text-2xl font-bold leading-tight mb-6 group-hover:text-[#F27D26] transition-colors line-clamp-3">
                  {post.name}
                </h3>
                <p className="text-sm opacity-50 mb-10 line-clamp-4 flex-grow italic">
                  {get_meta(post, 'body', "No description available for this piece.")}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-40">
                      <Heart size={12} /> {idx * 12 + 4}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-40">
                      <MessageSquare size={12} /> {idx * 3 + 1}
                    </div>
                  </div>
                  <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-[#F27D26]" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Content Section */}
      <section className="px-8 py-32 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className="lg:col-span-8">
              <div className="space-y-32">
                {latestPosts.slice(0, 3).map((post) => (
                  <article key={post.id} className="group cursor-pointer">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                      <div className="md:col-span-4 aspect-[3/4] overflow-hidden bg-black/5">
                        <img 
                          src={`https://picsum.photos/seed/${post.slug}/600/800`} 
                          alt={post.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="md:col-span-8 flex flex-col justify-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F27D26] mb-4">{post.type_name}</div>
                <h2 className="text-5xl font-display leading-[0.9] uppercase mb-6 group-hover:italic transition-all">
                          {post.name}
                        </h2>
                        <p className="text-lg opacity-70 mb-8 leading-relaxed">
                          {get_meta(post, 'body', "A deep dive into the evolving landscape of modern culture and the forces that shape our collective future.")}
                        </p>
                        <Link to={`/e/${post.slug}`} className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 group-hover:gap-5 transition-all">
                          Read Full Story <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-20">
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] mb-10 border-b border-black/10 pb-4">Most Read</h4>
                  <div className="space-y-10">
                    {latestPosts.slice(3, 7).map((post, i) => (
                      <Link key={post.id} to={`/e/${post.slug}`} className="flex gap-6 group">
                        <span className="text-4xl font-black opacity-10 group-hover:opacity-100 group-hover:text-[#F27D26] transition-all">0{i + 1}</span>
                        <div>
                          <h5 className="font-bold leading-tight group-hover:underline">{post.name}</h5>
                          <span className="text-[10px] font-bold uppercase opacity-40 tracking-widest">{post.type_name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                
                <div className="bg-black p-10 text-white rounded-3xl">
                  <h4 className="text-2xl font-black uppercase mb-4">Newsletter</h4>
                  <p className="text-sm opacity-60 mb-8 italic">Get the weekly editorial digest delivered to your inbox.</p>
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="w-full bg-white/10 border-b border-white/20 py-4 px-2 text-sm focus:outline-none focus:border-[#F27D26] transition-colors mb-6"
                  />
                  <button className="w-full py-4 bg-[#F27D26] text-black font-black uppercase text-xs tracking-widest hover:bg-white transition-colors">
                    Join the Future
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {footer ? (
        <div className="bg-black text-white px-8 py-32">
          <TemplatePart element={footer} />
        </div>
      ) : (
        <footer className="bg-[#050505] px-8 py-32 border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-20 mb-32">
              <div className="md:col-span-6">
                <span className="text-6xl font-black tracking-tighter uppercase italic block mb-10">THE MAGAZINE</span>
                <p className="text-xl opacity-50 max-w-md leading-relaxed italic">
                  Documenting the evolution of human creativity, technology, and culture since 2026.
                </p>
              </div>
              <div className="md:col-span-2">
                <h6 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 opacity-30">Sections</h6>
                <ul className="space-y-4 text-sm font-bold">
                  <li><a href="#" className="hover:text-[#F27D26] transition-colors">Culture</a></li>
                  <li><a href="#" className="hover:text-[#F27D26] transition-colors">Technology</a></li>
                  <li><a href="#" className="hover:text-[#F27D26] transition-colors">Design</a></li>
                  <li><a href="#" className="hover:text-[#F27D26] transition-colors">Future</a></li>
                </ul>
              </div>
              <div className="md:col-span-2">
                <h6 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 opacity-30">Company</h6>
                <ul className="space-y-4 text-sm font-bold">
                  <li><a href="#" className="hover:text-[#F27D26] transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-[#F27D26] transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-[#F27D26] transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-[#F27D26] transition-colors">Privacy</a></li>
                </ul>
              </div>
              <div className="md:col-span-2">
                <h6 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 opacity-30">Social</h6>
                <ul className="space-y-4 text-sm font-bold">
                  <li><a href="#" className="hover:text-[#F27D26] transition-colors">Instagram</a></li>
                  <li><a href="#" className="hover:text-[#F27D26] transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-[#F27D26] transition-colors">LinkedIn</a></li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between pt-20 border-t border-white/10 gap-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">© 2026 THE MAGAZINE EDITORIAL GROUP</p>
              <div className="flex gap-10">
                <a href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity">Terms</a>
                <a href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity">Cookies</a>
                <a href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity">Accessibility</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

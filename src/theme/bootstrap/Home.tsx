import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Database, Layers, Zap, Shield, LogOut, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Element, User } from "../../types";
import { themeUtils } from "./utils";

export const Home = ({ currentUser, onLogout }: { currentUser: User | null, onLogout: () => void }) => {
  const [featuredElements, setFeaturedElements] = useState<Element[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const elements = await themeUtils.getElementsByType("Publication");
      setFeaturedElements(elements.slice(0, 3));
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Bootstrap Navbar */}
      <nav className="bg-[#212529] px-4 py-2 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white text-xl font-medium">
            <Database size={24} className="text-[#0d6efd]" />
            FlexCatalog
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-white/75 text-sm">
              <a href="#" className="hover:text-white transition-colors">Home</a>
              <a href="#" className="hover:text-white transition-colors">Features</a>
              <a href="#" className="hover:text-white transition-colors">About</a>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <Link to="/admin" className="btn-outline-light text-white/75 hover:text-white text-sm border border-white/25 px-3 py-1.5 rounded transition-all">Dashboard</Link>
                  <button onClick={onLogout} className="text-white/50 hover:text-white transition-colors">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link to="/admin" className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white px-4 py-1.5 rounded text-sm font-medium transition-all">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Jumbotron Hero */}
      <header className="bg-[#f8f9fa] py-24 border-b border-zinc-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-6xl font-light text-[#212529] mb-4">Welcome to FlexCatalog</h1>
            <p className="text-xl text-[#6c757d] mb-8 leading-relaxed">
              This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.
            </p>
            <hr className="my-8 border-zinc-300" />
            <p className="text-[#212529] mb-8">
              It uses utility classes for typography and spacing to space content out within the larger container.
            </p>
            <Link 
              to="/admin" 
              className="inline-block bg-[#0d6efd] hover:bg-[#0b5ed7] text-white px-6 py-3 rounded-md text-lg font-medium transition-all"
            >
              Learn more
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-[#0d6efd] rounded-full flex items-center justify-center text-white mx-auto mb-6">
                <Layers size={32} />
              </div>
              <h2 className="text-2xl font-normal text-[#212529] mb-3">Modular</h2>
              <p className="text-[#6c757d]">Donec sed odio dui. Etiam porta sem malesuada magna mollis euismod. Nullam id dolor id nibh ultricies vehicula ut id elit.</p>
              <button className="mt-4 bg-[#6c757d] hover:bg-[#5c636a] text-white px-4 py-2 rounded text-sm transition-all">View details »</button>
            </div>
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-[#0d6efd] rounded-full flex items-center justify-center text-white mx-auto mb-6">
                <Zap size={32} />
              </div>
              <h2 className="text-2xl font-normal text-[#212529] mb-3">Fast</h2>
              <p className="text-[#6c757d]">Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Cras mattis consectetur purus sit amet fermentum.</p>
              <button className="mt-4 bg-[#6c757d] hover:bg-[#5c636a] text-white px-4 py-2 rounded text-sm transition-all">View details »</button>
            </div>
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-[#0d6efd] rounded-full flex items-center justify-center text-white mx-auto mb-6">
                <Shield size={32} />
              </div>
              <h2 className="text-2xl font-normal text-[#212529] mb-3">Secure</h2>
              <p className="text-[#6c757d]">Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper.</p>
              <button className="mt-4 bg-[#6c757d] hover:bg-[#5c636a] text-white px-4 py-2 rounded text-sm transition-all">View details »</button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cards */}
      {featuredElements.length > 0 && (
        <section className="py-20 bg-[#f8f9fa]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-light text-[#212529] mb-12 text-center">Featured Catalog</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredElements.map(el => (
                <div key={el.id} className="bg-white border border-zinc-200 rounded shadow-sm overflow-hidden flex flex-col">
                  <div className="h-48 bg-zinc-200 flex items-center justify-center text-zinc-400">
                    <Database size={48} />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h5 className="text-xl font-medium text-[#212529] mb-2">{el.name}</h5>
                    <p className="text-[#6c757d] text-sm mb-4 flex-1">
                      Some quick example text to build on the card title and make up the bulk of the card's content.
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <Link 
                        to={`/e/${el.slug}`} 
                        className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white px-3 py-1.5 rounded text-sm transition-all"
                      >
                        View Details
                      </Link>
                      <small className="text-[#6c757d] uppercase font-bold text-[10px]">{el.type_name}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-200">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-[#6c757d] text-sm">
          <p>© 2026 FlexCatalog, Inc. · <a href="#" className="text-[#0d6efd] hover:underline">Privacy</a> · <a href="#" className="text-[#0d6efd] hover:underline">Terms</a></p>
          <p><a href="#" className="text-[#0d6efd] hover:underline">Back to top</a></p>
        </div>
      </footer>
    </div>
  );
};

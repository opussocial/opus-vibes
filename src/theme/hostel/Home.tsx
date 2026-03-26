import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  MapPin, 
  Coffee, 
  Wifi, 
  Shield, 
  Users,
  Star,
  Calendar,
  Bed,
  DoorOpen,
  Waves,
  Music
} from "lucide-react";
import { User } from "../../types";
import { useTheme } from "../ThemeContext";

export const Home = ({ currentUser, onLogout, settings }: { currentUser: User | null, onLogout: () => void, settings: Record<string, any> }) => {
  const { elements, types } = useTheme();
  
  // Find the main hostel element based on settings or default
  const homeSlug = settings?.home_element;
  const hostel = homeSlug 
    ? elements.find(e => e.slug === homeSlug) 
    : (elements.find(e => e.type_slug === 'hostel') || elements[0]);
  
  const rooms = elements.filter(e => e.type_slug === 'room' && (hostel ? e.parent_id === hostel.id : true));
  const experiences = elements.filter(e => e.type_slug === 'artwork' || e.type_slug === 'article').slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans selection:bg-[#FF6321] selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#F5F5F0]/80 backdrop-blur-md border-b border-black/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black tracking-tighter uppercase italic">
            {hostel?.name || "HOSTEL_MODERN"}
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
            <Link to="/explore" className="hover:text-[#FF6321] transition-colors">Rooms</Link>
            <Link to="/explore?type=experience" className="hover:text-[#FF6321] transition-colors">Experiences</Link>
            <Link to="/explore?type=amenity" className="hover:text-[#FF6321] transition-colors">Amenities</Link>
          </div>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <Link to="/admin" className="px-6 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#FF6321] transition-all">
                Dashboard
              </Link>
            ) : (
              <Link to="/admin" className="px-6 py-2 border-2 border-black text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1555854816-802f188095e4?auto=format&fit=crop&q=80&w=2000" 
            alt="Hostel Interior" 
            className="w-full h-full object-cover grayscale-[0.5] brightness-[0.7]"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1 bg-[#FF6321] text-white text-[10px] font-black uppercase tracking-[0.3em] mb-6">
              EST. 2026 / AMSTERDAM
            </span>
            <h1 className="text-[15vw] md:text-[12vw] font-black leading-[0.8] uppercase tracking-tighter text-white mb-8">
              THE <br/> <span className="italic">NOMAD</span>
            </h1>
            <p className="text-white/80 text-lg md:text-2xl font-medium max-w-2xl mx-auto mb-12">
              {hostel?.content?.body || "A cozy, community-driven space for the modern traveler. Located in the heart of the historic district."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/explore" className="w-full sm:w-auto px-12 py-5 bg-[#FF6321] text-white font-black uppercase tracking-widest hover:scale-105 transition-transform">
                Book Your Stay
              </Link>
              <button className="w-full sm:w-auto px-12 py-5 border-2 border-white text-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                View Gallery
              </button>
            </div>
          </motion.div>
        </div>

        {/* Marquee */}
        <div className="absolute bottom-0 w-full bg-black py-4 overflow-hidden whitespace-nowrap border-t-2 border-white/20">
          <div className="animate-marquee inline-block">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="text-white text-xs font-black uppercase tracking-[0.5em] mx-12">
                FREE WIFI • 24/7 RECEPTION • ROOFTOP BAR • CO-WORKING SPACE • BIKE RENTAL • 
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Features */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-black/10">
        <div className="space-y-4">
          <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full">
            <MapPin size={24} />
          </div>
          <h3 className="text-xl font-black uppercase italic">Prime Location</h3>
          <p className="text-sm leading-relaxed opacity-60">
            Steps away from the central station and the city's most vibrant nightlife and cultural spots.
          </p>
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full">
            <Coffee size={24} />
          </div>
          <h3 className="text-xl font-black uppercase italic">Social Hub</h3>
          <p className="text-sm leading-relaxed opacity-60">
            Our common area is designed for meeting people. Free coffee every morning and community dinners twice a week.
          </p>
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full">
            <Shield size={24} />
          </div>
          <h3 className="text-xl font-black uppercase italic">Safe & Secure</h3>
          <p className="text-sm leading-relaxed opacity-60">
            Individual lockers in every room, 24-hour security, and keycard access for your peace of mind.
          </p>
        </div>
      </section>

      {/* Rooms Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <span className="text-[#FF6321] text-xs font-black uppercase tracking-widest block mb-2">Accommodations</span>
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">OUR_ROOMS</h2>
          </div>
          <Link to="/explore" className="group flex items-center gap-4 font-black uppercase text-sm tracking-widest border-b-2 border-black pb-2">
            View All <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {rooms.length > 0 ? rooms.map((room, idx) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative"
            >
              <div className="aspect-[16/10] overflow-hidden bg-black mb-6">
                <img 
                  src={`https://picsum.photos/seed/${room.slug}/800/500`} 
                  alt={room.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-black uppercase italic mb-2">{room.name}</h3>
                  <div className="flex items-center gap-4 text-xs font-bold opacity-40 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Users size={14} /> 8 Guests</span>
                    <span className="flex items-center gap-1"><Wifi size={14} /> Free Wi-Fi</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-black tracking-tighter">€24</span>
                  <span className="text-[10px] font-bold uppercase opacity-40">Per Night</span>
                </div>
              </div>
              <Link to={`/elements/${room.slug}`} className="absolute inset-0 z-10" />
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-black/10">
              <p className="font-bold uppercase tracking-widest opacity-40">No rooms listed yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Experiences Section */}
      <section className="bg-black text-white py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <span className="text-[#FF6321] text-xs font-black uppercase tracking-widest block mb-4">The Vibe</span>
              <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
                MORE THAN <br/> <span className="text-transparent stroke-white stroke-1" style={{ WebkitTextStroke: '1px white' }}>A BED</span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-12 max-w-md">
                We curate weekly events from walking tours to pub crawls and live music sessions. Join the community and make memories that last.
              </p>
              <div className="space-y-6">
                {[
                  { icon: <Waves size={20} />, title: "Canal Tours", time: "Every Tuesday" },
                  { icon: <Music size={20} />, title: "Live Music", time: "Friday Nights" },
                  { icon: <Star size={20} />, title: "Pub Crawl", time: "Daily at 9PM" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 p-4 border border-white/10 hover:bg-white/5 transition-colors">
                    <div className="text-[#FF6321]">{item.icon}</div>
                    <div>
                      <h4 className="font-black uppercase italic">{item.title}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-[#FF6321] rotate-3 absolute inset-0 -z-10" />
              <img 
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1000" 
                alt="Community" 
                className="w-full h-full object-cover -rotate-3 hover:rotate-0 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F5F5F0] border-t border-black/10 py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-8">
              {hostel?.name || "HOSTEL_MODERN"}
            </h2>
            <p className="text-sm font-medium opacity-60 max-w-xs mb-8">
              Redefining the hostel experience for a new generation of nomads.
            </p>
            <div className="flex gap-4">
              {['IG', 'TW', 'FB'].map(s => (
                <a key={s} href="#" className="w-10 h-10 border border-black flex items-center justify-center text-[10px] font-black hover:bg-black hover:text-white transition-all">
                  {s}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm font-bold uppercase tracking-widest opacity-60">
              <li><Link to="/explore" className="hover:text-[#FF6321]">Rooms</Link></li>
              <li><Link to="/explore" className="hover:text-[#FF6321]">Experience</Link></li>
              <li><Link to="/admin" className="hover:text-[#FF6321]">Admin</Link></li>
              <li><Link to="/explore" className="hover:text-[#FF6321]">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-6">Newsletter</h4>
            <div className="flex flex-col gap-4">
              <input 
                type="email" 
                placeholder="YOUR@EMAIL.COM" 
                className="bg-transparent border-b-2 border-black py-2 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-[#FF6321]"
              />
              <button className="px-6 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#FF6321] transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">© 2026 {hostel?.name || "HOSTEL_MODERN"}. ALL RIGHTS RESERVED.</span>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">DESIGNED BY AIS_AGENT</span>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;


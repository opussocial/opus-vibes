import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Database, 
  ArrowRight, 
  Globe, 
  Users, 
  Zap, 
  MapPin, 
  Coffee, 
  Wifi, 
  Shield, 
  Menu,
  Plus
} from "lucide-react";
import { ElementDetail, User } from "../../types";
import { useTheme } from "../ThemeContext";
import { TemplatePart } from "../TemplatePart";

export const Home = ({ currentUser }: { currentUser: User | null }) => {
  const { get_elements_by_type, get_header, get_footer } = useTheme();
  const rooms = get_elements_by_type("room");
  const experiences = get_elements_by_type("experience");
  const header = get_header();
  const footer = get_footer();

  return (
    <div className="min-h-screen bg-gallery-white text-brutal-black font-hostel selection:bg-neon-green selection:text-brutal-black">
      {/* Brutalist Header */}
      <header className="border-b-4 border-brutal-black sticky top-0 bg-gallery-white z-50">
        <div className="flex items-center justify-between h-24 px-8">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-brutal-black text-neon-green flex items-center justify-center border-2 border-brutal-black group-hover:bg-neon-green group-hover:text-brutal-black transition-colors">
              <Database size={28} strokeWidth={3} />
            </div>
            <span className="text-4xl font-display uppercase tracking-tighter">HOSTEL_X</span>
          </Link>

          <div className="hidden md:flex items-center gap-12">
            {['Rooms', 'Experiences', 'Community', 'About'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-black uppercase tracking-widest hover:text-neon-green transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {currentUser ? (
              <Link to="/admin" className="w-12 h-12 border-4 border-brutal-black flex items-center justify-center hover:bg-neon-green transition-colors">
                <Users size={24} />
              </Link>
            ) : (
              <Link to="/admin" className="px-8 py-3 bg-brutal-black text-neon-green font-black uppercase text-xs tracking-widest border-4 border-brutal-black hover:bg-neon-green hover:text-brutal-black transition-all">
                Book Now
              </Link>
            )}
            <button className="md:hidden">
              <Menu size={32} strokeWidth={3} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero: Split Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-2 border-b-4 border-brutal-black">
        <div className="p-12 lg:p-24 border-b-4 lg:border-b-0 lg:border-r-4 border-brutal-black flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-1 bg-neon-green border-2 border-brutal-black text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              EST. 2026 / DIGITAL NOMAD HUB
            </div>
            <h1 className="text-[12vw] lg:text-[10vw] font-display leading-[0.85] uppercase mb-12 tracking-tighter">
              BEYOND <br/> <span className="text-neon-green stroke-black stroke-2" style={{ WebkitTextStroke: '2px black' }}>BORDERS</span>
            </h1>
            <p className="text-2xl font-bold leading-tight max-w-md mb-12">
              A modular living space designed for the next generation of creative explorers. Connect, create, and crash in style.
            </p>
            <div className="flex flex-wrap gap-6">
              <button className="px-10 py-5 bg-neon-green border-4 border-brutal-black text-brutal-black font-black uppercase tracking-widest hover:translate-x-2 hover:-translate-y-2 transition-transform shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                Explore Rooms
              </button>
              <button className="px-10 py-5 border-4 border-brutal-black text-brutal-black font-black uppercase tracking-widest hover:bg-brutal-black hover:text-neon-green transition-all">
                Our Story
              </button>
            </div>
          </motion.div>
        </div>
        <div className="relative h-[60vh] lg:h-auto bg-brutal-black overflow-hidden group">
          <img 
            src="https://picsum.photos/seed/hostel-hero/1200/1200" 
            alt="Hostel Life"
            className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000 grayscale hover:grayscale-0"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-12 left-12 right-12">
            <div className="bg-neon-green border-4 border-brutal-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-4 mb-4">
                <MapPin size={24} strokeWidth={3} />
                <span className="font-black uppercase tracking-widest">Berlin / Kreuzberg</span>
              </div>
              <p className="font-bold text-lg">Join 50+ nomads currently staying with us.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-brutal-black py-6 border-b-4 border-brutal-black overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee">
          {[1,2,3,4,5].map(i => (
            <span key={i} className="text-neon-green text-4xl font-display uppercase mx-12">
              Fast Wifi • Community Kitchen • Rooftop Bar • Co-working Space • 24/7 Security • 
            </span>
          ))}
        </div>
      </div>

      {/* Rooms Grid: Brutalist Cards */}
      <section id="rooms" className="p-8 lg:p-24 bg-gallery-white">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div>
            <span className="text-6xl font-display uppercase leading-none block">01</span>
            <h2 className="text-8xl font-display uppercase leading-none tracking-tighter">THE ROOMS</h2>
          </div>
          <p className="max-w-xs font-bold text-lg opacity-60">
            From shared dorms to private suites, every space is a modular masterpiece.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {rooms.map((room, idx) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group border-4 border-brutal-black bg-gallery-white hover:bg-neon-green transition-colors shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
            >
              <Link to={`/e/${room.slug}`} className="block">
                <div className="aspect-square border-b-4 border-brutal-black overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/${room.slug}/800/800`} 
                    alt={room.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-brutal-black">
                      {room.type_name}
                    </span>
                    <span className="font-mono text-sm font-bold">FROM $45/NT</span>
                  </div>
                  <h3 className="text-4xl font-display uppercase leading-none mb-6 group-hover:translate-x-2 transition-transform">{room.name}</h3>
                  <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
                    View Details <ArrowRight size={14} strokeWidth={3} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          
          {/* Add Room Placeholder */}
          <Link to="/admin" className="border-4 border-brutal-black border-dashed flex flex-col items-center justify-center p-12 hover:bg-neon-green/10 transition-colors group">
            <div className="w-20 h-20 rounded-full border-4 border-brutal-black flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Plus size={40} strokeWidth={3} />
            </div>
            <span className="font-black uppercase tracking-widest">Add New Space</span>
          </Link>
        </div>
      </section>

      {/* Features: Icon Grid */}
      <section className="border-y-4 border-brutal-black grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <Wifi />, title: "Gigabit Wifi", desc: "Fiber optic everywhere." },
          { icon: <Coffee />, title: "Free Coffee", desc: "Local roasts all day." },
          { icon: <Users />, title: "Community", desc: "Weekly nomad meetups." },
          { icon: <Shield />, title: "Secure", desc: "Smart locks & lockers." }
        ].map((feat, i) => (
          <div key={i} className={`p-12 border-brutal-black ${i < 3 ? 'md:border-r-4' : ''} ${i < 2 ? 'lg:border-b-0 border-b-4' : 'border-b-4 lg:border-b-0'} last:border-b-0`}>
            <div className="w-16 h-16 bg-brutal-black text-neon-green flex items-center justify-center mb-8">
              {React.cloneElement(feat.icon as React.ReactElement, { size: 32, strokeWidth: 3 })}
            </div>
            <h4 className="text-2xl font-display uppercase mb-4">{feat.title}</h4>
            <p className="font-bold opacity-60">{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* Experiences: Horizontal Scroll or Grid */}
      <section id="experiences" className="bg-brutal-black text-gallery-white p-8 lg:p-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div>
            <span className="text-6xl font-display uppercase leading-none block text-neon-green">02</span>
            <h2 className="text-8xl font-display uppercase leading-none tracking-tighter">LOCAL VIBES</h2>
          </div>
          <button className="px-10 py-5 bg-neon-green border-4 border-neon-green text-brutal-black font-black uppercase tracking-widest hover:bg-transparent hover:text-neon-green transition-all">
            View All Events
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {experiences.slice(0, 2).map((exp, i) => (
            <div key={exp.id} className="group relative aspect-[16/9] border-4 border-gallery-white overflow-hidden">
              <img 
                src={`https://picsum.photos/seed/${exp.slug}/1200/800`} 
                alt={exp.name}
                className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 p-12 flex flex-col justify-end bg-gradient-to-t from-brutal-black to-transparent">
                <span className="text-neon-green font-mono text-sm mb-4">EVERY TUESDAY / 19:00</span>
                <h3 className="text-5xl font-display uppercase mb-6">{exp.name}</h3>
                <Link to={`/e/${exp.slug}`} className="inline-flex items-center gap-4 font-black uppercase tracking-widest hover:text-neon-green transition-colors">
                  Join Event <ArrowRight size={20} strokeWidth={3} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-brutal-black bg-gallery-white p-8 lg:p-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32">
          <div className="lg:col-span-6">
            <span className="text-[15vw] lg:text-[10vw] font-display uppercase leading-[0.8] tracking-tighter block mb-12">
              STAY <br/> <span className="text-neon-green" style={{ WebkitTextStroke: '2px black' }}>WIRED.</span>
            </span>
            <div className="flex gap-8">
              {['Instagram', 'Twitter', 'LinkedIn', 'Discord'].map(social => (
                <a key={social} href="#" className="text-sm font-black uppercase tracking-widest border-b-4 border-transparent hover:border-neon-green transition-all">
                  {social}
                </a>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6 grid grid-cols-2 gap-12">
            <div>
              <h5 className="font-black uppercase tracking-widest mb-8 text-xs opacity-40">Navigation</h5>
              <ul className="space-y-4 font-bold text-lg">
                <li><a href="#" className="hover:text-neon-green transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-neon-green transition-colors">Rooms</a></li>
                <li><a href="#" className="hover:text-neon-green transition-colors">Experiences</a></li>
                <li><a href="#" className="hover:text-neon-green transition-colors">Admin</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-black uppercase tracking-widest mb-8 text-xs opacity-40">Contact</h5>
              <ul className="space-y-4 font-bold text-lg">
                <li>hello@hostelx.com</li>
                <li>+49 30 123 456 78</li>
                <li>Reichenberger Str. 123</li>
                <li>10999 Berlin</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="pt-12 border-t-4 border-brutal-black flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="text-2xl font-display uppercase">HOSTEL_X © 2026</span>
          <span className="font-mono text-xs opacity-40 uppercase tracking-widest">Designed for the modular web</span>
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

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft, Box, FolderTree, Info, ExternalLink } from "lucide-react";
import { Element, ElementType } from "../types";
import { Link } from "react-router-dom";
import { IconRenderer } from "./common/IconRenderer";

interface TreeBrowserProps {
  types: ElementType[];
}

interface ElementCardProps {
  element: Element;
  type?: ElementType;
  isActive?: boolean;
  isSmall?: boolean;
  onClick: (element: Element) => void;
  key?: any;
}

const ElementCard = ({ element, type, isActive, isSmall = false, onClick }: ElementCardProps) => {
  return (
    <motion.button
      layout
      onClick={() => onClick(element)}
      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 group ${
        isActive 
          ? "bg-marine border-marine text-brand-yellow shadow-lg scale-[1.02]" 
          : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50"
      }`}
    >
      <div 
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${isActive ? "bg-marine-light" : ""}`}
        style={!isActive ? { backgroundColor: type?.color || "#6366f1" } : {}}
      >
        <IconRenderer name={type?.icon || "Package"} size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold truncate ${isActive ? "text-brand-yellow" : "text-zinc-900"}`}>{element.name}</p>
        <p className={`text-[10px] uppercase tracking-widest font-bold ${isActive ? "text-brand-yellow/60" : "text-zinc-400"}`}>
          {type?.name}
        </p>
      </div>
      {!isSmall && <ChevronRight size={18} className={isActive ? "text-brand-yellow" : "text-zinc-300 group-hover:text-zinc-500"} />}
    </motion.button>
  );
};

export const TreeBrowser = ({ types }: TreeBrowserProps) => {
  const [roots, setRoots] = useState<Element[]>([]);
  const [currentFocus, setCurrentFocus] = useState<Element | null>(null);
  const [parent, setParent] = useState<Element | null>(null);
  const [siblings, setSiblings] = useState<Element[]>([]);
  const [children, setChildren] = useState<Element[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoots();
  }, []);

  useEffect(() => {
    if (currentFocus) {
      fetchContext(currentFocus);
    } else {
      setParent(null);
      setSiblings(roots);
      setChildren([]);
    }
  }, [currentFocus, roots]);

  const fetchRoots = async () => {
    try {
      const res = await fetch("/api/elements/roots");
      if (res.ok) {
        const data = await res.ok ? await res.json() : [];
        setRoots(data);
        if (!currentFocus && data.length > 0) {
          // Don't auto-focus first root to keep it clean, or maybe do?
          // Let's not auto-focus, just show roots in the middle column
        }
      }
    } catch (err) {
      console.error("Error fetching roots:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContext = async (element: Element) => {
    setLoading(true);
    try {
      const [pRes, sRes, cRes] = await Promise.all([
        fetch(`/api/elements/${element.id}/parent`),
        element.parent_id 
          ? fetch(`/api/elements/${element.parent_id}/children`)
          : fetch(`/api/elements/roots`),
        fetch(`/api/elements/${element.id}/children`)
      ]);

      if (pRes.ok) setParent(await pRes.json());
      else setParent(null);

      if (sRes.ok) setSiblings(await sRes.json());
      if (cRes.ok) setChildren(await cRes.json());
    } catch (err) {
      console.error("Error fetching context:", err);
    } finally {
      setLoading(false);
    }
  };

  const getType = (typeId: number) => types.find(t => t.id === typeId);

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-marine text-brand-yellow rounded-2xl shadow-lg">
          <FolderTree size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-marine">Hierarchical Tree</h2>
          <p className="text-zinc-500 text-sm">Navigate through parent-child relationships.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
        {/* Parent Column */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Parent</h3>
            {parent && (
              <button 
                onClick={() => setCurrentFocus(parent)}
                className="text-[10px] font-bold text-marine hover:underline flex items-center gap-1"
              >
                <ChevronLeft size={10} /> Focus Parent
              </button>
            )}
          </div>
          <div className="flex-1 bg-zinc-50/50 rounded-[2.5rem] border border-zinc-200 p-4 overflow-y-auto space-y-3">
            {parent ? (
              <ElementCard 
                element={parent} 
                type={getType(parent.type_id)} 
                isSmall 
                onClick={setCurrentFocus}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 opacity-40">
                <Box size={32} className="text-zinc-300" />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No Parent</p>
              </div>
            )}
          </div>
        </div>

        {/* Current / Siblings Column */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              {currentFocus?.parent_id ? "Siblings" : "Root Elements"}
            </h3>
            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
              {siblings.length}
            </span>
          </div>
          <div className="flex-1 bg-white rounded-[2.5rem] border-2 border-zinc-200 p-4 overflow-y-auto space-y-3 shadow-inner">
            <AnimatePresence mode="popLayout">
              {siblings.map(el => (
                <ElementCard 
                  key={el.id} 
                  element={el} 
                  type={getType(el.type_id)}
                  isActive={currentFocus?.id === el.id} 
                  onClick={setCurrentFocus}
                />
              ))}
            </AnimatePresence>
            {siblings.length === 0 && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 opacity-40">
                <Box size={32} className="text-zinc-300" />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Children Column */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Children</h3>
            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
              {children.length}
            </span>
          </div>
          <div className="flex-1 bg-zinc-50/50 rounded-[2.5rem] border border-zinc-200 p-4 overflow-y-auto space-y-3">
            <AnimatePresence mode="popLayout">
              {children.map(el => (
                <ElementCard 
                  key={el.id} 
                  element={el} 
                  type={getType(el.type_id)}
                  onClick={setCurrentFocus}
                />
              ))}
            </AnimatePresence>
            {children.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 opacity-40">
                <Box size={32} className="text-zinc-300" />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No Children</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Focus Detail Bar */}
      {currentFocus && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-marine text-white p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-between gap-6"
        >
          <div className="flex items-center gap-6">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: getType(currentFocus.type_id)?.color || "#6366f1" }}
            >
              <IconRenderer name={getType(currentFocus.type_id)?.icon || "Package"} size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h4 className="text-2xl font-bold tracking-tight">{currentFocus.name}</h4>
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-brand-yellow">
                  {getType(currentFocus.type_id)?.name}
                </span>
              </div>
              <p className="text-white/60 text-sm italic">Focusing on this element and its immediate hierarchy.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to={`/elements/${currentFocus.slug}`}
              className="px-6 py-3 bg-brand-yellow text-marine rounded-xl font-bold hover:bg-white transition-all flex items-center gap-2 shadow-lg"
            >
              <ExternalLink size={18} />
              Open Element
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

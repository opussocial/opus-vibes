import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, MapPin, Link as LinkIcon, FileText, Package, Clock, Info } from "lucide-react";
import { ElementDetail, User, MODULAR_TABLES } from "../types";
import { Interactions } from "./Interactions";

interface ElementViewProps {
  elementId: number;
  onClose: () => void;
  currentUser: User;
}

export const ElementView = ({ elementId, onClose, currentUser }: ElementViewProps) => {
  const [element, setElement] = useState<ElementDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/elements/${elementId}`)
      .then(res => res.json())
      .then(data => {
        setElement(data);
        setLoading(false);
      });
  }, [elementId]);

  if (loading) return null;
  if (!element) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Info size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">{element.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2 py-0.5 bg-zinc-200 text-zinc-600 rounded text-[10px] font-bold uppercase tracking-wider">
                  {element.type_name}
                </span>
                <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <Clock size={10} />
                  Updated {new Date(element.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              {/* Modular Data Rendering */}
              {MODULAR_TABLES.map(table => {
                const data = element[table.value];
                if (!data || Object.keys(data).length === 0) return null;

                return (
                  <div key={table.value} className="space-y-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                      {table.value === 'content' && <FileText size={18} />}
                      {table.value === 'place' && <MapPin size={18} />}
                      {table.value === 'product_info' && <Package size={18} />}
                      {table.value === 'urls_embeds' && <LinkIcon size={18} />}
                      {table.value === 'time_tracking' && <Calendar size={18} />}
                      <h3 className="text-xs font-bold uppercase tracking-widest">{table.label}</h3>
                    </div>
                    
                    <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                      {table.value === 'content' && (
                        <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">{data.body}</p>
                      )}
                      
                      {table.value === 'place' && (
                        <div className="space-y-2">
                          <p className="font-medium text-zinc-900">{data.address}</p>
                          <p className="text-xs text-zinc-400">Coordinates: {data.latitude}, {data.longitude}</p>
                        </div>
                      )}

                      {table.value === 'product_info' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">SKU</p>
                            <p className="font-mono text-sm">{data.sku}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Price</p>
                            <p className="text-lg font-bold text-emerald-600">{data.currency} {data.price}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Stock</p>
                            <p className="text-sm">{data.stock} units</p>
                          </div>
                        </div>
                      )}

                      {table.value === 'urls_embeds' && (
                        <div className="space-y-4">
                          <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium flex items-center gap-2">
                            {data.title || data.url}
                            <LinkIcon size={14} />
                          </a>
                          {data.embed_code && (
                            <div className="rounded-xl overflow-hidden border border-zinc-200 bg-black aspect-video" dangerouslySetInnerHTML={{ __html: data.embed_code }} />
                          )}
                        </div>
                      )}

                      {table.value === 'time_tracking' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Start</span>
                            <span className="font-medium">{new Date(data.start_time).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">End</span>
                            <span className="font-medium">{new Date(data.end_time).toLocaleString()}</span>
                          </div>
                          <div className="pt-2 border-t border-zinc-200 flex justify-between items-center">
                            <span className="text-xs font-bold text-zinc-400 uppercase">Duration</span>
                            <span className="text-lg font-bold">{data.duration} mins</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1 border-l border-zinc-100 pl-8">
              <Interactions elementId={elementId} currentUser={currentUser} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

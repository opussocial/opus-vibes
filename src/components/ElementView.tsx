import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import * as LucideIcons from "lucide-react";
import { X, Calendar, MapPin, Link as LinkIcon, FileText, Package, Clock, Info, Loader2, Database, ChevronRight, Plus, Trash2, ArrowRight, Palette } from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ElementDetail, User, MODULAR_TABLES, Element, GraphEdge, ElementType, RelationshipType } from "../types";
import { Interactions } from "./Interactions";
import { Badge } from "./common/Badge";

const IconRenderer = ({ name, size = 16, className = "" }: { name: string; size?: number; className?: string }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <IconComponent size={size} className={className} />;
};

interface ElementViewProps {
  currentUser: User | null;
  types: ElementType[];
  relTypes: RelationshipType[];
}

export const ElementView = ({ currentUser, types, relTypes }: ElementViewProps) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [element, setElement] = useState<ElementDetail | null>(null);
  const [parent, setParent] = useState<Element | null>(null);
  const [children, setChildren] = useState<Element[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEdge, setShowAddEdge] = useState(false);
  const [newEdge, setNewEdge] = useState<{ rel_type_id?: number; target_el_id?: number }>({});
  const [allElements, setAllElements] = useState<Element[]>([]);

  const fetchElementData = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/elements/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setElement(data);
        
        // Fetch related data
        const [pRes, cRes, gRes, eRes] = await Promise.all([
          fetch(`/api/elements/${data.id}/parent`),
          fetch(`/api/elements/${data.id}/children`),
          fetch(`/api/elements/${data.id}/graph`),
          fetch("/api/elements")
        ]);
        
        setParent(await pRes.json());
        setChildren(await cRes.json());
        setEdges(await gRes.json());
        setAllElements(await eRes.json());
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElementData();
  }, [slug, navigate]);

  const handleCreateEdge = async () => {
    if (!newEdge.rel_type_id || !newEdge.target_el_id || !element) return;
    
    const res = await fetch("/api/graph", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rel_type_id: newEdge.rel_type_id,
        source_el_id: element.id,
        target_el_id: newEdge.target_el_id
      })
    });
    
    if (res.ok) {
      setNewEdge({});
      setShowAddEdge(false);
      fetchElementData();
    }
  };

  const handleDeleteEdge = async (id: number) => {
    if (!confirm("Remove this relationship?")) return;
    const res = await fetch(`/api/graph/${id}`, { method: "DELETE" });
    if (res.ok) fetchElementData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-marine" size={48} />
      </div>
    );
  }

  if (!element) return null;

  const allowedChildTypes = types.filter(t => t.allowed_parent_types?.includes(element.type_id));
  const availableRelTypes = relTypes.filter(rt => rt.source_type_id === element.type_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col"
    >
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-white"
            style={{ backgroundColor: types.find(t => t.id === element.type_id)?.color || "#6366f1" }}
          >
            <IconRenderer name={types.find(t => t.id === element.type_id)?.icon || "Package"} size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">{element.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-2 py-0.5 bg-zinc-200 text-zinc-600 rounded text-[10px] font-bold uppercase tracking-wider">
                {element.type_name}
              </span>
              {element.status && (
                <Badge color="blue">{element.status}</Badge>
              )}
              <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Clock size={10} />
                Updated {new Date(element.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-zinc-100 text-zinc-400 rounded-xl transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Hierarchy Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Hierarchy</h3>
              </div>
              
              <div className="space-y-4">
                {/* Parent */}
                <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Parent Element</p>
                  {parent ? (
                    <Link 
                      to={`/elements/${parent.slug}`}
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-zinc-200 hover:border-zinc-400 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-100 rounded-lg text-zinc-400 group-hover:text-black transition-colors">
                          <Database size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{parent.name}</p>
                          <p className="text-[10px] text-zinc-400">{parent.type_name}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-zinc-300" />
                    </Link>
                  ) : (
                    <p className="text-sm text-zinc-400 italic">No parent element (Root)</p>
                  )}
                </div>

                {/* Children */}
                <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Child Elements</p>
                    <div className="flex gap-2">
                      {allowedChildTypes.map(t => (
                        <button
                          key={t.id}
                          onClick={() => navigate(`/elements/new?type=${t.slug}&parent=${element.id}`)}
                          className="flex items-center gap-1.5 px-2 py-1 bg-marine text-brand-yellow rounded-lg text-[10px] font-bold hover:bg-marine-light transition-all shadow-sm"
                        >
                          <Plus size={10} />
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {children.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {children.map(child => (
                        <Link 
                          key={child.id}
                          to={`/elements/${child.slug}`}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-zinc-200 hover:border-zinc-400 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-400 group-hover:text-black transition-colors">
                              <Database size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold">{child.name}</p>
                              <p className="text-[10px] text-zinc-400">{child.type_name}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-zinc-300" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400 italic">No child elements</p>
                  )}
                </div>
              </div>
            </section>

            {/* Relationships Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Graph Relationships</h3>
                <button 
                  onClick={() => setShowAddEdge(!showAddEdge)}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-black transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              {showAddEdge && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-marine rounded-2xl p-6 text-white space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-brand-yellow/60 uppercase mb-2">Relationship Type</label>
                      <select 
                        value={newEdge.rel_type_id || ""}
                        onChange={e => setNewEdge({ ...newEdge, rel_type_id: parseInt(e.target.value) })}
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/10"
                      >
                        <option value="" className="text-black">Select...</option>
                        {availableRelTypes.map(rt => (
                          <option key={rt.id} value={rt.id} className="text-black">{rt.name} (→ {rt.target_type_name})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-brand-yellow/60 uppercase mb-2">Target Element</label>
                      <select 
                        value={newEdge.target_el_id || ""}
                        onChange={e => setNewEdge({ ...newEdge, target_el_id: parseInt(e.target.value) })}
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/10"
                      >
                        <option value="" className="text-black">Select...</option>
                        {allElements.filter(e => {
                          const rt = availableRelTypes.find(rt => rt.id === newEdge.rel_type_id);
                          return rt && e.type_id === rt.target_type_id && e.id !== element.id;
                        }).map(e => (
                          <option key={e.id} value={e.id} className="text-black">{e.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => setShowAddEdge(false)}
                      className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleCreateEdge}
                      disabled={!newEdge.rel_type_id || !newEdge.target_el_id}
                      className="flex-1 px-4 py-2 bg-brand-yellow text-marine hover:bg-yellow-400 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      Link Element
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="space-y-3">
                {edges.length > 0 ? (
                  edges.map(edge => {
                    const isSource = edge.source_el_id === element.id;
                    const otherName = isSource ? edge.target_name : edge.source_name;
                    const otherSlug = allElements.find(e => e.id === (isSource ? edge.target_el_id : edge.source_el_id))?.slug;

                    return (
                      <div key={edge.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm group">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">
                              {isSource ? "Source" : "Target"}
                            </span>
                            <div className={`p-2 rounded-lg ${isSource ? "bg-blue-50 text-blue-500" : "bg-emerald-50 text-emerald-500"}`}>
                              <LinkIcon size={14} />
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Relationship</p>
                              <Badge color="zinc">{edge.rel_name}</Badge>
                            </div>
                            <ArrowRight size={14} className="text-zinc-300" />
                            <div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">
                                {isSource ? "Target" : "Source"}
                              </p>
                              {otherSlug ? (
                                <Link to={`/elements/${otherSlug}`} className="text-sm font-bold hover:underline">
                                  {otherName}
                                </Link>
                              ) : (
                                <p className="text-sm font-bold">{otherName}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleDeleteEdge(edge.id)}
                          className="p-2 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-zinc-400 italic">No graph relationships defined</p>
                )}
              </div>
            </section>

            {/* Modular Data Rendering */}
            <section className="space-y-8 pt-8 border-t border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Details</h3>
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
                    {table.value === 'color_info' && <Palette size={18} />}
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

                    {table.value === 'color_info' && (
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-2xl shadow-inner border border-zinc-200"
                          style={{ backgroundColor: data.hex || "#000000" }}
                        />
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{data.label || "Untitled Color"}</p>
                          <p className="text-xs font-mono text-zinc-400 uppercase">{data.hex || "#000000"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            </section>
          </div>

          <div className="lg:col-span-1 border-l border-zinc-100 pl-8">
            <Interactions elementId={element.id} currentUser={currentUser} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

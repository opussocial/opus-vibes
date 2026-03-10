import React from "react";
import { motion } from "motion/react";
import { Plus, Trash2, X, Save, Link as LinkIcon, HelpCircle } from "lucide-react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { Element, RelationshipType, GraphEdge, ElementType } from "../types";
import { TreeNode } from "./common/TreeNode";
import * as LucideIcons from "lucide-react";

const IconRenderer = ({ name, size = 16, className = "" }: { name: string; size?: number; className?: string }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <IconComponent size={size} className={className} />;
};

interface RelationshipsProps {
  relTypes: RelationshipType[];
  graph: GraphEdge[];
  elements: Element[];
  hasPermission: (perm: string) => boolean;
  deleteRelType: (id: number) => void;
  deleteEdge: (id: number) => void;
  newRelType: Partial<RelationshipType>;
  setNewRelType: (val: any) => void;
  createRelType: () => void;
  newEdge: Partial<GraphEdge>;
  setNewEdge: (val: any) => void;
  createEdge: () => void;
  types: ElementType[];
}

export const Relationships = ({ 
  relTypes, 
  graph, 
  elements, 
  hasPermission, 
  deleteRelType, 
  deleteEdge,
  newRelType,
  setNewRelType,
  createRelType,
  newEdge,
  setNewEdge,
  createEdge,
  types
}: RelationshipsProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <Routes>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-marine">Relationships</h2>
                <p className="text-zinc-500 mt-1 text-sm md:text-base">Manage graph connections between elements.</p>
              </div>
            </div>

            {/* Schema Level Relationships */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-marine">Allowed Graph Relationships</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relTypes.map(rt => (
                  <div key={rt.id} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm relative group">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{rt.name}</span>
                      {hasPermission("manage_types") && (
                        <button onClick={() => deleteRelType(rt.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-center flex flex-col items-center">
                        <p className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest">Source</p>
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm mb-2"
                          style={{ backgroundColor: types.find(t => t.id === rt.source_type_id)?.color || "#6366f1" }}
                        >
                          <IconRenderer name={types.find(t => t.id === rt.source_type_id)?.icon || "Package"} size={14} />
                        </div>
                        <p className="text-sm font-bold">{rt.source_type_name}</p>
                      </div>
                      <div className="w-8 h-px bg-zinc-200 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-zinc-300 rotate-45" />
                      </div>
                      <div className="flex-1 p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-center flex flex-col items-center">
                        <p className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest">Target</p>
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm mb-2"
                          style={{ backgroundColor: types.find(t => t.id === rt.target_type_id)?.color || "#6366f1" }}
                        >
                          <IconRenderer name={types.find(t => t.id === rt.target_type_id)?.icon || "Package"} size={14} />
                        </div>
                        <p className="text-sm font-bold">{rt.target_type_name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Instance Level Graph */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-marine">Graph Connections</h3>
              </div>

              <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-zinc-50 border-b border-zinc-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Source Element</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-center">Relationship</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Target Element</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {graph.map(edge => {
                      const sourceEl = elements.find(e => e.id === edge.source_el_id);
                      const targetEl = elements.find(e => e.id === edge.target_el_id);
                      const sourceType = types.find(t => t.id === sourceEl?.type_id);
                      const targetType = types.find(t => t.id === targetEl?.type_id);

                      return (
                        <tr key={edge.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                                style={{ backgroundColor: sourceType?.color || "#6366f1" }}
                              >
                                <IconRenderer name={sourceType?.icon || "Package"} size={14} />
                              </div>
                              <span className="font-bold">{edge.source_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                              {edge.rel_name}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                                style={{ backgroundColor: targetType?.color || "#6366f1" }}
                              >
                                <IconRenderer name={targetType?.icon || "Package"} size={14} />
                              </div>
                              <span className="font-bold">{edge.target_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => deleteEdge(edge.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

          </motion.div>
        } />

        <Route path="/type/new" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-zinc-200 overflow-hidden"
          >
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-marine">
              <h2 className="text-2xl font-bold tracking-tight text-white">Define Relationship Type</h2>
              <button 
                onClick={() => navigate("/relationships")} 
                className="p-2 hover:bg-white/10 text-white rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-2">Relationship Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Related Products"
                  value={newRelType.name || ""}
                  onChange={e => setNewRelType({ ...newRelType, name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-2">Source Type</label>
                  <select 
                    value={newRelType.source_type_id || ""}
                    onChange={e => setNewRelType({ ...newRelType, source_type_id: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  >
                    <option value="">Select...</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-2">Target Type</label>
                  <select 
                    value={newRelType.target_type_id || ""}
                    onChange={e => setNewRelType({ ...newRelType, target_type_id: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  >
                    <option value="">Select...</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-100 flex gap-4">
                <button 
                  onClick={() => navigate("/relationships")}
                  className="flex-1 px-6 py-4 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-zinc-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={createRelType}
                  className="flex-[2] px-6 py-4 bg-marine text-brand-yellow rounded-xl font-bold hover:bg-marine-light transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save size={20} />
                  Create Relationship
                </button>
              </div>
            </div>
          </motion.div>
        } />

        <Route path="/edge/new" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-zinc-200 overflow-hidden"
          >
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-marine">
              <h2 className="text-2xl font-bold tracking-tight text-white">Link Elements</h2>
              <button 
                onClick={() => navigate("/relationships")} 
                className="p-2 hover:bg-white/10 text-white rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-2">Relationship Type</label>
                <select 
                  value={newEdge.rel_type_id || ""}
                  onChange={e => setNewEdge({ ...newEdge, rel_type_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                >
                  <option value="">Select...</option>
                  {relTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name} ({rt.source_type_name} → {rt.target_type_name})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-2">Source Element</label>
                  <select 
                    value={newEdge.source_el_id || ""}
                    onChange={e => setNewEdge({ ...newEdge, source_el_id: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  >
                    <option value="">Select...</option>
                    {elements.filter(e => !newEdge.rel_type_id || e.type_id === relTypes.find(rt => rt.id === newEdge.rel_type_id)?.source_type_id).map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.type_name})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-2">Target Element</label>
                  <select 
                    value={newEdge.target_el_id || ""}
                    onChange={e => setNewEdge({ ...newEdge, target_el_id: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  >
                    <option value="">Select...</option>
                    {elements.filter(e => !newEdge.rel_type_id || e.type_id === relTypes.find(rt => rt.id === newEdge.rel_type_id)?.target_type_id).map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.type_name})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-100 flex gap-4">
                <button 
                  onClick={() => navigate("/relationships")}
                  className="flex-1 px-6 py-4 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-zinc-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={createEdge}
                  className="flex-[2] px-6 py-4 bg-marine text-brand-yellow rounded-xl font-bold hover:bg-marine-light transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <LinkIcon size={20} />
                  Link Elements
                </button>
              </div>
            </div>
          </motion.div>
        } />
      </Routes>
    </div>
  );
};

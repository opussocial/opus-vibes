import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, X } from "lucide-react";
import { Element, RelationshipType, GraphEdge, ElementType } from "../types";
import { TreeNode } from "./common/TreeNode";

interface RelationshipsProps {
  relTypes: RelationshipType[];
  graph: GraphEdge[];
  elements: Element[];
  hasPermission: (perm: string) => boolean;
  setIsCreatingRelType: (val: boolean) => void;
  deleteRelType: (id: number) => void;
  setIsCreatingEdge: (val: boolean) => void;
  deleteEdge: (id: number) => void;
  isCreatingRelType: boolean;
  isCreatingEdge: boolean;
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
  setIsCreatingRelType, 
  deleteRelType, 
  setIsCreatingEdge, 
  deleteEdge,
  isCreatingRelType,
  isCreatingEdge,
  newRelType,
  setNewRelType,
  createRelType,
  newEdge,
  setNewEdge,
  createEdge,
  types
}: RelationshipsProps) => {
  return (
    <motion.div
      key="relationships"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-6xl mx-auto space-y-12"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relationships</h2>
          <p className="text-zinc-500 mt-1">Manage tree hierarchy and graph connections.</p>
        </div>
      </div>

      {/* Schema Level Relationships */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Allowed Graph Relationships</h3>
          {hasPermission("manage_types") && (
            <button 
              onClick={() => setIsCreatingRelType(true)}
              className="px-4 py-2 bg-black text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all flex items-center gap-2"
            >
              <Plus size={16} /> Define Relationship
            </button>
          )}
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
                <div className="flex-1 p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-center">
                  <p className="text-xs font-bold text-zinc-400 mb-1">SOURCE</p>
                  <p className="text-sm font-bold">{rt.source_type_name}</p>
                </div>
                <div className="w-8 h-px bg-zinc-200 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-zinc-300 rotate-45" />
                </div>
                <div className="flex-1 p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-center">
                  <p className="text-xs font-bold text-zinc-400 mb-1">TARGET</p>
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
          <h3 className="text-xl font-bold">Graph Connections</h3>
          <button 
            onClick={() => setIsCreatingEdge(true)}
            className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Link Elements
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Source Element</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-center">Relationship</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Target Element</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {graph.map(edge => (
                <tr key={edge.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold">{edge.source_name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      {edge.rel_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">{edge.target_name}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => deleteEdge(edge.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tree Adjacency Visualization */}
      <section>
        <h3 className="text-xl font-bold mb-6">Hierarchy (Tree)</h3>
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="space-y-4">
            {elements.filter(e => !e.parent_id).map(root => (
              <TreeNode key={root.id} element={root} allElements={elements} level={0} />
            ))}
          </div>
        </div>
      </section>

      {/* Modals for Relationships */}
      <AnimatePresence>
        {isCreatingRelType && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">Define Relationship</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Relationship Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Related Products"
                    value={newRelType.name || ""}
                    onChange={e => setNewRelType({ ...newRelType, name: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Source Type</label>
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
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Target Type</label>
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
                <div className="flex gap-3 mt-8">
                  <button onClick={() => setIsCreatingRelType(false)} className="flex-1 px-6 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-bold hover:bg-zinc-200 transition-all">Cancel</button>
                  <button onClick={createRelType} className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-all">Create</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isCreatingEdge && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">Link Elements</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Relationship Type</label>
                  <select 
                    value={newEdge.rel_type_id || ""}
                    onChange={e => setNewEdge({ ...newEdge, rel_type_id: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  >
                    <option value="">Select...</option>
                    {relTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name} ({rt.source_type_name} → {rt.target_type_name})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Source Element</label>
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
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Target Element</label>
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
                <div className="flex gap-3 mt-8">
                  <button onClick={() => setIsCreatingEdge(false)} className="flex-1 px-6 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-bold hover:bg-zinc-200 transition-all">Cancel</button>
                  <button onClick={createEdge} className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-all">Link</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Lock, Trash2, FileText, MapPin, Link as LinkIcon, Clock, Package, X, Save, Database } from "lucide-react";
import { ElementType } from "../types";
import { Badge } from "./common/Badge";

interface SchemaTypesProps {
  types: ElementType[];
  hasPermission: (perm: string) => boolean;
  setIsCreatingType: (val: boolean) => void;
  deleteType: (id: number) => void;
  isCreatingType: boolean;
  newType: Partial<ElementType>;
  setNewType: (val: any) => void;
  handleCreateType: (e: React.FormEvent) => void;
  toggleProp: (tableName: string, label: string) => void;
  MODULAR_TABLES: { value: string; label: string }[];
}

export const SchemaTypes = ({ 
  types, 
  hasPermission, 
  setIsCreatingType, 
  deleteType,
  isCreatingType,
  newType,
  setNewType,
  handleCreateType,
  toggleProp,
  MODULAR_TABLES
}: SchemaTypesProps) => {
  return (
    <motion.div
      key="types"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Schema Types</h2>
          <p className="text-zinc-500 mt-1">Define the structure of your elements and their modular properties.</p>
        </div>
        {hasPermission("manage_types") && (
          <button 
            onClick={() => setIsCreatingType(true)}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold hover:bg-zinc-800 transition-all"
          >
            <Plus size={20} />
            Create Type
          </button>
        )}
      </div>

      {!hasPermission("manage_types") && (
        <div className="mb-8 p-6 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-4 text-orange-800">
          <Lock size={24} />
          <div>
            <p className="font-bold">Restricted Access</p>
            <p className="text-sm opacity-80">You don't have permission to modify schema types. Contact an administrator for access.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {types.map((type) => (
          <div key={type.id} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{type.name}</h3>
              <div className="flex gap-2">
                <Badge color="zinc">{type.properties.length} Props</Badge>
                {hasPermission("manage_types") && (
                  <button 
                    onClick={() => deleteType(type.id)}
                    className="p-1 hover:bg-red-50 text-zinc-300 hover:text-red-500 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
              {type.description}
            </p>
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Included Modules</p>
              {type.properties.map(p => (
                <div key={p.id} className="flex items-center gap-3 text-sm font-medium text-zinc-700 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                  {p.table_name === "content" && <FileText size={16} className="text-blue-500" />}
                  {p.table_name === "place" && <MapPin size={16} className="text-red-500" />}
                  {p.table_name === "urls_embeds" && <LinkIcon size={16} className="text-purple-500" />}
                  {p.table_name === "time_tracking" && <Clock size={16} className="text-orange-500" />}
                  {p.table_name === "product_info" && <Package size={16} className="text-green-500" />}
                  {p.label}
                  <span className="ml-auto text-[10px] text-zinc-400 font-mono uppercase">{p.table_name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Type Creator Modal */}
      <AnimatePresence>
        {isCreatingType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Create New Schema Type</h2>
                <button onClick={() => setIsCreatingType(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateType} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-2">Type Name</label>
                  <input 
                    type="text" 
                    required
                    value={newType.name}
                    onChange={e => setNewType({ ...newType, name: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    placeholder="e.g. Portfolio Project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-2">Description</label>
                  <textarea 
                    rows={3}
                    value={newType.description}
                    onChange={e => setNewType({ ...newType, description: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none"
                    placeholder="Describe what this type represents..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-4">Modular Properties</label>
                  <div className="grid grid-cols-2 gap-3">
                    {MODULAR_TABLES.map(table => (
                      <button
                        key={table.value}
                        type="button"
                        onClick={() => toggleProp(table.value, table.label)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          newType.properties?.find(p => p.table_name === table.value)
                            ? "bg-black border-black text-white shadow-md"
                            : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          newType.properties?.find(p => p.table_name === table.value) ? "bg-white/20" : "bg-zinc-100"
                        }`}>
                          {table.value === "content" && <FileText size={16} />}
                          {table.value === "place" && <MapPin size={16} />}
                          {table.value === "urls_embeds" && <LinkIcon size={16} />}
                          {table.value === "time_tracking" && <Clock size={16} />}
                          {table.value === "product_info" && <Package size={16} />}
                          {table.value === "file" && <Database size={16} />}
                        </div>
                        <span className="text-sm font-bold">{table.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              <div className="p-8 border-t border-zinc-100 bg-zinc-50 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsCreatingType(false)}
                  className="flex-1 px-6 py-3 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-zinc-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  onClick={handleCreateType}
                  className="flex-[2] px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Create Schema Type
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

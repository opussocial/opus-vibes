import React from "react";
import { motion } from "motion/react";
import { X, Save } from "lucide-react";
import { Element, ElementType, ElementDetail, TypePermission } from "../types";
import { Badge } from "./common/Badge";

interface ElementEditorProps {
  editingElement: ElementDetail;
  setEditingElement: (el: ElementDetail | null) => void;
  isCreating: boolean;
  types: ElementType[];
  elements: Element[];
  handleSave: (e: React.FormEvent) => void;
  getTypePermission: (typeId: number) => TypePermission;
}

export const ElementEditor = ({ 
  editingElement, 
  setEditingElement, 
  isCreating, 
  types, 
  elements, 
  handleSave,
  getTypePermission
}: ElementEditorProps) => {
  const typePerm = getTypePermission(editingElement.type_id);
  const canEdit = typePerm.can_edit || !editingElement.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/20 backdrop-blur-sm">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col"
      >
        <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge color="blue">{editingElement.type_name}</Badge>
              <span className="text-xs text-zinc-400 font-medium">#{editingElement.id || "New"}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              {isCreating ? "Create New" : "Edit"} {editingElement.type_name}
            </h2>
          </div>
          <button 
            onClick={() => setEditingElement(null)}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Base Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Base Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Element Name</label>
                <input 
                  type="text" 
                  required
                  disabled={!canEdit}
                  value={editingElement.name}
                  onChange={e => setEditingElement({ ...editingElement, name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-lg font-medium disabled:opacity-50"
                  placeholder="e.g. Summer Collection 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Parent Element</label>
                <select 
                  disabled={!canEdit}
                  value={editingElement.parent_id || ""}
                  onChange={e => setEditingElement({ ...editingElement, parent_id: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-lg font-medium disabled:opacity-50"
                >
                  <option value="">No Parent (Root)</option>
                  {elements.filter(e => e.id !== editingElement.id).map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.type_name})</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Modular Sections */}
          {types.find(t => t.id === editingElement.type_id)?.properties.map(prop => (
            <section key={prop.id} className="space-y-4 pt-6 border-t border-zinc-100">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900">{prop.label}</h3>
                <Badge color="zinc">{prop.table_name}</Badge>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {prop.table_name === "content" && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Body Text</label>
                    <textarea 
                      rows={6}
                      disabled={!canEdit}
                      value={editingElement.content?.body || ""}
                      onChange={e => setEditingElement({
                        ...editingElement,
                        content: { ...editingElement.content, body: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none disabled:opacity-50"
                    />
                  </div>
                )}

                {prop.table_name === "place" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Address</label>
                      <input 
                        type="text"
                        disabled={!canEdit}
                        value={editingElement.place?.address || ""}
                        onChange={e => setEditingElement({
                          ...editingElement,
                          place: { ...editingElement.place, address: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Latitude</label>
                      <input 
                        type="number" step="any"
                        disabled={!canEdit}
                        value={editingElement.place?.latitude || ""}
                        onChange={e => setEditingElement({
                          ...editingElement,
                          place: { ...editingElement.place, latitude: parseFloat(e.target.value) }
                        })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Longitude</label>
                      <input 
                        type="number" step="any"
                        disabled={!canEdit}
                        value={editingElement.place?.longitude || ""}
                        onChange={e => setEditingElement({
                          ...editingElement,
                          place: { ...editingElement.place, longitude: parseFloat(e.target.value) }
                        })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}

                {prop.table_name === "file" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">File URL</label>
                      <input 
                        type="text"
                        disabled={!canEdit}
                        value={editingElement.file?.url || ""}
                        onChange={e => setEditingElement({
                          ...editingElement,
                          file: { ...editingElement.file, url: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all disabled:opacity-50"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Filename</label>
                        <input 
                          type="text"
                          disabled={!canEdit}
                          value={editingElement.file?.filename || ""}
                          onChange={e => setEditingElement({
                            ...editingElement,
                            file: { ...editingElement.file, filename: e.target.value }
                          })}
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">MIME Type</label>
                        <input 
                          type="text"
                          disabled={!canEdit}
                          value={editingElement.file?.mime_type || ""}
                          onChange={e => setEditingElement({
                            ...editingElement,
                            file: { ...editingElement.file, mime_type: e.target.value }
                          })}
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all disabled:opacity-50"
                          placeholder="image/jpeg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {prop.table_name === "urls_embeds" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">URL</label>
                      <input 
                        type="text"
                        disabled={!canEdit}
                        value={editingElement.urls_embeds?.url || ""}
                        onChange={e => setEditingElement({
                          ...editingElement,
                          urls_embeds: { ...editingElement.urls_embeds, url: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Title</label>
                      <input 
                        type="text"
                        disabled={!canEdit}
                        value={editingElement.urls_embeds?.title || ""}
                        onChange={e => setEditingElement({
                          ...editingElement,
                          urls_embeds: { ...editingElement.urls_embeds, title: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Embed Code</label>
                      <textarea 
                        rows={3}
                        disabled={!canEdit}
                        value={editingElement.urls_embeds?.embed_code || ""}
                        onChange={e => setEditingElement({
                          ...editingElement,
                          urls_embeds: { ...editingElement.urls_embeds, embed_code: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}

                {prop.table_name === "time_tracking" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Start Time</label>
                      <input 
                        type="datetime-local"
                        disabled={!canEdit}
                        value={editingElement.time_tracking?.start_time || ""}
                        onChange={e => setEditingElement({
                          ...editingElement,
                          time_tracking: { ...editingElement.time_tracking, start_time: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">End Time</label>
                      <input 
                        type="datetime-local"
                        disabled={!canEdit}
                        value={editingElement.time_tracking?.end_time || ""}
                        onChange={e => setEditingElement({
                          ...editingElement,
                          time_tracking: { ...editingElement.time_tracking, end_time: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all disabled:opacity-50"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Duration (minutes)</label>
                      <input 
                        type="number"
                        disabled={!canEdit}
                        value={editingElement.time_tracking?.duration || ""}
                        onChange={e => setEditingElement({
                          ...editingElement,
                          time_tracking: { ...editingElement.time_tracking, duration: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}

                {prop.table_name === "product_info" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">SKU</label>
                      <input 
                        type="text"
                        disabled={!canEdit}
                        value={editingElement.product_info?.sku || ""}
                        onChange={e => setEditingElement({
                          ...editingElement,
                          product_info: { ...editingElement.product_info, sku: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Price</label>
                      <input 
                        type="number" step="0.01"
                        disabled={!canEdit}
                        value={editingElement.product_info?.price || ""}
                        onChange={e => setEditingElement({
                          ...editingElement,
                          product_info: { ...editingElement.product_info, price: parseFloat(e.target.value) }
                        })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Currency</label>
                      <input 
                        type="text"
                        disabled={!canEdit}
                        value={editingElement.product_info?.currency || "USD"}
                        onChange={e => setEditingElement({
                          ...editingElement,
                          product_info: { ...editingElement.product_info, currency: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Stock</label>
                      <input 
                        type="number"
                        disabled={!canEdit}
                        value={editingElement.product_info?.stock || 0}
                        onChange={e => setEditingElement({
                          ...editingElement,
                          product_info: { ...editingElement.product_info, stock: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>
          ))}
        </form>

        <div className="p-8 border-t border-zinc-100 bg-zinc-50/50 flex gap-4">
          <button 
            onClick={() => setEditingElement(null)}
            className="flex-1 px-6 py-4 bg-white border border-zinc-200 text-zinc-900 rounded-xl font-bold hover:bg-zinc-50 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!canEdit}
            className="flex-1 px-6 py-4 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {canEdit ? "Save Changes" : "Read Only"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

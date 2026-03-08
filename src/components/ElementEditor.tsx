import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { X, Save, Loader2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Element, ElementType, ElementDetail, TypePermission, User } from "../types";
import { Badge } from "./common/Badge";

interface ElementEditorProps {
  types: ElementType[];
  elements: Element[];
  handleSave: (e: React.FormEvent, element: ElementDetail) => Promise<void>;
  getTypePermission: (typeId: number) => TypePermission;
  fetchData: () => void;
}

export const ElementEditor = ({ 
  types, 
  elements, 
  handleSave,
  getTypePermission,
  fetchData
}: ElementEditorProps) => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [editingElement, setEditingElement] = useState<ElementDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (slug) {
        // Editing existing
        try {
          const res = await fetch(`/api/elements/${slug}`);
          if (res.ok) {
            const data = await res.json();
            setEditingElement(data);
          } else {
            navigate("/");
          }
        } catch (err) {
          console.error(err);
          navigate("/");
        }
      } else {
        // Creating new
        const typeSlug = searchParams.get("type");
        const parentId = searchParams.get("parent");
        const type = types.find(t => t.slug === typeSlug);
        
        if (type) {
          setEditingElement({
            id: 0,
            name: `Untitled ${type.name}`,
            type_id: type.id,
            type_name: type.name,
            parent_id: parentId ? parseInt(parentId) : undefined,
            slug: "",
            created_at: "",
            updated_at: ""
          } as ElementDetail);
        } else {
          navigate("/");
        }
      }
      setLoading(false);
    };

    if (types.length > 0) {
      load();
    }
  }, [slug, searchParams, types, navigate]);

  if (loading || !editingElement) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-zinc-300" size={48} />
      </div>
    );
  }

  const typePerm = getTypePermission(editingElement.type_id);
  const canEdit = typePerm.can_edit || !editingElement.id;

  const onSave = async (e: React.FormEvent) => {
    await handleSave(e, editingElement);
    navigate("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col"
    >
      <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge color="blue">{editingElement.type_name}</Badge>
            <span className="text-xs text-zinc-400 font-medium">#{editingElement.id || "New"}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {!editingElement.id ? "Create New" : "Edit"} {editingElement.type_name}
          </h2>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-zinc-200 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={onSave} className="p-8 space-y-10">
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
                {elements.filter(e => {
                  const currentType = types.find(t => t.id === editingElement.type_id);
                  const allowedParentTypes = currentType?.allowed_parent_types || [];
                  
                  const isNotSelf = e.id !== editingElement.id;
                  const isAllowedType = allowedParentTypes.length === 0 || allowedParentTypes.includes(e.type_id);
                  
                  return isNotSelf && isAllowedType;
                }).map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.type_name})</option>
                ))}
              </select>
              {types.find(t => t.id === editingElement.type_id)?.allowed_parent_types?.length ? (
                <p className="text-[10px] text-zinc-400 mt-1 italic">
                  Only certain types can be parents of this {editingElement.type_name}.
                </p>
              ) : null}
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

        <div className="pt-8 border-t border-zinc-100 flex gap-4">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-4 bg-white border border-zinc-200 text-zinc-900 rounded-xl font-bold hover:bg-zinc-50 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={!canEdit}
            className="flex-1 px-6 py-4 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {canEdit ? "Save Changes" : "Read Only"}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

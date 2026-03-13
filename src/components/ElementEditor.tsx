import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import * as LucideIcons from "lucide-react";
import { X, Save, Loader2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Element, ElementType, ElementDetail, TypePermission, User } from "../types";
import { Badge } from "./common/Badge";

const IconRenderer = ({ name, size = 16, className = "" }: { name: string; size?: number; className?: string }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <IconComponent size={size} className={className} />;
};

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
  const [colorPresets, setColorPresets] = useState<string[]>(["#6366f1", "#ec4899", "#f43f5e", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#71717a"]);

  useEffect(() => {
    fetch("/api/settings/brand_color_presets")
      .then(res => res.json())
      .then(data => {
        if (data.value) {
          setColorPresets(data.value);
        }
      })
      .catch(err => console.error("Error fetching color presets:", err));
  }, []);

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
            navigate("/admin");
          }
        } catch (err) {
          console.error(err);
          navigate("/admin");
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
          navigate("/admin");
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
        <Loader2 className="animate-spin text-marine" size={48} />
      </div>
    );
  }

  const typePerm = getTypePermission(editingElement.type_id);
  const canEdit = typePerm.can_edit || !editingElement.id;

  const onSave = async (e: React.FormEvent) => {
    await handleSave(e, editingElement);
    navigate("/admin");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col"
    >
      <div 
        className="p-8 border-b border-zinc-100 flex items-center justify-between"
        style={{ backgroundColor: types.find(t => t.id === editingElement.type_id)?.color || "#6366f1" }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-white/20">
            <IconRenderer name={types.find(t => t.id === editingElement.type_id)?.icon || "Package"} size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge color="white">{editingElement.type_name}</Badge>
              <span className="text-xs text-white/60 font-medium">#{editingElement.id || "New"}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {!editingElement.id ? "Create New" : "Edit"} {editingElement.type_name}
            </h2>
          </div>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 text-white rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={onSave} className="p-8 space-y-10">
        {/* Base Info */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Base Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
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

            {types.find(t => t.id === editingElement.type_id)?.statuses?.length ? (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Status</label>
                <select 
                  disabled={!canEdit}
                  value={editingElement.status || ""}
                  onChange={e => setEditingElement({ ...editingElement, status: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-lg font-medium disabled:opacity-50"
                >
                  <option value="">Select Status...</option>
                  {types.find(t => t.id === editingElement.type_id)?.statuses?.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            ) : null}
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

              {prop.table_name === "color" && (
                <div className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <input 
                      type="color"
                      disabled={!canEdit}
                      value={editingElement.color?.hex || "#000000"}
                      onChange={e => setEditingElement({
                        ...editingElement,
                        color: { ...editingElement.color, hex: e.target.value }
                      })}
                      className="w-16 h-16 p-1 bg-zinc-50 border border-zinc-200 rounded-xl cursor-pointer disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Hex Color</label>
                      <input 
                        type="text"
                        disabled={!canEdit}
                        value={editingElement.color?.hex || "#000000"}
                        onChange={e => setEditingElement({
                          ...editingElement,
                          color: { ...editingElement.color, hex: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all font-mono uppercase disabled:opacity-50"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colorPresets.map(c => (
                      <button
                        key={c}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => setEditingElement({
                          ...editingElement,
                          color: { ...editingElement.color, hex: c }
                        })}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${editingElement.color?.hex === c ? "border-zinc-900 scale-110" : "border-transparent hover:scale-110"} disabled:opacity-50`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
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
            className="flex-1 px-6 py-4 bg-marine text-brand-yellow rounded-xl font-bold hover:bg-marine-light transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {canEdit ? "Save Changes" : "Read Only"}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

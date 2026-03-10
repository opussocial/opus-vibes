import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Plus, Lock, Trash2, FileText, MapPin, Link as LinkIcon, Clock, Package, X, Save, 
  Database, Edit2, AlertCircle, Palette, Search
} from "lucide-react";
import { useNavigate, useLocation, Routes, Route, useParams } from "react-router-dom";
import { ElementType } from "../types";
import { DataTable } from "./common/DataTable";
import { IconRenderer } from "./common/IconRenderer";

const COMMON_ICONS = [
  "Package", "FileText", "Users", "Database", "MapPin", "Calendar", "Clock", 
  "Shield", "Settings", "Activity", "Layers", "Box", "Briefcase", "Globe", 
  "Home", "Image", "Link", "Mail", "MessageSquare", "Music", "Phone", 
  "Search", "Star", "Tag", "Video", "Zap", "Heart", "Flag", "Bell", "Bookmark"
];

interface SchemaTypesProps {
  types: ElementType[];
  hasPermission: (perm: string) => boolean;
  deleteType: (slug: string) => void;
  newType: Partial<ElementType>;
  setNewType: (val: any) => void;
  handleCreateType: (e: React.FormEvent) => void;
  handleUpdateType: (e: React.FormEvent) => void;
  toggleProp: (tableName: string, label: string) => void;
  MODULAR_TABLES: { value: string; label: string }[];
}

export const SchemaTypes = ({ 
  types, 
  hasPermission, 
  deleteType,
  newType,
  setNewType,
  handleCreateType,
  handleUpdateType,
  toggleProp,
  MODULAR_TABLES
}: SchemaTypesProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isCreating = location.pathname.endsWith("/new");

  const wouldCreateCycle = (targetTypeId: number, potentialParentId: number) => {
    if (targetTypeId === potentialParentId) return true;
    
    const visited = new Set<number>();
    const check = (currentId: number): boolean => {
      if (visited.has(currentId)) return false;
      visited.add(currentId);

      if (currentId === targetTypeId) return true;
      
      const currentType = types.find(t => t.id === currentId);
      if (!currentType) return false;
      
      const parents = currentType.allowed_parent_types || [];
      for (const parentId of parents) {
        if (check(parentId)) return true;
      }
      return false;
    };

    return check(potentialParentId);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Routes>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-4xl font-bold tracking-tight text-marine">Schema Types</h2>
                <p className="text-zinc-500 mt-2 text-lg">Define the structure of your elements and their modular properties.</p>
              </div>
            </div>

            {!hasPermission("manage_types") && (
              <div className="p-8 bg-orange-50 border border-orange-100 rounded-3xl flex items-center gap-6 text-orange-800 shadow-sm">
                <Lock size={32} />
                <div>
                  <p className="font-bold text-lg">Restricted Access</p>
                  <p className="opacity-80">You don't have permission to modify schema types. Contact an administrator for access.</p>
                </div>
              </div>
            )}

            <DataTable 
              type="types"
              data={types}
              onEdit={(type) => {
                setNewType(type);
                navigate(`/types/${type.slug}/edit`);
              }}
              onDelete={(type) => deleteType(type.slug)}
            />
          </motion.div>
        } />

        <Route path="/new" element={
          <TypeForm 
            title="Create New Schema Type"
            buttonText="Create Schema Type"
            onSubmit={handleCreateType}
            newType={newType}
            setNewType={setNewType}
            types={types}
            toggleProp={toggleProp}
            wouldCreateCycle={wouldCreateCycle}
            MODULAR_TABLES={MODULAR_TABLES}
            navigate={navigate}
          />
        } />
        <Route path="/:slug/edit" element={
          <EditTypeWrapper 
            types={types}
            newType={newType}
            setNewType={setNewType}
            handleUpdateType={handleUpdateType}
            toggleProp={toggleProp}
            wouldCreateCycle={wouldCreateCycle}
            MODULAR_TABLES={MODULAR_TABLES}
            navigate={navigate}
          />
        } />
      </Routes>
    </div>
  );
};

const EditTypeWrapper = ({ types, newType, setNewType, handleUpdateType, toggleProp, wouldCreateCycle, MODULAR_TABLES, navigate }: any) => {
  const { slug } = useParams();
  const type = types.find((t: any) => t.slug === slug);

  React.useEffect(() => {
    if (type && (!newType.id || newType.slug !== slug)) {
      setNewType(type);
    }
  }, [type, slug, newType.id, newType.slug, setNewType]);

  if (!type) return null;

  const hasElements = type.element_count > 0;

  return (
    <TypeForm 
      title={`Edit Schema Type: ${type.name}`}
      buttonText="Update Schema Type"
      onSubmit={handleUpdateType}
      newType={newType}
      setNewType={setNewType}
      types={types}
      toggleProp={toggleProp}
      wouldCreateCycle={wouldCreateCycle}
      MODULAR_TABLES={MODULAR_TABLES}
      navigate={navigate}
      disabledProps={hasElements}
      warning={hasElements ? "Modular properties cannot be changed because elements of this type already exist. However, you can still update the name, description, and hierarchy." : null}
    />
  );
};

const TypeForm = ({ title, buttonText, onSubmit, newType, setNewType, types, toggleProp, wouldCreateCycle, MODULAR_TABLES, navigate, disabledProps, warning }: any) => {
  const [iconSearch, setIconSearch] = useState("");
  const [showIconList, setShowIconList] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const filteredIcons = COMMON_ICONS.filter(icon => 
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const addStatus = () => {
    if (!newStatus.trim()) return;
    const statuses = newType.statuses || [];
    if (statuses.includes(newStatus.trim())) return;
    setNewType({ ...newType, statuses: [...statuses, newStatus.trim()] });
    setNewStatus("");
  };

  const removeStatus = (status: string) => {
    setNewType({ 
      ...newType, 
      statuses: (newType.statuses || []).filter((s: string) => s !== status) 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col"
    >
      <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <button 
          onClick={() => navigate("/types")} 
          className="p-2 hover:bg-zinc-200 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {warning && (
        <div className="mx-8 mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4 text-amber-800">
          <AlertCircle size={24} />
          <p className="text-sm font-medium">{warning}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="block text-sm font-bold text-zinc-900 mb-2 flex items-center gap-2">
                  <Palette size={14} className="text-zinc-400" />
                  Brand Color
                </label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={newType.color || "#6366f1"}
                    onChange={e => setNewType({ ...newType, color: e.target.value })}
                    className="w-12 h-12 p-1 bg-zinc-50 border border-zinc-200 rounded-xl cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={newType.color || "#6366f1"}
                    onChange={e => setNewType({ ...newType, color: e.target.value })}
                    className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all font-mono text-sm uppercase"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-bold text-zinc-900 mb-2 flex items-center gap-2">
                <IconRenderer name={newType.icon || "Package"} size={14} className="text-zinc-400" />
                Type Icon
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  <IconRenderer name={newType.icon || "Package"} size={18} />
                </div>
                <input 
                  type="text" 
                  value={iconSearch || newType.icon || ""}
                  onFocus={() => setShowIconList(true)}
                  onChange={e => {
                    setIconSearch(e.target.value);
                    setShowIconList(true);
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  placeholder="Search icons (e.g. Heart, Star...)"
                />
                {showIconList && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowIconList(false)} />
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-20 max-h-64 overflow-y-auto p-2 grid grid-cols-4 gap-1">
                      {filteredIcons.length > 0 ? (
                        filteredIcons.map(icon => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => {
                              setNewType({ ...newType, icon });
                              setIconSearch("");
                              setShowIconList(false);
                            }}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all gap-2 ${
                              newType.icon === icon ? "bg-marine text-brand-yellow" : "hover:bg-zinc-50 text-zinc-600"
                            }`}
                          >
                            <IconRenderer name={icon} size={20} />
                            <span className="text-[8px] font-bold uppercase truncate w-full text-center">{icon}</span>
                          </button>
                        ))
                      ) : (
                        <div className="col-span-4 py-8 text-center text-zinc-400">
                          <Search size={24} className="mx-auto mb-2 opacity-20" />
                          <p className="text-xs font-medium">No icons found</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
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
              <label className="block text-sm font-bold text-zinc-900 mb-2 flex items-center gap-2">
                <Clock size={14} className="text-zinc-400" />
                Allowed Statuses (State Machine)
              </label>
              <div className="flex gap-2 mb-3">
                <input 
                  type="text" 
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addStatus())}
                  className="flex-1 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  placeholder="e.g. Draft, Published..."
                />
                <button 
                  type="button"
                  onClick={addStatus}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(newType.statuses || []).map((status: string) => (
                  <div key={status} className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs font-bold border border-blue-100">
                    {status}
                    <button 
                      type="button"
                      onClick={() => removeStatus(status)}
                      className="hover:text-blue-800"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {(newType.statuses || []).length === 0 && (
                  <p className="text-xs text-zinc-400 italic">No statuses defined. Elements will have no status field.</p>
                )}
              </div>
            </div>
          </div>

          <div className={`space-y-6 ${disabledProps ? "opacity-50 pointer-events-none" : ""}`}>
            <div>
              <label className="block text-sm font-bold text-zinc-900 mb-4">Modular Properties</label>
              <div className="grid grid-cols-1 gap-3">
                {MODULAR_TABLES.map((table: any) => (
                  <button
                    key={table.value}
                    type="button"
                    onClick={() => toggleProp(table.value, table.label)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      newType.properties?.find((p: any) => p.table_name === table.value)
                        ? "bg-marine border-marine text-brand-yellow shadow-md"
                        : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      newType.properties?.find((p: any) => p.table_name === table.value) ? "bg-white/20" : "bg-zinc-100"
                    }`}>
                      {table.value === "content" && <FileText size={16} />}
                      {table.value === "place" && <MapPin size={16} />}
                      {table.value === "urls_embeds" && <LinkIcon size={16} />}
                      {table.value === "time_tracking" && <Clock size={16} />}
                      {table.value === "product_info" && <Package size={16} />}
                      {table.value === "file" && <Database size={16} />}
                      {table.value === "color_info" && <Palette size={16} />}
                    </div>
                    <span className="text-sm font-bold">{table.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-100">
          <label className="block text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <Database size={18} className="text-zinc-400" />
            Allowed Parent Types
          </label>
          <p className="text-xs text-zinc-500 mb-4">
            Define which types of elements can be parents of this type. 
            This restricts the "Parent Element" selection in the editor.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {types.map((t: any) => {
              const isCycle = newType.id && wouldCreateCycle(newType.id, t.id);
              const isSelected = newType.allowed_parent_types?.includes(t.id);
              
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={isCycle && !isSelected}
                  onClick={() => {
                    const exists = newType.allowed_parent_types?.includes(t.id);
                    if (exists) {
                      setNewType({ ...newType, allowed_parent_types: newType.allowed_parent_types?.filter((id: any) => id !== t.id) });
                    } else {
                      setNewType({ ...newType, allowed_parent_types: [...(newType.allowed_parent_types || []), t.id] });
                    }
                  }}
                  title={isCycle && !isSelected ? "Selecting this would create a circular dependency" : ""}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    isSelected
                      ? "bg-marine border-marine text-brand-yellow shadow-md"
                      : isCycle 
                        ? "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                        : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"
                  }`}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: t.color || "#6366f1" }}
                  >
                    <IconRenderer name={t.icon || "Package"} size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{t.name}</span>
                    {isCycle && !isSelected && <span className="text-[8px] uppercase tracking-tighter text-red-400 font-bold">Cycle Risk</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-100 flex gap-4">
          <button 
            type="button"
            onClick={() => navigate("/types")}
            className="flex-1 px-6 py-4 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-zinc-50 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="flex-[2] px-6 py-4 bg-marine text-brand-yellow rounded-xl font-bold hover:bg-marine-light transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Save size={20} />
            {buttonText}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

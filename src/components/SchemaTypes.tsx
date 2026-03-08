import React from "react";
import { motion } from "motion/react";
import { Plus, Lock, Trash2, FileText, MapPin, Link as LinkIcon, Clock, Package, X, Save, Database, Edit2, AlertCircle } from "lucide-react";
import { useNavigate, useLocation, Routes, Route, useParams } from "react-router-dom";
import { ElementType } from "../types";
import { Badge } from "./common/Badge";

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

  return (
    <div className="max-w-5xl mx-auto">
      <Routes>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Schema Types</h2>
                <p className="text-zinc-500 mt-1">Define the structure of your elements and their modular properties.</p>
              </div>
              {hasPermission("manage_types") && (
                <button 
                  onClick={() => navigate("/types/new")}
                  className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold hover:bg-zinc-800 transition-all"
                >
                  <Plus size={20} />
                  Create Type
                </button>
              )}
            </div>

            {!hasPermission("manage_types") && (
              <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-4 text-orange-800">
                <Lock size={24} />
                <div>
                  <p className="font-bold">Restricted Access</p>
                  <p className="text-sm opacity-80">You don't have permission to modify schema types. Contact an administrator for access.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {types.map((type) => (
                <div key={type.id} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{type.name}</h3>
                    <div className="flex gap-2">
                      <Badge color="zinc">{type.properties.length} Props</Badge>
                      {hasPermission("manage_types") && (
                        <>
                          <button 
                            onClick={() => {
                              setNewType(type);
                              navigate(`/types/${type.slug}/edit`);
                            }}
                            className="p-1 hover:bg-zinc-100 text-zinc-300 hover:text-zinc-600 rounded transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => deleteType(type.slug)}
                            className="p-1 hover:bg-red-50 text-zinc-300 hover:text-red-500 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
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
                    {type.allowed_parent_types && type.allowed_parent_types.length > 0 && (
                      <div className="pt-4 mt-4 border-t border-zinc-50">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Database size={10} />
                          Allowed Parents
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {type.allowed_parent_types.map(parentId => {
                            const parentType = types.find(t => t.id === parentId);
                            return parentType ? (
                              <span key={parentId}>
                                <Badge color="zinc">{parentType.name}</Badge>
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
            MODULAR_TABLES={MODULAR_TABLES}
            navigate={navigate}
          />
        } />
      </Routes>
    </div>
  );
};

const EditTypeWrapper = ({ types, newType, setNewType, handleUpdateType, toggleProp, MODULAR_TABLES, navigate }: any) => {
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
      MODULAR_TABLES={MODULAR_TABLES}
      navigate={navigate}
      disabled={hasElements}
      warning={hasElements ? "This schema type cannot be edited because elements of this type already exist." : null}
    />
  );
};

const TypeForm = ({ title, buttonText, onSubmit, newType, setNewType, types, toggleProp, MODULAR_TABLES, navigate, disabled, warning }: any) => {
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

      <form onSubmit={onSubmit} className={`p-8 space-y-8 ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
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
                rows={4}
                value={newType.description}
                onChange={e => setNewType({ ...newType, description: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none"
                placeholder="Describe what this type represents..."
              />
            </div>
          </div>

          <div className="space-y-6">
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
                        ? "bg-black border-black text-white shadow-md"
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
            {types.map((t: any) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  const exists = newType.allowed_parent_types?.includes(t.id);
                  if (exists) {
                    setNewType({ ...newType, allowed_parent_types: newType.allowed_parent_types?.filter((id: any) => id !== t.id) });
                  } else {
                    setNewType({ ...newType, allowed_parent_types: [...(newType.allowed_parent_types || []), t.id] });
                  }
                }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  newType.allowed_parent_types?.includes(t.id)
                    ? "bg-zinc-900 border-zinc-900 text-white shadow-md"
                    : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  newType.allowed_parent_types?.includes(t.id) ? "bg-white/20" : "bg-zinc-100"
                }`}>
                  <Database size={16} />
                </div>
                <span className="text-sm font-bold">{t.name}</span>
              </button>
            ))}
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
            className="flex-[2] px-6 py-4 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Save size={20} />
            {buttonText}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

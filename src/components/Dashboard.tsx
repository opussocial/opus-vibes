import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Package, MapPin, Database, Edit3, Eye, Trash2, ChevronRight, ChevronDown, Plus } from "lucide-react";
import { Element, ElementType, TypePermission } from "../types";
import { Badge } from "./common/Badge";

interface DashboardProps {
  elements: Element[];
  types: ElementType[];
  getTypePermission: (typeId: number) => TypePermission;
  handleDelete: (slug: string) => void;
}

interface ElementRowProps {
  el: Element;
  allElements: Element[];
  types: ElementType[];
  getTypePermission: (typeId: number) => TypePermission;
  handleDelete: (slug: string) => void;
  depth?: number;
}

const ElementRow: React.FC<ElementRowProps> = ({ 
  el, 
  allElements, 
  types, 
  getTypePermission, 
  handleDelete, 
  depth = 0 
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const children = allElements.filter(child => child.parent_id === el.id);
  const perm = getTypePermission(el.type_id);
  
  if (!perm.can_view) return null;

  // Find types that allow this element's type as a parent
  const allowedChildTypes = types.filter(t => t.allowed_parent_types?.includes(el.type_id));

  return (
    <div className="flex flex-col">
      <motion.div
        layoutId={`el-${el.id}`}
        className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        style={{ marginLeft: `${depth * 24}px` }}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            {children.length > 0 ? (
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 hover:bg-zinc-100 rounded text-zinc-400"
              >
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <div className="w-6" />
            )}
            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400">
              {el.type_name === "Article" && <FileText size={20} />}
              {el.type_name === "Product" && <Package size={20} />}
              {el.type_name === "Event" && <MapPin size={20} />}
              {!["Article", "Product", "Event"].includes(el.type_name) && <Database size={20} />}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">{el.name}</h3>
              <Badge color={el.type_name === "Article" ? "blue" : el.type_name === "Product" ? "green" : "purple"}>
                {el.type_name}
              </Badge>
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Slug: {el.slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Child Dropdown */}
          {allowedChildTypes.length > 0 && perm.can_create && (
            <div className="relative group/add">
              <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-black transition-colors flex items-center gap-1">
                <Plus size={16} />
                <span className="text-[10px] font-bold uppercase hidden group-hover/add:inline">Add Child</span>
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl py-2 w-48 z-10 hidden group-hover/add:block">
                {allowedChildTypes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => navigate(`/elements/new?type=${t.slug}&parent=${el.id}`)}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-black"
                  >
                    New {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => navigate(`/elements/${el.slug}`)}
              className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors"
              title="View Details"
            >
              <Eye size={16} />
            </button>
            {perm.can_edit && (
              <button 
                onClick={() => navigate(`/elements/${el.slug}/edit`)}
                className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors"
                title="Edit"
              >
                <Edit3 size={16} />
              </button>
            )}
            {perm.can_delete && (
              <button 
                onClick={() => handleDelete(el.slug)}
                className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && children.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-2 mt-2"
          >
            {children.map(child => (
              <ElementRow 
                key={child.id} 
                el={child} 
                allElements={allElements} 
                types={types}
                getTypePermission={getTypePermission}
                handleDelete={handleDelete}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Dashboard = ({ 
  elements, 
  types,
  getTypePermission, 
  handleDelete
}: DashboardProps) => {
  const rootElements = elements.filter(el => !el.parent_id);

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Catalog Elements</h2>
          <p className="text-zinc-500 mt-1">Manage all your modular content elements here.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search elements..." 
              className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all w-64"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {rootElements.length > 0 ? (
          rootElements.map((el) => (
            <ElementRow 
              key={el.id} 
              el={el} 
              allElements={elements} 
              types={types}
              getTypePermission={getTypePermission}
              handleDelete={handleDelete}
            />
          ))
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-zinc-200 text-center">
            <Database size={48} className="mx-auto text-zinc-200 mb-4" />
            <h3 className="text-xl font-bold text-zinc-900">No elements found</h3>
            <p className="text-zinc-500 mt-1">Start by adding a root element from the sidebar.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

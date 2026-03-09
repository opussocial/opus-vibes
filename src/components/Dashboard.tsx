import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { Search, FileText, Package, MapPin, Database, Edit3, Eye, Trash2, ChevronRight, ChevronDown, Plus } from "lucide-react";
import { Element, ElementType, TypePermission } from "../types";
import { Badge } from "./common/Badge";

const IconRenderer = ({ name, size = 16, className = "" }: { name: string; size?: number; className?: string }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <IconComponent size={size} className={className} />;
};

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
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
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
                className="p-1 hover:bg-marine/5 rounded text-marine/40 hover:text-marine transition-colors"
              >
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <div className="w-6" />
            )}
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: types.find(t => t.id === el.type_id)?.color || "#6366f1" }}
            >
              <IconRenderer name={types.find(t => t.id === el.type_id)?.icon || "Package"} size={20} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-marine">{el.name}</h3>
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
            <div className="relative">
              <button 
                onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
                className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${isAddDropdownOpen ? 'bg-marine text-brand-yellow' : 'hover:bg-marine/5 text-marine/60 hover:text-marine'}`}
              >
                <Plus size={16} />
                <span className="text-[10px] font-bold uppercase">Add Child</span>
              </button>
              
              <AnimatePresence>
                {isAddDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsAddDropdownOpen(false)} 
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 bg-white border border-zinc-100 rounded-xl shadow-2xl py-2 w-48 z-20 overflow-hidden"
                    >
                      <div className="px-4 py-1.5 border-b border-zinc-50 mb-1">
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Select Type</p>
                      </div>
                      {allowedChildTypes.map(t => (
                        <button
                          key={t.id}
                          onClick={() => {
                            navigate(`/elements/new?type=${t.slug}&parent=${el.id}`);
                            setIsAddDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-medium text-zinc-600 hover:bg-marine/5 hover:text-marine transition-colors flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                          {t.name}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => navigate(`/elements/${el.slug}`)}
              className="p-2 hover:bg-marine/5 rounded-lg text-marine/60 hover:text-marine transition-colors"
              title="View Details"
            >
              <Eye size={16} />
            </button>
            {perm.can_edit && (
              <button 
                onClick={() => navigate(`/elements/${el.slug}/edit`)}
                className="p-2 hover:bg-marine/5 rounded-lg text-marine/60 hover:text-marine transition-colors"
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
          <h2 className="text-3xl font-bold tracking-tight text-marine">Catalog Elements</h2>
          <p className="text-zinc-500 mt-1">Manage all your modular content elements here.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search elements..." 
              className="pl-10 pr-4 py-2 bg-white border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-marine/10 transition-all w-64"
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

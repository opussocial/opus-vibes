import React from "react";
import { motion } from "motion/react";
import { Search, FileText, Package, MapPin, Database, Edit3, Eye, Trash2 } from "lucide-react";
import { Element, TypePermission } from "../types";
import { Badge } from "./common/Badge";

interface DashboardProps {
  elements: Element[];
  getTypePermission: (typeId: number) => TypePermission;
  handleEdit: (id: number) => void;
  handleDelete: (id: number) => void;
  handleView: (id: number) => void;
}

export const Dashboard = ({ elements, getTypePermission, handleEdit, handleDelete, handleView }: DashboardProps) => {
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

      <div className="grid grid-cols-1 gap-4">
        {elements.map((el) => {
          const perm = getTypePermission(el.type_id);
          if (!perm.can_view) return null;
          
          return (
            <motion.div
              layoutId={`el-${el.id}`}
              key={el.id}
              className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400">
                  {el.type_name === "Article" && <FileText size={24} />}
                  {el.type_name === "Product" && <Package size={24} />}
                  {el.type_name === "Event" && <MapPin size={24} />}
                  {!["Article", "Product", "Event"].includes(el.type_name) && <Database size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{el.name}</h3>
                    <Badge color={el.type_name === "Article" ? "blue" : el.type_name === "Product" ? "green" : "purple"}>
                      {el.type_name}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Updated {new Date(el.updated_at).toLocaleDateString()} • ID: {el.id}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleView(el.id)}
                  className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors"
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
                {perm.can_edit && (
                  <button 
                    onClick={() => handleEdit(el.id)}
                    className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={18} />
                  </button>
                )}
                {perm.can_delete && (
                  <button 
                    onClick={() => handleDelete(el.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

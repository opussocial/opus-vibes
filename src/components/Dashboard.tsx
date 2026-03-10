import React from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Search, Database } from "lucide-react";
import { Element, ElementType, TypePermission } from "../types";
import { DataTable } from "./common/DataTable";

interface DashboardProps {
  elements: Element[];
  types: ElementType[];
  getTypePermission: (typeId: number) => TypePermission;
  handleDelete: (slug: string) => void;
}

export const Dashboard = ({ 
  elements, 
  types,
  getTypePermission, 
  handleDelete
}: DashboardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-6xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-marine">Catalog Elements</h2>
          <p className="text-zinc-500 mt-2 text-lg">Manage all your modular content elements here.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input 
              type="text" 
              placeholder="Search elements..." 
              className="pl-12 pr-6 py-4 bg-white border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-marine/10 transition-all w-full text-lg shadow-sm"
            />
          </div>
        </div>
      </div>

      {elements.length > 0 ? (
        <DataTable 
          type="elements"
          data={elements}
          onView={(el) => navigate(`/elements/${el.slug}`)}
          onEdit={(el) => navigate(`/elements/${el.slug}/edit`)}
          onDelete={(el) => handleDelete(el.slug)}
        />
      ) : (
        <div className="bg-white p-24 rounded-[3rem] border border-zinc-200 text-center shadow-xl">
          <Database size={64} className="mx-auto text-zinc-200 mb-6" />
          <h3 className="text-2xl font-bold text-zinc-900">No elements found</h3>
          <p className="text-zinc-500 mt-2 text-lg">Start by adding a root element from the sidebar.</p>
        </div>
      )}
    </motion.div>
  );
};

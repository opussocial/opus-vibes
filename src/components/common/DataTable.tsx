import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Trash2, Edit2, Eye, Check, MoreVertical } from 'lucide-react';
import { Badge } from './Badge';
import { IconRenderer } from './IconRenderer';

interface DataTableProps<T> {
  type: 'users' | 'elements' | 'roles' | 'types';
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  pageSize?: number;
  // For hierarchical elements, we might need to handle depth or just flatten it
  // For now, let's assume flat data for the table view
}

export const DataTable = <T extends { id: number | string }>({ 
  type, 
  data = [], 
  onEdit, 
  onDelete, 
  onView,
  actions,
  pageSize = 10 
}: DataTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());

  const safeData = Array.isArray(data) ? data : [];
  const totalPages = Math.ceil(safeData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = safeData.slice(startIndex, startIndex + pageSize);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map(item => item.id)));
    }
  };

  const toggleSelect = (id: number | string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const renderHeader = () => {
    switch (type) {
      case 'users':
        return (
          <>
            <th className="px-10 py-8 text-left text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">User Identity</th>
            <th className="px-10 py-8 text-left text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Role & Access</th>
            <th className="px-10 py-8 text-right text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Actions</th>
          </>
        );
      case 'elements':
        return (
          <>
            <th className="px-10 py-8 text-left text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Element Info</th>
            <th className="px-10 py-8 text-left text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Classification</th>
            <th className="px-10 py-8 text-right text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Actions</th>
          </>
        );
      case 'roles':
        return (
          <>
            <th className="px-10 py-8 text-left text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Role Definition</th>
            <th className="px-10 py-8 text-left text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Permissions</th>
            <th className="px-10 py-8 text-right text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Actions</th>
          </>
        );
      case 'types':
        return (
          <>
            <th className="px-10 py-8 text-left text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Schema Definition</th>
            <th className="px-10 py-8 text-left text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Structure</th>
            <th className="px-10 py-8 text-right text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Actions</th>
          </>
        );
    }
  };

  const renderRow = (item: any) => {
    switch (type) {
      case 'users':
        return (
          <>
            <td className="px-10 py-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-zinc-100 rounded-[1.25rem] flex items-center justify-center text-zinc-500 font-bold text-xl shadow-inner">
                  {item.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-2xl font-bold text-marine leading-tight">{item.username}</p>
                  <p className="text-sm font-medium text-zinc-400 mt-1">{item.email}</p>
                </div>
              </div>
            </td>
            <td className="px-10 py-10">
              <div className="flex flex-col gap-2 items-start">
                <Badge color={item.role_name === "Super Admin" ? "purple" : item.role_name === "Editor" ? "blue" : "zinc"}>
                  {item.role_name}
                </Badge>
                <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">ID: {item.id}</p>
              </div>
            </td>
          </>
        );
      case 'elements':
        return (
          <>
            <td className="px-10 py-10">
              <div>
                <p className="text-2xl font-bold text-marine leading-tight">{item.name}</p>
                <p className="text-sm font-medium text-zinc-400 mt-1">Slug: {item.slug}</p>
              </div>
            </td>
            <td className="px-10 py-10">
              <div className="flex flex-col gap-2 items-start">
                <div className="flex items-center gap-2">
                  <Badge color="zinc">{item.type_name}</Badge>
                  {item.status && <Badge color="blue">{item.status}</Badge>}
                </div>
                <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Created: {new Date(item.created_at).toLocaleDateString()}</p>
              </div>
            </td>
          </>
        );
      case 'roles':
        return (
          <>
            <td className="px-10 py-10">
              <div>
                <p className="text-2xl font-bold text-marine leading-tight">{item.name}</p>
                <p className="text-sm font-medium text-zinc-400 mt-1">{item.description}</p>
              </div>
            </td>
            <td className="px-10 py-10">
              <div className="flex flex-wrap gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Global</span>
                  <Badge color="zinc">{item.permissions.length} Permissions</Badge>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Types</span>
                  <Badge color="blue">{item.type_permissions.length} Configured</Badge>
                </div>
              </div>
            </td>
          </>
        );
      case 'types':
        return (
          <>
            <td className="px-10 py-10">
              <div className="flex items-center gap-6">
                <div 
                  className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg border-4 border-white/20"
                  style={{ backgroundColor: item.color || "#6366f1" }}
                >
                  <IconRenderer name={item.icon || "Package"} size={28} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-marine leading-tight">{item.name}</p>
                  <p className="text-sm font-medium text-zinc-400 mt-1">{item.description}</p>
                </div>
              </div>
            </td>
            <td className="px-10 py-10">
               <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Modules</span>
                  <Badge color="zinc">{item.properties.length} Active</Badge>
                </div>
                {item.statuses && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">States</span>
                    <Badge color="blue">{item.statuses.length} Defined</Badge>
                  </div>
                )}
              </div>
            </td>
          </>
        );
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-white rounded-[3rem] border border-zinc-200 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-50/50 border-b border-zinc-100">
              <tr>
                <th className="px-10 py-8 w-24">
                  <button 
                    onClick={toggleSelectAll}
                    className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${
                      selectedIds.size === paginatedData.length && paginatedData.length > 0
                        ? "bg-marine border-marine text-brand-yellow" 
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    {selectedIds.size === paginatedData.length && paginatedData.length > 0 && <Check size={18} strokeWidth={4} />}
                  </button>
                </th>
                {renderHeader()}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/30 transition-colors group">
                  <td className="px-10 py-10">
                    <button 
                      onClick={() => toggleSelect(item.id)}
                      className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${
                        selectedIds.has(item.id)
                          ? "bg-marine border-marine text-brand-yellow" 
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      {selectedIds.has(item.id) && <Check size={18} strokeWidth={4} />}
                    </button>
                  </td>
                  {renderRow(item)}
                  <td className="px-10 py-10 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {actions ? actions(item) : (
                        <>
                          {onView && (
                            <button onClick={() => onView(item)} className="p-4 hover:bg-zinc-100 rounded-2xl text-zinc-400 hover:text-marine transition-all shadow-sm hover:shadow-md">
                              <Eye size={22} />
                            </button>
                          )}
                          {onEdit && (
                            <button onClick={() => onEdit(item)} className="p-4 hover:bg-zinc-100 rounded-2xl text-zinc-400 hover:text-marine transition-all shadow-sm hover:shadow-md">
                              <Edit2 size={22} />
                            </button>
                          )}
                          {onDelete && (
                            <button onClick={() => onDelete(item)} className="p-4 hover:bg-red-50 rounded-2xl text-zinc-400 hover:text-red-500 transition-all shadow-sm hover:shadow-md">
                              <Trash2 size={22} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-10 py-6 bg-white rounded-[2rem] border border-zinc-200 shadow-xl gap-6">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">
            Showing <span className="text-marine">{startIndex + 1}</span> to <span className="text-marine">{Math.min(startIndex + pageSize, safeData.length)}</span> of <span className="text-marine">{safeData.length}</span> entities
          </p>
          <div className="flex items-center gap-3">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-3 hover:bg-zinc-100 rounded-2xl disabled:opacity-30 transition-all border border-zinc-100"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-12 h-12 rounded-2xl font-bold text-sm transition-all ${
                    currentPage === i + 1 ? "bg-marine text-brand-yellow shadow-xl scale-110" : "hover:bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-3 hover:bg-zinc-100 rounded-2xl disabled:opacity-30 transition-all border border-zinc-100"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

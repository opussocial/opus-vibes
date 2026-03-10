import React from "react";
import { motion } from "motion/react";
import { Lock, X, Plus, Save } from "lucide-react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { Role, Permission, ElementType } from "../types";
import { Badge } from "./common/Badge";
import * as LucideIcons from "lucide-react";

const IconRenderer = ({ name, size = 16, className = "" }: { name: string; size?: number; className?: string }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <IconComponent size={size} className={className} />;
};

interface RolesProps {
  roles: Role[];
  allPermissions: Permission[];
  hasPermission: (perm: string) => boolean;
  updateRoleGlobalPermission: (roleIdOrSlug: string | number, permissionId: number, active: boolean) => void;
  updateRoleTypePermission: (roleIdOrSlug: string | number, typeIdOrSlug: string | number, field: string, value: boolean) => void;
  newRole: { name: string; description: string };
  setNewRole: (val: { name: string; description: string }) => void;
  handleCreateRole: (e: React.FormEvent) => void;
  types: ElementType[];
}

export const Roles = ({ 
  roles, 
  allPermissions, 
  hasPermission, 
  updateRoleGlobalPermission, 
  updateRoleTypePermission,
  newRole,
  setNewRole,
  handleCreateRole,
  types
}: RolesProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <Routes>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Roles & Permissions</h2>
                <p className="text-zinc-500 mt-1 text-sm md:text-base">Configure system-wide roles and granular type permissions.</p>
              </div>
            </div>

            {!hasPermission("manage_roles") && (
              <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-4 text-orange-800">
                <Lock size={24} />
                <div>
                  <p className="font-bold">Superadmin Only</p>
                  <p className="text-sm opacity-80">Role management is restricted to Super Admin users. Switch users in the sidebar to test.</p>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {roles.map((role) => (
                <div key={role.id} className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-zinc-100 bg-zinc-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold text-marine">{role.name}</h3>
                      <Badge color="zinc">Slug: {role.slug}</Badge>
                    </div>
                    <p className="text-zinc-500">{role.description}</p>
                  </div>

                  <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Global Permissions</h4>
                      <div className="space-y-2">
                        {allPermissions.map(p => {
                          const isActive = role.permissions.some(rp => rp.id === p.id);
                          const isSuperAdmin = role.name === "Super Admin";
                          return (
                            <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isActive ? "bg-marine/5 border-marine/10" : "bg-zinc-50 border-zinc-100 hover:border-zinc-200"}`}>
                              <input 
                                type="checkbox" 
                                checked={isActive}
                                disabled={isSuperAdmin || !hasPermission("manage_roles")}
                                onChange={(e) => updateRoleGlobalPermission(role.slug, p.id, e.target.checked)}
                                className="w-4 h-4 rounded border-zinc-300 text-marine focus:ring-marine"
                              />
                              <div>
                                <p className={`text-sm font-bold ${isActive ? "text-marine" : "text-zinc-700"}`}>{p.name}</p>
                                <p className="text-[10px] text-zinc-400">{p.description}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Type Granularity</h4>
                      <div className="space-y-3">
                        {role.type_permissions.map(tp => {
                          const isSuperAdmin = role.name === "Super Admin";
                          const type = types.find(t => t.id === tp.type_id);
                          return (
                            <div key={tp.type_id} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-6 h-6 rounded flex items-center justify-center text-white shadow-sm"
                                    style={{ backgroundColor: type?.color || "#6366f1" }}
                                  >
                                    <IconRenderer name={type?.icon || "Package"} size={12} />
                                  </div>
                                  <span className="text-sm font-bold">{tp.type_name}</span>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="checkbox"
                                    checked={tp.can_view === 1}
                                    disabled={isSuperAdmin || !hasPermission("manage_roles")}
                                    onChange={(e) => updateRoleTypePermission(role.slug, tp.type_slug || tp.type_id, "can_view", e.target.checked)}
                                    className="w-3 h-3 rounded border-zinc-300 text-green-600 focus:ring-green-500"
                                  />
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase">View</span>
                                </label>
                              </div>
                              <div className="flex gap-4">
                                {["can_create", "can_edit", "can_delete"].map(field => (
                                  <label key={field} className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                      type="checkbox"
                                      checked={(tp as any)[field] === 1}
                                      disabled={isSuperAdmin || !hasPermission("manage_roles") || !tp.can_view}
                                      onChange={(e) => updateRoleTypePermission(role.slug, tp.type_slug || tp.type_id, field, e.target.checked)}
                                      className={`w-3 h-3 rounded border-zinc-300 focus:ring-opacity-50 ${field === "can_delete" ? "text-red-600 focus:ring-red-500" : "text-green-600 focus:ring-green-500"}`}
                                    />
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase">{field.split("_")[1]}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        } />

        <Route path="/new" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col"
          >
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h2 className="text-2xl font-bold tracking-tight">Create New Role</h2>
              <button 
                onClick={() => navigate("/roles")} 
                className="p-2 hover:bg-zinc-200 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-2">Role Name</label>
                <input 
                  type="text" 
                  required
                  value={newRole.name}
                  onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  placeholder="e.g. Content Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-2">Description</label>
                <textarea 
                  rows={4}
                  value={newRole.description}
                  onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none"
                  placeholder="Describe the responsibilities of this role..."
                />
              </div>

              <div className="pt-8 border-t border-zinc-100 flex gap-4">
                <button 
                  type="button"
                  onClick={() => navigate("/roles")}
                  className="flex-1 px-6 py-4 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-zinc-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] px-6 py-4 bg-marine text-brand-yellow rounded-xl font-bold hover:bg-marine-light transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save size={20} />
                  Create Role
                </button>
              </div>
            </form>
          </motion.div>
        } />
      </Routes>
    </div>
  );
};

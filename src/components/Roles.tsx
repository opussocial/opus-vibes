import React from "react";
import { motion } from "motion/react";
import { Lock, X, Plus, Save, Shield, Database } from "lucide-react";
import { useNavigate, useLocation, Routes, Route, useParams } from "react-router-dom";
import { Role, Permission, ElementType } from "../types";
import { DataTable } from "./common/DataTable";
import { IconRenderer } from "./common/IconRenderer";
import { Badge } from "./common/Badge";

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

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <Routes>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-4xl font-bold tracking-tight text-marine">Roles & Permissions</h2>
                <p className="text-zinc-500 mt-2 text-lg">Configure system-wide roles and granular type permissions.</p>
              </div>
              {hasPermission("manage_roles") && (
                <button 
                  onClick={() => navigate("/admin/roles/new")}
                  className="px-8 py-4 bg-marine text-brand-yellow rounded-2xl font-bold hover:bg-marine-light transition-all flex items-center gap-3 shadow-lg"
                >
                  <Plus size={24} />
                  New Role
                </button>
              )}
            </div>

            {!hasPermission("manage_roles") && (
              <div className="p-8 bg-orange-50 border border-orange-100 rounded-3xl flex items-center gap-6 text-orange-800 shadow-sm">
                <Lock size={32} />
                <div>
                  <p className="font-bold text-lg">Superadmin Only</p>
                  <p className="opacity-80">Role management is restricted to Super Admin users. Switch users in the sidebar to test.</p>
                </div>
              </div>
            )}

            <DataTable 
              type="roles"
              data={roles}
              onEdit={(role) => navigate(`/admin/roles/${role.slug}`)}
            />
          </motion.div>
        } />

        <Route path="/new" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] shadow-2xl border border-zinc-200 overflow-hidden flex flex-col"
          >
            <div className="p-10 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h2 className="text-3xl font-bold tracking-tight text-marine">Create New Role</h2>
              <button 
                onClick={() => navigate("/admin/roles")} 
                className="p-3 hover:bg-zinc-200 rounded-2xl transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="p-10 space-y-8">
              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-3 uppercase tracking-widest">Role Name</label>
                <input 
                  type="text" 
                  required
                  value={newRole.name}
                  onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-lg"
                  placeholder="e.g. Content Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-3 uppercase tracking-widest">Description</label>
                <textarea 
                  rows={4}
                  value={newRole.description}
                  onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                  className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none text-lg"
                  placeholder="Describe the responsibilities of this role..."
                />
              </div>

              <div className="pt-10 border-t border-zinc-100 flex gap-6">
                <button 
                  type="button"
                  onClick={() => navigate("/admin/roles")}
                  className="flex-1 px-8 py-5 bg-white border border-zinc-200 rounded-2xl font-bold text-zinc-600 hover:bg-zinc-50 transition-all text-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] px-8 py-5 bg-marine text-brand-yellow rounded-2xl font-bold hover:bg-marine-light transition-all flex items-center justify-center gap-3 shadow-xl text-lg"
                >
                  <Save size={24} />
                  Create Role
                </button>
              </div>
            </form>
          </motion.div>
        } />

        <Route path="/:slug" element={
          <RolePermissionsEditor 
            roles={roles}
            allPermissions={allPermissions}
            hasPermission={hasPermission}
            updateRoleGlobalPermission={updateRoleGlobalPermission}
            updateRoleTypePermission={updateRoleTypePermission}
            types={types}
            navigate={navigate}
          />
        } />
      </Routes>
    </div>
  );
};

const RolePermissionsEditor = ({ roles, allPermissions, hasPermission, updateRoleGlobalPermission, updateRoleTypePermission, types, navigate }: any) => {
  const { slug } = useParams();
  const role = roles.find((r: any) => r.slug === slug);

  if (!role) return null;

  const isSuperAdmin = role.name === "Super Admin";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[3rem] shadow-2xl border border-zinc-200 overflow-hidden"
    >
      <div className="p-10 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h3 className="text-4xl font-bold text-marine">{role.name}</h3>
            <Badge color="zinc">Slug: {role.slug}</Badge>
          </div>
          <p className="text-zinc-500 text-lg">{role.description}</p>
        </div>
        <button 
          onClick={() => navigate("/admin/roles")} 
          className="p-4 hover:bg-zinc-200 rounded-2xl transition-colors shadow-sm"
        >
          <X size={32} />
        </button>
      </div>

      <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <Shield size={18} />
            Global Permissions
          </h4>
          <div className="space-y-4">
            {allPermissions.map((p: any) => {
              const isActive = role.permissions.some((rp: any) => rp.id === p.id);
              return (
                <label key={p.id} className={`flex items-center gap-6 p-6 rounded-2xl border-2 transition-all cursor-pointer ${isActive ? "bg-marine/5 border-marine/20" : "bg-zinc-50 border-zinc-100 hover:border-zinc-200"}`}>
                  <input 
                    type="checkbox" 
                    checked={isActive}
                    disabled={isSuperAdmin || !hasPermission("manage_roles")}
                    onChange={(e) => updateRoleGlobalPermission(role.slug, p.id, e.target.checked)}
                    className="w-6 h-6 rounded-lg border-zinc-300 text-marine focus:ring-marine transition-all"
                  />
                  <div>
                    <p className={`text-xl font-bold ${isActive ? "text-marine" : "text-zinc-700"}`}>{p.name}</p>
                    <p className="text-sm text-zinc-400 mt-1">{p.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <Database size={18} />
            Type Granularity
          </h4>
          <div className="space-y-6">
            {role.type_permissions.map((tp: any) => {
              const type = types.find((t: any) => t.id === tp.type_id);
              return (
                <div key={tp.type_id} className="p-8 bg-zinc-50 rounded-[2rem] border-2 border-zinc-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                        style={{ backgroundColor: type?.color || "#6366f1" }}
                      >
                        <IconRenderer name={type?.icon || "Package"} size={24} />
                      </div>
                      <span className="text-2xl font-bold text-marine">{tp.type_name}</span>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer bg-white px-4 py-2 rounded-xl border border-zinc-200 shadow-inner">
                      <input 
                        type="checkbox"
                        checked={tp.can_view === 1}
                        disabled={isSuperAdmin || !hasPermission("manage_roles")}
                        onChange={(e) => updateRoleTypePermission(role.slug, tp.type_slug || tp.type_id, "can_view", e.target.checked)}
                        className="w-5 h-5 rounded-lg border-zinc-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">View</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-6 pt-6 border-t border-zinc-200/50">
                    {["can_create", "can_edit", "can_delete"].map(field => (
                      <label key={field} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox"
                          checked={(tp as any)[field] === 1}
                          disabled={isSuperAdmin || !hasPermission("manage_roles") || !tp.can_view}
                          onChange={(e) => updateRoleTypePermission(role.slug, tp.type_slug || tp.type_id, field, e.target.checked)}
                          className={`w-5 h-5 rounded-lg border-zinc-300 focus:ring-opacity-50 transition-all ${field === "can_delete" ? "text-red-600 focus:ring-red-500" : "text-green-600 focus:ring-green-500"}`}
                        />
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-600 transition-colors">{field.split("_")[1]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="p-10 bg-zinc-50 border-t border-zinc-100 flex justify-end">
        <button 
          onClick={() => navigate("/admin/roles")}
          className="px-10 py-5 bg-marine text-brand-yellow rounded-2xl font-bold hover:bg-marine-light transition-all shadow-xl text-lg"
        >
          Done
        </button>
      </div>
    </motion.div>
  );
};

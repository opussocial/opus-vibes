import React from "react";
import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { Role, Permission } from "../types";
import { Badge } from "./common/Badge";

interface RolesProps {
  roles: Role[];
  allPermissions: Permission[];
  hasPermission: (perm: string) => boolean;
  updateRoleGlobalPermission: (roleId: number, permissionId: number, active: boolean) => void;
  updateRoleTypePermission: (roleId: number, typeId: number, field: string, value: boolean) => void;
}

export const Roles = ({ roles, allPermissions, hasPermission, updateRoleGlobalPermission, updateRoleTypePermission }: RolesProps) => {
  return (
    <motion.div
      key="roles"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Roles & Permissions</h2>
          <p className="text-zinc-500 mt-1">Configure system-wide roles and granular type permissions.</p>
        </div>
      </div>

      {!hasPermission("manage_roles") && (
        <div className="mb-8 p-6 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-4 text-orange-800">
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
                <h3 className="text-2xl font-bold">{role.name}</h3>
                <Badge color="purple">Role ID: {role.id}</Badge>
              </div>
              <p className="text-zinc-500">{role.description}</p>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Global Permissions</h4>
                <div className="space-y-2">
                  {allPermissions.map(p => {
                    const isActive = role.permissions.some(rp => rp.id === p.id);
                    const isSuperAdmin = role.name === "Super Admin";
                    return (
                      <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isActive ? "bg-purple-50 border-purple-100" : "bg-zinc-50 border-zinc-100 hover:border-zinc-200"}`}>
                        <input 
                          type="checkbox" 
                          checked={isActive}
                          disabled={isSuperAdmin || !hasPermission("manage_roles")}
                          onChange={(e) => updateRoleGlobalPermission(role.id, p.id, e.target.checked)}
                          className="w-4 h-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <p className={`text-sm font-bold ${isActive ? "text-purple-900" : "text-zinc-700"}`}>{p.name}</p>
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
                    return (
                      <div key={tp.type_id} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold">{tp.type_name}</span>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={tp.can_view === 1}
                              disabled={isSuperAdmin || !hasPermission("manage_roles")}
                              onChange={(e) => updateRoleTypePermission(role.id, tp.type_id, "can_view", e.target.checked)}
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
                                onChange={(e) => updateRoleTypePermission(role.id, tp.type_id, field, e.target.checked)}
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
  );
};

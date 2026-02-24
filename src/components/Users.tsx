import React from "react";
import { motion } from "motion/react";
import { User, Role } from "../types";
import { Badge } from "./common/Badge";

interface UsersProps {
  users: User[];
  roles: Role[];
  updateUserRole: (userId: number, roleId: number) => void;
}

export const Users = ({ users, roles, updateUserRole }: UsersProps) => {
  return (
    <motion.div
      key="users"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-zinc-500 mt-1">Manage system users and assign roles.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Email</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 font-bold text-xs">
                      {user.username[0].toUpperCase()}
                    </div>
                    <span className="font-bold">{user.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500">{user.email}</td>
                <td className="px-6 py-4">
                  <Badge color={user.role_name === "Super Admin" ? "purple" : user.role_name === "Editor" ? "blue" : "zinc"}>
                    {user.role_name}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={user.role_id}
                    onChange={(e) => updateUserRole(user.id, parseInt(e.target.value))}
                    className="text-sm bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black/5"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

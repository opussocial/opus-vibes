import React from "react";
import { motion } from "motion/react";
import { User, Role } from "../types";
import { DataTable } from "./common/DataTable";

interface UsersProps {
  users: User[];
  roles: Role[];
  currentUser: User | null;
  updateUserRole: (userId: number, roleId: number) => void;
}

export const Users = ({ users, roles, currentUser, updateUserRole }: UsersProps) => {
  return (
    <motion.div
      key="users"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-6xl mx-auto"
    >
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-marine">User Management</h2>
          <p className="text-zinc-500 mt-2 text-lg">Manage system users and assign roles.</p>
        </div>
      </div>

      <DataTable 
        type="users"
        data={users}
        actions={(user) => (
          <select 
            value={user.role_id}
            onChange={(e) => updateUserRole(user.id, parseInt(e.target.value))}
            className="text-sm font-bold bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all cursor-pointer hover:border-zinc-400"
          >
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        )}
      />
    </motion.div>
  );
};

import React from "react";
import { motion } from "motion/react";
import { Shield, Mail, User as UserIcon, Calendar } from "lucide-react";
import { User } from "../types";
import { Badge } from "./common/Badge";

interface ProfileProps {
  user: User;
}

export const Profile = ({ user }: ProfileProps) => {
  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Your Profile</h2>
        <p className="text-zinc-500 mt-1">Manage your account information and preferences.</p>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-zinc-100 to-zinc-200" />
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center text-zinc-400">
              <UserIcon size={48} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-zinc-900">{user.username}</h3>
                <p className="text-zinc-500">{user.email}</p>
              </div>
              <Badge color={user.role_name === "Super Admin" ? "purple" : user.role_name === "Editor" ? "blue" : "zinc"}>
                {user.role_name}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-zinc-100">
              <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-zinc-400 shadow-sm">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Role</p>
                  <p className="text-sm font-medium text-zinc-900">{user.role_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-zinc-400 shadow-sm">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email</p>
                  <p className="text-sm font-medium text-zinc-900">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Permissions</h4>
              <div className="flex flex-wrap gap-2">
                {user.permissions.length > 0 ? (
                  user.permissions.map(p => (
                    <span key={p} className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-medium">
                      {p.replace("_", " ")}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-400 italic">No special permissions assigned.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

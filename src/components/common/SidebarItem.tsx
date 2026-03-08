import React from "react";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  to: string;
}

export const SidebarItem = ({ icon: Icon, label, active, to }: SidebarItemProps) => (
  <Link
    to={to}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? "bg-black text-white shadow-md" 
        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

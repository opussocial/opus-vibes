import React from "react";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}

export const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? "bg-black text-white shadow-md" 
        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

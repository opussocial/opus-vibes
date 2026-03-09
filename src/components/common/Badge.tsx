import React from "react";

export const Badge = ({ children, color = "zinc" }: { children: React.ReactNode, color?: string, [key: string]: any }) => {
  const colors: any = {
    zinc: "bg-zinc-100 text-zinc-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    white: "bg-white/20 text-white",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[color]}`}>
      {children}
    </span>
  );
};

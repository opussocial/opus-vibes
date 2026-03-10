import React from "react";
import * as LucideIcons from "lucide-react";

interface IconRendererProps {
  name: string;
  size?: number;
  className?: string;
}

export const IconRenderer = ({ name, size = 16, className = "" }: IconRendererProps) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <IconComponent size={size} className={className} />;
};

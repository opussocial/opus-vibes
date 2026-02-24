import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Element } from "../../types";

interface TreeNodeProps {
  element: Element;
  allElements: Element[];
  level: number;
  key?: any;
}

export function TreeNode({ element, allElements, level }: TreeNodeProps) {
  const children = allElements.filter(e => e.parent_id === element.id);
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="select-none">
      <div 
        className="flex items-center gap-2 py-1.5 px-3 hover:bg-zinc-50 rounded-lg cursor-pointer transition-colors group"
        style={{ marginLeft: `${level * 24}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {children.length > 0 ? (
          <ChevronRight size={14} className={`text-zinc-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
        ) : (
          <div className="w-3.5" />
        )}
        <div className="w-2 h-2 rounded-full bg-zinc-200 group-hover:bg-black transition-colors" />
        <span className="text-sm font-bold text-zinc-700">{element.name}</span>
        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest ml-2">{element.type_name}</span>
      </div>
      {isOpen && children.length > 0 && (
        <div className="mt-1">
          {children.map(child => (
            <TreeNode key={child.id} element={child} allElements={allElements} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

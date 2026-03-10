import React, { useState } from "react";
import { motion } from "motion/react";
import { FolderTree, Share2, LayoutGrid, Network } from "lucide-react";
import { TreeBrowser } from "./TreeBrowser";
import { GraphBrowser } from "./GraphBrowser";
import { ElementType, RelationshipType } from "../types";

interface ElementBrowserProps {
  types: ElementType[];
  relTypes: RelationshipType[];
}

export const ElementBrowser = ({ types, relTypes }: ElementBrowserProps) => {
  const [mode, setMode] = useState<"tree" | "graph">("tree");

  return (
    <div className="h-full flex flex-col space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-marine">Element Browser</h1>
          <p className="text-zinc-500 mt-2 text-lg">Explore your data hierarchy and relationships.</p>
        </div>

        <div className="flex bg-zinc-100 p-1.5 rounded-2xl self-start">
          <button
            onClick={() => setMode("tree")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              mode === "tree" 
                ? "bg-white text-marine shadow-md" 
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <FolderTree size={18} />
            Tree Mode
          </button>
          <button
            onClick={() => setMode("graph")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              mode === "graph" 
                ? "bg-white text-marine shadow-md" 
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <Share2 size={18} />
            Graph Mode
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="h-full"
        >
          {mode === "tree" ? (
            <TreeBrowser types={types} />
          ) : (
            <GraphBrowser types={types} relTypes={relTypes} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "motion/react";
import { Share2, Filter, Play, RefreshCcw, ZoomIn, ZoomOut, Maximize2, Info } from "lucide-react";
import { Element, ElementType, RelationshipType, GraphEdge } from "../types";
import { IconRenderer } from "./common/IconRenderer";

interface GraphBrowserProps {
  types: ElementType[];
  relTypes: RelationshipType[];
}

interface Node extends d3.SimulationNodeDatum {
  id: number;
  name: string;
  type_id: number;
  color: string;
  icon: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  id: number;
  rel_name: string;
}

export const GraphBrowser = ({ types, relTypes }: GraphBrowserProps) => {
  const [selectedTypes, setSelectedTypes] = useState<number[]>(types.map(t => t.id));
  const [selectedRelTypes, setSelectedRelTypes] = useState<number[]>(relTypes.map(rt => rt.id));
  const [isLoaded, setIsLoaded] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLoad = async () => {
    setLoading(true);
    try {
      const [eRes, gRes] = await Promise.all([
        fetch("/api/elements"),
        fetch("/api/graph")
      ]);

      const allElements: Element[] = await eRes.json();
      const allEdges: GraphEdge[] = await gRes.json();

      // Filter elements by selected types
      const filteredElements = allElements.filter(e => selectedTypes.includes(e.type_id));
      const elementIds = new Set(filteredElements.map(e => e.id));

      // Filter edges by selected relationship types AND ensure both ends are in filtered elements
      const filteredEdges = allEdges.filter(edge => 
        selectedRelTypes.includes(edge.rel_type_id) && 
        elementIds.has(edge.source_el_id) && 
        elementIds.has(edge.target_el_id)
      );

      const d3Nodes: Node[] = filteredElements.map(e => {
        const type = types.find(t => t.id === e.type_id);
        return {
          id: e.id,
          name: e.name,
          type_id: e.type_id,
          color: type?.color || "#6366f1",
          icon: type?.icon || "Package"
        };
      });

      const d3Links: Link[] = filteredEdges.map(edge => ({
        id: edge.id,
        source: edge.source_el_id,
        target: edge.target_el_id,
        rel_name: edge.rel_name
      }));

      setNodes(d3Nodes);
      setLinks(d3Links);
      setIsLoaded(true);
    } catch (err) {
      console.error("Error loading graph data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !svgRef.current || nodes.length === 0) return;

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Simulation
    const simulation = d3.forceSimulation<Node>(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    // Links
    const link = g.append("g")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2);

    // Link labels
    const linkLabels = g.append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .attr("font-size", "8px")
      .attr("fill", "#9ca3af")
      .attr("text-anchor", "middle")
      .attr("dy", -5)
      .text((d: any) => d.rel_name);

    // Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    // Node circles
    node.append("circle")
      .attr("r", 25)
      .attr("fill", (d: any) => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .attr("shadow", "0 4px 6px -1px rgb(0 0 0 / 0.1)");

    // Node labels
    node.append("text")
      .attr("dy", 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#374151")
      .text((d: any) => d.name);

    // Simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkLabels
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => simulation.stop();
  }, [isLoaded, nodes, links]);

  if (!isLoaded) {
    return (
      <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-marine text-brand-yellow rounded-[2rem] shadow-2xl flex items-center justify-center mx-auto mb-8">
            <Share2 size={48} />
          </div>
          <h2 className="text-4xl font-bold text-marine tracking-tight">Graph Explorer</h2>
          <p className="text-zinc-500 text-lg">Select which elements and relationships you want to visualize.</p>
        </div>

        <div className="w-full bg-white rounded-[3rem] border border-zinc-200 shadow-xl p-10 space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Filter size={18} className="text-marine" />
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Filter by Schema Types</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {types.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    if (selectedTypes.includes(t.id)) setSelectedTypes(selectedTypes.filter(id => id !== t.id));
                    else setSelectedTypes([...selectedTypes, t.id]);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                    selectedTypes.includes(t.id)
                      ? "bg-marine border-marine text-brand-yellow shadow-md"
                      : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-300"
                  }`}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: t.color || "#6366f1" }}
                  >
                    <IconRenderer name={t.icon || "Package"} size={14} />
                  </div>
                  <span className="text-xs font-bold truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Share2 size={18} className="text-marine" />
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Filter by Relationships</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {relTypes.map(rt => (
                <button
                  key={rt.id}
                  onClick={() => {
                    if (selectedRelTypes.includes(rt.id)) setSelectedRelTypes(selectedRelTypes.filter(id => id !== rt.id));
                    else setSelectedRelTypes([...selectedRelTypes, rt.id]);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                    selectedRelTypes.includes(rt.id)
                      ? "bg-marine border-marine text-brand-yellow shadow-md"
                      : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-300"
                  }`}
                >
                  <span className="text-xs font-bold truncate">{rt.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleLoad}
            disabled={loading || selectedTypes.length === 0}
            className="w-full py-5 bg-marine text-brand-yellow rounded-[1.5rem] font-bold text-xl hover:bg-marine-light transition-all flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50"
          >
            {loading ? <RefreshCcw className="animate-spin" /> : <Play fill="currentColor" />}
            Generate Visual Graph
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-marine text-brand-yellow rounded-2xl shadow-lg">
            <Share2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-marine">Relational Graph</h2>
            <p className="text-zinc-500 text-sm">Visualizing {nodes.length} elements and {links.length} connections.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsLoaded(false)}
            className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all flex items-center gap-2"
          >
            <Filter size={16} /> Change Filters
          </button>
          <div className="flex bg-white border border-zinc-200 rounded-xl p-1">
             <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400"><ZoomIn size={18} /></button>
             <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400"><ZoomOut size={18} /></button>
             <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400"><Maximize2 size={18} /></button>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 bg-white rounded-[3rem] border-2 border-zinc-100 shadow-inner overflow-hidden relative"
      >
        <svg ref={svgRef} className="w-full h-full cursor-move" />
        
        {/* Legend */}
        <div className="absolute bottom-8 left-8 bg-white/80 backdrop-blur-md border border-zinc-200 p-6 rounded-3xl shadow-xl space-y-4 max-w-xs">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Info size={12} /> Legend
          </h4>
          <div className="space-y-3">
            {types.filter(t => selectedTypes.includes(t.id)).map(t => (
              <div key={t.id} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-xs font-bold text-zinc-600">{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

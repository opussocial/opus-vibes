import React, { createContext, useContext, ReactNode } from "react";
import { Element, ElementType, RelationshipType, GraphEdge, User } from "../types";

interface TemplateContextData {
  elements: Element[];
  types: ElementType[];
  relTypes: RelationshipType[];
  graph: GraphEdge[];
  settings: Record<string, any>;
  currentUser: User | null;
}

interface TemplateContextType extends TemplateContextData {
  // WP-like helpers
  get_element: (slug: string) => Element | undefined;
  get_elements_by_type: (typeSlug: string) => Element[];
  get_children: (elementId: number) => Element[];
  get_parents: (elementId: number) => Element[];
  get_related: (elementId: number, relName?: string) => Element[];
  get_setting: (key: string, defaultValue?: any) => any;
  get_type: (slug: string) => ElementType | undefined;
  get_meta: (element: any, key: string, defaultValue?: any) => any;
  get_header: () => Element | undefined;
  get_footer: () => Element | undefined;
  get_posts: (args?: { type?: string, status?: string, limit?: number, offset?: number }) => Element[];
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const TemplateProvider = ({ 
  children, 
  value 
}: { 
  children: ReactNode, 
  value: TemplateContextData 
}) => {
  const { elements, types, relTypes, graph, settings } = value;

  const get_element = (slug: string) => elements.find(e => e.slug === slug);
  
  const get_elements_by_type = (typeSlug: string) => {
    const type = types.find(t => t.slug === typeSlug);
    if (!type) return [];
    return elements.filter(e => e.type_id === type.id);
  };

  const get_children = (elementId: number) => {
    return elements.filter(e => e.parent_id === elementId);
  };

  const get_parents = (elementId: number) => {
    const element = elements.find(e => e.id === elementId);
    if (!element || !element.parent_id) return [];
    const parent = elements.find(e => e.id === element.parent_id);
    return parent ? [parent] : [];
  };

  const get_related = (elementId: number, relName?: string) => {
    const relatedEdges = graph.filter(edge => 
      edge.source_el_id === elementId && (!relName || edge.rel_name === relName)
    );
    const targetIds = relatedEdges.map(edge => edge.target_el_id);
    return elements.filter(e => targetIds.includes(e.id));
  };

  const get_setting = (key: string, defaultValue?: any) => {
    return settings[key] !== undefined ? settings[key] : defaultValue;
  };

  const get_type = (slug: string) => types.find(t => t.slug === slug);

  const get_meta = (element: any, key: string, defaultValue?: any) => {
    if (!element) return defaultValue;
    
    // Check if it's a direct property
    if (element[key] !== undefined) return element[key];
    
    // Check in properties array (if it's an ElementDetail)
    if (element.properties && Array.isArray(element.properties)) {
      const prop = element.properties.find((p: any) => p.key === key);
      if (prop) return prop.value;
    }
    
    return defaultValue;
  };

  const get_header = () => {
    const headerSlug = get_setting("header_element", "header");
    return get_element(headerSlug);
  };

  const get_footer = () => {
    const footerSlug = get_setting("footer_element", "footer");
    return get_element(footerSlug);
  };

  const get_posts = (args?: { type?: string, status?: string, limit?: number, offset?: number }) => {
    let filtered = [...elements];
    
    if (args?.type) {
      const type = types.find(t => t.slug === args.type);
      if (type) filtered = filtered.filter(e => e.type_id === type.id);
    }
    
    if (args?.status) {
      filtered = filtered.filter(e => e.status === args.status);
    }
    
    if (args?.offset) {
      filtered = filtered.slice(args.offset);
    }
    
    if (args?.limit) {
      filtered = filtered.slice(0, args.limit);
    }
    
    return filtered;
  };

  const contextValue: TemplateContextType = {
    ...value,
    get_element,
    get_elements_by_type,
    get_children,
    get_parents,
    get_related,
    get_setting,
    get_type,
    get_meta,
    get_header,
    get_footer,
    get_posts
  };

  return (
    <TemplateContext.Provider value={contextValue}>
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplate = () => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error("useTemplate must be used within a TemplateProvider");
  }
  return context;
};

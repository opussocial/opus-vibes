import React from "react";
import { useTheme } from "./ThemeContext";
import { Element } from "../types";

interface TemplatePartProps {
  element?: Element;
  slug?: string;
  type?: string;
  fallback?: React.ReactNode;
  components?: Record<string, React.ComponentType<{ element: Element }>>;
}

/**
 * A WordPress-like Template Part component.
 * It can render a specific element by slug, or the first element of a type,
 * or a passed element object.
 */
export const TemplatePart = ({ 
  element, 
  slug, 
  type, 
  fallback,
  components = {}
}: TemplatePartProps) => {
  const { get_element, get_elements_by_type } = useTheme();

  let targetElement = element;

  if (!targetElement && slug) {
    targetElement = get_element(slug);
  }

  if (!targetElement && type) {
    const elementsOfType = get_elements_by_type(type);
    if (elementsOfType.length > 0) {
      targetElement = elementsOfType[0];
    }
  }

  if (!targetElement) {
    return <>{fallback}</>;
  }

  // If we have a specific component for this type, use it
  const Component = components[targetElement.type_name] || components[targetElement.slug];
  
  if (Component) {
    return <Component element={targetElement} />;
  }

  // Default rendering if no specific component is provided
  return (
    <div className="template-part" data-type={targetElement.type_name} data-slug={targetElement.slug}>
      <h3>{targetElement.name}</h3>
      <p className="text-xs text-zinc-400 uppercase tracking-widest">{targetElement.type_name}</p>
    </div>
  );
};

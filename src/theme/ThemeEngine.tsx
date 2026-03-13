import React from "react";
import { Dashboard } from "../components/Dashboard";
import { ElementRenderer } from "./ElementRenderer";
import { Element, ElementType, TypePermission } from "../types";

interface ThemeEngineProps {
  features: Record<string, boolean>;
  settings: Record<string, any>;
  elements: Element[];
  types: ElementType[];
  getTypePermission: (typeId: number) => TypePermission;
  handleDelete: (slug: string) => void;
}

export const ThemeEngine = ({
  features,
  settings,
  elements,
  types,
  getTypePermission,
  handleDelete
}: ThemeEngineProps) => {
  const homepageEnabled = features["homepage_enabled"] !== false; // Default to true if not present
  const homeElementSlug = settings["home_element"];

  // If homepage is disabled AND we have a home_element slug, render that element
  if (!homepageEnabled && homeElementSlug) {
    return <ElementRenderer slug={homeElementSlug} isHome={true} />;
  }

  // Otherwise, render the default Dashboard
  return (
    <Dashboard 
      elements={elements}
      types={types}
      getTypePermission={getTypePermission}
      handleDelete={handleDelete}
    />
  );
};

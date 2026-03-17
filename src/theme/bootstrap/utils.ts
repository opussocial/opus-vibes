import { Element, ElementDetail } from "../../types";

/**
 * Utility functions for use in element templates
 */
export const themeUtils = {
  /**
   * Find an element by its slug
   */
  async getElementBySlug(slug: string): Promise<ElementDetail | null> {
    try {
      const res = await fetch(`/api/elements/${slug}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error(`Error fetching element by slug: ${slug}`, err);
      return null;
    }
  },

  /**
   * Get children of an element
   */
  async getChildren(elementId: number | string): Promise<Element[]> {
    try {
      const res = await fetch(`/api/elements/${elementId}/children`);
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.error(`Error fetching children for element: ${elementId}`, err);
      return [];
    }
  },

  /**
   * Get elements of a specific type
   */
  async getElementsByType(typeSlug: string): Promise<Element[]> {
    try {
      const res = await fetch("/api/elements");
      if (!res.ok) return [];
      const elements: Element[] = await res.json();
      return elements.filter(el => el.type_name.toLowerCase() === typeSlug.toLowerCase());
    } catch (err) {
      console.error(`Error fetching elements by type: ${typeSlug}`, err);
      return [];
    }
  },

  /**
   * Get all top-level elements (no parent)
   */
  async getTopLevelElements(): Promise<Element[]> {
    try {
      const res = await fetch("/api/elements");
      if (!res.ok) return [];
      const elements: Element[] = await res.json();
      return elements.filter(el => !el.parent_id);
    } catch (err) {
      console.error("Error fetching top-level elements", err);
      return [];
    }
  }
};

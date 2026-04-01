import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { get_header, get_footer, the_title, the_content, the_children, the_neighbors, the_parent } from "../../TemplateTags";

export const ElementPage = ({ settings }: any) => {
  const { slug, id } = useParams();
  const identifier = id || slug;
  const [element, setElement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElement = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/theme/element/${identifier}`);
        const data = await res.json();
        setElement(data.element);
      } catch (err) {
        console.error("Failed to fetch element:", err);
      } finally {
        setLoading(false);
      }
    };
    if (identifier) fetchElement();
  }, [identifier]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!element) return <div className="p-8 text-center">Element not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {get_header(settings)}
      <main className="max-w-4xl mx-auto p-12">
        <div className="bg-white p-12 rounded-3xl shadow-sm border">
          {the_parent(element)}
          {the_title(element)}
          <div className="text-xs text-gray-300 mb-8 uppercase tracking-widest">{element.type_name}</div>
          {the_content(element)}
          <div className="mt-12 border-t pt-8">
            {the_children(element)}
            {the_neighbors(element)}
          </div>
        </div>
      </main>
      {get_footer(settings)}
    </div>
  );
};

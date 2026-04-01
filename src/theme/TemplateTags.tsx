import React from "react";
import { Link } from "react-router-dom";

export const get_header = (settings: any) => (
  <header className="p-4 border-b bg-white">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <Link to="/home" className="text-xl font-bold">{settings.site_name || "FlexCatalog"}</Link>
      <nav className="flex gap-4">
        <Link to="/home" className="hover:underline">Home</Link>
        <Link to="/explore" className="hover:underline">Explore</Link>
      </nav>
    </div>
  </header>
);

export const get_footer = (settings: any) => (
  <footer className="p-8 border-t bg-gray-50 mt-12">
    <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
      &copy; {new Date().getFullYear()} {settings.site_name || "FlexCatalog"}. Built with AIS.
    </div>
  </footer>
);

export const the_title = (element: any) => (
  <h1 className="text-4xl font-bold mb-4">{element.name}</h1>
);

export const the_content = (element: any) => {
  const content = element.content?.body || element.description || "";
  return <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: content }} />;
};

export const the_children = (element: any) => {
  if (!element.children?.length) return null;
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Children</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {element.children.map((child: any) => (
          <Link 
            key={child.id} 
            to={`/element/${child.type_slug || 'default'}/${child.slug}`}
            className="p-4 border rounded hover:shadow-md transition-shadow bg-white"
          >
            {child.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export const the_neighbors = (element: any) => {
  if (!element.neighbors?.length) return null;
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Related</h3>
      <div className="flex flex-wrap gap-2">
        {element.neighbors.map((neighbor: any) => (
          <Link 
            key={neighbor.id} 
            to={`/element/${neighbor.type_slug || 'default'}/${neighbor.slug}`}
            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
          >
            {neighbor.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export const the_parent = (element: any) => {
  if (!element.parent) return null;
  return (
    <div className="mb-4 text-sm text-gray-500">
      Parent: <Link to={`/element/${element.parent.type_slug || 'default'}/${element.parent.slug}`} className="text-blue-600 hover:underline">{element.parent.name}</Link>
    </div>
  );
};

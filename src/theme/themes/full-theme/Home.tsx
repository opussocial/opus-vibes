import React from "react";
import { get_header, get_footer, the_title, the_content, the_children, the_neighbors, the_parent } from "../../TemplateTags";

export const Home = ({ settings, currentUser }: any) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {get_header(settings)}
      <main className="max-w-7xl mx-auto p-8">
        <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to {settings.site_name || "FlexCatalog"}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            This is the Full Theme home page. Explore our content and see how the modular system works.
          </p>
        </div>
      </main>
      {get_footer(settings)}
    </div>
  );
};

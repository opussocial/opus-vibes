import React from "react";
import { get_header, get_footer } from "../../TemplateTags";

export const Home = ({ settings }: any) => (
  <div className="min-h-screen bg-white">
    {get_header(settings)}
    <main className="max-w-4xl mx-auto p-12 text-center">
      <h1 className="text-3xl font-light mb-4">Minimal Theme</h1>
      <p className="text-gray-400">Less is more. This theme focus on content and simplicity.</p>
    </main>
    {get_footer(settings)}
  </div>
);
